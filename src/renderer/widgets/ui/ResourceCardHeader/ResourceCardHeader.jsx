import { Icon } from '../Icon/Icon.jsx';

/**
 * Encabezado de card de recurso con el patrón "ícono de identidad + título en
 * accent" y un slot de acciones alineado a la derecha. Usado por las cards del
 * Detalle de sesión (Administrador de recursos / Configuración).
 * @param {{
 *   title: string,
 *   icon: string,
 *   children?: import('react').ReactNode,
 * }} props
 */
export function ResourceCardHeader({ title, icon, children }) {
  return (
    <div className="flex items-center gap-2">
      <Icon icon={icon} className="text-accent" />
      <h3 className="text-lg font-semibold text-accent">{title}</h3>
      {children && <div className="ml-auto flex-shrink-0">{children}</div>}
    </div>
  );
}