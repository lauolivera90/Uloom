import { ipcMain } from 'electron';
import { getTabHistory, clearTabHistory } from '../services/tabHistoryService.js';

/**
 * Registra los canales del dominio historial de pestañas: lectura (`tabHistory:get`,
 * lista de tabs usadas para el modal de agregar) y limpieza (`tabHistory:clear`).
 * Todo handler envuelve en try/catch y responde con la forma { success, data, error }.
 */
export function registerTabHistoryHandlers() {
  ipcMain.handle('tabHistory:get', () => {
    try {
      const history = getTabHistory();
      return { success: true, data: history, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  });

  ipcMain.handle('tabHistory:clear', () => {
    try {
      const cleared = clearTabHistory();
      return { success: true, data: { cleared }, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  });
}