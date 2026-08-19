import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getTabHistory } from '../api/index.js';

/**
 * Historial de pestañas usadas para el modo de selección múltiple del modal de
 * agregar pestaña. Carga la lista desde el proceso main **al montar la vista y al
 * abrir el modal** (`isActive`), con flag de cancelación: así el estado es
 * conocido antes de que el usuario abra el modal y se refresca en cada apertura
 * sin limpiar la lista previa (no hay parpadeo ni vacío transitorio). El fallo de
 * carga es un soft-fallback: se loguea y la lista queda con el último estado
 * conocido (vacía si nunca cargó).
 *
 * La selección (`selectedUrls`) se resetea en cada apertura (transición de
 * `isActive` a `true`, con patrón de ajuste de estado durante el render): al
 * abrir el modal se arranca de cero. `existingUrls` (URLs ya presentes en la
 * sesión) filtra la lista visible — las entradas derivadas (`visibleEntries`,
 * `selectedCount`, `selectedEntries`) salen de un solo memo.
 * @param {{
 *   isActive?: boolean,
 *   existingUrls?: string[],
 * }} [options] `isActive` = el modal de pestaña está abierto (modo alta).
 * @returns {{
 *   history: import('../../../shared/types.js').TabHistoryEntry[],
 *   isLoaded: boolean,
 *   visibleEntries: import('../../../shared/types.js').TabHistoryEntry[],
 *   selectedCount: number,
 *   selectedUrls: Set<string>,
 *   selectedEntries: import('../../../shared/types.js').TabHistoryEntry[],
 *   toggle: (url: string) => void,
 * }}
 */
export function useTabHistory({ isActive = false, existingUrls = [] } = {}) {
  const [history, setHistory] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState(() => new Set());
  const [wasActive, setWasActive] = useState(isActive);
  const fetchedOnceRef = useRef(false);

  if (isActive !== wasActive) {
    setWasActive(isActive);
    if (isActive) setSelectedUrls(new Set());
  }

  useEffect(() => {
    let cancelled = false;
    const fetchHistory = () => {
      getTabHistory()
        .then((items) => {
          if (!cancelled) {
            setHistory(items);
            setIsLoaded(true);
          }
        })
        .catch((error) => {
          console.error('Error al cargar el historial de pestañas:', error);
          if (!cancelled) setIsLoaded(true);
        });
    };
    if (isActive) {
      fetchHistory();
    } else if (!fetchedOnceRef.current) {
      fetchedOnceRef.current = true;
      fetchHistory();
    }
    return () => {
      cancelled = true;
    };
  }, [isActive]);

  const toggle = useCallback((url) => {
    setSelectedUrls((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  }, []);

  const { visibleEntries, selectedCount, selectedEntries } = useMemo(() => {
    const existingUrlSet = new Set(existingUrls);
    const visible = history.filter((entry) => !existingUrlSet.has(entry.url));
    const selected = visible.filter((entry) => selectedUrls.has(entry.url));
    return {
      visibleEntries: visible,
      selectedCount: selected.length,
      selectedEntries: selected,
    };
  }, [history, existingUrls, selectedUrls]);

  return { history, isLoaded, visibleEntries, selectedCount, selectedUrls, selectedEntries, toggle };
}