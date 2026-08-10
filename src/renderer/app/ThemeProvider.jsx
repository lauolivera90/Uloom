import { createContext, useContext } from 'react';
import { useThemeState } from './hook/useTheme.js';

const ThemeContext = createContext(null);

/**
 * Acceso al tema global (claro/oscuro) compartido por la app. Debe usarse
 * dentro de un ThemeProvider; fuera de él lanza un error descriptivo.
 * @returns {{
 *   theme: 'light' | 'dark',
 *   setTheme: (theme: 'light' | 'dark') => void,
 *   toggleTheme: () => void,
 * }}
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  }
  return context;
}

/**
 * Provee el estado global del tema a toda la aplicación.
 * Presentacional: solo llama al hook de estado y expone el valor por context.
 * @param {{ children: React.ReactNode }} props
 */
export function ThemeProvider({ children }) {
  const value = useThemeState();

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}