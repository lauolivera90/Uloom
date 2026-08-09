import {
  Form,
  FormField,
  IconPickerField,
  Modal,
  ModalFooter,
  TextInput,
  IconButton,
} from '../../../widgets/index.js';
import { ADD_TAB_LABEL, SAVE_CHANGES_LABEL } from '../api/index.js';

/** @typedef {import('../hook/useTabForm.js').TabFormState} TabFormState */

/**
 * Modal de alta/edición de pestaña. Sigue la convención de modales de formulario
 * (ver design.md §3): Modal md, Form con gap default, FormField, footer con par
 * outline+primary flex-1. El icono se elige del catálogo (default mapamundi) o se
 * aplica el favicon real del sitio a través del `IconPickerField`. Si hay favicon
 * disponible y se eligió un icono manual, aparece "Usar icono sugerido" (swap_horiz)
 * separado por una barra "|"; el botón del nombre sugerido reserva siempre su
 * espacio (invisible si no aplica). En edición los labels cambian a "Editar
 * pestaña"/"Guardar cambios" y el id se conserva.
 * @param {{
 *   isOpen: boolean,
 *   isSaving?: boolean,
 *   isEditing?: boolean,
 *   form: TabFormState,
 *   onCancel: () => void,
 * }} props
 */
export function TabFormModal({ isOpen, isSaving = false, isEditing = false, form, onCancel }) {
  const { submit, isUrlValid } = form;
  const handleSubmit = () => {
    submit().catch((error) => console.error(error));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={isEditing ? 'Editar pestaña' : ADD_TAB_LABEL}
      size="md"
      footer={
        <ModalFooter
          confirmLabel={isEditing ? SAVE_CHANGES_LABEL : ADD_TAB_LABEL}
          onCancel={onCancel}
          onConfirm={handleSubmit}
          confirmIcon={isEditing ? 'save' : 'add'}
          cancelDisabled={isSaving}
          confirmDisabled={!isUrlValid || isSaving}
        />
      }
    >
      <Form onSubmit={handleSubmit}>
        <FormField label="Icono">
          <IconPickerField
            previewIcon={form.previewIcon}
            showPicker={form.showPicker}
            toggleShowPicker={form.toggleShowPicker}
            icons={form.visibleIcons}
            selectedIcon={form.selectedIcon}
            showAllIcons={form.showAllIcons}
            onSelect={form.selectIcon}
            onToggleShowAll={form.toggleShowAllIcons}
            showSuggestedIcon={form.showSuggestedIcon}
            useSuggestedIcon={form.useSuggestedIcon}
          />
        </FormField>

        <FormField label="Nombre" htmlFor="tab-name">
          <div className="flex items-center gap-2">
            <TextInput
              id="tab-name"
              type="text"
              value={form.name}
              onChange={(event) => form.setName(event.target.value)}
              placeholder={
                form.suggestedName || 'Nombre de la página'
              }
              className="flex-1"
            />
            <IconButton
              variant="ghost"
              icon="swap_horiz"
              label="Usar nombre sugerido"
              title="Usar nombre sugerido"
              onClick={form.useSuggestedName}
              className={`flex-shrink-0 ${form.showSuggestionSwap ? '' : 'invisible'}`}
            />
          </div>
        </FormField>

        <FormField label="URL" required htmlFor="tab-url">
          <TextInput
            id="tab-url"
            type="text"
            value={form.url}
            onChange={(event) => form.setUrl(event.target.value)}
            placeholder="https://ejemplo.com"
          />
        </FormField>
      </Form>
    </Modal>
  );
}