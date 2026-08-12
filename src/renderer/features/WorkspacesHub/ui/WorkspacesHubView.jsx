import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, PageHeader } from '../../../widgets/index.js';
import { useI18n } from '../../../shared/index.js';
import { WorkspaceFormModal, useLaunchWorkspace, useTabForm, TabFormModal } from '../../../entities/workspace/index.js';
import { useWorkspacesHub } from '../hook/index.js';
import { WorkspaceGrid } from './WorkspaceGrid.jsx';

/**
 * Vista contenedora del feature Hub de Sesiones: orquesta los hooks, la navegación
 * hacia el detalle, el modal de creación y el modal de agregar pestaña que abre el
 * botón (+) de las cards sin pestañas.
 */
export function WorkspacesHubView() {
  const navigate = useNavigate();
  const { workspaces, createModal, tabModal, openAddTab } = useWorkspacesHub();
  const { t } = useI18n();

  const tabForm = useTabForm({ initialTab: null, onSubmit: tabModal.onSubmitTab });
  const { reset: resetTabForm } = tabForm;
  const { close: closeTabModal } = tabModal;

  const handleCancelTab = useCallback(() => {
    resetTabForm();
    closeTabModal();
  }, [resetTabForm, closeTabModal]);

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
      <PageHeader title={t('hub.title')} description={t('hub.description')} />
      <WorkspaceGrid
        workspaces={workspaces}
        onCreate={createModal.open}
        onOpen={handleOpenWorkspace}
        onPlay={handlePlay}
        onAddTab={openAddTab}
      />
      <WorkspaceFormModal
        isOpen={createModal.isOpen}
        isSaving={createModal.isSaving}
        form={createModal.form}
        onCancel={createModal.close}
      />
      <TabFormModal
        isOpen={tabModal.isOpen}
        isSaving={tabModal.isSaving}
        form={tabForm}
        onCancel={handleCancelTab}
      />
    </Page>
  );
}
