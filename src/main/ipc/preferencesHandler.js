import { ipcMain } from 'electron';
import { updatePreferences } from '../services/preferencesService.js';

/**
 * Registra el canal `config:updatePreferences` que persiste preferencias globales.
 * Envuelve en try/catch y responde con la forma { success, data, error }.
 */
export function registerPreferencesHandlers() {
  ipcMain.handle('config:updatePreferences', (event, partial) => {
    try {
      const preferences = updatePreferences(partial);
      return { success: true, data: preferences, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  });
}