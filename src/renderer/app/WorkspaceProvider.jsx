import { createContext, useContext } from 'react';
import { useWorkspaceState } from './hook/useWorkspaceState.js';

const WorkspaceContext = createContext(null);

/**
 * Acceso a la lista de sesiones compartida. Debe usarse dentro de un
 * WorkspaceProvider; fuera de él lanza un error descriptivo.
 * @returns {{
 *   workspaces: import('../shared/types.js').Workspace[],
 *   addWorkspace: (workspace: import('../shared/types.js').Workspace) => void,
 * }}
 */
export function useWorkspaces() {
  const context = useContext(WorkspaceContext);
  if (context === null) {
    throw new Error('useWorkspaces debe usarse dentro de <WorkspaceProvider>');
  }
  return context;
}

/**
 * Provee el estado compartido de sesiones a toda la aplicación.
 * Presentacional: solo llama al hook de estado y expone el valor por context.
 * @param {{ children: React.ReactNode }} props
 */
export function WorkspaceProvider({ children }) {
  const value = useWorkspaceState();

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
