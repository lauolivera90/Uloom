import { TabRow } from './TabRow.jsx';
import { CreateTile } from '../../../widgets/index.js';
import { useI18n } from '../../../shared/index.js';

/**
 * Lista de recursos web de la sesión. Presentacional: si no hay pestañas muestra
 * un estado vacío tipo CreateTile ("Sin pestañas aquí / Agrega algunas") que abre
 * el modal de agregar pestaña; si hay, lista las pestañas.
 * @param {{
 *   tabs: import('../../../shared/types.js').Tab[],
 *   onAddTab?: () => void,
 *   onEdit?: (tab: import('../../../shared/types.js').Tab) => void,
 *   onDelete?: (tab: import('../../../shared/types.js').Tab) => void,
 * }} props
 */
export function TabList({ tabs, onAddTab, onEdit, onDelete }) {
  const { t } = useI18n();

  if (tabs.length === 0) {
    return (
      <div className="p-5">
        <CreateTile
          className="w-full"
          label={t('tabList.empty')}
          description={t('tabList.emptyAction')}
          onClick={onAddTab}
        />
      </div>
    );
  }

  return (
    <ul className="flex flex-col">
      {tabs.map((tab) => (
        <li key={tab.id}>
          <TabRow tab={tab} onEdit={onEdit} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
}