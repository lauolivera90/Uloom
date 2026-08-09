import { ipcMain } from 'electron';
import { getInstalledBrowsers, getSystemDefaultBrowser } from '../services/browserService.js';

/**
 * Registra los canales de navegadores. Envuelven en try/catch y responden con la
 * forma { success, data, error }.
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

  ipcMain.handle('browser:system', async () => {
    try {
      const browser = await getSystemDefaultBrowser();
      return { success: true, data: browser, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  });
}