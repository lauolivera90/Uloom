import { useCallback, useState } from 'react';

const STORAGE_KEY = 'uloom-theme';

/**
 * Sembra el estado de tema desde la clase `.dark` que el script anti-flash ya
 * aplicó al `<html>` antes del boot de React (fuente canónica; coincide con lo
 * guardado en localStorage o con el color scheme del sistema).
 * @returns {'light' | 'dark'}
 */
function getInitialTheme() {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/**
 * Persiste la elección de tema en localStorage. Sin persistencia no bloquea el
 * cambio visual (el try/catch cubre entornos con storage deshabilitado).
 * @param {'light' | 'dark'} theme
 */
function persistTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Sin persistencia no bloquea la interacción
  }
}

/**
 * Estado global del tema (claro/oscuro): muta la clase `.dark` del
 * `documentElement` (activa las variables CSS de `index.css`) y persiste la
 * elección en localStorage con la clave `uloom-theme`. El default lo resuelve el
 * script anti-flash desde el color scheme del sistema hasta que el usuario
 * elige por primera vez.
 * @returns {{
 *   theme: 'light' | 'dark',
 *   setTheme: (theme: 'light' | 'dark') => void,
 *   toggleTheme: () => void,
 * }}
 */
export function useThemeState() {
  const [theme, setThemeState] = useState(getInitialTheme);

  const setTheme = useCallback((nextTheme) => {
    setThemeState(nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    persistTheme(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === 'light' ? 'dark' : 'light';
    setThemeState(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    persistTheme(next);
  }, [theme]);

  return { theme, setTheme, toggleTheme };
}
