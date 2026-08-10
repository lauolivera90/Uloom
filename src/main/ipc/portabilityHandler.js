import { ipcMain } from 'electron';
import { exportWorkspace, exportAll } from '../services/portabilityService.js';

/**
 * Registra los canales del dominio portabilidad: `portability:exportWorkspace`
 * (sesión individual) y `portability:exportAll` (respaldo completo). Ambos abren
 * el diálogo nativo de guardado en el proceso main y escriben el `.json`.
 * Envuelven en try/catch y responden con la forma { success, data, error };
 * cancelar el diálogo no es un error (data.canceled = true).
 */
export function registerPortabilityHandlers() {
  ipcMain.handle('portability:exportWorkspace', async (_event, workspaceId) => {
    try {
      const data = await exportWorkspace(workspaceId);
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  });

  ipcMain.handle('portability:exportAll', async () => {
    try {
      const data = await exportAll();
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  });
}
