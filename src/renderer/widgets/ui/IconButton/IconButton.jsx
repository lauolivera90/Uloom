import { buttonStyles, focusRing } from '../buttonStyles.js';
import { Icon } from '../Icon/Icon.jsx';

const sizeClasses = {
  md: { button: 'w-9 h-9', icon: 24 },
  sm: { button: 'w-8 h-8', icon: 20 },
};

/**
 * Botón de solo icono. Variantes (subconjunto de Button: primary, secondary,
 * ghost) con tamaño fijo y mismo rounded que Button. Tamaño `md` (w-9 h-9, Icon
 * 24px) para uso estándar; `sm` (w-8 h-8, Icon 20px) para densidad (botón
 * colapsar del sidebar). Recibe el glifo de Material Symbols y un label para
 * accesibilidad (aria-label). Con appearOnHover se enciende oculto hasta el
 * hover del contenedor (group). El className se usa solo para
 * posicionamiento/layout del consumidor, no para re-estilar.
 * @param {{
 *   variant?: 'primary' | 'secondary' | 'ghost',
 *   icon: string,
 *   label?: string,
 *   disabled?: boolean,
 *   appearOnHover?: boolean,
 *   size?: 'md' | 'sm',
 *   noFocusRing?: boolean,
 *   className?: string,
 * }} props
 */
export function IconButton({
  variant = 'primary',
  icon,
  label = '',
  disabled = false,
  appearOnHover = false,
  size = 'md',
  noFocusRing = false,
  className = '',
  ...props
}) {
  const { button, icon: iconSize } = sizeClasses[size];
  const baseStyles = `inline-flex items-center justify-center ${button} rounded transition duration-fast${noFocusRing ? '' : ` ${focusRing}`}`;
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
      <Icon icon={icon} size={iconSize} />
    </button>
  );
}