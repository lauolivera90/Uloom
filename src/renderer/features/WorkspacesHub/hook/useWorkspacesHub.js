import { useCallback, useState } from 'react';
import { useWorkspaces } from '../../../app/index.js';
import {
  useTabModal,
  useWorkspaceFormModal,
} from '../../../entities/workspace/index.js';

/**
 * Estado del feature Hub de Sesiones: delega la lista de workspaces al context
 * global de la app y orquesta el modal de creación (hook genérico
 * `useWorkspaceFormModal`, alta) y el modal de agregar pestaña que abre el botón
 * (+) de una card sin pestañas: `tabTargetId` recuerda sobre qué sesión se abre y
 * el submit delega en la persistencia global (addTab/updateTab inyectadas a
 * useTabModal, sin que entities dependa de app).
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
 *     editingTab: import('../../../shared/types.js').Tab | null,
 *     openAdd: () => void,
 *     openEdit: (tab: import('../../../shared/types.js').Tab) => void,
 *     close: () => void,
 *     isSaving: boolean,
 *     onSubmitTab: (tab: import('../../../shared/types.js').Tab) => Promise<void>,
 *   },
 *   openAddTab: (workspaceId: string) => void,
 * }}
 */
export function useWorkspacesHub() {
  const { workspaces, createWorkspace, addTab, updateTab } = useWorkspaces();
  const createModal = useWorkspaceFormModal({ workspace: null, onSubmit: createWorkspace });
  const [tabTargetId, setTabTargetId] = useState(null);
  const tabModal = useTabModal({ workspaceId: tabTargetId, addTab, updateTab });
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
