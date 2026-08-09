import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, PageHeader } from '../../../widgets/index.js';
import { useWorkspaceForm, WorkspaceFormModal, useLaunchWorkspace, useTabForm, TabFormModal } from '../../../entities/workspace/index.js';
import { useWorkspacesHub } from '../hook/index.js';
import { WorkspaceGrid } from './WorkspaceGrid.jsx';

/**
 * Vista contenedora del feature Hub de Sesiones: orquesta los hooks, la navegación
 * hacia el detalle, el modal de creación y el modal de agregar pestaña que abre el
 * botón (+) de las cards sin pestañas.
 */
export function WorkspacesHubView() {
  const navigate = useNavigate();
  const {
    workspaces,
    isCreateOpen,
    openCreate,
    closeCreate,
    isCreating,
    createWorkspace,
    tabModal,
    openAddTab,
  } = useWorkspacesHub();

  const handleCreate = useCallback(
    async (workspace) => {
      await createWorkspace(workspace);
      closeCreate();
    },
    [createWorkspace, closeCreate],
  );

  const form = useWorkspaceForm({ initialWorkspace: null, onSubmit: handleCreate });
  const { reset } = form;
  const tabForm = useTabForm({ initialTab: null, onSubmit: tabModal.onSubmitTab });
  const { reset: resetTabForm } = tabForm;

  const handleCancel = useCallback(() => {
    reset();
    closeCreate();
  }, [reset, closeCreate]);

  const handleCancelTab = useCallback(() => {
    resetTabForm();
    tabModal.close();
  }, [resetTabForm, tabModal]);

  const handleOpenWorkspace = useCallback(
    (workspaceId) => {
      navigate(`/workspaces/${workspaceId}`);
    },
    [navigate],
  );

  const { launch } = useLaunchWorkspace();

  const handlePlay = useCallback(
    (workspaceId) => {
      launch(workspaceId);
    },
    [launch],
  );

  return (
    <Page>
      <PageHeader title="Sesiones" description="Elegí una sesión para abrirla o creá una nueva." />
      <WorkspaceGrid
        workspaces={workspaces}
        onCreate={openCreate}
        onOpen={handleOpenWorkspace}
        onPlay={handlePlay}
        onAddTab={openAddTab}
      />
      <WorkspaceFormModal isOpen={isCreateOpen} isSaving={isCreating} form={form} onCancel={handleCancel} />
      <TabFormModal
        isOpen={tabModal.isOpen}
        isSaving={tabModal.isSaving}
        form={tabForm}
        onCancel={handleCancelTab}
      />
    </Page>
  );
}