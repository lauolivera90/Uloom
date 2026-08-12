import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  ConfirmDialog,
  IconButton,
  Page,
  PageHeader,
  ResourceCardHeader,
} from '../../../widgets/index.js';
import { useI18n } from '../../../shared/index.js';
import { WorkspaceFormModal, useLaunchWorkspace, useTabForm, useTabModal, TabFormModal, ADD_TAB_LABEL, DELETE_TAB_LABEL, useExportWorkspace, IRREVERSIBLE_ACTION_HINT } from '../../../entities/workspace/index.js';
import { useDeleteTab, useDeleteWorkspace, useWorkspaceEdit, useSessionConfig } from '../hook/index.js';
import { TabList } from './TabList.jsx';
import { WorkspaceConfig } from './WorkspaceConfig.jsx';
import { WorkspaceExportCard } from './WorkspaceExportCard.jsx';
import { useWorkspaces } from '../../../app/index.js';

const BACK_TO_HUB_LABEL = 'detail.backToHub';

/**
 * Vista del Detalle de Sesión (Lienzo / Command Center): header con nombre,
 * descripción y acciones (Lanzar —o Agregar pestaña si la sesión está vacía— y
 * editar/borrar sesión) y
 * dos cards en fila — Administrador de recursos (lista de pestañas con alta/
 * edición/baja) y Configuración (openBehavior/browser por sesión). Las mutaciones
 * de pestañas y de la sesión pasan por el líder único de escritura del estado
 * global (useWorkspaceState.mutateWorkspace). Si la sesión no existe, muestra un
 * estado de no encontrada.
 * @param {{
 *   workspace: import('../../../shared/types.js').Workspace | null,
 *   isNotFound: boolean,
 * }} props
 */
export function WorkspaceDetailView({ workspace, isNotFound }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { addTab, updateTab } = useWorkspaces();
  const { isOpen, editingTab, openAdd, openEdit, close, isSaving, onSubmitTab } = useTabModal({
    workspaceId: workspace?.id,
    addTab,
    updateTab,
  });
  const tabForm = useTabForm({ initialTab: isOpen ? editingTab : null, onSubmit: onSubmitTab });
  const { reset: resetTabForm } = tabForm;
  const { target: deleteTabTarget, isOpen: isDeleteTabOpen, requestDelete, cancelDelete, confirmDelete, isDeleting } = useDeleteTab(workspace?.id);
  const {
    isConfirmOpen: isDeleteConfirmOpen,
    isDeleting: isDeletingWorkspace,
    requestDelete: requestDeleteWorkspace,
    cancelDelete: cancelDeleteWorkspace,
    confirmDelete: confirmDeleteWorkspace,
  } = useDeleteWorkspace(workspace?.id);
  const workspaceEdit = useWorkspaceEdit(workspace);
  const browserConfig = useSessionConfig(workspace?.id, workspace);
  const { isLaunching, launch } = useLaunchWorkspace(workspace?.id);
  const { isExporting, exportSession } = useExportWorkspace(workspace?.id);

  const handleCancelTab = () => {
    resetTabForm();
    close();
  };

  const handleDeleteWorkspace = async () => {
    const deleted = await confirmDeleteWorkspace();
    if (deleted) {
      navigate('/');
    }
  };

  if (isNotFound) {
    return (
      <Page className="gap-4">
        <header className="flex items-center gap-2">
          <IconButton variant="ghost" icon="arrow_back" label={t(BACK_TO_HUB_LABEL)} onClick={() => navigate('/')} />
          <h1 className="text-xl font-semibold text-text">{t('detail.notFound')}</h1>
        </header>
        <p className="text-sm text-text/60">{t('detail.notFoundDescription')}</p>
        <Button className="w-fit" icon="home" onClick={() => navigate('/')}>
          {t(BACK_TO_HUB_LABEL)}
        </Button>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        title={workspace.name}
        description={workspace.description}
        icon={workspace.icon || 'work'}
        actions={
          <>
            {(workspace.tabs?.length ?? 0) === 0 ? (
              <Button variant="primary" icon="add" onClick={openAdd}>
                {t(ADD_TAB_LABEL)}
              </Button>
            ) : (
              <Button
                variant="primary"
                icon="play_arrow"
                disabled={isLaunching}
                onClick={launch}
              >
                {t('detail.launch')}
              </Button>
            )}
            <IconButton variant="warning" icon="edit" label={t('detail.editSession')} onClick={workspaceEdit.open} />
            <IconButton variant="danger" icon="delete" label={t('detail.deleteSession')} onClick={requestDeleteWorkspace} />
            <div className="w-px h-6 bg-border/40 mx-1" />
            <Button variant="outline" icon="arrow_back" onClick={() => navigate('/')}>
              {t('detail.back')}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_32rem] xl:grid-cols-[minmax(0,1fr)_40rem] items-start gap-6">
        <section className="flex flex-col gap-6">
          <Card
            header={
              <ResourceCardHeader title={t('detail.resourcesManager')} icon="tab">
                <Button variant="outline" icon="add" className="bg-surface" onClick={openAdd}>
                  {t('detail.add')}
                </Button>
              </ResourceCardHeader>
            }
            headerClassName="bg-accent/10"
            bodyClassName="p-0"
          >
            <TabList tabs={workspace.tabs ?? []} onAddTab={openAdd} onEdit={openEdit} onDelete={requestDelete} />
          </Card>
        </section>
        <section className="flex flex-col gap-6">
          <Card
            header={<ResourceCardHeader title={t('common.settings')} icon="settings" />}
            headerClassName="bg-accent/10"
          >
            <WorkspaceConfig
              browsers={browserConfig.browsers}
              isLoadingBrowsers={browserConfig.isLoadingBrowsers}
              openBehavior={browserConfig.openBehavior}
              browserOverride={browserConfig.browser}
              resolvedBrowserLabel={browserConfig.resolvedBrowserLabel}
              resolvedBrowserId={browserConfig.resolvedBrowserId}
              onOpenBehaviorChange={browserConfig.setOpenBehavior}
              onBrowserChange={browserConfig.setBrowser}
              isSaving={browserConfig.isSaving}
              error={browserConfig.error}
            />
          </Card>
          <WorkspaceExportCard isExporting={isExporting} onExport={exportSession} />
        </section>
      </div>

      <TabFormModal
        isOpen={isOpen}
        isSaving={isSaving}
        isEditing={editingTab !== null}
        form={tabForm}
        onCancel={handleCancelTab}
      />
      <WorkspaceFormModal
        isOpen={workspaceEdit.isOpen}
        isSaving={workspaceEdit.isSaving}
        isEditing={workspaceEdit.isEditing}
        form={workspaceEdit.form}
        onCancel={workspaceEdit.close}
      />
      <ConfirmDialog
        isOpen={isDeleteTabOpen}
        title={t(DELETE_TAB_LABEL)}
        description={t('detail.deleteTabConfirm', { name: deleteTabTarget?.name ?? '' })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title={t('detail.deleteSession')}
        description={t('detail.deleteSessionConfirm', { name: workspace.name, hint: t(IRREVERSIBLE_ACTION_HINT) })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        isLoading={isDeletingWorkspace}
        onConfirm={handleDeleteWorkspace}
        onCancel={cancelDeleteWorkspace}
      />
    </Page>
  );
}