import { useCachedQuery } from '../../../shared/index.js';
import { getSystemDefaultBrowser } from '../api/index.js';

const SYSTEM_DEFAULT_BROWSER_QUERY_KEY = 'system:default';

function loadSystemDefaultBrowser() {
  return getSystemDefaultBrowser();
}

/**
 * Carga el id y nombre del navegador predeterminado del sistema operativo si
 * pertenece al catálogo conocido (chrome/edge/firefox/brave/opera/vivaldi).
 * `systemDefaultId` es `null` mientras no se resuelva o si el default no es del
 * catálogo; en ese caso los consumidores caen al ícono genérico, como se hace con
 * el valor `system`. `systemDefaultName` evita re-derivar el nombre legible desde
 * el probe de instalación (puede no contener al default aún instalado). La
 * consulta está cacheada a nivel de módulo vía `useCachedQuery`: el default del SO
 * se consulta una sola vez por sesión de la app y se comparte entre consumidores.
 * @returns {{
 *   systemDefaultId: string | null,
 *   systemDefaultName: string | null,
 *   isLoading: boolean,
 * }}
 */
export function useSystemDefaultBrowser() {
  const { data, isLoading } = useCachedQuery(SYSTEM_DEFAULT_BROWSER_QUERY_KEY, loadSystemDefaultBrowser);
  return {
    systemDefaultId: data?.id ?? null,
    systemDefaultName: data?.name ?? null,
    isLoading,
  };
}