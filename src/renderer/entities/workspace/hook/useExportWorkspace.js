import { useCallback, useState } from 'react';
import { exportWorkspace } from '../api/index.js';

/**
 * Exporta una sesión individual a un archivo `.json` (diálogo nativo de guardado
 * en el proceso main). Expone estado de ejecución (`isExporting`), el último
 * error y la acción `exportSession`. La cancelación del diálogo no es un error
 * (el servicio la devuelve como `canceled: true`). Los errores se loguean con
 * `console.error` y quedan en `error` (convención actual del proyecto).
 * @param {string} [workspaceId]
 * @returns {{
 *   isExporting: boolean,
 *   error: string | null,
 *   exportSession: () => Promise<boolean>,
 * }}
 */
export function useExportWorkspace(workspaceId) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const exportSession = useCallback(async () => {
    if (!workspaceId || isExporting) return false;
    setIsExporting(true);
    setError(null);
    try {
      const { canceled } = await exportWorkspace(workspaceId);
      return !canceled;
    } catch (err) {
      console.error('Error al exportar la sesión:', err);
      setError(err.message);
      return false;
    } finally {
      setIsExporting(false);
    }
  }, [workspaceId, isExporting]);

  return { isExporting, error, exportSession };
}
