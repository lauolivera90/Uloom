import { readConfig, writeConfig } from './configStore.js';

/**
 * Cantidad máxima de entradas del historial de pestañas: se evictan las menos
 * usadas cuando el registro supera el tope (registro liviano, no un log completo).
 * @type {number}
 */
const MAX_TAB_HISTORY = 20;

/**
 * Normaliza el historial de pestañas para persistencia: garantiza que sea un
 * array, descarta entradas sin URL válida y rellena defaults de `name`/`count`/
 * `lastUsedAt` ante configs viejas o ediciones manuales del JSON.
 * @param {unknown} tabHistory
 * @returns {import('../../renderer/shared/types.js').TabHistoryEntry[]}
 */
export function normalizeTabHistory(tabHistory) {
  if (!Array.isArray(tabHistory)) return [];
  return tabHistory
    .filter((entry) => entry && typeof entry.url === 'string' && entry.url !== '')
    .map((entry) => ({
      url: entry.url,
      name: typeof entry.name === 'string' && entry.name !== '' ? entry.name : entry.url,
      icon: entry.icon,
      favicon: entry.favicon,
      count: typeof entry.count === 'number' && entry.count > 0 ? entry.count : 1,
      lastUsedAt:
        typeof entry.lastUsedAt === 'string'
          ? entry.lastUsedAt
          : new Date(0).toISOString(),
    }));
}

/**
 * Ordena el historial de más usada a menos usada, desempatando por la más
 * reciente (los más usados quedan primero para la UI).
 * @param {import('../../renderer/shared/types.js').TabHistoryEntry[]} tabHistory
 * @returns {import('../../renderer/shared/types.js').TabHistoryEntry[]}
 */
function sortTabHistory(tabHistory) {
  return [...tabHistory].sort(
    (a, b) => b.count - a.count || b.lastUsedAt.localeCompare(a.lastUsedAt),
  );
}

/**
 * Devuelve el historial de pestañas persistido, normalizado y ordenado
 * (más usadas primero, luego las más recientes).
 * @returns {import('../../renderer/shared/types.js').TabHistoryEntry[]}
 */
export function readTabHistory() {
  const config = readConfig();
  return sortTabHistory(normalizeTabHistory(config.tabHistory));
}

/**
 * Registra pestañas usadas (agregadas o lanzadas) en el historial. Upsert por
 * URL: una URL existente incrementa `count`, actualiza `lastUsedAt` y refresca
 * `name`/`icon`/`favicon` con el valor más reciente; una URL nueva crea la
 * entrada con `count: 1`. Después ordena y aplica el cap (`MAX_TAB_HISTORY`,
 * evicción de las menos usadas). Devuelve el historial final persistido.
 * @param {Array<{ url: string, name?: string, icon?: string, favicon?: string }>} tabs
 * @returns {import('../../renderer/shared/types.js').TabHistoryEntry[]}
 */
export function recordTabs(tabs) {
  const config = readConfig();
  const history = normalizeTabHistory(config.tabHistory);
  const now = new Date().toISOString();

  for (const tab of tabs) {
    if (!tab || typeof tab.url !== 'string' || tab.url === '') continue;
    const index = history.findIndex((entry) => entry.url === tab.url);
    const name = typeof tab.name === 'string' && tab.name !== '' ? tab.name : null;
    if (index === -1) {
      history.push({
        url: tab.url,
        name: name ?? tab.url,
        icon: tab.icon,
        favicon: tab.favicon,
        count: 1,
        lastUsedAt: now,
      });
    } else {
      const current = history[index];
      history[index] = {
        ...current,
        name: name ?? current.name,
        icon: tab.icon ?? current.icon,
        favicon: tab.favicon ?? current.favicon,
        count: current.count + 1,
        lastUsedAt: now,
      };
    }
  }

  config.tabHistory = sortTabHistory(history).slice(0, MAX_TAB_HISTORY);
  writeConfig(config);
  return config.tabHistory;
}

/**
 * Vacía el historial de pestañas usadas. Devuelve la cantidad de entradas
 * removidas.
 * @returns {number}
 */
export function clearTabHistory() {
  const config = readConfig();
  const cleared = normalizeTabHistory(config.tabHistory).length;
  config.tabHistory = [];
  writeConfig(config);
  return cleared;
}