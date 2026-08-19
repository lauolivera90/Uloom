import {
  readTabHistory,
  recordTabs as recordTabsInRepository,
  clearTabHistory as clearTabHistoryInRepository,
} from '../data/tabHistoryRepository.js';

/**
 * Devuelve el historial de pestañas usadas, normalizado y ordenado (más usadas
 * primero, luego las más recientes). Lo consume la sección de reuso del modal de
 * agregar pestaña.
 * @returns {import('../../renderer/shared/types.js').TabHistoryEntry[]}
 */
export function getTabHistory() {
  return readTabHistory();
}

/**
 * Mapea una pestaña a la forma que consume el repositorio del historial (solo los
 * campos que se persisten). Centralizado acá para que todos los servicios que
 * registran uso (workspace, launcher) compartan el mismo mapeo.
 * @param {import('../../renderer/shared/types.js').Tab} tab
 * @returns {{ url: string, name?: string, icon?: string, favicon?: string }}
 */
function tabToHistoryEntry(tab) {
  return { url: tab.url, name: tab.name, icon: tab.icon, favicon: tab.favicon };
}

/**
 * Registra pestañas usadas en el historial (upsert por URL, cap de entradas).
 * Lo invocan el alta de pestañas (`workspaceService.updateWorkspace`, diff de
 * URLs nuevas) y el lanzamiento (`launcherService.launchWorkspace`, URLs abiertas).
 * @param {import('../../renderer/shared/types.js').Tab[]} tabs
 * @returns {import('../../renderer/shared/types.js').TabHistoryEntry[]}
 */
export function recordTabs(tabs) {
  return recordTabsInRepository(tabs.map(tabToHistoryEntry));
}

/**
 * Registra pestañas usadas sin condicionar el resultado de la operación primaria:
 * un fallo del historial (side-effect no crítico) solo se loguea, nunca convierte
 * un alta/lanzamiento exitoso en un error del canal IPC.
 * @param {import('../../renderer/shared/types.js').Tab[]} tabs
 * @returns {void}
 */
export function recordTabsBestEffort(tabs) {
  try {
    recordTabs(tabs);
  } catch (error) {
    console.error('Error al registrar el historial de pestañas:', error);
  }
}

/**
 * Vacía el historial de pestañas usadas. Devuelve la cantidad de entradas
 * removidas.
 * @returns {number}
 */
export function clearTabHistory() {
  return clearTabHistoryInRepository();
}