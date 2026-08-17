import { useCallback, useState } from 'react';
import { launchWorkspace } from '../api/index.js';
import { useI18n, useToast } from '../../../shared/index.js';

/**
 * Lanza una sesión en el navegador resuelto (sesión → global → sistema). Vivía
 * en el Detalle y el Hub, por eso es un hook de entidad compartido: expone estado
 * de ejecución (`isLaunching`), último error de la apertura y la acción `launch`,
 * que recibe opcionalmente el id de la sesión (si se omite o no es un string,
 * usa el del hook, fijo del Detalle; el Hub pasa el id de cada card). Los errores
 * se loguean con `console.error`, emiten un toast de error localizado y quedan
 * en `error` (para feedback inline futuro) — nunca lanza. Si parte de las
 * pestañas fallan al abrirse, avisa con un toast de advertencia.
 * @param {string} [workspaceId]
 * @returns {{
 *   isLaunching: boolean,
 *   error: string | null,
 *   launch: (workspaceId?: string) => Promise<{ opened: number, failed: number } | null>,
 * }}
 */
export function useLaunchWorkspace(workspaceId) {
  const [isLaunching, setIsLaunching] = useState(false);
  const [error, setError] = useState(null);
  const { t } = useI18n();
  const { toast } = useToast();

  const launch = useCallback(
    async (id) => {
      const targetId = typeof id === 'string' ? id : workspaceId;
      if (!targetId) {
        setError(t('launch.sessionUndefined'));
        return null;
      }
      setIsLaunching(true);
      setError(null);
      try {
        const result = await launchWorkspace(targetId);
        if (result.failed > 0) {
          console.error(`Launches fallidos: ${result.failed} de ${result.opened + result.failed}`);
          toast({
            variant: 'warning',
            message: t('launch.partialFailure', { failed: result.failed }),
          });
        }
        return result;
      } catch (err) {
        console.error('Error al lanzar la sesión:', err);
        setError(err.message);
        toast({ variant: 'error', message: t('launch.error') });
        return null;
      } finally {
        setIsLaunching(false);
      }
    },
    [workspaceId, t, toast],
  );

  return { isLaunching, error, launch };
}