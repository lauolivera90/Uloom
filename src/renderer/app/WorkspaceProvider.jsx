import { createContext, useContext } from 'react';
import { useWorkspaceState } from './hook/useWorkspaceState.js';

const WorkspaceContext = createContext(null);

/**
 * Acceso a la lista de sesiones y preferencias globales compartidas. Debe usarse
 * dentro de un WorkspaceProvider; fuera de él lanza un error descriptivo.
 * @returns {{
 *   workspaces: import('../shared/types.js').Workspace[],
 *   preferences: import('../shared/types.js').Preferences,
 *   createWorkspace: (input: { name: string, description?: string, icon?: string }) => Promise<import('../shared/types.js').Workspace>,
 *   mutateWorkspace: (workspaceId: string, mutator: (workspace: import('../shared/types.js').Workspace) => import('../shared/types.js').Workspace) => Promise<import('../shared/types.js').Workspace>,
 *   addTab: (workspaceId: string, tab: import('../shared/types.js').Tab) => Promise<import('../shared/types.js').Workspace>,
 *   deleteTab: (workspaceId: string, tabId: string) => Promise<import('../shared/types.js').Workspace>,
 *   updateTab: (workspaceId: string, tab: import('../shared/types.js').Tab) => Promise<import('../shared/types.js').Workspace>,
 *   deleteWorkspace: (workspaceId: string) => Promise<void>,
 *   updatePreferences: (partial: Partial<import('../shared/types.js').Preferences>) => Promise<import('../shared/types.js').Preferences>,
 *   clearMetadataCache: () => Promise<number>,
 *   clearAllWorkspaces: () => Promise<number>,
 *   importWorkspaces: () => Promise<{ imported: number }>,
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
