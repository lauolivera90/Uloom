import { Button, IconButton } from '../../../widgets/index.js';

/**
 * Selector de icono para una sesión. Muestra una grilla reducida y permite expandir
 * la lista completa con un botón ghost. Cada celda es un IconButton: ghost si no
 * está seleccionada, primary si sí. Controlado por props, sin estado propio.
 * No incluye label: lo aporta el FormField contenedor.
 * @param {{
 *   icons: string[],
 *   selectedIcon: string,
 *   showAllIcons: boolean,
 *   onSelect: (icon: string) => void,
 *   onToggleShowAll: () => void,
 * }} props
 */
export function IconPicker({ icons, selectedIcon, showAllIcons, onSelect, onToggleShowAll }) {
  return (
    <div className="flex flex-col gap-3">
      <div
        role="radiogroup"
        aria-label="Icono de la sesión"
        className="grid grid-cols-7 gap-2"
      >
        {icons.map((icon) => {
          const isSelected = icon === selectedIcon;
          return (
            <IconButton
              key={icon}
              variant={isSelected ? 'primary' : 'ghost'}
              icon={icon}
              label={icon}
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(icon)}
            />
          );
        })}
      </div>
      <Button
        variant="ghost"
        icon={showAllIcons ? 'expand_less' : 'expand_more'}
        onClick={onToggleShowAll}
      >
        Mostrar todos los iconos
      </Button>
    </div>
  );
}
