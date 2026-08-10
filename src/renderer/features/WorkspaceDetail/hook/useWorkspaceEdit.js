import { useCallback } from 'react';
import { useWorkspaces } from '../../../app/index.js';
import { useWorkspaceFormModal } from '../../../entities/workspace/index.js';

/**
 * Estado del modal de edición de sesión en el Detalle: apertura/cierre y la
 * persistencia a través del líder único de escritura (mergea solo name/description/
 * icon sobre el workspace existente, preservando tabs/openBehavior/browser). La
 * máquina del modal la aporta el hook genérico `useWorkspaceFormModal`
 * (entities, rules.md §4), precargado con el workspace actual.
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

  const handleSubmit = useCallback(
    async (data) => {
      if (!workspace) return;
      await mutateWorkspace(workspace.id, (current) => ({ ...current, ...data }));
    },
    [workspace, mutateWorkspace],
  );

  const modal = useWorkspaceFormModal({ workspace, onSubmit: handleSubmit });

  return { ...modal, isEditing: workspace !== null };
}
