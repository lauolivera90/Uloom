import { useEffect, useState } from 'react';

/**
 * Registro de promesas cacheadas por clave de consulta, a nivel de módulo.
 * @type {Map<string, Promise<unknown>>}
 */
const moduleCache = new Map();

/**
 * Hook genérico para una consulta IPC cacheada a nivel de módulo: la promesa del
 * fetch se guarda por `queryKey` y se comparte entre todos los consumidores — una
 * sola consulta por sesión de la app, sin re-petirla en cada montaje. El patrón lo
 * usaban `useInstalledBrowsers` y `useSystemDefaultBrowser` con su propio cache y
 * `useEffect`; acá vive la lógica común (estado, flag de cancelación y limpieza).
 * `loadData` debe ser estable (definida a nivel de módulo o memoizada); la promesa
 * cacheada se crea solo con la primera invocación. Si el fetch falla, se limpia la
 * entrada del cache para que el próximo montaje reintente. `data` arranca en
 * `initialData` (default `null`).
 * @param {string} queryKey
 * @param {() => Promise<unknown>} loadData
 * @param {{ initialData?: unknown }} [options]
 * @returns {{
 *   data: unknown,
 *   isLoading: boolean,
 * }}
 */
export function useCachedQuery(queryKey, loadData, { initialData = null } = {}) {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!moduleCache.has(queryKey)) {
      let queryPromise;
      try {
        queryPromise = loadData();
      } catch (error) {
        queryPromise = Promise.reject(error);
      }
      moduleCache.set(queryKey, queryPromise);
    }
    moduleCache
      .get(queryKey)
      .then((value) => {
        if (!cancelled) {
          setData(value);
        }
      })
      .catch((error) => {
        moduleCache.delete(queryKey);
        if (!cancelled) {
          console.error(`Error en la consulta cacheada "${queryKey}":`, error);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [queryKey, loadData]);

  return { data, isLoading };
}