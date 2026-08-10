/**
 * Exporta una sesión individual a un archivo `.json` vía el diálogo nativo de
 * guardado del proceso main. `canceled: true` significa que el usuario canceló
 * el diálogo (no es un error).
 * @param {string} workspaceId
 * @returns {Promise<{ canceled: boolean, filePath?: string }>}
 */
export async function exportWorkspace(workspaceId) {
  const response = await window.uloomApi.exportWorkspace(workspaceId);
  if (!response.success) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * Exporta un respaldo completo de todas las sesiones a un archivo `.json` vía el
 * diálogo nativo de guardado del proceso main.
 * @returns {Promise<{ canceled: boolean, filePath?: string }>}
 */
export async function exportAll() {
  const response = await window.uloomApi.exportAll();
  if (!response.success) {
    throw new Error(response.error);
  }
  return response.data;
}
