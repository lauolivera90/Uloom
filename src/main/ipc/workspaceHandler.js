import { ipcMain } from 'electron';
import {
  getConfig,
  createWorkspace,
  duplicateWorkspace,
  updateWorkspace,
  deleteWorkspace,
  clearMetadataCache,
  deleteAllWorkspaces,
} from '../services/workspaceService.js';

/**
 * Registra los canales del dominio workspace: lectura de la configuración completa
 * (`config:get`), CRUD de sesiones (`workspace:create`, `workspace:duplicate`,
 * `workspace:update`, `workspace:delete`) y limpieza (`workspace:clearMetadataCache`,
 * `workspace:clearAll`). Todo handler envuelve en try/catch y responde con la forma
 * { success, data, error }.
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

  ipcMain.handle('workspace:duplicate', (event, sourceId, input) => {
    try {
      const duplicated = duplicateWorkspace(sourceId, input);
      return { success: true, data: duplicated, error: null };
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

  ipcMain.handle('workspace:delete', (event, workspaceId) => {
    try {
      deleteWorkspace(workspaceId);
      return { success: true, data: null, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  });

  ipcMain.handle('workspace:clearMetadataCache', () => {
    try {
      const cleared = clearMetadataCache();
      return { success: true, data: { cleared }, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  });

  ipcMain.handle('workspace:clearAll', () => {
    try {
      const deleted = deleteAllWorkspaces();
      return { success: true, data: { deleted }, error: null };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  });
}