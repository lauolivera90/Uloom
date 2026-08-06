import { focusRing } from '../focusRing.js';
import { Icon } from '../Icon/Icon.jsx';

/**
 * Tarjeta punteada que invita a crear un recurso nuevo. Widget presentacional:
 * encapsula el estilo dashed/tarjeta y la accesibilidad de teclado del botón
 * nativo. Fondo superficial translúcido para delimitarlo frente a las cards
 * reales (opacas). El className se usa solo para layout del contenedor, no para
 * re-estilar.
 * @param {{
 *   label: string,
 *   icon?: string,
 *   onClick?: () => void,
 *   className?: string,
 * }} props
 */
export function CreateTile({ label, icon = 'add', onClick, className = '' }) {
  const baseStyles = `flex flex-col items-center justify-center gap-2 p-5 border border-dashed border-border rounded-xl bg-surface/40 text-text/70 hover:border-primary hover:bg-primary/10 hover:text-primary cursor-pointer active:scale-[0.98] transition duration-fast min-h-40 ${focusRing}${className ? ` ${className}` : ''}`;

  return (
    <button type="button" onClick={onClick} className={baseStyles}>
      <Icon icon={icon} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}