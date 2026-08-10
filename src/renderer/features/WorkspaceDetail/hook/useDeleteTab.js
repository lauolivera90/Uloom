import { useCallback, useState } from 'react';
import { useWorkspaces } from '../../../app/index.js';
import { useConfirmAction } from '../../../shared/index.js';

/**
 * Estado del borrado de una pestaña en el Detalle: guarda la pestaña objetivo del
 * ConfirmDialog y delega la máquina de confirmación en `useConfirmAction`
 * (apertura, guard de ejecución y cierre solo ante éxito — rules.md §4). El
 * diálogo solo se cierra si la persistencia tiene éxito; si falla, el error se
 * loguea en el hook genérico y el objetivo se mantiene para reintentar.
 * @param {string} [workspaceId]
 * @returns {{
 *   target: import('../../../shared/types.js').Tab | null,
 *   isOpen: boolean,
 *   requestDelete: (tab: import('../../../shared/types.js').Tab) => void,
 *   cancelDelete: () => void,
 *   confirmDelete: () => Promise<boolean>,
 *   isDeleting: boolean,
 * }}
 */
export function useDeleteTab(workspaceId) {
  const { deleteTab } = useWorkspaces();
  const [target, setTarget] = useState(null);

  const action = useCallback(async () => {
    if (!target || !workspaceId) return;
    await deleteTab(workspaceId, target.id);
  }, [target, workspaceId, deleteTab]);

  const errorMessage = target
    ? `Error al eliminar la pestaña "${target.name}":`
    : 'Error al eliminar la pestaña:';

  const { isOpen, isRunning, request, cancel, confirm } = useConfirmAction({
    action,
    errorMessage,
  });

  const confirmDelete = useCallback(async () => {
    const ok = await confirm();
    if (ok) setTarget(null);
    return ok;
  }, [confirm]);

  const requestDelete = useCallback(
    (tab) => {
      setTarget(tab);
      request();
    },
    [request],
  );

  const cancelDelete = useCallback(() => {
    setTarget(null);
    cancel();
  }, [cancel]);

  return {
    target,
    isOpen,
    isDeleting: isRunning,
    requestDelete,
    cancelDelete,
    confirmDelete,
  };
}
