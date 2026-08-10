import { ipcMain } from 'electron';
import { exportWorkspace, exportAll, importFromFile } from '../services/portabilityService.js';

/**
 * Registra los canales del dominio portabilidad: `portability:exportWorkspace`
 * (sesión individual), `portability:exportAll` (respaldo completo) y
 * `portability:import` (importación de sesiones desde un `.json`). Los flujos
 * de exportación abren el diálogo nativo de guardado y escriben el `.json`; el
 * import abre el diálogo de apertura, valida el wrapper y reescribe el catálogo.
 * Envuelven en try/catch y responden con la forma { success, data, error };
 * cancelar un diálogo no es un error (data.canceled = true).
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

  ipcMain.handle('portability:import', async () => {
    try {
      const data = await importFromFile();
      return { success: true, data, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  });
}
