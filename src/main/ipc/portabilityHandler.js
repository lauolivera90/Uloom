import { ipcMain } from 'electron';
import { exportWorkspace, exportAll, importFromFile } from '../services/portabilityService.js';

/**
 * Forma de respuesta IPC estándar con el `code` de error opcional del dominio
 * portabilidad (ver `PORTABILITY_ERROR_CODES`). Permite al frontend mapear cada
 * fallo de importación a un mensaje localizado.
 * @typedef {Object} PortabilityErrorResponse
 * @property {boolean} success
 * @property {*} data
 * @property {string | null} error
 * @property {string} [code]
 */

/**
 * Registra los canales del dominio portabilidad: `portability:exportWorkspace`
 * (sesión individual), `portability:exportAll` (respaldo completo) y
 * `portability:import` (importación de sesiones desde un `.json`). Los flujos
 * de exportación abren el diálogo nativo de guardado y escriben el `.json`; el
 * import abre el diálogo de apertura, valida el wrapper y reescribe el catálogo.
 * Envuelven en try/catch y responden con la forma { success, data, error } (con
 * `code` cuando el error es de portabilidad); cancelar un diálogo no es un error
 * (data.canceled = true).
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
      const response = { success: false, data: null, error: error.message };
      if (error.code) {
        response.code = error.code;
      }
      return response;
    }
  });
}
