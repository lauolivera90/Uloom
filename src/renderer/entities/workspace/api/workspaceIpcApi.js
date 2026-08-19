/**
 * @typedef {import('../../../shared/types.js').Config} Config
 * @typedef {import('../../../shared/types.js').Workspace} Workspace
 * @typedef {import('../../../shared/types.js').Preferences} Preferences
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
 * Duplica una sesión existente por su id: el main clona su configuración de
 * lanzamiento y sus pestañas (con ids nuevos) en un workspace nuevo con id nuevo.
 * @param {string} sourceId
 * @param {{ name: string, description?: string, icon?: string }} input
 * @returns {Promise<Workspace>}
 */
export async function duplicateWorkspace(sourceId, input) {
  const response = await window.uloomApi.duplicateWorkspace(sourceId, input);
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
 * Elimina un workspace existente por su id (baja estricta). Lanza si el proceso
 * main responde con error (p. ej. id inexistente).
 * @param {string} workspaceId
 * @returns {Promise<null>}
 */
export async function deleteWorkspace(workspaceId) {
  const response = await window.uloomApi.deleteWorkspace(workspaceId);
  if (!response.success) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * Obtiene los metadatos web de una URL: el <title> del sitio y su favicon como
 * data URL. Cualquier fallo se resuelve con campos en `null` (soft-fallback del
 * main; esta capa solo convierte la forma de respuesta).
 * @param {string} url
 * @returns {Promise<{ title: string | null, favicon: string | null }>}
 */
export async function getPageMetadata(url) {
  const response = await window.uloomApi.getPageMetadata(url);
  if (!response.success) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * Lanza una sesión en el navegador resuelto: abre todas las pestañas del
 * workspace en el proceso main (spawn del navegador o openExternal según la
 * configuración de sesión/global). Lanza si el main responde con error. Desde
 * v0.6.2 la respuesta incluye la sesión persistida actualizada con los datos de
 * uso (`workspace`), o `null` si no hubo apertura.
 * @param {string} workspaceId
 * @returns {Promise<{ opened: number, failed: number, workspace: import('../../../shared/types.js').Workspace | null }>}
 */
export async function launchWorkspace(workspaceId) {
  const response = await window.uloomApi.launchWorkspace(workspaceId);
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
 * Resuelve el navegador predeterminado del sistema operativo si pertenece al
 * catálogo conocido (chrome/edge/firefox/brave/opera/vivaldi). Devuelve `null` si
 * el default no se puede resolver o no es un navegador del catálogo.
 * @returns {Promise<{ id: string, name: string } | null>}
 */
export async function getSystemDefaultBrowser() {
  const response = await window.uloomApi.getSystemDefaultBrowser();
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

/**
 * Limpia la caché de metadatos web de todas las pestañas (favicons en
 * `Tab.favicon`). Lanza si el main responde con error.
 * @returns {Promise<{ cleared: number }>}
 */
export async function clearMetadataCache() {
  const response = await window.uloomApi.clearMetadataCache();
  if (!response.success) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * Elimina todas las sesiones preservando las preferencias globales. Lanza si el
 * main responde con error.
 * @returns {Promise<{ deleted: number }>}
 */
export async function clearAllWorkspaces() {
  const response = await window.uloomApi.clearAllWorkspaces();
  if (!response.success) {
    throw new Error(response.error);
  }
  return response.data;
}