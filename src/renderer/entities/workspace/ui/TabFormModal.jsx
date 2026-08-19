import {
  Button,
  Form,
  FormField,
  IconPickerField,
  Modal,
  ModalFooter,
  TextInput,
  IconButton,
} from '../../../widgets/index.js';
import { useI18n } from '../../../shared/index.js';
import { ADD_TAB_LABEL, SAVE_CHANGES_LABEL } from '../api/index.js';
import { TabFavicon } from './TabFavicon.jsx';

/** @typedef {import('../hook/useTabForm.js').TabFormState} TabFormState */
/** @typedef {import('../../../shared/types.js').TabHistoryEntry} TabHistoryEntry */

/**
 * Modal de alta/edición de pestaña. Sigue la convención de modales de formulario
 * (ver design.md §3): Modal md, Form con gap default, FormField, footer con par
 * outline+primary flex-1. El icono se elige del catálogo (default mapamundi) o se
 * aplica el favicon real del sitio a través del `IconPickerField`. Si hay favicon
 * disponible y se eligió un icono manual, aparece "Usar icono sugerido" (swap_horiz)
 * separado por una barra "|"; el botón del nombre sugerido reserva siempre su
 * espacio (invisible si no aplica). En edición los labels cambian a "Editar
 * pestaña"/"Guardar cambios", el id se conserva y no hay modo historial.
 *
 * En alta el modal ofrece dos modos (`mode`, segment control de `Button` con la
 * variante activa en primary, patrón de Configuración): `manual` es el form único
 * de siempre y `history` es la selección múltiple desde el historial de pestañas
 * usadas — filas con checkbox nativo (`accent-primary`) sobre `visibleEntries`
 * (ya filtradas por `useTabHistory` para excluir las URLs presentes en la sesión),
 * y el footer confirma el lote con "Agregar seleccionadas" (`selectedCount` lo
 * habilita). El segment de Historial se deshabilita (`historyDisabled`) cuando no
 * hay nada para mostrar, decidido antes de abrir el modal. Ambos modos conservan
 * su estado mientras el modal está abierto; al cerrar se resetea (form y selección
 * en useTabFormModal).
 * @param {{
 *   isOpen: boolean,
 *   isSaving?: boolean,
 *   isEditing?: boolean,
 *   mode?: 'manual' | 'history',
 *   form: TabFormState,
 *   onCancel: () => void,
 *   onModeChange?: (mode: 'manual' | 'history') => void,
 *   visibleEntries?: TabHistoryEntry[],
 *   historyDisabled?: boolean,
 *   selectedCount?: number,
 *   selectedUrls?: Set<string>,
 *   onToggleHistoryEntry?: (url: string) => void,
 *   onConfirmBatch?: () => void,
 * }} props
 */
export function TabFormModal({
  isOpen,
  isSaving = false,
  isEditing = false,
  mode = 'manual',
  form,
  onCancel,
  onModeChange = () => {},
  visibleEntries = [],
  historyDisabled = false,
  selectedCount = 0,
  selectedUrls = new Set(),
  onToggleHistoryEntry = () => {},
  onConfirmBatch = () => {},
}) {
  const { submit, isUrlValid } = form;
  const { t } = useI18n();
  const handleSubmit = () => {
    submit().catch((error) => console.error(error));
  };

  const isHistoryMode = mode === 'history' && !isEditing;

  const footer = isHistoryMode ? (
    <ModalFooter
      confirmLabel={t('tabForm.confirmMultiple')}
      onCancel={onCancel}
      onConfirm={onConfirmBatch}
      confirmIcon="add"
      cancelDisabled={isSaving}
      confirmDisabled={selectedCount === 0 || isSaving}
    />
  ) : (
    <ModalFooter
      confirmLabel={t(isEditing ? SAVE_CHANGES_LABEL : ADD_TAB_LABEL)}
      onCancel={onCancel}
      onConfirm={handleSubmit}
      confirmIcon={isEditing ? 'save' : 'add'}
      cancelDisabled={isSaving}
      confirmDisabled={!isUrlValid || isSaving}
    />
  );

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={t(isEditing ? 'tabForm.editTitle' : ADD_TAB_LABEL)} size="md" footer={footer}>
      {!isEditing && (
        <div className="flex gap-2 mb-4">
          <Button
            variant={mode === 'manual' ? 'primary' : 'ghost'}
            className="flex-1"
            onClick={() => onModeChange('manual')}
          >
            {t('tabForm.modeManual')}
          </Button>
          <Button
            variant={isHistoryMode ? 'primary' : 'ghost'}
            className="flex-1"
            disabled={historyDisabled}
            onClick={() => onModeChange('history')}
          >
            {t('tabForm.modeHistory')}
          </Button>
        </div>
      )}

      {isHistoryMode ? (
        <div className="flex flex-col gap-2">
          {visibleEntries.length === 0 ? (
            <p className="text-sm text-text/60">{t('tabForm.historyEmpty')}</p>
          ) : (
            <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
              {visibleEntries.map((entry) => {
                const selected = selectedUrls.has(entry.url);
                return (
                  <label
                    key={entry.url}
                    className={`flex items-center gap-2.5 rounded px-2 py-1.5 cursor-pointer transition duration-fast ${
                      selected ? 'bg-primary/10' : 'hover:bg-primary/10'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => onToggleHistoryEntry(entry.url)}
                      className="accent-primary flex-shrink-0"
                    />
                    <TabFavicon url={entry.url} icon={entry.icon} favicon={entry.favicon} />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-text truncate">{entry.name}</span>
                      <span className="block text-xs text-text/60 truncate">{entry.url}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <Form onSubmit={handleSubmit}>
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
              showSuggestedIcon={form.showSuggestedIcon}
              useSuggestedIcon={form.useSuggestedIcon}
            />
          </FormField>

          <FormField label={t('common.name')} htmlFor="tab-name">
            <div className="flex items-center gap-2">
              <TextInput
                id="tab-name"
                type="text"
                value={form.name}
                onChange={(event) => form.setName(event.target.value)}
                placeholder={form.suggestedName || t('tabForm.namePlaceholder')}
                className="flex-1"
              />
              <IconButton
                variant="ghost"
                icon="swap_horiz"
                label={t('tabForm.useSuggestedName')}
                title={t('tabForm.useSuggestedName')}
                onClick={form.useSuggestedName}
                className={`flex-shrink-0 ${form.showSuggestionSwap ? '' : 'invisible'}`}
              />
            </div>
          </FormField>

          <FormField label={t('common.url')} required htmlFor="tab-url">
            <TextInput
              id="tab-url"
              type="text"
              value={form.url}
              onChange={(event) => form.setUrl(event.target.value)}
              placeholder={t('tabForm.urlPlaceholder')}
            />
          </FormField>
        </Form>
      )}
    </Modal>
  );
}