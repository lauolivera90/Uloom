import { useState } from 'react';
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
 * Navegación lateral principal. En pantallas grandes (≥lg, `isSmall` falso) es un
 * sidebar colapsable a columna de iconos (w-16) con modelo push; expandida usa
 * w-56. En pantallas pequeñas (`isSmall`) queda SIEMPRE colapsada y fija al
 * borde izquierdo (z-[40], debajo de modales/toasts): al hacer hover se expande
 * SUPERPUESTA sobre el contenido (sin quitarle espacio, reserva el rail el
 * `pl-16` de MainLayout) y se oculta el botón de colapsar. El contenedor no
 * tiene padding: cada hijo (header y nav) controla su propia distancia. El
 * header muestra la marca Uloom y el botón de colapsar con space-between;
 * colapsado solo queda el botón. Debajo de la navegación vive la acción global
 * de crear sesión (`onAddSession`), siempre usable en cualquier ruta.
 * @param {{
 *   collapsed: boolean,
 *   onToggle: () => void,
 *   onAddSession: () => void,
 *   isSmall?: boolean,
 * }} props
 */
export function Sidebar({ collapsed, onToggle, onAddSession, isSmall = false }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [hovered, setHovered] = useState(false);

  const expanded = isSmall ? hovered : !collapsed;

  const positionClass = isSmall
    ? 'fixed inset-y-0 left-0 z-[40]'
    : '';
  const overlayShadow = isSmall && expanded ? 'shadow-xl' : '';

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`flex flex-col shrink-0 h-full py-5 border-r border-border bg-surface transition-[width] duration-base ${positionClass} ${overlayShadow} ${
        expanded ? 'w-56' : 'w-16'
      }`}
    >
      <div
        className={`flex items-center mb-8 ${
          expanded ? 'justify-between mx-5' : 'justify-center'
        }`}
      >
        {expanded && <span className="text-lg font-semibold text-accent truncate">Uloom</span>}
        {!isSmall && (
          <IconButton
            size="sm"
            variant="ghost"
            noFocusRing
            icon="grid_layout_side"
            label={collapsed ? t(EXPAND_SIDEBAR_LABEL) : t(COLLAPSE_SIDEBAR_LABEL)}
            onClick={onToggle}
          />
        )}
      </div>
      <nav className="flex flex-col w-full gap-1">
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={t(item.labelKey)}
            collapsed={!expanded}
            isActive={item.isActive(pathname)}
            onClick={() => navigate(item.to)}
          />
        ))}
      </nav>
      <div className={`mt-auto ${expanded ? 'mx-4' : 'flex justify-center px-2'}`}>
        {expanded ? (
          <Button variant="outline" icon="add" className="w-full" onClick={onAddSession}>
            {t(ADD_SESSION_LABEL)}
          </Button>
        ) : (
          <IconButton variant="outline" icon="add" label={t(ADD_SESSION_LABEL)} onClick={onAddSession} />
        )}
      </div>
    </aside>
  );
}