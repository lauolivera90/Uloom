import { useCallback, useState } from 'react';
import { useWorkspaces } from '../../../app/index.js';

/**
 * Estado del feature Hub de Sesiones: delega la lista de workspaces al context
 * global de la app y conserva el estado local del modal de creación, incluida la
 * persistencia pesimista (isCreating mientras se escribe en disco).
 * @returns {{
 *   workspaces: import('../../../shared/types.js').Workspace[],
 *   isCreateOpen: boolean,
 *   openCreate: () => void,
 *   closeCreate: () => void,
 *   isCreating: boolean,
 *   createWorkspace: (workspace: { name: string, description?: string, icon?: string }) => Promise<import('../../../shared/types.js').Workspace>,
 * }}
 */
export function useWorkspacesHub() {
  const { workspaces, createWorkspace: createWorkspaceGlobal } = useWorkspaces();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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

  return {
    workspaces,
    isCreateOpen,
    openCreate,
    closeCreate,
    isCreating,
    createWorkspace,
  };
}