import { useCallback, useSyncExternalStore } from 'react';

const noop = () => {};
const noMatches = () => false;

/**
 * Suscripción a una media query del CSS. Devuelve `true` mientras la query
 * matchea. Usa `window.matchMedia` con listener `change` y cleanup completo
 * (regla 2.2); el estado se mantiene sincronizado vía `useSyncExternalStore`
 * (robusto ante cambios de `query`, aunque en la app se pasa como literal).
 * Safe-guard para entornos sin `matchMedia`.
 * @param {string} query Media query CSS (ej. '(max-width: 1023px)').
 * @returns {boolean}
 */
export function useMediaQuery(query) {
  const hasMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function';

  const subscribe = useCallback(
    (onStoreChange) => {
      if (!hasMedia) return noop;
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onStoreChange);
      return () => mql.removeEventListener('change', onStoreChange);
    },
    [hasMedia, query],
  );

  const getSnapshot = useCallback(
    () => (hasMedia ? window.matchMedia(query).matches : false),
    [hasMedia, query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, noMatches);
}