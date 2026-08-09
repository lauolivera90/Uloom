import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';

const APP_VERSION = '0.3.2';

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
export function normalizePreferences(preferences) {
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
 * Lee, valida y devuelve la configuración cruda persistida (los workspaces pasan
 * sin normalizar — la normalización de la entidad vive en su repositorio).
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