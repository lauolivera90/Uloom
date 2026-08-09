import { useCallback, useState } from 'react';
import { useWorkspaces } from '../../../app/index.js';
import { useWorkspaceForm } from '../../../entities/workspace/index.js';

/**
 * Estado del modal de edición de sesión en el Detalle: apertura/cierre y la
 * persistencia a través del líder único de escritura (mergea solo name/description/
 * icon sobre el workspace existente, preservando tabs/openBehavior/browser). El
 * form lo aporta el hook genérico de entities (`useWorkspaceForm`), precargado
 * con el workspace actual. `open` resetea el form para que cada reapertura
 * re-inicialice desde el workspace vigente (evita quedar una edición atrás).
 * @param {import('../../../shared/types.js').Workspace | null} workspace
 * @returns {{
 *   form: import('../../../entities/workspace/hook/useWorkspaceForm.js').WorkspaceFormState,
 *   isOpen: boolean,
 *   isEditing: boolean,
 *   isSaving: boolean,
 *   open: () => void,
 *   close: () => void,
 * }}
 */
export function useWorkspaceEdit(workspace) {
  const { mutateWorkspace } = useWorkspaces();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = useCallback(
    async (data) => {
      if (!workspace) return;
      setIsSaving(true);
      try {
        await mutateWorkspace(workspace.id, (current) => ({ ...current, ...data }));
        setIsOpen(false);
      } finally {
        setIsSaving(false);
      }
    },
    [workspace, mutateWorkspace],
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

  return { form, isOpen, isEditing: workspace !== null, isSaving, open, close };
}