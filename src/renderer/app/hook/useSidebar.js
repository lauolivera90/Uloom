import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'ui.sidebarCollapsed';

/**
 * Estado del sidebar (colapsado/expandido). Se siembra sincrónicamente desde
 * localStorage para evitar el flash de arranque y persiste en cada cambio. Vive
 * en localStorage del renderer mientras el config.json no tenga consumidor real
 * (fase mock); migrar a config.json vía la cadena config:set cuando exista.
 * @returns {{
 *   collapsed: boolean,
 *   toggle: () => void,
 * }}
 */
export function useSidebar() {
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

  return { collapsed, toggle };
}
