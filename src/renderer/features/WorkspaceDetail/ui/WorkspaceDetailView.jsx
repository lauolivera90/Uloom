import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  ConfirmDialog,
  Icon,
  IconButton,
  ResourceCardHeader,
} from '../../../widgets/index.js';
import { useAddTab, useAddTabForm, useDeleteTab, useSessionConfig } from '../hook/index.js';
import { AddTabModal } from './AddTabModal.jsx';
import { TabList } from './TabList.jsx';
import { WorkspaceConfig } from './WorkspaceConfig.jsx';

/**
 * Vista del Detalle de Sesión (Lienzo / Command Center), fase v0.2.2: header con
 * nombre, descripción y acciones (Launch deshabilitado, editar/borrar inertes) y
 * dos cards en fila — Administrador de recursos (lista de pestañas con alta y
 * baja) y Configuración (openBehavior/browser por sesión). Si la sesión no
 * existe, muestra un estado de no encontrada.
 * @param {{
 *   workspace: import('../../../shared/types.js').Workspace | null,
 *   isNotFound: boolean,
 * }} props
 */
export function WorkspaceDetailView({ workspace, isNotFound }) {
  const navigate = useNavigate();
  const { isAddOpen, openAdd, closeAdd, isSaving, onAddTab } = useAddTab(workspace?.id);
  const form = useAddTabForm({ onSubmit: onAddTab });
  const { reset } = form;
  const { target, requestDelete, cancelDelete, confirmDelete, isDeleting } = useDeleteTab(
    workspace?.id,
  );
  const browserConfig = useSessionConfig(workspace?.id, workspace);

  const handleCancel = () => {
    reset();
    closeAdd();
  };

  if (isNotFound) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <header className="flex items-center gap-2">
          <IconButton variant="ghost" icon="arrow_back" label="Volver al Hub" onClick={() => navigate('/')} />
          <h1 className="text-xl font-semibold text-text">Sesión no encontrada</h1>
        </header>
        <p className="text-sm text-text/60">La sesión que buscás no existe o fue eliminada.</p>
        <Button className="w-fit" icon="home" onClick={() => navigate('/')}>
          Volver al Hub
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Icon icon={workspace.icon || 'work'} className="text-accent" />
          <div className="flex flex-col gap-1 min-w-0">
            <h1 className="text-2xl font-semibold text-text truncate">{workspace.name}</h1>
            {workspace.description && <p className="text-sm text-text/60 truncate">{workspace.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="primary" icon="play_arrow" disabled title="Disponible en v0.3">
            Launch
          </Button>
          <IconButton variant="outline" icon="edit" label="Editar sesión" disabled />
          <IconButton variant="danger" icon="delete" label="Eliminar sesión" disabled />
          <div className="w-px h-6 bg-border mx-1" />
          <Button variant="outline" icon="arrow_back" onClick={() => navigate('/')}>
            Volver
          </Button>
        </div>
      </header>

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
            <TabList tabs={workspace.tabs ?? []} onAddTab={openAdd} onDelete={requestDelete} />
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
      <AddTabModal isOpen={isAddOpen} isSaving={isSaving} form={form} onCancel={handleCancel} />
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
    </div>
  );
}