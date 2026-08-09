import { useCallback, useMemo, useState } from 'react';

/**
 * Estado del selector de icono de los formularios — controlado: el valor
 * seleccionado pertenece al form (única fuente de verdad, recibido por `selected`)
 * y este hook solo gestiona la expansión de la lista completa y la grilla visible.
 * Lo consumen useWorkspaceForm (sesión) y useTabForm (pestaña) para no duplicar la
 * lógica del picker. Es genérico: no conoce el catálogo — lo recibe por props
 * (shared no importa de entities). Si `selected` no pertenece a `icons` (p. ej. un
 * favicon data-URL/http), el widget no resalta ningún slot.
 * @param {{
 *   icons: string[],
 *   previewCount: number,
 *   selected: string | null,
 *   onSelect: (icon: string) => void,
 * }} props
 * @returns {{
 *   selectedIcon: string | null,
 *   selectIcon: (icon: string) => void,
 *   showAllIcons: boolean,
 *   toggleShowAllIcons: () => void,
 *   visibleIcons: string[],
 *   ensureVisible: (icon: string) => void,
 *   reset: () => void,
 * }}
 */
export function useIconPicker({ icons, previewCount, selected, onSelect }) {
  const [showAllIcons, setShowAllIcons] = useState(false);

  const toggleShowAllIcons = useCallback(() => setShowAllIcons((prev) => !prev), []);
  const ensureVisible = useCallback(
    (icon) => {
      if (icon && !icons.slice(0, previewCount).includes(icon)) {
        setShowAllIcons(true);
      }
    },
    [icons, previewCount],
  );

  const reset = useCallback(() => {
    setShowAllIcons(false);
  }, []);

  const visibleIcons = useMemo(
    () => (showAllIcons ? icons : icons.slice(0, previewCount)),
    [showAllIcons, icons, previewCount],
  );

  return { selectedIcon: selected, selectIcon: onSelect, showAllIcons, toggleShowAllIcons, visibleIcons, ensureVisible, reset };
}