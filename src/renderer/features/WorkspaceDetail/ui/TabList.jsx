import { TabRow } from './TabRow.jsx';
import { CreateTile } from '../../../widgets/index.js';

/**
 * Lista de recursos web de la sesión. Presentacional: si no hay pestañas muestra
 * un estado vacío tipo CreateTile ("Sin pestañas aquí / Agrega algunas") que abre
 * el modal de agregar pestaña; si hay, lista las pestañas.
 * @param {{
 *   tabs: import('../../../shared/types.js').Tab[],
 *   onAddTab?: () => void,
 *   onDelete?: (tab: import('../../../shared/types.js').Tab) => void,
 * }} props
 */
export function TabList({ tabs, onAddTab, onDelete }) {
  if (tabs.length === 0) {
    return (
      <div className="p-5">
        <CreateTile className='w-full' label="Sin pestañas aquí" description="Agrega algunas" onClick={onAddTab} />
      </div>
    );
  }

  return (
    <ul className="flex flex-col">
      {tabs.map((tab) => (
        <li key={tab.id}>
          <TabRow tab={tab} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
}