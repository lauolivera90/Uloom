import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getConfig,
  createWorkspace,
  duplicateWorkspace as duplicateWorkspaceIpc,
  updateWorkspace,
  deleteWorkspace as deleteWorkspaceIpc,
  updatePreferences,
  clearMetadataCache as clearMetadataCacheIpc,
  clearAllWorkspaces as clearAllWorkspacesIpc,
  clearTabHistory as clearTabHistoryIpc,
  importFromFile as importFromFileIpc,
  SYSTEM_BROWSER,
} from '../../entities/workspace/index.js';
import { useI18n, useToast } from '../../shared/index.js';

/**
 * Reemplaza el catálogo del estado global a partir de una lista persistida y
 * reconstruye el ref de última escritura por id. Lo usan el load inicial y la
 * importación de sesiones (que ya devuelve la lista final desde el main).
 * @param {import('react').Dispatch<import('react').SetStateAction<import('../../shared/types.js').Workspace[]>>} setWorkspaces
 * @param {import('react').MutableRefObject<Map<string, import('../../shared/types.js').Workspace>>} latestByWorkspaceRef
 * @param {import('../../shared/types.js').Workspace[]} workspaceList
 */
function hydrateCatalog(setWorkspaces, latestByWorkspaceRef, workspaceList) {
  setWorkspaces(workspaceList);
  latestByWorkspaceRef.current = new Map(workspaceList.map((workspace) => [workspace.id, workspace]));
}

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
 *   duplicateWorkspace: (sourceId: string, input: { name: string, description?: string, icon?: string }) => Promise<import('../../shared/types.js').Workspace>,
 *   mutateWorkspace: (workspaceId: string, mutator: (workspace: import('../../shared/types.js').Workspace) => import('../../shared/types.js').Workspace) => Promise<import('../../shared/types.js').Workspace>,
 *   syncWorkspace: (workspace: import('../../shared/types.js').Workspace) => Promise<import('../../shared/types.js').Workspace | null>,
 *   addTab: (workspaceId: string, tab: import('../../shared/types.js').Tab) => Promise<import('../../shared/types.js').Workspace>,
 *   addTabs: (workspaceId: string, tabs: import('../../shared/types.js').Tab[]) => Promise<import('../../shared/types.js').Workspace>,
 *   deleteTab: (workspaceId: string, tabId: string) => Promise<import('../../shared/types.js').Workspace>,
 *   updateTab: (workspaceId: string, tab: import('../../shared/types.js').Tab) => Promise<import('../../shared/types.js').Workspace>,
 *   deleteWorkspace: (workspaceId: string) => Promise<void>,
 *   updatePreferences: (partial: Partial<import('../../shared/types.js').Preferences>) => Promise<import('../../shared/types.js').Preferences>,
 *   clearMetadataCache: () => Promise<number>,
 *   clearAllWorkspaces: () => Promise<number>,
 *   clearTabHistory: () => Promise<number>,
 *   importWorkspaces: () => Promise<{ canceled: boolean, imported: number }>,
 * }}
 */
export function useWorkspaceState() {
  const [workspaces, setWorkspaces] = useState([]);
  const workspacesRef = useRef([]);
  const latestByWorkspaceRef = useRef(new Map());
  const writeChainRef = useRef(Promise.resolve());
  const [preferences, setPreferences] = useState({ defaultBrowser: SYSTEM_BROWSER });
  const { t } = useI18n();
  const { toast } = useToast();

  useEffect(() => {
    workspacesRef.current = workspaces;
  }, [workspaces]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const config = await getConfig();
        if (!cancelled) {
          setPreferences(config.preferences ?? { defaultBrowser: SYSTEM_BROWSER });
          hydrateCatalog(setWorkspaces, latestByWorkspaceRef, config.workspaces ?? []);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          toast({ variant: 'error', message: t('load.error') });
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [toast, t]);

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

  /**
   * Sincroniza los datos de uso que el main registró durante `workspace:launch`
   * (`lastLaunchedAt`/`launchCount`). Se serializa en el write-chain y **mergea
   * solo esos campos** sobre la versión actual del workspace en estado (no
   * reemplaza el objeto completo): así no pisa una mutación concurrente del
   * mismo workspace (ej. toggle de pin o edición de pestaña aplicados mientras
   * el launch resolvía). Sin re-IPC: el backend ya persistió.
   * @param {import('../../shared/types.js').Workspace} workspace
   * @returns {Promise<import('../../shared/types.js').Workspace | null>}
   */
  const syncWorkspace = useCallback((workspace) => {
    const task = writeChainRef.current.then(() => {
      const current =
        latestByWorkspaceRef.current.get(workspace.id) ??
        workspacesRef.current.find((item) => item.id === workspace.id);
      if (!current) {
        return null;
      }
      const merged = {
        ...current,
        lastLaunchedAt: workspace.lastLaunchedAt ?? current.lastLaunchedAt ?? null,
        launchCount: workspace.launchCount ?? current.launchCount ?? 0,
      };
      latestByWorkspaceRef.current.set(merged.id, merged);
      setWorkspaces((prev) =>
        prev.map((item) => (item.id === merged.id ? merged : item)),
      );
      return merged;
    });
    writeChainRef.current = task.catch(() => undefined);
    return task;
  }, []);

  const duplicateWorkspacePersisted = useCallback(async (sourceId, input) => {
    const created = await duplicateWorkspaceIpc(sourceId, input);
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

  const addTabs = useCallback(
    (workspaceId, tabs) =>
      mutateWorkspace(workspaceId, (workspace) => ({
        ...workspace,
        tabs: [...(workspace.tabs ?? []), ...tabs],
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

  const clearMetadataCachePersisted = useCallback(() => {
    const task = writeChainRef.current.then(async () => {
      const { cleared } = await clearMetadataCacheIpc();
      const withoutFavicons = new Map(
        [...latestByWorkspaceRef.current.entries()].map(([id, workspace]) => [
          id,
          {
            ...workspace,
            tabs: (workspace.tabs ?? []).map((tab) => {
              const next = { ...tab };
              delete next.favicon;
              return next;
            }),
          },
        ]),
      );
      latestByWorkspaceRef.current = withoutFavicons;
      setWorkspaces([...withoutFavicons.values()]);
      return cleared;
    });
    writeChainRef.current = task.catch(() => undefined);
    return task;
  }, []);

  const clearAllWorkspacesPersisted = useCallback(() => {
    const task = writeChainRef.current.then(async () => {
      const { deleted } = await clearAllWorkspacesIpc();
      latestByWorkspaceRef.current = new Map();
      setWorkspaces([]);
      return deleted;
    });
    writeChainRef.current = task.catch(() => undefined);
    return task;
  }, []);

  const clearTabHistoryPersisted = useCallback(() => {
    const task = writeChainRef.current.then(async () => {
      const { cleared } = await clearTabHistoryIpc();
      return cleared;
    });
    writeChainRef.current = task.catch(() => undefined);
    return task;
  }, []);

  const importWorkspacesFromFile = useCallback(() => {
    const task = writeChainRef.current.then(async () => {
      const { canceled, imported } = await importFromFileIpc();
      if (canceled) {
        return { canceled: true, imported: 0 };
      }
      hydrateCatalog(setWorkspaces, latestByWorkspaceRef, imported);
      return { canceled: false, imported: imported.length };
    });
    writeChainRef.current = task.catch(() => undefined);
    return task;
  }, []);

  return {
    workspaces,
    preferences,
    createWorkspace: createWorkspacePersisted,
    duplicateWorkspace: duplicateWorkspacePersisted,
    mutateWorkspace,
    syncWorkspace,
    addTab,
    addTabs,
    deleteTab,
    updateTab,
    deleteWorkspace,
    updatePreferences: updatePreferencesPersisted,
    clearMetadataCache: clearMetadataCachePersisted,
    clearAllWorkspaces: clearAllWorkspacesPersisted,
    clearTabHistory: clearTabHistoryPersisted,
    importWorkspaces: importWorkspacesFromFile,
  };
}