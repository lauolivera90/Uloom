import { useCachedQuery } from '../../../shared/index.js';
import { getInstalledBrowsers } from '../api/index.js';

const INSTALLED_BROWSERS_QUERY_KEY = 'installed:list';

function loadInstalledBrowsers() {
  return getInstalledBrowsers();
}

/**
 * Carga los navegadores instalados detectados por el backend (`browser:list`).
 * Usado en común por el Detalle (config por sesión) y la página de Configuración
 * (predeterminado global) para no duplicar la detección. La consulta está cacheada
 * a nivel de módulo vía `useCachedQuery`: la lista es estática por sesión de app y
 * los múltiples consumidores comparten un único fetch.
 * @returns {{
 *   browsers: Array<{ id: string, name: string }>,
 *   isLoading: boolean,
 * }}
 */
export function useInstalledBrowsers() {
  const { data, isLoading } = useCachedQuery(INSTALLED_BROWSERS_QUERY_KEY, loadInstalledBrowsers, {
    initialData: [],
  });
  return { browsers: data, isLoading };
}