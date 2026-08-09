import { ipcMain } from 'electron';
import { fetchPageMetadata } from '../services/pageService.js';

/**
 * Registra el canal `page:metadata` que trae metadatos web (title + favicon as
 * data URL) para una URL. Envuelve en try/catch y responde con la forma
 * { success, data, error }; el service ya hace soft-fallback a null.
 */
export function registerPageHandlers() {
  ipcMain.handle('page:metadata', async (_event, url) => {
    try {
      const data = await fetchPageMetadata(url);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  });
}