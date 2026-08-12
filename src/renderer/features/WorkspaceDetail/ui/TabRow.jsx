import { IconButton } from '../../../widgets/index.js';
import { useI18n } from '../../../shared/index.js';
import { TabFavicon, DELETE_TAB_LABEL } from '../../../entities/workspace/index.js';

/**
 * Fila de una pestaña web en la lista de recursos. Presentacional: icono (favicon)
 * y columna con nombre + URL. En hover revela en el extremo dos acciones: editar
 * y borrar, que disparan onEdit/onDelete.
 * @param {{
 *   tab: import('../../../shared/types.js').Tab,
 *   onEdit?: (tab: import('../../../shared/types.js').Tab) => void,
 *   onDelete?: (tab: import('../../../shared/types.js').Tab) => void,
 * }} props
 */
export function TabRow({ tab, onEdit, onDelete }) {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-primary/10 group transition duration-fast">
      <TabFavicon url={tab.url} icon={tab.icon} favicon={tab.favicon} />
      <div className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-text truncate">{tab.name}</span>
        <span className="block text-xs text-text/60 truncate">{tab.url}</span>
      </div>
      <div className="flex items-center gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition duration-fast flex-shrink-0">
        <IconButton variant="warning" icon="edit" label={t('tabRow.editTab')} size="sm" onClick={() => onEdit?.(tab)} />
        <IconButton
          variant="danger"
          icon="delete"
          label={t(DELETE_TAB_LABEL)}
          size="sm"
          onClick={() => onDelete?.(tab)}
        />
      </div>
    </div>
  );
}