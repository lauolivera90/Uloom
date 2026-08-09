import { useCallback, useState } from 'react';
import { useWorkspaces } from '../../../app/index.js';
import { useTabModal } from '../../../entities/workspace/index.js';

/**
 * Estado del feature Hub de Sesiones: delega la lista de workspaces al context
 * global de la app y conserva el estado local del modal de creación, incluida la
 * persistencia pesimista (isCreating mientras se escribe en disco). También
 * orquesta el modal de agregar pestaña que abre el botón (+) de una card sin
 * pestañas: `tabTargetId` recuerda sobre qué sesión se abre y el submit delega en
 * la persistencia global (addTab/updateTab inyectadas a useTabModal, sin que
 * entities dependa de app).
 * @returns {{
 *   workspaces: import('../../../shared/types.js').Workspace[],
 *   isCreateOpen: boolean,
 *   openCreate: () => void,
 *   closeCreate: () => void,
 *   isCreating: boolean,
 *   createWorkspace: (workspace: { name: string, description?: string, icon?: string }) => Promise<import('../../../shared/types.js').Workspace>,
 *   tabTargetId: string | null,
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
  const { workspaces, createWorkspace: createWorkspaceGlobal, addTab, updateTab } = useWorkspaces();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [tabTargetId, setTabTargetId] = useState(null);
  const tabModal = useTabModal({ workspaceId: tabTargetId, addTab, updateTab });
  const { openAdd } = tabModal;

  const openCreate = useCallback(() => setIsCreateOpen(true), []);
  const closeCreate = useCallback(() => setIsCreateOpen(false), []);

  const createWorkspace = useCallback(
    async (workspace) => {
      setIsCreating(true);
      try {
        return await createWorkspaceGlobal(workspace);
      } finally {
        setIsCreating(false);
      }
    },
    [createWorkspaceGlobal],
  );

  const openAddTab = useCallback(
    (workspaceId) => {
      setTabTargetId(workspaceId);
      openAdd();
    },
    [setTabTargetId, openAdd],
  );

  return {
    workspaces,
    isCreateOpen,
    openCreate,
    closeCreate,
    isCreating,
    createWorkspace,
    tabTargetId,
    tabModal,
    openAddTab,
  };
}