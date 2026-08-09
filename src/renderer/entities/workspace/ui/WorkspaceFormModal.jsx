import {
  Form,
  FormField,
  IconPicker,
  Modal,
  ModalFooter,
  TextInput,
} from '../../../widgets/index.js';

/** @typedef {import('../hook/useWorkspaceForm.js').WorkspaceFormState} WorkspaceFormState */

/**
 * Modal de sesión compartido entre el Hub (alta) y el Detalle (edición). Todo el
 * contenido está en columna: nombre, selector de icono y descripción. Los labels
 * del título y del botón confirmar dependen de `isEditing`.
 * @param {{
 *   isOpen: boolean,
 *   isSaving?: boolean,
 *   isEditing?: boolean,
 *   form: WorkspaceFormState,
 *   onCancel: () => void,
 * }} props
 */
export function WorkspaceFormModal({ isOpen, isSaving = false, isEditing = false, form, onCancel }) {
  const { submit, isNameValid } = form;
  const handleSubmit = () => {
    submit().catch((error) => console.error(error));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={isEditing ? 'Editar sesión' : 'Nueva sesión'}
      size="md"
      footer={
        <ModalFooter
          cancelLabel="Cancelar"
          confirmLabel={isEditing ? 'Guardar cambios' : 'Crear sesión'}
          onCancel={onCancel}
          onConfirm={handleSubmit}
          confirmIcon={isEditing ? 'save' : 'add'}
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