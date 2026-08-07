import { ipcMain } from 'electron';
import { getConfig, createWorkspace, updateWorkspace } from '../services/configService.js';
import { registerBrowserHandlers } from './browserHandler.js';
import { registerPreferencesHandlers } from './preferencesHandler.js';

/**
 * Registra todos los handlers de IPC del proceso main.
 * Todo handler responde con la forma { success, data, error } y atrapa cualquier error.
 */
export function registerIpcHandlers() {
  ipcMain.handle('config:get', () => {
    try {
      const config = getConfig();
      return { success: true, data: config };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  });

  ipcMain.handle('workspace:create', (event, input) => {
    try {
      const created = createWorkspace(input);
      return { success: true, data: created, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  });

  ipcMain.handle('workspace:update', (event, workspace) => {
    try {
      const updated = updateWorkspace(workspace);
      return { success: true, data: updated, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  });

  registerBrowserHandlers();
  registerPreferencesHandlers();
}