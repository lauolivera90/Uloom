import { useCallback, useState } from 'react';
import { useWorkspaces } from '../../../app/index.js';

/**
 * Estado del borrado de una pestaña en el Detalle: guarda la pestaña objetivo del
 * ConfirmDialog y ejecuta la baja de forma pesimista (espera la respuesta del
 * disco). El diálogo solo se cierra si la persistencia tiene éxito; si falla, el
 * error se loguea acá y el objetivo se mantiene para reintentar.
 * @param {string} [workspaceId]
 * @returns {{
 *   target: import('../../../shared/types.js').Tab | null,
 *   requestDelete: (tab: import('../../../shared/types.js').Tab) => void,
 *   cancelDelete: () => void,
 *   confirmDelete: () => Promise<void>,
 *   isDeleting: boolean,
 * }}
 */
export function useDeleteTab(workspaceId) {
  const { deleteTab } = useWorkspaces();
  const [target, setTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const requestDelete = useCallback((tab) => setTarget(tab), []);
  const cancelDelete = useCallback(() => {
    if (isDeleting) return;
    setTarget(null);
  }, [isDeleting]);

  const confirmDelete = useCallback(async () => {
    if (!target || !workspaceId) return;
    setIsDeleting(true);
    try {
      await deleteTab(workspaceId, target.id);
      setTarget(null);
    } catch (error) {
      console.error(`Error al eliminar la pestaña "${target.name}":`, error);
    } finally {
      setIsDeleting(false);
    }
  }, [target, workspaceId, deleteTab]);

  return { target, requestDelete, cancelDelete, confirmDelete, isDeleting };
}