/**
 * @typedef {import('../../shared/types.js').Config} Config
 */

/**
 * Obtiene la configuración actual desde el proceso main vía el puente IPC.
 * Convierte una respuesta { success: false, error } en un throw del mensaje de error.
 * @returns {Promise<Config>}
 */
export async function getConfig() {
  const response = await window.uloomApi.getConfig();
  if (!response.success) {
    throw new Error(response.error);
  }
  return response.data;
}