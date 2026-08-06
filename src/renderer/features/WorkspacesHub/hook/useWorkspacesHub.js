import { useCallback, useState } from 'react';
import { useWorkspaces } from '../../../app/index.js';

/**
 * Estado del feature Hub de Sesiones: delega la lista de workspaces al context
 * global de la app y conserva solo el estado local del modal de creación.
 * @returns {{
 *   workspaces: import('../../../shared/types.js').Workspace[],
 *   isCreateOpen: boolean,
 *   openCreate: () => void,
 *   closeCreate: () => void,
 *   addWorkspace: (workspace: import('../../../shared/types.js').Workspace) => void,
 * }}
 */
export function useWorkspacesHub() {
  const { workspaces, addWorkspace } = useWorkspaces();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const openCreate = useCallback(() => setIsCreateOpen(true), []);
  const closeCreate = useCallback(() => setIsCreateOpen(false), []);

  return { workspaces, isCreateOpen, openCreate, closeCreate, addWorkspace };
}
