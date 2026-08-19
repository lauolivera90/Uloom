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

/**
 * Importa sesiones desde un archivo `.json` elegido con el diálogo nativo de
 * apertura del proceso main. Un respaldo (`kind: 'backup'`) reemplaza el
 * catálogo; una sesión individual (`kind: 'workspace'`) se agrega a las
 * existentes. `canceled: true` significa que el usuario canceló el diálogo (no
 * es un error); ante un archivo inválido el main responde `{ success: false }` y
 * esta capa lo convierte en throw, adjuntando el `code` de error de portabilidad
 * (para que el caller mapee el fallo a un mensaje localizado).
 * @returns {Promise<{ canceled: boolean, imported?: import('../../../shared/types.js').Workspace[] }>}
 */
export async function importFromFile() {
  const response = await window.uloomApi.importFromFile();
  if (!response.success) {
    const error = new Error(response.error);
    if (response.code) {
      error.code = response.code;
    }
    throw error;
  }
  return response.data;
}
