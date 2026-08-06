import { useMemo } from 'react';
import { useWorkspaces } from '../../../app/index.js';

/**
 * Resuelve la sesión seleccionada desde el estado global por su id.
 * Si el id no existe (o la ruta llegó sin id) devuelve workspace null.
 * @param {string} [workspaceId]
 * @returns {{
 *   workspace: import('../../../shared/types.js').Workspace | null,
 *   isNotFound: boolean,
 * }}
 */
export function useWorkspaceDetail(workspaceId) {
  const { workspaces } = useWorkspaces();
  const workspace = useMemo(
    () => workspaces.find((workspace) => workspace.id === workspaceId) ?? null,
    [workspaces, workspaceId],
  );

  return { workspace, isNotFound: workspace === null };
}
