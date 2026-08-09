import { useCallback, useState } from 'react';
import { useWorkspaces } from '../../../app/index.js';

/**
 * Estado de la baja de una sesión en el Detalle. `isConfirmOpen` controla el
 * ConfirmDialog y `isDeleting` el spinner mientras se persiste. La eliminación es
 * pesimista (espera la respuesta del disco) y se serializa en el líder de
 * escritura global; solo tras éxito devuelve `true` para que la vista navegue.
 * @param {string} [workspaceId]
 * @returns {{
 *   isConfirmOpen: boolean,
 *   isDeleting: boolean,
 *   requestDelete: () => void,
 *   cancelDelete: () => void,
 *   confirmDelete: () => Promise<boolean>,
 * }}
 */
export function useDeleteWorkspace(workspaceId) {
  const { deleteWorkspace } = useWorkspaces();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const requestDelete = useCallback(() => setIsConfirmOpen(true), []);
  const cancelDelete = useCallback(() => {
    if (isDeleting) return;
    setIsConfirmOpen(false);
  }, [isDeleting]);

  const confirmDelete = useCallback(async () => {
    if (!workspaceId || isDeleting) return false;
    setIsDeleting(true);
    try {
      await deleteWorkspace(workspaceId);
      setIsConfirmOpen(false);
      return true;
    } catch (error) {
      console.error(`Error al eliminar la sesión:`, error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [workspaceId, deleteWorkspace, isDeleting]);

  return { isConfirmOpen, isDeleting, requestDelete, cancelDelete, confirmDelete };
}