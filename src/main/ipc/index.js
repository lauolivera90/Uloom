import { registerWorkspaceHandlers } from './workspaceHandler.js';
import { registerBrowserHandlers } from './browserHandler.js';
import { registerPreferencesHandlers } from './preferencesHandler.js';
import { registerPageHandlers } from './pageHandler.js';
import { registerLauncherHandlers } from './launcherHandler.js';
import { registerPortabilityHandlers } from './portabilityHandler.js';
import { registerTabHistoryHandlers } from './tabHistoryHandler.js';

/**
 * Registra todos los handlers de IPC del proceso main, agrupados por dominio.
 * Todo handler responde con la forma { success, data, error } y atrapa cualquier error.
 */
export function registerIpcHandlers() {
  registerWorkspaceHandlers();
  registerBrowserHandlers();
  registerPreferencesHandlers();
  registerPageHandlers();
  registerLauncherHandlers();
  registerPortabilityHandlers();
  registerTabHistoryHandlers();
}