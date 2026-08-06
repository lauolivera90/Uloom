import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateWorkspace, useWorkspacesHub } from '../hook/index.js';
import { CreateWorkspaceModal } from './CreateWorkspaceModal.jsx';
import { WorkspaceGrid } from './WorkspaceGrid.jsx';

/**
 * Vista contenedora del feature Hub de Sesiones: orquesta los hooks, la navegación
 * hacia el detalle y el modal de creación.
 */
export function WorkspacesHubView() {
  const navigate = useNavigate();
  const { workspaces, isCreateOpen, openCreate, closeCreate, addWorkspace } = useWorkspacesHub();

  const handleCreate = useCallback(
    (workspace) => {
      addWorkspace(workspace);
      closeCreate();
    },
    [addWorkspace, closeCreate],
  );

  const form = useCreateWorkspace({ onCreate: handleCreate });
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
    <div className="flex flex-col gap-6 p-6">
      <header>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-text">Sesiones</h1>
          <p className="text-sm text-text/60">Elegí una sesión para abrirla o creá una nueva.</p>
        </div>
      </header>
      <WorkspaceGrid workspaces={workspaces} onCreate={openCreate} onOpen={handleOpenWorkspace} />
      <CreateWorkspaceModal isOpen={isCreateOpen} form={form} onCancel={handleCancel} />
    </div>
  );
}
