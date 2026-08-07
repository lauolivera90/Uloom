import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';

const APP_VERSION = '0.2.2';

/**
 * Devuelve la estructura de config por defecto cuando el archivo no existe o está corrupto.
 * @returns {import('../../renderer/shared/types.js').Config}
 */
function defaultConfig() {
  return {
    version: APP_VERSION,
    preferences: {
      defaultBrowser: 'system',
    },
    workspaces: [],
  };
}

/**
 * Normaliza las preferencias globales para persistencia y migración:
 * garantiza la existencia de `defaultBrowser` (default 'system').
 * @param {import('../../renderer/shared/types.js').Preferences} [preferences]
 * @returns {import('../../renderer/shared/types.js').Preferences}
 */
function normalizePreferences(preferences) {
  return {
    defaultBrowser: preferences?.defaultBrowser ?? 'system',
  };
}

/**
 * Devuelve la ruta absoluta al archivo de configuración en el directorio de datos del usuario.
 * @returns {string}
 */
function getConfigFilePath() {
  return path.join(app.getPath('userData'), 'config.json');
}

/**
 * Normaliza un workspace para persistencia: garantiza que `tabs` sea un array y
 * rellena los defaults de navegador (`openBehavior`, `browser`) ante configs viejas.
 * @param {import('../../renderer/shared/types.js').Workspace} workspace
 * @returns {import('../../renderer/shared/types.js').Workspace}
 */
function normalizeWorkspace(workspace) {
  return {
    ...workspace,
    tabs: Array.isArray(workspace.tabs) ? workspace.tabs : [],
    openBehavior: workspace.openBehavior ?? 'active-tab',
    browser: workspace.browser ?? null,
  };
}

/**
 * Lee, valida y devuelve la configuración persistida.
 * Si el archivo no existe o no tiene un formato válido, se crea/restaura el default.
 * @returns {import('../../renderer/shared/types.js').Config}
 */
export function readConfig() {
  const filePath = getConfigFilePath();

  if (!fs.existsSync(filePath)) {
    return writeConfig(defaultConfig());
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.workspaces)) {
      throw new Error('Formato de config.json inválido');
    }
    parsed.workspaces = parsed.workspaces.map(normalizeWorkspace);
    parsed.preferences = normalizePreferences(parsed.preferences);
    return parsed;
  } catch (error) {
    return writeConfig(defaultConfig());
  }
}

/**
 * Persiste la configuración en disco.
 * @param {import('../../renderer/shared/types.js').Config} config
 * @returns {import('../../renderer/shared/types.js').Config}
 */
export function writeConfig(config) {
  const filePath = getConfigFilePath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf-8');
  return config;
}

/**
 * Agrega un workspace nuevo al archivo de configuración y lo persiste.
 * @param {import('../../renderer/shared/types.js').Workspace} workspace
 * @returns {import('../../renderer/shared/types.js').Workspace}
 */
export function addWorkspace(workspace) {
  const config = readConfig();
  const saved = normalizeWorkspace(workspace);
  config.workspaces.push(saved);
  writeConfig(config);
  return saved;
}

/**
 * Actualiza un workspace existente por su id (update estricto: no inserta).
 * Si el id no existe, lanza; de lo contrario escribe y devuelve el persistido.
 * @param {import('../../renderer/shared/types.js').Workspace} nextWorkspace
 * @returns {import('../../renderer/shared/types.js').Workspace}
 */
export function updateWorkspace(nextWorkspace) {
  const config = readConfig();
  const index = config.workspaces.findIndex((workspace) => workspace.id === nextWorkspace.id);
  if (index === -1) {
    throw new Error('Workspace no encontrado');
  }
  const saved = normalizeWorkspace(nextWorkspace);
  config.workspaces[index] = saved;
  writeConfig(config);
  return saved;
}