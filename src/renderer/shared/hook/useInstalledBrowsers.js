import { useEffect, useState } from 'react';
import { getInstalledBrowsers } from '../../entities/workspace/index.js';

let cachedPromise = null;

function fetchInstalledBrowsers() {
  if (!cachedPromise) {
    cachedPromise = getInstalledBrowsers();
  }
  return cachedPromise;
}

/**
 * Carga los navegadores instalados detectados por el backend (browser:list).
 * Usado en común por el Detalle (config por sesión) y la página de Configuración
 * (predeterminado global) para no duplicar la detección. La promesa se cachea a
 * nivel de módulo: la lista es estática por sesión de app y los múltiples
 * consumidores comparten un único fetch.
 * @returns {{
 *   browsers: Array<{ id: string, name: string }>,
 *   isLoading: boolean,
 * }}
 */
export function useInstalledBrowsers() {
  const [browsers, setBrowsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchInstalledBrowsers()
      .then((detected) => {
        if (!cancelled) {
          setBrowsers(detected);
        }
      })
      .catch((error) => {
        console.error(error);
        cachedPromise = null;
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { browsers, isLoading };
}