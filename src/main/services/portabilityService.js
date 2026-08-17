import { dialog } from 'electron';
import fs from 'node:fs';
import {
  getConfig,
  getWorkspaceById,
  importWorkspaces,
} from '../data/workspaceRepository.js';

const APP_ID = 'uloom';
const SCHEMA_VERSION = '0.4.1';

/**
 * Códigos de error del dominio portabilidad. Se adjuntan a los `Error` lanzados
 * por la importación para que el frontend mapee cada fallo a un mensaje
 * localizado (regla 7 de rules.md); el handler IPC los propaga en la respuesta.
 * @type {Record<string, string>}
 */
export const PORTABILITY_ERROR_CODES = {
  INVALID_JSON: 'INVALID_JSON',
  NOT_ULOOLM_FILE: 'NOT_ULOOLM_FILE',
  UNSUPPORTED_KIND: 'UNSUPPORTED_KIND',
  INVALID_SCHEMA_VERSION: 'INVALID_SCHEMA_VERSION',
  INVALID_WORKSPACES: 'INVALID_WORKSPACES',
  READ_ERROR: 'READ_ERROR',
  PERSIST_ERROR: 'PERSIST_ERROR',
};

/**
 * Crea un `Error` de portabilidad con `code` adjunto para que las capas superiores
 * (handler IPC → API del renderer → hooks) propaguen el identificador del fallo.
 * @param {keyof typeof PORTABILITY_ERROR_CODES} code
 * @param {string} message Mensaje dev-facing (no se traduce, convención rules.md §9).
 * @returns {Error}
 */
function createPortabilityError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

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
 * (wrapper kind 'backup'). No incluye `preferences` (el import reconstruye
 * sesiones).
 * @returns {Promise<{ canceled: boolean, filePath?: string }>}
 */
export async function exportAll() {
  const { workspaces } = getConfig();
  const payload = buildExportPayload('backup', workspaces);
  const today = new Date().toISOString().slice(0, 10);
  const defaultPath = `uloom-backup-${today}.json`;
  return saveJsonToDisk(payload, defaultPath, 'Exportar todo');
}

/**
 * Valida el contenido de un archivo de portabilidad: debe ser un JSON con el
 * wrapper de Uloom (`app: 'uloom'`, `kind: 'workspace' | 'backup'`,
 * `schemaVersion` string) y `data` como array de workspaces con `name` string.
 * Los workspaces se normalizan (tabs/openBehavior/browser) antes de persistir.
 * @param {string} raw Contenido crudo del archivo seleccionado.
 * @returns {{ kind: 'workspace' | 'backup', workspaces: import('../../renderer/shared/types.js').Workspace[] }}
 */
function parseImportPayload(raw) {
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw createPortabilityError(PORTABILITY_ERROR_CODES.INVALID_JSON, 'El archivo no es un JSON válido');
  }

  if (!payload || payload.app !== APP_ID) {
    throw createPortabilityError(PORTABILITY_ERROR_CODES.NOT_ULOOLM_FILE, 'No es un archivo de sesiones de Uloom');
  }
  if (payload.kind !== 'workspace' && payload.kind !== 'backup') {
    throw createPortabilityError(PORTABILITY_ERROR_CODES.UNSUPPORTED_KIND, 'Tipo de archivo no reconocido (se espera workspace o backup)');
  }
  if (typeof payload.schemaVersion !== 'string') {
    throw createPortabilityError(PORTABILITY_ERROR_CODES.INVALID_SCHEMA_VERSION, 'El archivo no indica una versión de esquema válida');
  }
  if (!Array.isArray(payload.data) || payload.data.some((item) => !item || typeof item.name !== 'string')) {
    throw createPortabilityError(PORTABILITY_ERROR_CODES.INVALID_WORKSPACES, 'El archivo no contiene sesiones válidas');
  }

  return { kind: payload.kind, workspaces: payload.data };
}

/**
 * Importa sesiones desde un archivo `.json` elegido con el diálogo nativo de
 * apertura. Un `kind: 'workspace'` (sesión individual) agrega la sesión al
 * catálogo sin tocar lo existente; un `kind: 'backup'` (respaldo completo)
 * reemplaza todas las sesiones locales preservando `preferences`. Devuelve
 * `{ canceled, imported }` con la lista final persistida; cancelar el diálogo
 * no es un error. Si el archivo no es un wrapper de Uloom válido, lanza.
 * @returns {Promise<{ canceled: boolean, imported?: import('../../renderer/shared/types.js').Workspace[] }>}
 */
export async function importFromFile() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Importar sesiones',
    properties: ['openFile'],
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  if (canceled || filePaths.length === 0) {
    return { canceled: true };
  }

  let raw;
  try {
    raw = fs.readFileSync(filePaths[0], 'utf-8');
  } catch {
    throw createPortabilityError(PORTABILITY_ERROR_CODES.READ_ERROR, 'No se pudo leer el archivo seleccionado');
  }

  const { kind, workspaces } = parseImportPayload(raw);
  let imported;
  try {
    imported = importWorkspaces(workspaces, { replace: kind === 'backup' });
  } catch {
    throw createPortabilityError(PORTABILITY_ERROR_CODES.PERSIST_ERROR, 'No se pudieron guardar las sesiones importadas');
  }
  return { canceled: false, imported };
}
