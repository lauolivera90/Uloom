import { useCallback, useState } from 'react';
import { mockWorkspaces } from '../../../entities/workspace/index.js';

/**
 * Administra la lista de sesiones del Hub y el estado del modal de creación.
 * @returns {{
 *   workspaces: import('../../../shared/types.js').Workspace[],
 *   isCreateOpen: boolean,
 *   openCreate: () => void,
 *   closeCreate: () => void,
 *   addWorkspace: (workspace: import('../../../shared/types.js').Workspace) => void,
 * }}
 */
export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState(mockWorkspaces);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const openCreate = useCallback(() => setIsCreateOpen(true), []);
  const closeCreate = useCallback(() => setIsCreateOpen(false), []);

  const addWorkspace = useCallback((workspace) => {
    setWorkspaces((prev) => [...prev, workspace]);
  }, []);

  return { workspaces, isCreateOpen, openCreate, closeCreate, addWorkspace };
}
