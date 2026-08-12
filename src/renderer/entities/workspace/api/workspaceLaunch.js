/**
 * Catalogos y constantes del comportamiento de lanzamiento por sesión.
 * El listado de navegadores instalados NO vive acá: lo aporta el backend
 * (browser:list → getInstalledBrowsers). Solo se centraliza acá la UI estática
 * (modos de apertura y etiquetas del valor "sistema"). Los labels son claves
 * del diccionario i18n (`shared/lib/i18n`): el valor textual lo resuelve cada
 * consumidor con `t(clave)` (v0.4.3).
 */

/** Valor que representa "usar el navegador predeterminado del sistema operativo". */
export const SYSTEM_BROWSER = 'system';

/** Clave de la etiqueta de la opción "navegador predeterminado del sistema". */
export const SYSTEM_BROWSER_LABEL = 'launch.systemBrowser';

/** Clave de la etiqueta de la sesión cuya opción hereda el predeterminado global. */
export const DEFAULT_BROWSER_LABEL = 'launch.defaultBrowser';

/** Clave del título de los botones Launch cuando la sesión no tiene pestañas. */
export const LAUNCH_EMPTY_TABS_TITLE = 'launch.emptyTabsTitle';

/**
 * Modos de apertura disponibles por sesión, con su clave de label.
 * @type {Array<{ value: import('../../../shared/types.js').OpenBehavior, labelKey: string }>}
 */
export const OPEN_BEHAVIOR_OPTIONS = [
  { value: 'active-tab', labelKey: 'launch.openBehaviorActiveTab' },
  { value: 'new-window', labelKey: 'launch.openBehaviorNewWindow' },
];

/**
 * Convierte los modos de apertura en opciones para un Select resolviendo las
 * claves con el traductor del idioma activo.
 * @param {(key: string) => string} t Función de traducción del idioma activo.
 * @returns {Array<{ value: string, label: string }>}
 */
export function buildOpenBehaviors(t) {
  return OPEN_BEHAVIOR_OPTIONS.map(({ value, labelKey }) => ({ value, label: t(labelKey) }));
}

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