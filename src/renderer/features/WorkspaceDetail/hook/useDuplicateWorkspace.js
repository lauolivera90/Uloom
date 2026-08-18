import { useCallback, useMemo } from 'react';
import { useWorkspaces } from '../../../app/index.js';
import { useWorkspaceFormModal } from '../../../entities/workspace/index.js';
import { inferDuplicateName, useI18n, useToast } from '../../../shared/index.js';

/**
 * Estado del modal de duplicación de sesión en el Detalle: apertura/cierre y la
 * creación de la copia vía el estado global (`duplicateWorkspace`), que clona en
 * el main las tabs y la configuración de lanzamiento de la fuente con ids
 * nuevos. El form precarga los datos de la fuente con el nombre inferido
 * (`root (count)`, `shared/lib/workspaceName.js`); la sesión original nunca se
 * modifica. El submit cierra el modal solo ante éxito (persistencia pesimista) y
 * confirma con toast de éxito (`duplicate.success` — el resultado no es visible
 * desde el Detalle, el nuevo catálogo vive en el Hub); los errores se resuelven
 * con toast de error en `useWorkspaceFormModal`.
 * @param {import('../../../shared/types.js').Workspace | null} workspace
 * @returns {{
 *   form: import('../../../entities/workspace/hook/useWorkspaceForm.js').WorkspaceFormState,
 *   isOpen: boolean,
 *   isDuplicating: boolean,
 *   isSaving: boolean,
 *   open: () => void,
 *   close: () => void,
 * }}
 */
export function useDuplicateWorkspace(workspace) {
  const { workspaces, duplicateWorkspace } = useWorkspaces();
  const { t } = useI18n();
  const { toast } = useToast();

  const duplicatePrefill = useMemo(() => {
    if (!workspace) return null;
    const existingNames = workspaces.map((item) => item.name);
    return { ...workspace, name: inferDuplicateName(workspace.name, existingNames) };
  }, [workspace, workspaces]);

  const handleSubmit = useCallback(
    async (data) => {
      if (!workspace) return;
      await duplicateWorkspace(workspace.id, data);
      toast({ variant: 'success', message: t('duplicate.success') });
    },
    [workspace, duplicateWorkspace, toast, t],
  );

  const modal = useWorkspaceFormModal({ workspace: duplicatePrefill, onSubmit: handleSubmit });

  return { ...modal, isDuplicating: workspace !== null };
}