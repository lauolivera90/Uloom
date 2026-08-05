import { useEffect } from 'react';

/**
 * Bloquea el scroll del body mientras `active` es true y lo restaura al desmontar.
 * @param {boolean} active - si el scroll debe bloquearse.
 * @returns {void}
 */
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);
}