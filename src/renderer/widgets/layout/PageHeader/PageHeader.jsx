import { Icon } from '../../ui/index.js';

/**
 * Header estándar de página: título (`h1`) opcionalmente con descripción e
 * ícono líder a la izquierda, y bloque de acciones a la derecha. Presentacional.
 * @param {{
 *   title: string,
 *   description: string,
 *   icon: string,
 *   actions: import('react').ReactNode,
 * }} props
 */
export function PageHeader({ title, description, icon = null, actions = null }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {icon && <Icon icon={icon} className="text-accent flex-shrink-0" />}
        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="text-2xl font-semibold text-text truncate">{title}</h1>
          {description && <p className="text-sm text-text/60 truncate">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </header>
  );
}