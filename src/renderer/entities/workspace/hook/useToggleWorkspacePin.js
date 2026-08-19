import { useCallback } from 'react';
import { useI18n, useToast } from '../../../shared/index.js';

/**
 * Toggle de fijado de una sesión (favorito del Hub). Escribe por el líder único
 * de escritura (`mutateWorkspace`) invirtiendo `workspace.pinned`; si el IPC
 * falla loguea y emite un toast de error localizado (regla 10: error siempre
 * justifica toast). El éxito no tostéa: es un cambio in-place que la estrella
 * refleja en la vista (regla 10).
 *
 * Recibe `mutateWorkspace` por inyección (mismo precedente que `useTabModal` con
 * `addTab`/`updateTab`): si importara `useWorkspaces` desde `app/` crearía el
 * ciclo `app → entities → app` (el estado global de app depende del barrel de
 * entities). Lo consumen Hub y Detalle (precedente `useLaunchWorkspace`).
 * @param {{
 *   mutateWorkspace: (workspaceId: string, mutator: (workspace: import('../../../shared/types.js').Workspace) => import('../../../shared/types.js').Workspace) => Promise<import('../../../shared/types.js').Workspace>,
 * }} deps
 * @returns {{ togglePin: (workspaceId: string) => Promise<void> }}
 */
export function useToggleWorkspacePin({ mutateWorkspace }) {
  const { t } = useI18n();
  const { toast } = useToast();

  const togglePin = useCallback(
    async (workspaceId) => {
      try {
        await mutateWorkspace(workspaceId, (workspace) => ({
          ...workspace,
          pinned: !workspace.pinned,
        }));
      } catch (error) {
        console.error(error);
        toast({ variant: 'error', message: t('hub.pinError') });
      }
    },
    [mutateWorkspace, toast, t],
  );

  return { togglePin };
}