import { Button, Form, FormField, Modal, TextInput } from '../../../widgets/index.js';
import { IconPicker } from './IconPicker.jsx';

/**
 * Modal de creación de sesión. Todo el contenido está en columna: nombre, selector
 * de icono y descripción. Recibe el estado del formulario desde el hook.
 * @param {{
 *   isOpen: boolean,
 *   form: import('../hook/useCreateWorkspace.js').useCreateWorkspace,
 *   onCancel: () => void,
 * }} props
 */
export function CreateWorkspaceModal({ isOpen, form, onCancel }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Nueva sesión"
      size="md"
      footer={
        <div>
          <Button variant="secondary" className="flex-1" onClick={onCancel} icon="arrow_back">
            Cancelar
          </Button>
          <Button className="flex-1" onClick={form.submit} disabled={!form.isNameValid} icon="add">
            Crear sesión
          </Button>
        </div>
      }
    >
      <Form onSubmit={form.submit}>
        <FormField label="Nombre" required htmlFor="workspace-name">
          <TextInput
            id="workspace-name"
            type="text"
            value={form.name}
            onChange={(event) => form.setName(event.target.value)}
            placeholder="Nombre de la sesión"
          />
        </FormField>

        <FormField label="Icono">
          <IconPicker
            icons={form.visibleIcons}
            selectedIcon={form.selectedIcon}
            showAllIcons={form.showAllIcons}
            onSelect={form.selectIcon}
            onToggleShowAll={form.toggleShowAllIcons}
          />
        </FormField>

        <FormField label="Descripción" htmlFor="workspace-description">
          <TextInput
            id="workspace-description"
            type="text"
            value={form.description}
            onChange={(event) => form.setDescription(event.target.value)}
            placeholder="Descripción de la sesión"
          />
        </FormField>
      </Form>
    </Modal>
  );
}
