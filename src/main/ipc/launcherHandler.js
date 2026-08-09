import { ipcMain } from 'electron';
import { launchWorkspace } from '../services/launcherService.js';

/**
 * Registra el canal del dominio launch: `workspace:launch` abre todas las
 * pestañas de la sesión en el navegador resuelto (sesión → global → sistema).
 * Envuelve en try/catch y responde con la forma { success, data, error }.
 */
export function registerLauncherHandlers() {
  ipcMain.handle('workspace:launch', async (event, workspaceId) => {
    try {
      const result = await launchWorkspace(workspaceId);
      return { success: true, data: result, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  });
}