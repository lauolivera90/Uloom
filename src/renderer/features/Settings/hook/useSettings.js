import { useCallback, useState } from 'react';
import { useWorkspaces, useTheme } from '../../../app/index.js';
import { useI18n, useToast } from '../../../shared/index.js';
import { useInstalledBrowsers, useSystemDefaultBrowser, SYSTEM_BROWSER } from '../../../entities/workspace/index.js';

/**
 * Identificadores de las secciones del navegador de apartados de Configuración.
 */
export const SETTINGS_SECTION = {
  preferences: 'preferencias',
  sessions: 'sesiones',
};

/**
 * Estado de Configuración: sección activa, el tema global (día/noche, funcional
 * vía `useTheme` con persistencia en localStorage), la paleta de identidad
 * (selector de paletas predefinidas, v0.5.2) y el navegador predeterminado
 * GLOBAL, que también es funcional — persiste en las preferencias de la app y lo
 * heredan las sesiones "Predeterminado".
 * @returns {{
 *   activeSection: string,
 *   setActiveSection: (section: string) => void,
 *   theme: 'light' | 'dark',
 *   toggleTheme: () => void,
 *   palette: string,
 *   setPalette: (palette: string) => void,
 *   language: import('../../../shared/types.js').Language,
 *   setLanguage: (language: import('../../../shared/types.js').Language) => void,
 *   browsers: Array<{ id: string, name: string }>,
 *   isLoadingBrowsers: boolean,
 *   systemDefaultId: string | null,
 *   defaultBrowser: string,
 *   setDefaultBrowser: (value: string) => Promise<void>,
 *   searchQuery: string,
 *   setSearchQuery: (value: string) => void,
 * }}
 */
export function useSettings() {
  const { preferences, updatePreferences } = useWorkspaces();
  const { theme, toggleTheme, palette, setPalette } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const { toast } = useToast();
  const { browsers, isLoading: isLoadingBrowsers } = useInstalledBrowsers();
  const { systemDefaultId } = useSystemDefaultBrowser();
  const [activeSection, setActiveSection] = useState(SETTINGS_SECTION.preferences);
  const [searchQuery, setSearchQuery] = useState('');

  const defaultBrowser = preferences?.defaultBrowser ?? SYSTEM_BROWSER;

  const setDefaultBrowser = useCallback(
    async (value) => {
      try {
        await updatePreferences({ defaultBrowser: value });
      } catch (error) {
        console.error(error);
        toast({ variant: 'error', message: t('save.preferencesError') });
      }
    },
    [updatePreferences, toast, t],
  );

  return {
    activeSection,
    setActiveSection,
    theme,
    toggleTheme,
    palette,
    setPalette,
    language,
    setLanguage,
    browsers,
    isLoadingBrowsers,
    systemDefaultId,
    defaultBrowser,
    setDefaultBrowser,
    searchQuery,
    setSearchQuery,
  };
}
