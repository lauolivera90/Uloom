import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_LANGUAGE, normalizeLanguage } from '../../shared/index.js';

const STORAGE_KEY = 'uloom-language';

/**
 * Resuelve el idioma del sistema desde `navigator.language` (es/en, fallback
 * español). Espeja el comportamiento del tema (`prefers-color-scheme`) hasta que
 * el usuario elige por primera vez.
 * @returns {import('../../shared/types.js').Language}
 */
function getSystemLanguage() {
  const raw = String(typeof navigator !== 'undefined' ? navigator.language : '');
  return raw.toLowerCase().startsWith('en') ? 'en' : DEFAULT_LANGUAGE;
}

/**
 * Siembra el idioma desde localStorage (elección previa) o desde el sistema.
 * @returns {import('../../shared/types.js').Language}
 */
function getInitialLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return normalizeLanguage(stored);
    }
  } catch {
    // Sin localStorage se resuelve igual por el idioma del sistema
  }
  return getSystemLanguage();
}

/**
 * Estado global del idioma. Persiste la elección en localStorage con la clave
 * `uloom-language` (misma estrategia que `uloom-theme`) y mantiene el atributo
 * `lang` del `<html>` sincronizado (a11y de lectores de pantalla). El default
 * lo resuelve el locale del sistema hasta que el usuario elige por primera vez.
 * @returns {{
 *   language: import('../../shared/types.js').Language,
 *   setLanguage: (language: import('../../shared/types.js').Language) => void,
 *   toggleLanguage: () => void,
 * }}
 */
export function useLanguageState() {
  const [language, setLanguageState] = useState(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((nextLanguage) => {
    const normalized = normalizeLanguage(nextLanguage);
    setLanguageState(normalized);
    try {
      localStorage.setItem(STORAGE_KEY, normalized);
    } catch {
      // Sin persistencia no bloquea la interacción
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'es' ? 'en' : 'es');
  }, [language, setLanguage]);

  return { language, setLanguage, toggleLanguage };
}