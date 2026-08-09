import {
  Button,
  Form,
  FormField,
  Icon,
  IconButton,
  IconPicker,
  Modal,
  ModalFooter,
  TextInput,
} from '../../../widgets/index.js';
import { isDataUrl } from '../../../shared/index.js';

/** @typedef {import('../hook/useTabForm.js').TabFormState} TabFormState */

/**
 * Modal de alta/edición de pestaña. Sigue la convención de modales de formulario
 * (ver design.md §3): Modal md, Form con gap default, FormField, footer con par
 * outline+primary flex-1. El icono se elige del catálogo (default mapamundi) o se
 * aplica el favicon real del sitio. "Subir icono" queda deshabilitado hasta
 * definir la carga de archivos. Si hay favicon disponible y se eligió un icono
 * manual, aparece "Usar icono sugerido" (swap_horiz) separado por una barra "|";
 * el botón del nombre sugerido reserva siempre su espacio (invisible si no aplica).
 * En edición los labels cambian a "Editar pestaña"/"Guardar cambios" y el id se conserva.
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
      title={isEditing ? 'Editar pestaña' : 'Agregar pestaña'}
      size="md"
      footer={
        <ModalFooter
          cancelLabel="Cancelar"
          confirmLabel={isEditing ? 'Guardar cambios' : 'Agregar pestaña'}
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
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl border border-border bg-background flex items-center justify-center flex-shrink-0">
              {isDataUrl(form.previewIcon) ? (
                <img src={form.previewIcon} alt="" className="w-7 h-7 rounded-sm" />
              ) : (
                <Icon icon={form.previewIcon} className="text-accent" />
              )}
            </div>
            <div className="flex flex-row items-center gap-2">
              <Button variant="outline" icon="upload" disabled title="Próximamente">
                Subir icono
              </Button>
              <span className="text-sm text-text/60">o</span>
              <Button
                variant="ghost"
                icon={form.showPicker ? 'expand_less' : 'expand_more'}
                onClick={form.toggleShowPicker}
              >
                Elegir uno
              </Button>
              {form.showSuggestedIcon && (
                <>
                  <span className="text-sm text-text/40" aria-hidden="true">
                    |
                  </span>
                  <IconButton
                    variant="ghost"
                    icon="swap_horiz"
                    label="Usar icono sugerido"
                    title="Usar icono sugerido"
                    onClick={form.useSuggestedIcon}
                  />
                </>
              )}
            </div>
          </div>
          {form.showPicker && (
            <div className="mt-4">
              <IconPicker
                icons={form.visibleIcons}
                selectedIcon={form.selectedIcon}
                showAllIcons={form.showAllIcons}
                onSelect={form.selectIcon}
                onToggleShowAll={form.toggleShowAllIcons}
              />
            </div>
          )}
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