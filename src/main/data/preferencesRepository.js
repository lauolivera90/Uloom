import { readConfig, writeConfig } from './configStore.js';

/**
 * Devuelve las preferencias globales persistidas (normalizadas al leer).
 * @returns {import('../../renderer/shared/types.js').Preferences}
 */
export function getPreferences() {
  return readConfig().preferences;
}

/**
 * Actualiza las preferencias globales por merge parcial y las persiste.
 * No reemplaza el objeto completo: solo combina las claves provistas sobre las
 * existentes, dejando intactas las demás preferencias.
 * @param {Partial<import('../../renderer/shared/types.js').Preferences>} partial
 * @returns {import('../../renderer/shared/types.js').Preferences}
 */
export function updatePreferences(partial) {
  const config = readConfig();
  const next = {
    ...config.preferences,
    ...partial,
  };
  config.preferences = next;
  writeConfig(config);
  return next;
}