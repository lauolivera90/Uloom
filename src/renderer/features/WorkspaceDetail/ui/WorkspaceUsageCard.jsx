import { Card, OptionRow, ResourceCardHeader } from '../../../widgets/index.js';
import { formatRelativeTime, useI18n } from '../../../shared/index.js';

/**
 * @typedef {import('../../../shared/types.js').Workspace} Workspace
 */

/**
 * Card "Datos de uso" del Detalle: muestra la última vez que se lanzó la sesión
 * (tiempo relativo localizado; "Nunca lanzada" si no tiene historial) y la
 * cantidad de lanzamientos. Presentacional: lee los campos de uso de la entidad
 * (se sincronizan al instante tras un lanzamiento vía `syncWorkspace`).
 * @param {{ workspace: Workspace }} props
 */
export function WorkspaceUsageCard({ workspace }) {
  const { t } = useI18n();

  const lastLaunched = workspace.lastLaunchedAt
    ? formatRelativeTime(workspace.lastLaunchedAt, t)
    : t('detail.neverLaunched');

  return (
    <Card
      header={<ResourceCardHeader title={t('detail.usageData')} icon="query_stats" />}
      headerClassName="bg-accent/10"
    >
      <div className="flex flex-col divide-y divide-border/40">
        <OptionRow
          label={t('detail.lastLaunched')}
          control={<span className="text-sm text-text">{lastLaunched}</span>}
        />
        <OptionRow
          label={t('detail.timesLaunched')}
          control={
            <span className="text-sm text-text">
              {t('detail.launchCount', { count: workspace.launchCount ?? 0 })}
            </span>
          }
        />
      </div>
    </Card>
  );
}