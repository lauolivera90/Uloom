import {
  getPreferences as getPreferencesFromRepository,
  updatePreferences as updatePreferencesInRepository,
} from '../data/preferencesRepository.js';

/**
 * Devuelve las preferencias globales de la aplicación.
 * @returns {import('../../renderer/shared/types.js').Preferences}
 */
export function getPreferences() {
  return getPreferencesFromRepository();
}

/**
 * Actualiza las preferencias globales por merge parcial. Delega en el repositorio.
 * @param {Partial<import('../../renderer/shared/types.js').Preferences>} partial
 * @returns {import('../../renderer/shared/types.js').Preferences}
 */
export function updatePreferences(partial) {
  return updatePreferencesInRepository(partial);
}