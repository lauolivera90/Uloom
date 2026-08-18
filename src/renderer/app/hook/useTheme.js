import { useCallback, useState } from 'react';
import { normalizePalette } from '../../shared/index.js';

const THEME_KEY = 'uloom-theme';
const PALETTE_KEY = 'uloom-palette';

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
 * Sembra la paleta activa desde el atributo `data-palette` que el script
 * anti-flash ya aplicó al `<html>` antes del boot de React. Se valida contra el
 * catálogo (`normalizePalette`); si el valor es desconocido o falta, cae a la
 * paleta por defecto.
 * @returns {string}
 */
function getInitialPalette() {
  return normalizePalette(document.documentElement.getAttribute('data-palette'));
}

/**
 * Persiste una preferencia de tema/paleta en localStorage. Sin persistencia no
 * bloquea el cambio visual (el try/catch cubre entornos con storage
 * deshabilitado).
 * @param {string} key
 * @param {string} value
 */
function persistPreference(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Sin persistencia no bloquea la interacción
  }
}

/**
 * Estado global del tema y la paleta de identidad: muta la clase `.dark` y el
 * atributo `data-palette` del `documentElement` (activan las variables CSS de
 * `index.css`) y persiste ambas elecciones en localStorage (`uloom-theme`,
 * `uloom-palette`). El default del tema lo resuelve el script anti-flash desde
 * el color scheme del sistema hasta que el usuario elige por primera vez; la
 * paleta por defecto es `violeta`.
 * @returns {{
 *   theme: 'light' | 'dark',
 *   setTheme: (theme: 'light' | 'dark') => void,
 *   toggleTheme: () => void,
 *   palette: string,
 *   setPalette: (palette: string) => void,
 * }}
 */
export function useThemeState() {
  const [theme, setThemeState] = useState(getInitialTheme);
  const [palette, setPaletteState] = useState(getInitialPalette);

  const setTheme = useCallback((nextTheme) => {
    setThemeState(nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    persistPreference(THEME_KEY, nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === 'light' ? 'dark' : 'light';
    setThemeState(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    persistPreference(THEME_KEY, next);
  }, [theme]);

  const setPalette = useCallback((nextPalette) => {
    const normalized = normalizePalette(nextPalette);
    setPaletteState(normalized);
    document.documentElement.setAttribute('data-palette', normalized);
    persistPreference(PALETTE_KEY, normalized);
  }, []);

  return { theme, setTheme, toggleTheme, palette, setPalette };
}