import { useCallback } from 'react';
import { useWorkspaces } from '../../../app/index.js';
import { useConfirmAction } from '../../../shared/index.js';

/**
 * Estado de la baja de una sesión en el Detalle. `isConfirmOpen` controla el
 * ConfirmDialog y `isDeleting` el spinner mientras se persiste. La eliminación es
 * pesimista (espera la respuesta del disco) y se serializa en el líder de
 * escritura global; solo tras éxito devuelve `true` para que la vista navegue.
 * La máquina de confirmación la aporta el hook genérico `useConfirmAction`
 * (rules.md §4).
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

  const { isOpen, isRunning, request, cancel, confirm } = useConfirmAction({
    action: useCallback(() => deleteWorkspace(workspaceId), [workspaceId, deleteWorkspace]),
    errorMessage: 'Error al eliminar la sesión:',
    errorKey: 'deleteWorkspace.error',
  });

  return {
    isConfirmOpen: isOpen,
    isDeleting: isRunning,
    requestDelete: request,
    cancelDelete: cancel,
    confirmDelete: confirm,
  };
}
