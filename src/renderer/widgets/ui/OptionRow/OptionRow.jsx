/**
 * Fila de configuración: label y descripción a la izquierda (columna) y el
 * control a la derecha. Presentacional; el control llega como prop. Usado por la
 * página de Configuración y por la card de Configuración del Detalle de sesión.
 * @param {{
 *   label: string,
 *   description?: string,
 *   control: import('react').ReactNode,
 *   className?: string,
 * }} props
 */
export function OptionRow({ label, description = '', control, className = '' }) {
  return (
    <div className={`flex items-center justify-between gap-5 py-5 ${className}`}>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-text">{label}</span>
        {description && <p className="text-sm text-text/60 line-clamp-2">{description}</p>}
      </div>
      <div className="flex-shrink-0">{control}</div>
    </div>
  );
}