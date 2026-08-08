import { useCallback, useState } from 'react';

/**
 * Estado compartido del selector de icono de los formularios: icono seleccionado,
 * expansión de la lista completa y grilla visible. Lo consumen useCreateWorkspace
 * (sesión) y useAddTabForm (pestaña) para no duplicar la lógica del picker. Es
 * genérico: no conoce el catálogo — lo recibe por props (shared no importa de entities).
 * @param {{
 *   icons: string[],
 *   previewCount: number,
 *   defaultIcon?: string,
 * }} props
 * @returns {{
 *   selectedIcon: string,
 *   selectIcon: (icon: string) => void,
 *   showAllIcons: boolean,
 *   toggleShowAllIcons: () => void,
 *   visibleIcons: string[],
 *   reset: () => void,
 * }}
 */
export function useIconPicker({ icons, previewCount, defaultIcon = icons[0] }) {
  const [selectedIcon, setSelectedIcon] = useState(defaultIcon);
  const [showAllIcons, setShowAllIcons] = useState(false);

  const selectIcon = useCallback((icon) => setSelectedIcon(icon), []);
  const toggleShowAllIcons = useCallback(() => setShowAllIcons((prev) => !prev), []);

  const reset = useCallback(() => {
    setSelectedIcon(defaultIcon);
    setShowAllIcons(false);
  }, [defaultIcon]);

  const visibleIcons = showAllIcons ? icons : icons.slice(0, previewCount);

  return { selectedIcon, selectIcon, showAllIcons, toggleShowAllIcons, visibleIcons, reset };
}