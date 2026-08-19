import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, PageHeader } from '../../../widgets/index.js';
import { useI18n } from '../../../shared/index.js';
import { WorkspaceFormModal, useLaunchWorkspace, TabFormModal } from '../../../entities/workspace/index.js';
import { useWorkspacesHub } from '../hook/index.js';
import { WorkspaceGrid } from './WorkspaceGrid.jsx';

/**
 * Vista contenedora del feature Hub de Sesiones: orquesta la navegación hacia el
 * detalle, el modal de creación y el modal de agregar pestaña que abre el botón
 * (+) de las cards sin pestañas. El estado del modal de pestaña (form + historial
 * + selección múltiple) vive en `useWorkspacesHub` vía el hook compuesto
 * `useTabFormModal`; esta vista solo presenta.
 */
export function WorkspacesHubView() {
  const navigate = useNavigate();
  const { workspaces, createModal, tabModal, openAddTab } = useWorkspacesHub();
  const { t } = useI18n();

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
        isEditing={tabModal.isEditing}
        mode={tabModal.mode}
        form={tabModal.form}
        onCancel={tabModal.onCancel}
        onModeChange={tabModal.onModeChange}
        visibleEntries={tabModal.visibleEntries}
        historyDisabled={tabModal.historyDisabled}
        selectedCount={tabModal.selectedCount}
        selectedUrls={tabModal.selectedUrls}
        onToggleHistoryEntry={tabModal.onToggleHistoryEntry}
        onConfirmBatch={tabModal.onConfirmBatch}
      />
    </Page>
  );
}