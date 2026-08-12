import { Button, Card, OptionRow, ResourceCardHeader } from '../../../widgets/index.js';
import { useI18n } from '../../../shared/index.js';
import { EXPORT_LABEL } from '../../../entities/workspace/index.js';

/**
 * Card de exportación de una sesión (Detalle): una fila con la acción de bajar
 * la sesión actual como `.json`. Presentacional: recibe el estado de ejecución y
 * el callback; el guardado real lo resuelve el proceso main (diálogo nativo).
 * @param {{
 *   isExporting: boolean,
 *   onExport: () => void,
 * }} props
 */
export function WorkspaceExportCard({ isExporting, onExport }) {
  const { t } = useI18n();

  return (
    <Card
      header={<ResourceCardHeader title={t(EXPORT_LABEL)} icon="file_download" />}
      headerClassName="bg-accent/10"
    >
      <OptionRow
        label={t('detail.exportSession')}
        description={t('detail.exportSessionDescription')}
        control={
          <Button variant="outline" icon="download" disabled={isExporting} onClick={onExport}>
            {t(EXPORT_LABEL)}
          </Button>
        }
      />
    </Card>
  );
}
