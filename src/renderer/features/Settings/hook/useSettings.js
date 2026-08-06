import { useCallback, useState } from 'react';

/**
 * Identificadores de las secciones del navegador de apartados de Configuración.
 */
export const SETTINGS_SECTION = {
  preferences: 'preferencias',
  sessions: 'sesiones',
};

/**
 * Estado de la maqueta de Configuración: sección activa del navegador de
 * apartados y tema (día/noche) ilustrado. Sin funcionalidad real — el toggle del
 * tema solo muestra el control; el runtime de temas llega en una fase futura.
 * @returns {{
 *   activeSection: string,
 *   setActiveSection: (section: string) => void,
 *   theme: 'light' | 'dark',
 *   toggleTheme: () => void,
 * }}
 */
export function useSettings() {
  const [activeSection, setActiveSection] = useState(SETTINGS_SECTION.preferences);
  const [theme, setTheme] = useState('light');

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return { activeSection, setActiveSection, theme, toggleTheme };
}
