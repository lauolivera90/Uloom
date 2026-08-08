import {
  Form,
  FormField,
  IconPicker,
  Modal,
  ModalFooter,
  TextInput,
} from '../../../widgets/index.js';

/** @typedef {import('../hook/useCreateWorkspace.js').CreateWorkspaceFormState} CreateWorkspaceFormState */

/**
 * Modal de creación de sesión. Todo el contenido está en columna: nombre, selector
 * de icono y descripción. Recibe el estado del formulario desde el hook.
 * @param {{
 *   isOpen: boolean,
 *   isSaving?: boolean,
 *   form: CreateWorkspaceFormState,
 *   onCancel: () => void,
 * }} props
 */
export function CreateWorkspaceModal({ isOpen, isSaving = false, form, onCancel }) {
  const { submit, isNameValid } = form;
  const handleSubmit = () => {
    submit().catch((error) => console.error(error));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Nueva sesión"
      size="md"
      footer={
        <ModalFooter
          cancelLabel="Cancelar"
          confirmLabel="Crear sesión"
          onCancel={onCancel}
          onConfirm={handleSubmit}
          confirmIcon="add"
          cancelDisabled={isSaving}
          confirmDisabled={!isNameValid || isSaving}
        />
      }
    >
      <Form onSubmit={handleSubmit}>
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
