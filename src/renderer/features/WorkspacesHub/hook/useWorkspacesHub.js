import { useCallback, useState } from 'react';
import { useWorkspaces } from '../../../app/index.js';
import {
  useTabFormModal,
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
 * @returns {{
 *   workspaces: import('../../../shared/types.js').Workspace[],
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
  const { workspaces, createWorkspace, addTab, addTabs, updateTab } = useWorkspaces();
  const createModal = useWorkspaceFormModal({ workspace: null, onSubmit: createWorkspace });
  const [tabTargetId, setTabTargetId] = useState(null);
  const tabTargetWorkspace = workspaces.find((workspace) => workspace.id === tabTargetId) ?? null;
  const tabModal = useTabFormModal({
    workspaceId: tabTargetId,
    existingUrls: (tabTargetWorkspace?.tabs ?? []).map((tab) => tab.url),
    addTab,
    addTabs,
    updateTab,
  });
  const { openAdd } = tabModal;

  const openAddTab = useCallback(
    (workspaceId) => {
      setTabTargetId(workspaceId);
      openAdd();
    },
    [setTabTargetId, openAdd],
  );

  return {
    workspaces,
    createModal,
    tabModal,
    openAddTab,
  };
}