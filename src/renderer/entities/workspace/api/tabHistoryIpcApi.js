/**
 * @typedef {import('../../../shared/types.js').TabHistoryEntry} TabHistoryEntry
 */

/**
 * Obtiene el historial de pestañas usadas desde el proceso main vía el puente
 * IPC (ya viene ordenado: más usadas primero, luego las más recientes). Convierte
 * una respuesta { success: false, error } en un throw del mensaje de error.
 * @returns {Promise<TabHistoryEntry[]>}
 */
export async function getTabHistory() {
  const response = await window.uloomApi.getTabHistory();
  if (!response.success) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * Vacía el historial de pestañas usadas. Lanza si el main responde con error.
 * @returns {Promise<{ cleared: number }>}
 */
export async function clearTabHistory() {
  const response = await window.uloomApi.clearTabHistory();
  if (!response.success) {
    throw new Error(response.error);
  }
  return response.data;
}