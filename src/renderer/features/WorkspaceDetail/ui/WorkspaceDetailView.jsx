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
import { WorkspaceFormModal } from '../../../entities/workspace/index.js';
import { useTabModal, useTabForm, useDeleteTab, useDeleteWorkspace, useWorkspaceEdit, useSessionConfig } from '../hook/index.js';
import { TabFormModal } from './TabFormModal.jsx';
import { TabList } from './TabList.jsx';
import { WorkspaceConfig } from './WorkspaceConfig.jsx';

const BACK_TO_HUB_LABEL = 'Volver al Hub';

/**
 * Vista del Detalle de Sesión (Lienzo / Command Center): header con nombre,
 * descripción y acciones (Launch disponible en v0.3, editar/borrar sesión) y
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
  const { isOpen, editingTab, openAdd, openEdit, close, isSaving, onSubmitTab } = useTabModal(workspace?.id);
  const tabForm = useTabForm({ initialTab: isOpen ? editingTab : null, onSubmit: onSubmitTab });
  const { reset: resetTabForm } = tabForm;
  const { target, requestDelete, cancelDelete, confirmDelete, isDeleting } = useDeleteTab(workspace?.id);
  const {
    isConfirmOpen: isDeleteConfirmOpen,
    isDeleting: isDeletingWorkspace,
    requestDelete: requestDeleteWorkspace,
    cancelDelete: cancelDeleteWorkspace,
    confirmDelete: confirmDeleteWorkspace,
  } = useDeleteWorkspace(workspace?.id);
  const workspaceEdit = useWorkspaceEdit(workspace);
  const browserConfig = useSessionConfig(workspace?.id, workspace);

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
          <IconButton variant="ghost" icon="arrow_back" label={BACK_TO_HUB_LABEL} onClick={() => navigate('/')} />
          <h1 className="text-xl font-semibold text-text">Sesión no encontrada</h1>
        </header>
        <p className="text-sm text-text/60">La sesión que buscás no existe o fue eliminada.</p>
        <Button className="w-fit" icon="home" onClick={() => navigate('/')}>
          {BACK_TO_HUB_LABEL}
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
            <Button variant="primary" icon="play_arrow" disabled title="Disponible en v0.3">
              Launch
            </Button>
            <IconButton variant="warning" icon="edit" label="Editar sesión" onClick={workspaceEdit.open} />
            <IconButton variant="danger" icon="delete" label="Eliminar sesión" onClick={requestDeleteWorkspace} />
            <div className="w-px h-6 bg-border mx-1" />
            <Button variant="outline" icon="arrow_back" onClick={() => navigate('/')}>
              Volver
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-[minmax(0,1fr)_40rem] items-start gap-6">
        <section>
          <Card
            header={
              <ResourceCardHeader title="Administrador de recursos" icon="tab">
                <Button variant="outline" icon="add" className="bg-surface" onClick={openAdd}>
                  Agregar
                </Button>
              </ResourceCardHeader>
            }
            headerClassName="bg-accent/10"
            bodyClassName="p-0"
          >
            <TabList tabs={workspace.tabs ?? []} onAddTab={openAdd} onEdit={openEdit} onDelete={requestDelete} />
          </Card>
        </section>
        <section>
          <Card
            header={<ResourceCardHeader title="Configuración" icon="settings" />}
            headerClassName="bg-accent/10"
          >
            <WorkspaceConfig
              browsers={browserConfig.browsers}
              isLoadingBrowsers={browserConfig.isLoadingBrowsers}
              openBehavior={browserConfig.openBehavior}
              browserOverride={browserConfig.browser}
              resolvedBrowserLabel={browserConfig.resolvedBrowserLabel}
              onOpenBehaviorChange={browserConfig.setOpenBehavior}
              onBrowserChange={browserConfig.setBrowser}
              isSaving={browserConfig.isSaving}
              error={browserConfig.error}
            />
          </Card>
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
        isOpen={target !== null}
        title="Eliminar pestaña"
        description={`¿Eliminar "${target?.name ?? ''}" de esta sesión?`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Eliminar sesión"
        description={`¿Eliminar "${workspace.name}" y todas sus pestañas? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar sesión"
        cancelLabel="Cancelar"
        variant="danger"
        isLoading={isDeletingWorkspace}
        onConfirm={handleDeleteWorkspace}
        onCancel={cancelDeleteWorkspace}
      />
    </Page>
  );
}