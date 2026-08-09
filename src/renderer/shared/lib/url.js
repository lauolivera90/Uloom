/**
 * Devuelve el hostname de una URL, o `null` si no es parseable.
 * @param {string} url
 * @returns {string | null}
 */
export function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/**
 * Indica si un valor es un data URL (favicon/ícono embebido en base64).
 * @param {string | undefined} value
 * @returns {boolean}
 */
export function isDataUrl(value) {
  return Boolean(value) && value.startsWith('data:');
}

/**
 * Indica si un valor es una URL remota http(s) (favicon externo).
 * @param {string | undefined} value
 * @returns {boolean}
 */
export function isRemoteIcon(value) {
  return Boolean(value) && /^https?:\/\//i.test(value);
}

/**
 * Indica si un valor es un símbolo del catálogo de íconos (Material Symbol), es
 * decir: no es un data URL ni una URL remota. Complementa `isDataUrl`/`isRemoteIcon`.
 * @param {string | undefined} value
 * @returns {boolean}
 */
export function isCatalogIcon(value) {
  return Boolean(value) && !isDataUrl(value) && !isRemoteIcon(value);
}