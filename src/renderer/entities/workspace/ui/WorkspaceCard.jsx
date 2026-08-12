/**
 * @typedef {import('../../../shared/types.js').Workspace} Workspace
 */

import { Card, Icon, IconButton, focusRing } from '../../../widgets/index.js';
import { useI18n } from '../../../shared/index.js';
import { LAUNCH_EMPTY_TABS_TITLE, ADD_TAB_LABEL } from '../api/index.js';

/**
 * Tarjeta de una sesión de trabajo del Hub. Presentacional: muestra icono, nombre,
 * descripción y cantidad de pestañas. La card completa es clickeable (abre el
 * detalle) y en hover muestra el botón de play para lanzar la sesión; si la sesión
 * no tiene pestañas el play se reemplaza por un botón `+` que invita a agregar la
 * primera pestaña (modal de alta vía `onAddTab`), porque no se puede lanzar una
 * sesión vacía.
 * @param {{
 *   workspace: Workspace,
 *   onClick: () => void,
 *   onPlay?: (workspaceId: string) => void,
 *   onAddTab?: (workspaceId: string) => void,
 * }} props
 */
export function WorkspaceCard({ workspace, onClick, onPlay, onAddTab }) {
  const tabsCount = workspace.tabs?.length ?? 0;
  const { t } = useI18n();

  return (
    <Card
      className={`group flex flex-col hover:border-primary-hover transition duration-fast active:scale-[0.98] cursor-pointer ${focusRing}`}
      bodyClassName="flex-1"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.();
        }
      }}
      footerClassName="px-5 py-3 flex items-center justify-between gap-2"
      footer={
        <>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-text/60">{t('workspaceCard.resources')}</span>
            <span className="flex items-center gap-2 text-xs text-text/60">
              <Icon icon="tab" size={16} className="text-text/60" />
              {t('workspaceCard.tabsCount', { count: tabsCount })}
            </span>
          </div>
          {tabsCount === 0 ? (
            <IconButton
              variant="primary"
              icon="add"
              label={t(ADD_TAB_LABEL)}
              appearOnHover
              title={t(LAUNCH_EMPTY_TABS_TITLE)}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onAddTab?.(workspace.id);
              }}
            />
          ) : (
            <IconButton
              variant="primary"
              icon="play_arrow"
              label={t('workspaceCard.openSession')}
              appearOnHover
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onPlay?.(workspace.id);
              }}
            />
          )}
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Icon icon={workspace.icon || 'work'} className="text-accent" />
          <h3 className="text-base font-semibold text-text">{workspace.name}</h3>
        </div>
        {workspace.description && (
          <p className="text-sm text-text/60 line-clamp-3">{workspace.description}</p>
        )}
      </div>
    </Card>
  );
}
