/**
 * @typedef {import('../../shared/types.js').Config} Config
 * @typedef {import('../../shared/types.js').Workspace} Workspace
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