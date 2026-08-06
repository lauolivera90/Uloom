import { ipcMain } from 'electron';
import { getConfig } from '../services/configService.js';

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
}