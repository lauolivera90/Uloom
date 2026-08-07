import { Button, Form, FormField, IconPicker, Modal, TextInput } from '../../../widgets/index.js';

/**
 * Modal de creación de sesión. Todo el contenido está en columna: nombre, selector
 * de icono y descripción. Recibe el estado del formulario desde el hook.
 * @param {{
 *   isOpen: boolean,
 *   isSaving?: boolean,
 *   form: {
 *     name: string,
 *     description: string,
 *     selectedIcon: string,
 *     visibleIcons: string[],
 *     showAllIcons: boolean,
 *     isNameValid: boolean,
 *     submit: () => Promise<void>,
 *     setName: (value: string) => void,
 *     setDescription: (value: string) => void,
 *     selectIcon: (icon: string) => void,
 *     toggleShowAllIcons: () => void,
 *   },
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
        <div>
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={isSaving} icon="arrow_back">
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={!isNameValid || isSaving} icon="add">
            Crear sesión
          </Button>
        </div>
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
