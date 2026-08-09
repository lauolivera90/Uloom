import { useCallback, useState } from 'react';
import { useWorkspaces } from '../../../app/index.js';
import { useInstalledBrowsers, useSystemDefaultBrowser, SYSTEM_BROWSER } from '../../../entities/workspace/index.js';

/**
 * Identificadores de las secciones del navegador de apartados de Configuración.
 */
export const SETTINGS_SECTION = {
  preferences: 'preferencias',
  sessions: 'sesiones',
};

/**
 * Estado de Configuración: sección activa, tema (día/noche) ilustrado y el
 * navegador predeterminado GLOBAL, que sí es funcional — persiste en las
 * preferencias de la app y lo heredan las sesiones "Predeterminado". El tema
 * sigue siendo maqueta (el runtime llega en una fase futura).
 * @returns {{
 *   activeSection: string,
 *   setActiveSection: (section: string) => void,
 *   theme: 'light' | 'dark',
 *   toggleTheme: () => void,
 *   browsers: Array<{ id: string, name: string }>,
 *   isLoadingBrowsers: boolean,
 *   systemDefaultId: string | null,
 *   defaultBrowser: string,
 *   setDefaultBrowser: (value: string) => Promise<void>,
 * }}
 */
export function useSettings() {
  const { preferences, updatePreferences } = useWorkspaces();
  const { browsers, isLoading: isLoadingBrowsers } = useInstalledBrowsers();
  const { systemDefaultId } = useSystemDefaultBrowser();
  const [activeSection, setActiveSection] = useState(SETTINGS_SECTION.preferences);
  const [theme, setTheme] = useState('light');

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const defaultBrowser = preferences?.defaultBrowser ?? SYSTEM_BROWSER;

  const setDefaultBrowser = useCallback(
    async (value) => {
      try {
        await updatePreferences({ defaultBrowser: value });
      } catch (error) {
        console.error(error);
      }
    },
    [updatePreferences],
  );

  return {
    activeSection,
    setActiveSection,
    theme,
    toggleTheme,
    browsers,
    isLoadingBrowsers,
    systemDefaultId,
    defaultBrowser,
    setDefaultBrowser,
  };
}
