import { registerWorkspaceHandlers } from './workspaceHandler.js';
import { registerBrowserHandlers } from './browserHandler.js';
import { registerPreferencesHandlers } from './preferencesHandler.js';

/**
 * Registra todos los handlers de IPC del proceso main, agrupados por dominio.
 * Todo handler responde con la forma { success, data, error } y atrapa cualquier error.
 */
export function registerIpcHandlers() {
  registerWorkspaceHandlers();
  registerBrowserHandlers();
  registerPreferencesHandlers();
}