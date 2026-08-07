/**
 * @typedef {import('../../shared/types.js').Config} Config
 * @typedef {import('../../shared/types.js').Workspace} Workspace
 * @typedef {import('../../shared/types.js').Preferences} Preferences
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

/**
 * Persiste un workspace nuevo (el id lo genera el proceso main).
 * @param {{ name: string, description?: string, icon?: string }} input
 * @returns {Promise<Workspace>}
 */
export async function createWorkspace(input) {
  const response = await window.uloomApi.createWorkspace(input);
  if (!response.success) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * Actualiza un workspace existente por su id (update estricto). Lanza si el
 * proceso main responde con error (p. ej. id inexistente).
 * @param {Workspace} workspace
 * @returns {Promise<Workspace>}
 */
export async function updateWorkspace(workspace) {
  const response = await window.uloomApi.updateWorkspace(workspace);
  if (!response.success) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * Obtiene la lista de navegadores instalados detectados por el proceso main.
 * @returns {Promise<Array<{ id: string, name: string }>>}
 */
export async function getInstalledBrowsers() {
  const response = await window.uloomApi.getInstalledBrowsers();
  if (!response.success) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * Actualiza las preferencias globales por merge parcial (el main combina las
 * claves provistas sobre las existentes).
 * @param {Partial<Preferences>} partial
 * @returns {Promise<Preferences>}
 */
export async function updatePreferences(partial) {
  const response = await window.uloomApi.updatePreferences(partial);
  if (!response.success) {
    throw new Error(response.error);
  }
  return response.data;
}