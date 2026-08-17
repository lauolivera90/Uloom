import { useCallback, useState } from 'react';
import { useWorkspaceForm } from './useWorkspaceForm.js';
import { useI18n, useToast } from '../../../shared/index.js';

/**
 * Estado del modal de sesión (alta o edición) compartido entre el Hub, el Detalle
 * y la app global (Sidebar): apertura/cierre, persistencia pesimista y el form
 * precargado. `workspace: null` = alta (form vacío); un workspace = edición con
 * `initialWorkspace`. Centraliza el patrón del modal de sesión que repetían la app
 * global, `useWorkspaceEdit` y la lógica inline del Hub (rules.md §4). El submit
 * cierra el modal solo ante éxito (persistencia pesimista); si falla, emite un
 * toast de error localizado y re-lanza para que la vista loguee (console.error).
 * @param {{
 *   workspace?: import('../../shared/types.js').Workspace | null,
 *   onSubmit: (workspace: { name: string, description?: string, icon?: string }) => Promise<unknown>,
 * }} props
 * @returns {{
 *   isOpen: boolean,
 *   isSaving: boolean,
 *   form: import('./useWorkspaceForm.js').WorkspaceFormState,
 *   open: () => void,
 *   close: () => void,
 * }}
 */
export function useWorkspaceFormModal({ workspace = null, onSubmit }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useI18n();
  const { toast } = useToast();

  const handleSubmit = useCallback(
    async (data) => {
      setIsSaving(true);
      try {
        await onSubmit(data);
        setIsOpen(false);
      } catch (error) {
        toast({ variant: 'error', message: t('save.error') });
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [onSubmit, toast, t],
  );

  const form = useWorkspaceForm({ initialWorkspace: workspace, onSubmit: handleSubmit });
  const { reset } = form;

  const open = useCallback(() => {
    reset();
    setIsOpen(true);
  }, [reset]);

  const close = useCallback(() => {
    reset();
    setIsOpen(false);
  }, [reset]);

  return { isOpen, isSaving, form, open, close };
}
