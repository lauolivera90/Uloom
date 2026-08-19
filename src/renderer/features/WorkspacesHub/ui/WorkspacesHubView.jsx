import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, PageHeader, Select, TextInput } from '../../../widgets/index.js';
import { useI18n } from '../../../shared/index.js';
import { WorkspaceFormModal, TabFormModal } from '../../../entities/workspace/index.js';
import { useWorkspacesHub, HUB_SORT_OPTIONS } from '../hook/index.js';
import { WorkspaceGrid } from './WorkspaceGrid.jsx';

/**
 * Vista contenedora del feature Hub de Sesiones: orquesta la navegación hacia el
 * detalle, el modal de creación y el modal de agregar pestaña que abre el botón
 * (+) de las cards sin pestañas. El estado del modal de pestaña (form + historial
 * + selección múltiple) y el lanzamiento viven en `useWorkspacesHub` vía los
 * hooks compuestos `useTabFormModal`/`useLaunchWorkspace`; esta vista solo
 * presenta. Desde v0.6.1 el header incluye la búsqueda de sesiones y las cards
 * reciben el toggle de fijado; desde v0.6.2 suma el SortBy (Select antes de la
 * búsqueda: se lee "Ordenar por: [dropdown] [buscar]", con la búsqueda anclada
 * al borde derecho).
 */
export function WorkspacesHubView() {
  const navigate = useNavigate();
  const {
    visibleWorkspaces,
    isSearching,
    searchQuery,
    setSearchQuery,
    sort,
    setSort,
    launch,
    togglePin,
    createModal,
    tabModal,
    openAddTab,
  } = useWorkspacesHub();
  const { t } = useI18n();

  const sortOptions = HUB_SORT_OPTIONS.map((option) => ({
    value: option.value,
    label: t(option.labelKey),
  }));

  const handleOpenWorkspace = useCallback(
    (workspaceId) => {
      navigate(`/workspaces/${workspaceId}`);
    },
    [navigate],
  );

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
          <>
            <Select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              options={sortOptions}
              aria-label={t('hub.sortBy')}
              className="w-40"
            />
            <TextInput
              type="search"
              icon="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t('hub.searchPlaceholder')}
              aria-label={t('hub.searchPlaceholder')}
              className="w-64"
            />
          </>
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