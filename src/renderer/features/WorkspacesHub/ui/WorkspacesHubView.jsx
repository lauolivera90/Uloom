import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, PageHeader } from '../../../widgets/index.js';
import { useWorkspaceForm, WorkspaceFormModal } from '../../../entities/workspace/index.js';
import { useWorkspacesHub } from '../hook/index.js';
import { WorkspaceGrid } from './WorkspaceGrid.jsx';

/**
 * Vista contenedora del feature Hub de Sesiones: orquesta los hooks, la navegación
 * hacia el detalle y el modal de creación.
 */
export function WorkspacesHubView() {
  const navigate = useNavigate();
  const { workspaces, isCreateOpen, openCreate, closeCreate, isCreating, createWorkspace } =
    useWorkspacesHub();

  const handleCreate = useCallback(
    async (workspace) => {
      await createWorkspace(workspace);
      closeCreate();
    },
    [createWorkspace, closeCreate],
  );

  const form = useWorkspaceForm({ initialWorkspace: null, onSubmit: handleCreate });
  const { reset } = form;

  const handleCancel = useCallback(() => {
    reset();
    closeCreate();
  }, [reset, closeCreate]);

  const handleOpenWorkspace = useCallback(
    (workspaceId) => {
      navigate(`/workspaces/${workspaceId}`);
    },
    [navigate],
  );

  return (
    <Page>
      <PageHeader title="Sesiones" description="Elegí una sesión para abrirla o creá una nueva." />
      <WorkspaceGrid workspaces={workspaces} onCreate={openCreate} onOpen={handleOpenWorkspace} />
      <WorkspaceFormModal isOpen={isCreateOpen} isSaving={isCreating} form={form} onCancel={handleCancel} />
    </Page>
  );
}
