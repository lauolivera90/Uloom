import { Button, Card, OptionRow, ResourceCardHeader } from '../../../widgets/index.js';
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
  return (
    <Card
      header={<ResourceCardHeader title="Exportar" icon="file_download" />}
      headerClassName="bg-accent/10"
    >
      <OptionRow
        label="Exportar esta sesión"
        description="Baja un archivo `.json` con esta sesión para respaldarla o compartirla."
        control={
          <Button variant="outline" icon="download" disabled={isExporting} onClick={onExport}>
            {EXPORT_LABEL}
          </Button>
        }
      />
    </Card>
  );
}
