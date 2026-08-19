import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, PageHeader, TextInput } from '../../../widgets/index.js';
import { useI18n } from '../../../shared/index.js';
import { WorkspaceFormModal, useLaunchWorkspace, TabFormModal } from '../../../entities/workspace/index.js';
import { useWorkspacesHub } from '../hook/index.js';
import { WorkspaceGrid } from './WorkspaceGrid.jsx';

/**
 * Vista contenedora del feature Hub de Sesiones: orquesta la navegación hacia el
 * detalle, el modal de creación y el modal de agregar pestaña que abre el botón
 * (+) de las cards sin pestañas. El estado del modal de pestaña (form + historial
 * + selección múltiple) vive en `useWorkspacesHub` vía el hook compuesto
 * `useTabFormModal`; esta vista solo presenta. Desde v0.6.1 el header incluye la
 * búsqueda de sesiones y las cards reciben el toggle de fijado.
 */
export function WorkspacesHubView() {
  const navigate = useNavigate();
  const {
    visibleWorkspaces,
    isSearching,
    searchQuery,
    setSearchQuery,
    togglePin,
    createModal,
    tabModal,
    openAddTab,
  } = useWorkspacesHub();
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
      <PageHeader
        title={t('hub.title')}
        description={t('hub.description')}
        actions={
          <TextInput
            type="search"
            icon="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t('hub.searchPlaceholder')}
            aria-label={t('hub.searchPlaceholder')}
            className="w-64"
          />
        }
      />
      {isSearching && visibleWorkspaces.length === 0 ? (
        <p className="text-sm text-text/60">{t('hub.noResults')}</p>
      ) : (
        <WorkspaceGrid
          workspaces={visibleWorkspaces}
          onCreate={createModal.open}
          onOpen={handleOpenWorkspace}
          onPlay={handlePlay}
          onAddTab={openAddTab}
          onTogglePin={togglePin}
        />
      )}
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