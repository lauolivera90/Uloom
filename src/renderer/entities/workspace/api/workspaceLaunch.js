/**
 * Catalogos y constantes del comportamiento de lanzamiento por sesión.
 * El listado de navegadores instalados NO vive acá: lo aporta el backend
 * (browser:list → getInstalledBrowsers). Solo se centraliza acá la UI estática
 * (modos de apertura y etiquetas del valor "sistema").
 */

/** Valor que representa "usar el navegador predeterminado del sistema operativo". */
export const SYSTEM_BROWSER = 'system';

/** Etiqueta legible de la opción "navegador predeterminado del sistema". */
export const SYSTEM_BROWSER_LABEL = 'Sistema (predeterminado)';

/** Etiqueta de la sesión cuya opción hereda el predeterminado global. */
export const DEFAULT_BROWSER_LABEL = 'Predeterminado';

/** Título de los botones Launch cuando la sesión no tiene pestañas. */
export const LAUNCH_EMPTY_TABS_TITLE = 'Agregá pestañas para poder lanzar la sesión';

/**
 * Modos de apertura disponibles por sesión.
 * @type {Array<{ value: import('../../../shared/types.js').OpenBehavior, label: string }>}
 */
export const OPEN_BEHAVIORS = [
  { value: 'active-tab', label: 'Ventana activa' },
  { value: 'new-window', label: 'Ventana nueva' },
];

/**
 * Resuelve el nombre legible de un navegador dado su id, a partir de la lista
 * detectada en el sistema. Si no se encuentra, devuelve el id tal cual.
 * @param {string | null | undefined} browserId
 * @param {Array<{ id: string, name: string }>} browsers
 * @returns {string}
 */
export function getBrowserNameById(browserId, browsers) {
  if (!browserId) return '';
  const match = browsers.find((browser) => browser.id === browserId);
  return match ? match.name : browserId;
}

/**
 * Convierte el listado de navegadores detectados en opciones para un Select.
 * Helper único para no duplicar el mapeo entre el Detalle y la página de Configuración.
 * @param {Array<{ id: string, name: string }>} browsers
 * @returns {Array<{ value: string, label: string }>}
 */
export function buildBrowserOptions(browsers) {
  return browsers.map((browser) => ({ value: browser.id, label: browser.name }));
}