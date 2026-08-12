/**
 * Resuelve el valor de una clave en un diccionario. Las claves ausentes se
 * devuelven tal cual (debug visible). Los plurales usan la forma `{ one, other }`
 * y se eligen por el parámetro `count`. Los parámetros `{name}` se interpolan.
 * @param {Record<string, unknown>} dict Diccionario del idioma activo.
 * @param {string} key Clave de la traducción (p. ej. `'common.cancel'`).
 * @param {Record<string, string | number>} [params] Parámetros de interpolación.
 * @returns {string}
 */
export function translateKey(dict, key, params = {}) {
  let value = dict[key];
  if (value && typeof value === 'object' && value.one && value.other) {
    value = params.count === 1 ? value.one : value.other;
  }
  if (typeof value !== 'string') {
    return key;
  }
  return value.replace(/\{(\w+)\}/g, (match, name) =>
    name in params ? String(params[name]) : match,
  );
}

/**
 * Crea la función `t` enlazada a un diccionario. Se memoiza por idioma en el
 * provider (`LanguageProvider`) para mantener referencias estables.
 * @param {Record<string, unknown>} dict Diccionario del idioma activo.
 * @returns {(key: string, params?: Record<string, string | number>) => string}
 */
export function createTranslator(dict) {
  return (key, params) => translateKey(dict, key, params);
}