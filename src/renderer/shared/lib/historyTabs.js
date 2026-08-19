/**
 * @typedef {import('../types.js').Tab} Tab
 * @typedef {import('../types.js').TabHistoryEntry} TabHistoryEntry
 */

/**
 * Genera un id único para una pestaña nueva del lote. Prefiere
 * `crypto.randomUUID()` (contexto seguro, disponible en el renderer de Electron);
 * si no, cae a la convención `tab-<timestamp>-<índice>` del proyecto.
 * @param {number} index Índice de la pestaña dentro del lote (solo para el fallback).
 * @returns {string}
 */
function newTabId(index) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `tab-${Date.now()}-${index}`;
}

/**
 * Construye las pestañas nuevas a partir de un lote de entradas del historial
 * seleccionadas por el usuario. Cada pestaña copia nombre, ícono manual y favicon
 * guardados en el registro (sin fetch de metadatos) y recibe un `id` único, de
 * modo que un solo `workspace:update` las persiste juntas y el diff del historial
 * las registra de una vez.
 * @param {TabHistoryEntry[]} entries Entradas del historial seleccionadas.
 * @returns {Tab[]} Pestañas listas para agregar a la sesión.
 */
export function buildTabsFromHistory(entries) {
  return entries.map((entry, index) => ({
    id: newTabId(index),
    url: entry.url,
    name: entry.name,
    icon: entry.icon,
    favicon: entry.favicon,
  }));
}