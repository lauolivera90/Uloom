import { es } from './es.js';
import { en } from './en.js';

/** Idioma por defecto de la app (fallback cuando no hay elección ni locale coincide). */
export const DEFAULT_LANGUAGE = 'es';

/** Idiomas soportados por la interfaz. */
export const SUPPORTED_LANGUAGES = ['es', 'en'];

/** Mapa de diccionarios por idioma. */
export const DICTIONARIES = { es, en };

/**
 * Normaliza un valor a un idioma soportado. Si no matchea, devuelve el default.
 * @param {string} [language]
 * @returns {import('../../types.js').Language}
 */
export function normalizeLanguage(language) {
  return SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
}