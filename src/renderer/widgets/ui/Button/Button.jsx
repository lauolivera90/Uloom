import { buttonStyles, focusRing } from '../buttonStyles.js';
import { Icon } from '../Icon/Icon.jsx';

/**
 * Botón de acción. Variantes primary/secondary/ghost/warning/danger definidas en
 * el mapa compartido de widgets. Presentacional: el resto de las props se pasan
 * al elemento nativo. Cuando está disabled no aplica hover ni active (no rebota).
 * @param {{
 *   variant?: keyof typeof buttonStyles,
 *   disabled?: boolean,
 *   className?: string,
 *   children?: React.ReactNode,
 *   icon?: string,
 * }} props
 */
export function Button({
  variant = 'primary',
  disabled = false,
  className = '',
  children,
  icon,
  ...props
}) {
  const baseStyles = `inline-flex items-center justify-center gap-2 px-5 py-1.5 text-sm font-medium rounded transition duration-fast ${focusRing}`;
  const { base, hover, active } = buttonStyles[variant];

  return (
    <button
      type="button"
      disabled={disabled}
      className={`${baseStyles} ${base} ${
        disabled ? 'opacity-50 cursor-not-allowed' : `${hover} ${active}`
      }${className ? ` ${className}` : ''}`}
      {...props}
    >
      {icon ? (
        <Icon icon={icon} />
      ) : null}
      {children ? <span>{children}</span> : null}
    </button>
  );
}