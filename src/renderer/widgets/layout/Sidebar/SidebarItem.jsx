import { Icon } from '../../ui/index.js';

/**
 * Item de navegación del sidebar. Es una fila que ocupa todo el ancho del
 * contenedor (w-full) y controla su propia distancia con padding (px/py), sin
 * margen ni gap del contenedor. En estado colapsado solo muestra el icono,
 * centrado. El label admite hasta dos líneas (line-clamp) y, al expandirse,
 * queda centrado verticalmente respecto al icono.
 * @param {{
 *   icon: string,
 *   label: string,
 *   collapsed: boolean,
 *   isActive: boolean,
 *   onClick: () => void,
 * }} props
 */
export function SidebarItem({ icon, label, collapsed, isActive, onClick }) {
  return (
    <button
      type="button"
      aria-current={isActive ? 'page' : undefined}
      onClick={onClick}
      className={`flex items-center w-full py-3 transition duration-fast active:scale-[0.98] ${
        collapsed ? 'justify-center px-5' : 'justify-start gap-3 px-5'
      } ${isActive ? 'bg-primary text-on-primary' : 'text-text hover:bg-primary/10'}`}
    >
      <Icon icon={icon} className="shrink-0" />
      {!collapsed && (
        <span className="text-sm line-clamp-2 text-left min-w-0 leading-snug">{label}</span>
      )}
    </button>
  );
}