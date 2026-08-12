import { useLocation, useNavigate } from 'react-router-dom';
import { Button, IconButton } from '../../ui/index.js';
import { useI18n } from '../../../shared/index.js';
import { SidebarItem } from './SidebarItem.jsx';

const NAV_ITEMS = [
  {
    id: 'sessions',
    labelKey: 'sidebar.sessions',
    icon: 'grid_view',
    to: '/',
    isActive: (pathname) => pathname === '/' || pathname.startsWith('/workspaces/'),
  },
  {
    id: 'settings',
    labelKey: 'sidebar.settings',
    icon: 'settings',
    to: '/settings',
    isActive: (pathname) => pathname === '/settings',
  },
];

const ADD_SESSION_LABEL = 'sidebar.addSession';
const EXPAND_SIDEBAR_LABEL = 'sidebar.expand';
const COLLAPSE_SIDEBAR_LABEL = 'sidebar.collapse';

/**
 * Navegación lateral principal. Colapsable a columna de iconos (w-16); expandida
 * usa w-56. El contenedor no tiene padding: cada hijo (header y nav) controla su
 * propia distancia. El header muestra la marca Uloom y el botón de colapsar con
 * space-between; colapsado solo queda el botón. Debajo de la navegación vive la
 * acción global de crear sesión (`onAddSession`), siempre usable en cualquier ruta.
 * @param {{
 *   collapsed: boolean,
 *   onToggle: () => void,
 *   onAddSession: () => void,
 * }} props
 */
export function Sidebar({ collapsed, onToggle, onAddSession }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();

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
          label={collapsed ? t(EXPAND_SIDEBAR_LABEL) : t(COLLAPSE_SIDEBAR_LABEL)}
          onClick={onToggle}
        />
      </div>
      <nav className="flex flex-col w-full gap-1">
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={t(item.labelKey)}
            collapsed={collapsed}
            isActive={item.isActive(pathname)}
            onClick={() => navigate(item.to)}
          />
        ))}
      </nav>
      <div className={`mt-auto ${collapsed ? 'flex justify-center px-2' : 'mx-4'}`}>
        {collapsed ? (
          <IconButton variant="outline" icon="add" label={t(ADD_SESSION_LABEL)} onClick={onAddSession} />
        ) : (
          <Button variant="outline" icon="add" className="w-full" onClick={onAddSession}>
            {t(ADD_SESSION_LABEL)}
          </Button>
        )}
      </div>
    </aside>
  );
}