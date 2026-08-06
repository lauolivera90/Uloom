import { buttonStyles, focusRing } from '../buttonStyles.js';
import { Icon } from '../Icon/Icon.jsx';

/**
 * Botón de solo icono. Variantes (subconjunto de Button: primary, secondary,
 * ghost) con tamaño fijo (w-9 h-9) y mismo rounded que Button. Recibe el glifo de
 * Material Symbols y un label para accesibilidad (aria-label). Con appearOnHover
 * se enciende oculto hasta el hover del contenedor (group). El className se usa
 * solo para posicionamiento/layout del consumidor, no para re-estilar.
 * @param {{
 *   variant?: 'primary' | 'secondary' | 'ghost',
 *   icon: string,
 *   label?: string,
 *   disabled?: boolean,
 *   appearOnHover?: boolean,
 *   className?: string,
 * }} props
 */
export function IconButton({
  variant = 'primary',
  icon,
  label = '',
  disabled = false,
  appearOnHover = false,
  className = '',
  ...props
}) {
  const baseStyles = `inline-flex items-center justify-center w-9 h-9 rounded transition duration-fast ${focusRing}`;
  const { base, hover, active } = buttonStyles[variant];

  const appearStyles = appearOnHover
    ? ' opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto'
    : '';

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      className={`${baseStyles} ${base} ${
        disabled ? 'opacity-50 cursor-not-allowed' : `${hover} ${active}`
      }${appearStyles}${className ? ` ${className}` : ''}`}
      {...props}
    >
      <Icon icon={icon} />
    </button>
  );
}