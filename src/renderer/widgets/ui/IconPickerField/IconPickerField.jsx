import { Button } from '../Button/Button.jsx';
import { Icon } from '../Icon/Icon.jsx';
import { IconButton } from '../IconButton/IconButton.jsx';
import { IconPicker } from '../IconPicker/IconPicker.jsx';
import { isDataUrl, useI18n } from '../../../shared/index.js';

/**
 * Selector de icono colapsado para los formularios de sesión y pestaña (patrón
 * unificado): tile de preview con el icono efectivo (símbolo del catálogo o data
 * URL/favicon), botón "Subir icono" (placeholder disabled hasta la carga de
 * archivos), separador «o» y botón "Elegir uno" que expande/contrae la grilla
 * `IconPicker`. Presentacional: todos los valores y callbacks llegan por props
 * desde el hook del form. El swap "Usar icono sugerido" es opcional — lo usa solo
 * el formulario de pestaña cuando hay favicon real disponible y el icono actual
 * no lo usa. No incluye label: lo aporta el FormField contenedor.
 * @param {{
 *   previewIcon: string,
 *   showPicker: boolean,
 *   toggleShowPicker: () => void,
 *   icons: string[],
 *   selectedIcon: string | null,
 *   showAllIcons: boolean,
 *   onSelect: (icon: string) => void,
 *   onToggleShowAll: () => void,
 *   showSuggestedIcon?: boolean,
 *   useSuggestedIcon?: () => void,
 * }} props
 */
export function IconPickerField({
  previewIcon,
  showPicker,
  toggleShowPicker,
  icons,
  selectedIcon,
  showAllIcons,
  onSelect,
  onToggleShowAll,
  showSuggestedIcon = false,
  useSuggestedIcon,
}) {
  const { t } = useI18n();

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl border border-border bg-border/10 flex items-center justify-center flex-shrink-0">
          {isDataUrl(previewIcon) ? (
            <img src={previewIcon} alt="" className="w-7 h-7 rounded-sm" />
          ) : (
            <Icon icon={previewIcon} className="text-accent" />
          )}
        </div>
        <div className="flex flex-row items-center gap-2">
          <Button variant="outline" icon="upload" disabled title={t('common.comingSoon')}>
            {t('iconPicker.upload')}
          </Button>
          <span className="text-sm text-text/60">{t('iconPicker.or')}</span>
          <Button
            variant="ghost"
            icon={showPicker ? 'expand_less' : 'expand_more'}
            onClick={toggleShowPicker}
          >
            {t('iconPicker.choose')}
          </Button>
          {showSuggestedIcon && useSuggestedIcon && (
            <>
              <span className="text-sm text-text/40" aria-hidden="true">
                |
              </span>
              <IconButton
                variant="ghost"
                icon="swap_horiz"
                label={t('iconPicker.useSuggested')}
                title={t('iconPicker.useSuggested')}
                onClick={useSuggestedIcon}
              />
            </>
          )}
        </div>
      </div>
      {showPicker && (
        <div className="mt-4">
          <IconPicker
            icons={icons}
            selectedIcon={selectedIcon}
            showAllIcons={showAllIcons}
            onSelect={onSelect}
            onToggleShowAll={onToggleShowAll}
          />
        </div>
      )}
    </>
  );
}