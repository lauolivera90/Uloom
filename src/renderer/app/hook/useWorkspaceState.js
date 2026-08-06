import { useCallback, useState } from 'react';
import { mockWorkspaces } from '../../entities/workspace/index.js';

/**
 * Estado de la lista de sesiones compartida por la app. Se siembra con los datos
 * de prueba mientras la aplicación vive en la fase de mock.
 * @returns {{
 *   workspaces: import('../../shared/types.js').Workspace[],
 *   addWorkspace: (workspace: import('../../shared/types.js').Workspace) => void,
 * }}
 */
export function useWorkspaceState() {
  const [workspaces, setWorkspaces] = useState(mockWorkspaces);

  const addWorkspace = useCallback((workspace) => {
    setWorkspaces((prev) => [...prev, workspace]);
  }, []);

  return { workspaces, addWorkspace };
}
