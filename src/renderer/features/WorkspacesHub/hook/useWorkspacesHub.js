import { useCallback, useMemo, useState } from 'react';
import { useWorkspaces } from '../../../app/index.js';
import {
  useTabFormModal,
  useToggleWorkspacePin,
  useWorkspaceFormModal,
} from '../../../entities/workspace/index.js';

/**
 * Estado del feature Hub de Sesiones: delega la lista de workspaces al context
 * global de la app y orquesta el modal de creación (hook genérico
 * `useWorkspaceFormModal`, alta) y el modal de agregar pestaña que abre el botón
 * (+) de una card sin pestañas: `tabTargetId` recuerda sobre qué sesión se abre y
 * la persistencia del modal de pestaña delega en la global (addTab/addTabs/
 * updateTab inyectadas a `useTabFormModal`, sin que entities dependa de app). El
 * `existingUrls` del modal sale de la sesión objetivo para filtrar el historial.
 *
 * Desde v0.6.1 maneja además la búsqueda de sesiones (filtra por nombre/
 * descripción, patrón de Configuración) y el fijado de sesiones: `togglePin`
 * delega en el hook de entidad compartido (`useToggleWorkspacePin`, mismo
 * precedente que `useLaunchWorkspace`) y `visibleWorkspaces` deriva la lista
 * filtrada y ordenada — las fijadas primero (sort estable, mantiene el orden de
 * creación dentro de cada grupo; el orden aplica también al buscar).
 * @returns {{
 *   visibleWorkspaces: import('../../../shared/types.js').Workspace[],
 *   isSearching: boolean,
 *   searchQuery: string,
 *   setSearchQuery: (value: string) => void,
 *   togglePin: (workspaceId: string) => Promise<void>,
 *   createModal: {
 *     isOpen: boolean,
 *     isSaving: boolean,
 *     form: import('../../../entities/workspace/hook/useWorkspaceForm.js').WorkspaceFormState,
 *     open: () => void,
 *     close: () => void,
 *   },
 *   tabModal: {
 *     isOpen: boolean,
 *     isEditing: boolean,
 *     isSaving: boolean,
 *     editingTab: import('../../../shared/types.js').Tab | null,
 *     mode: 'manual' | 'history',
 *     form: import('../../../entities/workspace/hook/useTabForm.js').TabFormState,
 *     openAdd: () => void,
 *     onCancel: () => void,
 *     onModeChange: (mode: 'manual' | 'history') => void,
 *     visibleEntries: import('../../../shared/types.js').TabHistoryEntry[],
 *     historyDisabled: boolean,
 *     selectedCount: number,
 *     selectedUrls: Set<string>,
 *     onToggleHistoryEntry: (url: string) => void,
 *     onConfirmBatch: () => void,
 *   },
 *   openAddTab: (workspaceId: string) => void,
 * }}
 */
export function useWorkspacesHub() {
  const { workspaces, createWorkspace, addTab, addTabs, updateTab, mutateWorkspace } =
    useWorkspaces();
  const createModal = useWorkspaceFormModal({ workspace: null, onSubmit: createWorkspace });
  const [tabTargetId, setTabTargetId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const tabTargetWorkspace = workspaces.find((workspace) => workspace.id === tabTargetId) ?? null;
  const tabModal = useTabFormModal({
    workspaceId: tabTargetId,
    existingUrls: (tabTargetWorkspace?.tabs ?? []).map((tab) => tab.url),
    addTab,
    addTabs,
    updateTab,
  });
  const { openAdd } = tabModal;
  const { togglePin } = useToggleWorkspacePin({ mutateWorkspace });

  const openAddTab = useCallback(
    (workspaceId) => {
      setTabTargetId(workspaceId);
      openAdd();
    },
    [setTabTargetId, openAdd],
  );

  const isSearching = searchQuery.trim().length > 0;

  const visibleWorkspaces = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = query
      ? workspaces.filter(
          (workspace) =>
            (workspace.name ?? '').toLowerCase().includes(query) ||
            (workspace.description ?? '').toLowerCase().includes(query),
        )
      : workspaces;
    return [...filtered].sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [workspaces, searchQuery]);

  return {
    visibleWorkspaces,
    isSearching,
    searchQuery,
    setSearchQuery,
    togglePin,
    createModal,
    tabModal,
    openAddTab,
  };
}