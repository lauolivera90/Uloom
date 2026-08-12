import { useMemo } from 'react';
import { I18nContext, createTranslator, DICTIONARIES, DEFAULT_LANGUAGE } from '../shared/index.js';
import { useLanguageState } from './hook/useLanguage.js';

/**
 * Provee el idioma global (y la función `t`) a toda la aplicación.
 * Presentacional: combina el estado de idioma con el traductor del diccionario
 * activo, memoizado para mantener referencias estables (`t` cambia solo cuando
 * cambia el idioma). El contexto vive en shared (`useI18n`) para que widgets y
 * features lo consuman sin depender de la capa app.
 * @param {{ children: React.ReactNode }} props
 */
export function LanguageProvider({ children }) {
  const { language, setLanguage, toggleLanguage } = useLanguageState();

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: createTranslator(DICTIONARIES[language] ?? DICTIONARIES[DEFAULT_LANGUAGE]),
    }),
    [language, setLanguage, toggleLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}