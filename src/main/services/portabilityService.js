import { dialog } from 'electron';
import fs from 'node:fs';
import { getConfig, getWorkspaceById } from '../data/workspaceRepository.js';

const APP_ID = 'uloom';
const SCHEMA_VERSION = '0.4.1';

/**
 * Transforma un nombre en un nombre de archivo seguro: elimina caracteres inválidos
 * de Windows (`/\:*?"<>|`), colapsa espacios y guiones, y recorta puntos/espacios finales.
 * @param {string} name
 * @returns {string}
 */
function slugifyName(name) {
  return name
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[.\s]+|[.\s]+$/g, '');
}

/**
 * Arma el payload de exportación con el wrapper de metadatos (app, kind,
 * schemaVersion, exportedAt) alrededor de los workspaces a exportar.
 * @param {'workspace' | 'backup'} kind Tipo de exportación: sesión individual o respaldo completo.
 * @param {import('../../renderer/shared/types.js').Workspace[]} workspaces
 * @returns {Object}
 */
function buildExportPayload(kind, workspaces) {
  return {
    app: APP_ID,
    kind,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: workspaces,
  };
}

/**
 * Abre el diálogo nativo de guardado y escribe el JSON en disco. Si el usuario
 * cancela, devuelve `{ canceled: true }` (no es un error).
 * @param {Object} payload
 * @param {string} defaultPath Nombre de archivo sugerido.
 * @param {string} title
 * @returns {Promise<{ canceled: boolean, filePath?: string }>}
 */
async function saveJsonToDisk(payload, defaultPath, title) {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title,
    defaultPath,
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  if (canceled || !filePath) {
    return { canceled: true };
  }
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
  return { canceled: false, filePath };
}

/**
 * Exporta una sesión individual a un archivo `.json` (wrapper kind 'workspace').
 * Abre el diálogo de guardado con nombre sugerido a partir del nombre de la sesión.
 * @param {string} workspaceId
 * @returns {Promise<{ canceled: boolean, filePath?: string }>}
 */
export async function exportWorkspace(workspaceId) {
  const workspace = getWorkspaceById(workspaceId);
  const payload = buildExportPayload('workspace', [workspace]);
  const defaultPath = `${slugifyName(workspace.name) || 'sesion'}.json`;
  return saveJsonToDisk(payload, defaultPath, 'Exportar sesión');
}

/**
 * Exporta un respaldo completo de todas las sesiones a un archivo `.json`
 * (wrapper kind 'backup'). No incluye `preferences` (el import de v0.4.2
 * reconstruye sesiones).
 * @returns {Promise<{ canceled: boolean, filePath?: string }>}
 */
export async function exportAll() {
  const { workspaces } = getConfig();
  const payload = buildExportPayload('backup', workspaces);
  const today = new Date().toISOString().slice(0, 10);
  const defaultPath = `uloom-backup-${today}.json`;
  return saveJsonToDisk(payload, defaultPath, 'Exportar todo');
}
