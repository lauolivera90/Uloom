import { readConfig } from '../data/configRepository.js';

/**
 * Devuelve el contenido actual de la configuración.
 * @returns {import('../../renderer/shared/types.js').Config}
 */
export function getConfig() {
  return readConfig();
}