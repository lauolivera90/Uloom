import { Outlet } from 'react-router-dom';
import { Sidebar } from '../Sidebar/index.js';

/**
 * Shell del layout principal: sidebar colapsable (modelo push) y zona de
 * contenido. En pantallas pequeñas (`isSmall`) el sidebar pasa a overlay fijo
 * (siempre colapsado, se expande por hover superpuesto) y `main` reserva el
 * rail colapsado con `pl-16`. Renderiza las páginas hijas del layout route a
 * través de Outlet. Presentacional: recibe el estado del sidebar y la acción
 * global de agregar sesión por props.
 * @param {{
 *   collapsed: boolean,
 *   onToggle: () => void,
 *   onAddSession: () => void,
 *   isSmall?: boolean,
 * }} props
 */
export function MainLayout({ collapsed, onToggle, onAddSession, isSmall = false }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={onToggle} onAddSession={onAddSession} isSmall={isSmall} />
      <main className={`flex-1 min-w-0 overflow-auto ${isSmall ? 'pl-16' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}