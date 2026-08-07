import { useNavigate } from 'react-router-dom';
import { Button, Card, ConfirmDialog, Icon, IconButton } from '../../../widgets/index.js';
import { useAddTab, useAddTabForm, useDeleteTab } from '../hook/index.js';
import { AddTabModal } from './AddTabModal.jsx';
import { TabList } from './TabList.jsx';

function ResourceCardHeader({ title, icon, children }) {
  return (
    <div className="flex items-center gap-2">
      <Icon icon={icon} className="text-accent" />
      <h3 className="text-lg font-semibold text-accent">{title}</h3>
      {children && <div className="ml-auto flex-shrink-0">{children}</div>}
    </div>
  );
}

/**
 * Vista del Detalle de Sesión (Lienzo / Command Center), fase v0.2.1: header con
 * nombre, descripción y acciones (Launch deshabilitado, editar/borrar inertes) y
 * dos cards en fila — Administrador de recursos (lista de pestañas con alta en
 * memoria) y Configuración (placeholder). Si la sesión no existe, muestra un
 * estado de no encontrada.
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

  const handleCancel = () => {
    reset();
    closeAdd();
  };

  const handleDelete = (tab) => {
    requestDelete(tab);
  };

  const handleConfirmDelete = async () => {
    try {
      await confirmDelete();
    } catch (error) {
      console.error(error);
    }
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

      <div className="flex flex-row items-start gap-6">
        <section className="flex-1 min-w-0">
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
            <TabList tabs={workspace.tabs ?? []} onAddTab={openAdd} onDelete={handleDelete} />
          </Card>
        </section>
        <section className="w-80 flex-shrink-0">
          <Card
            header={<ResourceCardHeader title="Configuración" icon="settings" />}
            headerClassName="bg-accent/10"
          >
            <p className="text-sm text-text/60">
              Opciones de ejecución de la sesión (próximamente).
            </p>
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
        onConfirm={handleConfirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}