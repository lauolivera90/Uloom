import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getConfig,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace as deleteWorkspaceIpc,
  updatePreferences,
  SYSTEM_BROWSER,
} from '../../entities/workspace/index.js';

/**
 * Estado de la lista de sesiones y preferencias globales compartidos por la app,
 * respaldado en config.json vía IPC. Estrategia pesimista: cada mutación espera
 * la respuesta del disco y usa el valor persistido como fuente de verdad; si el
 * IPC falla, el error se propaga al caller (sin optimismo ni rollback).
 *
 * Líder único de escritura: toda mutación de un workspace (tabs o configuración
 * de la sesión) pasa por `mutateWorkspace`, que serializa las escrituras en una
 * cola de promesas y parte siempre del último workspace *persistido* (ref por id,
 * no React state que puede quedar atrás). Así dos mutaciones solapadas no pisan
 * snapshots parciales en disco.
 * @returns {{
 *   workspaces: import('../../shared/types.js').Workspace[],
 *   preferences: import('../../shared/types.js').Preferences,
 *   createWorkspace: (input: { name: string, description?: string, icon?: string }) => Promise<import('../../shared/types.js').Workspace>,
 *   mutateWorkspace: (workspaceId: string, mutator: (workspace: import('../../shared/types.js').Workspace) => import('../../shared/types.js').Workspace) => Promise<import('../../shared/types.js').Workspace>,
 *   addTab: (workspaceId: string, tab: import('../../shared/types.js').Tab) => Promise<import('../../shared/types.js').Workspace>,
 *   deleteTab: (workspaceId: string, tabId: string) => Promise<import('../../shared/types.js').Workspace>,
 *   updateTab: (workspaceId: string, tab: import('../../shared/types.js').Tab) => Promise<import('../../shared/types.js').Workspace>,
 *   deleteWorkspace: (workspaceId: string) => Promise<void>,
 *   updatePreferences: (partial: Partial<import('../../shared/types.js').Preferences>) => Promise<import('../../shared/types.js').Preferences>,
 * }}
 */
export function useWorkspaceState() {
  const [workspaces, setWorkspaces] = useState([]);
  const workspacesRef = useRef([]);
  const latestByWorkspaceRef = useRef(new Map());
  const writeChainRef = useRef(Promise.resolve());
  const [preferences, setPreferences] = useState({ defaultBrowser: SYSTEM_BROWSER });

  useEffect(() => {
    workspacesRef.current = workspaces;
  }, [workspaces]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const config = await getConfig();
        if (!cancelled) {
          setWorkspaces(config.workspaces ?? []);
          setPreferences(config.preferences ?? { defaultBrowser: SYSTEM_BROWSER });
          latestByWorkspaceRef.current = new Map(
            (config.workspaces ?? []).map((workspace) => [workspace.id, workspace]),
          );
        }
      } catch (error) {
        console.error(error);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const mutateWorkspace = useCallback(async (workspaceId, mutator) => {
    const task = writeChainRef.current.then(async () => {
      const base =
        latestByWorkspaceRef.current.get(workspaceId) ??
        workspacesRef.current.find((workspace) => workspace.id === workspaceId);
      if (!base) {
        throw new Error('Workspace no encontrado');
      }
      const nextWorkspace = mutator(base);
      const saved = await updateWorkspace(nextWorkspace);
      latestByWorkspaceRef.current.set(workspaceId, saved);
      setWorkspaces((prev) =>
        prev.map((workspace) => (workspace.id === saved.id ? saved : workspace)),
      );
      return saved;
    });
    writeChainRef.current = task.catch(() => undefined);
    return task;
  }, []);

  const createWorkspacePersisted = useCallback(async (input) => {
    const created = await createWorkspace(input);
    latestByWorkspaceRef.current.set(created.id, created);
    setWorkspaces((prev) => [...prev, created]);
    return created;
  }, []);

  const addTab = useCallback(
    (workspaceId, tab) =>
      mutateWorkspace(workspaceId, (workspace) => ({
        ...workspace,
        tabs: [...(workspace.tabs ?? []), tab],
      })),
    [mutateWorkspace],
  );

  const deleteTab = useCallback(
    (workspaceId, tabId) =>
      mutateWorkspace(workspaceId, (workspace) => ({
        ...workspace,
        tabs: (workspace.tabs ?? []).filter((tab) => tab.id !== tabId),
      })),
    [mutateWorkspace],
  );

  const updateTab = useCallback(
    (workspaceId, tab) =>
      mutateWorkspace(workspaceId, (workspace) => ({
        ...workspace,
        tabs: (workspace.tabs ?? []).map((current) => (current.id === tab.id ? tab : current)),
      })),
    [mutateWorkspace],
  );

  const deleteWorkspace = useCallback((workspaceId) => {
    const task = writeChainRef.current.then(async () => {
      await deleteWorkspaceIpc(workspaceId);
      latestByWorkspaceRef.current.delete(workspaceId);
      setWorkspaces((prev) => prev.filter((workspace) => workspace.id !== workspaceId));
    });
    writeChainRef.current = task.catch(() => undefined);
    return task;
  }, []);

  const updatePreferencesPersisted = useCallback(async (partial) => {
    const saved = await updatePreferences(partial);
    setPreferences(saved);
    return saved;
  }, []);

  return {
    workspaces,
    preferences,
    createWorkspace: createWorkspacePersisted,
    mutateWorkspace,
    addTab,
    deleteTab,
    updateTab,
    deleteWorkspace,
    updatePreferences: updatePreferencesPersisted,
  };
}