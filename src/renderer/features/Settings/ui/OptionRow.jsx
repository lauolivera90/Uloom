/**
 * Fila de una sección de Configuración: label y descripción a la izquierda, y el
 * control a la derecha. Presentacional; el control llega como prop. Vive en el
 * feature porque su único consumidor es la página de Configuración.
 * @param {{
 *   label: string,
 *   description: string,
 *   control: import('react').ReactNode,
 * }} props
 */
export function OptionRow({ label, description, control }) {
  return (
    <div className="flex items-center justify-between gap-5 py-5">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-text">{label}</span>
        <p className="text-sm text-text/60">{description}</p>
      </div>
      <div>{control}</div>
    </div>
  );
}