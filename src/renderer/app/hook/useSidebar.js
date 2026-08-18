import { useCallback, useEffect, useState } from 'react';
import { useMediaQuery } from '../../shared/index.js';

const STORAGE_KEY = 'ui.sidebarCollapsed';

/**
 * Estado del sidebar (colapsado/expandido). Se siembra sincrónicamente desde
 * localStorage para evitar el flash de arranque y persiste en cada cambio. Vive
 * en localStorage del renderer mientras el config.json no tenga consumidor real
 * (fase mock); migrar a config.json vía la cadena config:set cuando exista.
 * `isSmall` indica pantallas por debajo de `lg` (1024px): en ellas el sidebar
 * siempre se muestra colapsado (la preferencia persistida se ignora) y la
 * expansión pasa a ser overlay por hover (ver Sidebar).
 * @returns {{
 *   collapsed: boolean,
 *   toggle: () => void,
 *   isSmall: boolean,
 * }}
 */
export function useSidebar() {
  const isSmall = useMediaQuery('(max-width: 1023px)');
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // Sin persistencia no bloquea la interacción
    }
  }, [collapsed]);

  const toggle = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return { collapsed, toggle, isSmall };
}
