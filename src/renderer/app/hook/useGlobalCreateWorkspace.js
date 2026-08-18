import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useWorkspaces } from '../WorkspaceProvider.jsx';
import { useWorkspaceFormModal } from '../../entities/workspace/index.js';
import { useI18n, useToast } from '../../shared/index.js';

/**
 * Estado del modal global de creación de sesión (lo abre el Sidebar desde
 * cualquier ruta): apertura/cierre, persistencia pesimista y el form vacío,
 * sobre el hook genérico `useWorkspaceFormModal`. El éxito confirma con toast
 * solo cuando el resultado (la card nueva en el Hub) NO es visible desde la
 * vista actual: estando en el Hub la card aparece in-place y no hay toast;
 * estando en Configuración o el Detalle, el catálogo nuevo vive en otra vista y
 * el toast cierra el hueco (design.md §3, mismo criterio que
 * `duplicate.success`). Los errores se resuelven con toast de error en
 * `useWorkspaceFormModal`.
 * @returns {{
 *   isOpen: boolean,
 *   isSaving: boolean,
 *   form: import('../../entities/workspace/hook/useWorkspaceForm.js').WorkspaceFormState,
 *   open: () => void,
 *   close: () => void,
 * }}
 */
export function useGlobalCreateWorkspace() {
  const { createWorkspace } = useWorkspaces();
  const location = useLocation();
  const { t } = useI18n();
  const { toast } = useToast();

  const handleCreate = useCallback(
    async (data) => {
      const created = await createWorkspace(data);
      if (location.pathname !== '/') {
        toast({ variant: 'success', message: t('create.success') });
      }
      return created;
    },
    [createWorkspace, location.pathname, toast, t],
  );

  const modal = useWorkspaceFormModal({ workspace: null, onSubmit: handleCreate });

  return modal;
}