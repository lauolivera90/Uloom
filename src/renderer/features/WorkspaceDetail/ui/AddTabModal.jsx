import {
  Button,
  Form,
  FormField,
  Icon,
  IconPicker,
  Modal,
  ModalFooter,
  TextInput,
} from '../../../widgets/index.js';

/** @typedef {import('../hook/useAddTabForm.js').AddTabFormState} AddTabFormState */

/**
 * Modal de agregar pestaña. Sigue la convención de modales de formulario
 * (ver design.md §3): Modal md, Form con gap default, FormField, footer con par
 * outline+primary flex-1. El icono se elige del catálogo (default mapamundi);
 * "Subir icono" queda deshabilitado hasta definir la carga de archivos.
 * @param {{
 *   isOpen: boolean,
 *   isSaving?: boolean,
 *   form: AddTabFormState,
 *   onCancel: () => void,
 * }} props
 */
export function AddTabModal({ isOpen, isSaving = false, form, onCancel }) {
  const { submit, isUrlValid } = form;
  const handleSubmit = () => {
    submit().catch((error) => console.error(error));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Agregar pestaña"
      size="md"
      footer={
        <ModalFooter
          cancelLabel="Cancelar"
          confirmLabel="Agregar pestaña"
          onCancel={onCancel}
          onConfirm={handleSubmit}
          confirmIcon="add"
          cancelDisabled={isSaving}
          confirmDisabled={!isUrlValid || isSaving}
        />
      }
    >
      <Form onSubmit={handleSubmit}>
        <FormField label="Icono">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl border border-border bg-background flex items-center justify-center flex-shrink-0">
              <Icon icon={form.selectedIcon} className="text-accent" />
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
          <TextInput
            id="tab-name"
            type="text"
            value={form.name}
            onChange={(event) => form.setName(event.target.value)}
            placeholder="Nombre de la página"
          />
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