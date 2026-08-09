import chromeIcon from '../assets/browsers/chrome.svg';
import edgeIcon from '../assets/browsers/edge.svg';
import firefoxIcon from '../assets/browsers/firefox.svg';
import braveIcon from '../assets/browsers/brave.svg';
import operaIcon from '../assets/browsers/opera.svg';
import vivaldiIcon from '../assets/browsers/vivaldi.svg';

/**
 * Mapa de SVG empaquetados por id de navegador conocido (misma lista que el
 * catálogo del backend en `browserService`). Los assets viven commiteados en
 * `entities/workspace/assets/browsers/` — render offline y determinista, sin
 * depender de red ni de extraer el ícono del `.exe`.
 * @type {Record<string, string>}
 */
export const BROWSER_ICONS = {
  chrome: chromeIcon,
  edge: edgeIcon,
  firefox: firefoxIcon,
  brave: braveIcon,
  opera: operaIcon,
  vivaldi: vivaldiIcon,
};

/**
 * Url del ícono de un navegador por su id. Devuelve `null` para ids sin asset
 * (el valor `'system'`, un navegador desconocido) — el consumidor decide el
 * fallback visual.
 * @param {string | null | undefined} browserId
 * @returns {string | null}
 */
export function getBrowserIconUrl(browserId) {
  if (!browserId) return null;
  return BROWSER_ICONS[browserId] ?? null;
}