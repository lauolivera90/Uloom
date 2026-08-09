import { useCallback, useMemo, useState } from 'react';

/**
 * Estado del selector de icono de los formularios — controlado: el valor
 * seleccionado pertenece al form (única fuente de verdad, recibido por `selected`)
 * y este hook solo gestiona la expansión de la lista completa, la grilla visible y
 * el colapso del selector (patrón `IconPickerField`). Lo consumen useWorkspaceForm
 * (sesión) y useTabForm (pestaña) para no duplicar la lógica del picker. Es
 * genérico: no conoce el catálogo — lo recibe por props (shared no importa de
 * entities). Si `selected` no pertenece a `icons` (p. ej. un favicon data-URL/http),
 * el widget no resalta ningún slot. `selectIcon` cierra el selector al elegir.
 * @param {{
 *   icons: string[],
 *   previewCount: number,
 *   selected: string | null,
 *   onSelect: (icon: string) => void,
 * }} props
 * @returns {{
 *   selectedIcon: string | null,
 *   selectIcon: (icon: string) => void,
 *   showPicker: boolean,
 *   toggleShowPicker: () => void,
 *   showAllIcons: boolean,
 *   toggleShowAllIcons: () => void,
 *   visibleIcons: string[],
 *   ensureVisible: (icon: string) => void,
 *   reset: () => void,
 * }}
 */
export function useIconPicker({ icons, previewCount, selected, onSelect }) {
  const [showAllIcons, setShowAllIcons] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const toggleShowAllIcons = useCallback(() => setShowAllIcons((prev) => !prev), []);
  const toggleShowPicker = useCallback(() => setShowPicker((prev) => !prev), []);

  const ensureVisible = useCallback(
    (icon) => {
      if (icon && !icons.slice(0, previewCount).includes(icon)) {
        setShowAllIcons(true);
      }
    },
    [icons, previewCount],
  );

  const selectIcon = useCallback(
    (icon) => {
      onSelect(icon);
      setShowPicker(false);
    },
    [onSelect],
  );

  const reset = useCallback(() => {
    setShowAllIcons(false);
    setShowPicker(false);
  }, []);

  const visibleIcons = useMemo(
    () => (showAllIcons ? icons : icons.slice(0, previewCount)),
    [showAllIcons, icons, previewCount],
  );

  return {
    selectedIcon: selected,
    selectIcon,
    showPicker,
    toggleShowPicker,
    showAllIcons,
    toggleShowAllIcons,
    visibleIcons,
    ensureVisible,
    reset,
  };
}