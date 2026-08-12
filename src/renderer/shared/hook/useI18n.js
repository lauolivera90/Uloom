import { createContext, useContext } from 'react';

/**
 * Contexto global de idioma. Lo provee `LanguageProvider` (app/); vive en shared
 * para que widgets y features puedan consumir `t` sin depender de la capa app
 * (evita el ciclo app ↔ widgets que marcaría `import/no-cycle`).
 * @type {import('react').Context<{
 *   language: import('../types.js').Language,
 *   t: (key: string, params?: Record<string, string | number>) => string,
 *   setLanguage: (language: import('../types.js').Language) => void,
 *   toggleLanguage: () => void,
 * } | null>}
 */
export const I18nContext = createContext(null);

/**
 * Acceso al idioma activo y a la función de traducción `t`. Debe usarse dentro
 * de un `LanguageProvider`; fuera de él lanza un error descriptivo.
 * @returns {{
 *   language: import('../types.js').Language,
 *   t: (key: string, params?: Record<string, string | number>) => string,
 *   setLanguage: (language: import('../types.js').Language) => void,
 *   toggleLanguage: () => void,
 * }}
 */
export function useI18n() {
  const context = useContext(I18nContext);
  if (context === null) {
    throw new Error('useI18n debe usarse dentro de <LanguageProvider>');
  }
  return context;
}