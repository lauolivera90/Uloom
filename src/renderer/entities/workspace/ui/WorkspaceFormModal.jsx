import {
  Form,
  FormField,
  IconPickerField,
  Modal,
  ModalFooter,
  TextInput,
} from '../../../widgets/index.js';
import { useI18n } from '../../../shared/index.js';
import { SAVE_CHANGES_LABEL } from '../api/index.js';

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
  const { t } = useI18n();
  const handleSubmit = () => {
    submit().catch((error) => console.error(error));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={t(isEditing ? 'workspaceForm.editTitle' : 'workspaceForm.createTitle')}
      size="md"
      footer={
        <ModalFooter
          confirmLabel={t(isEditing ? SAVE_CHANGES_LABEL : 'workspaceForm.confirmCreate')}
          onCancel={onCancel}
          onConfirm={handleSubmit}
          confirmIcon={isEditing ? 'save' : 'add'}
          cancelDisabled={isSaving}
          confirmDisabled={!isNameValid || isSaving}
        />
      }
    >
      <Form onSubmit={handleSubmit}>
        <FormField label={t('common.name')} required htmlFor="workspace-name">
          <TextInput
            id="workspace-name"
            type="text"
            value={form.name}
            onChange={(event) => form.setName(event.target.value)}
            placeholder={t('workspaceForm.namePlaceholder')}
          />
        </FormField>

        <FormField label={t('common.icon')}>
          <IconPickerField
            previewIcon={form.previewIcon}
            showPicker={form.showPicker}
            toggleShowPicker={form.toggleShowPicker}
            icons={form.visibleIcons}
            selectedIcon={form.selectedIcon}
            showAllIcons={form.showAllIcons}
            onSelect={form.selectIcon}
            onToggleShowAll={form.toggleShowAllIcons}
          />
        </FormField>

        <FormField label={t('common.description')} htmlFor="workspace-description">
          <TextInput
            id="workspace-description"
            type="text"
            value={form.description}
            onChange={(event) => form.setDescription(event.target.value)}
            placeholder={t('workspaceForm.descriptionPlaceholder')}
          />
        </FormField>
      </Form>
    </Modal>
  );
}