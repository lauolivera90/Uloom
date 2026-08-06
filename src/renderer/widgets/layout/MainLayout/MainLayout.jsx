import { Outlet } from 'react-router-dom';
import { Sidebar } from '../Sidebar/index.js';

/**
 * Shell del layout principal: sidebar colapsable (modelo push) y zona de
 * contenido. Renderiza las páginas hijas del layout route a través de Outlet.
 * Presentacional: recibe el estado del sidebar por props.
 * @param {{
 *   collapsed: boolean,
 *   onToggle: () => void,
 * }} props
 */
export function MainLayout({ collapsed, onToggle }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={onToggle} />
      <main className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}