import { ipcMain } from 'electron';
import { getInstalledBrowsers } from '../services/browserService.js';

/**
 * Registra el canal `browser:list` que devuelve los navegadores instalados.
 * Envuelve en try/catch y responde con la forma { success, data, error }.
 */
export function registerBrowserHandlers() {
  ipcMain.handle('browser:list', () => {
    try {
      const browsers = getInstalledBrowsers();
      return { success: true, data: browsers, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  });
}