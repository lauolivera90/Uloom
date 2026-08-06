import { useLocation, useNavigate } from 'react-router-dom';
import { IconButton } from '../../ui/index.js';
import { SidebarItem } from './SidebarItem.jsx';

const NAV_ITEMS = [
  {
    id: 'sessions',
    label: 'Sesiones',
    icon: 'grid_view',
    to: '/',
    isActive: (pathname) => pathname === '/' || pathname.startsWith('/workspaces/'),
  },
  {
    id: 'settings',
    label: 'Configuración',
    icon: 'settings',
    to: '/settings',
    isActive: (pathname) => pathname === '/settings',
  },
];

/**
 * Navegación lateral principal. Colapsable a columna de iconos (w-16); expandida
 * usa w-56. El contenedor no tiene padding: cada hijo (header y nav) controla su
 * propia distancia. El header muestra la marca Uloom y el botón de colapsar con
 * space-between; colapsado solo queda el botón.
 * @param {{
 *   collapsed: boolean,
 *   onToggle: () => void,
 * }} props
 */
export function Sidebar({ collapsed, onToggle }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <aside
      className={`flex flex-col shrink-0 h-full py-5 border-r border-border bg-surface transition-[width] duration-base ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div
        className={`flex items-center mb-8 ${
          collapsed ? 'justify-center' : 'justify-between mx-5'
        }`}
      >
        {!collapsed && <span className="text-lg font-semibold text-accent truncate">Uloom</span>}
        <IconButton
          size="sm"
          variant="ghost"
          noFocusRing
          icon="grid_layout_side"
          label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          onClick={onToggle}
        />
      </div>
      <nav className="flex flex-col w-full gap-1">
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            collapsed={collapsed}
            isActive={item.isActive(pathname)}
            onClick={() => navigate(item.to)}
          />
        ))}
      </nav>
    </aside>
  );
}