import { ipcMain } from 'electron';
import { getConfig, createWorkspace, updateWorkspace } from '../services/workspaceService.js';

/**
 * Registra los canales del dominio workspace: lectura de la configuración completa
 * (`config:get`) y CRUD de sesiones (`workspace:create`, `workspace:update`).
 * Todo handler envuelve en try/catch y responde con la forma { success, data, error }.
 */
export function registerWorkspaceHandlers() {
  ipcMain.handle('config:get', () => {
    try {
      const config = getConfig();
      return { success: true, data: config };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  });

  ipcMain.handle('workspace:create', (event, input) => {
    try {
      const created = createWorkspace(input);
      return { success: true, data: created, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  });

  ipcMain.handle('workspace:update', (event, workspace) => {
    try {
      const updated = updateWorkspace(workspace);
      return { success: true, data: updated, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  });
}