import { useCallback, useEffect, useRef, useState } from 'react';
import { getConfig, createWorkspace, updateWorkspace } from '../../entities/workspace/index.js';

/**
 * Estado de la lista de sesiones compartida por la app, respaldado en config.json
 * vía IPC. Estrategia pesimista: cada mutación espera la respuesta del disco y usa
 * el workspace persistido como fuente de verdad; si el IPC falla, el error se
 * propaga al caller (sin optimismo ni rollback).
 * @returns {{
 *   workspaces: import('../../shared/types.js').Workspace[],
 *   createWorkspace: (input: { name: string, description?: string, icon?: string }) => Promise<import('../../shared/types.js').Workspace>,
 *   updateWorkspace: (next: import('../../shared/types.js').Workspace) => Promise<import('../../shared/types.js').Workspace>,
 *   addTab: (workspaceId: string, tab: import('../../shared/types.js').Tab) => Promise<import('../../shared/types.js').Workspace>,
 *   deleteTab: (workspaceId: string, tabId: string) => Promise<import('../../shared/types.js').Workspace>,
 * }}
 */
export function useWorkspaceState() {
  const [workspaces, setWorkspaces] = useState([]);
  const workspacesRef = useRef([]);

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

  const createWorkspacePersisted = useCallback(async (input) => {
    const created = await createWorkspace(input);
    setWorkspaces((prev) => [...prev, created]);
    return created;
  }, []);

  const updateWorkspacePersisted = useCallback(async (nextWorkspace) => {
    const saved = await updateWorkspace(nextWorkspace);
    setWorkspaces((prev) =>
      prev.map((workspace) => (workspace.id === saved.id ? saved : workspace)),
    );
    return saved;
  }, []);

  const addTab = useCallback(
    async (workspaceId, tab) => {
      const target = workspacesRef.current.find((workspace) => workspace.id === workspaceId);
      if (!target) {
        throw new Error('Workspace no encontrado');
      }
      return updateWorkspacePersisted({
        ...target,
        tabs: [...(target.tabs ?? []), tab],
      });
    },
    [updateWorkspacePersisted],
  );

  const deleteTab = useCallback(
    async (workspaceId, tabId) => {
      const target = workspacesRef.current.find((workspace) => workspace.id === workspaceId);
      if (!target) {
        throw new Error('Workspace no encontrado');
      }
      return updateWorkspacePersisted({
        ...target,
        tabs: (target.tabs ?? []).filter((tab) => tab.id !== tabId),
      });
    },
    [updateWorkspacePersisted],
  );

  return {
    workspaces,
    createWorkspace: createWorkspacePersisted,
    updateWorkspace: updateWorkspacePersisted,
    addTab,
    deleteTab,
  };
}