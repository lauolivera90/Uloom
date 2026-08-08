import { Button } from '../Button/Button.jsx';

/**
 * Par de acciones del footer de un modal: botón de cancelar (outline) a la
 * izquierda y botón de confirmar a la derecha, repartiendo el ancho con
 * `flex-1`. El confirmar muestra un spinner mientras `isLoading`. Consultar
 * la convención de modales en `.doc/design.md` §3.
 * @param {{
 *   cancelLabel?: string,
 *   confirmLabel?: string,
 *   onCancel: () => void,
 *   onConfirm: () => void,
 *   confirmVariant?: 'primary' | 'warning' | 'danger',
 *   confirmIcon?: string,
 *   cancelDisabled?: boolean,
 *   confirmDisabled?: boolean,
 *   isLoading?: boolean,
 * }} props
 */
export function ModalFooter({
  cancelLabel = 'Cancelar',
  confirmLabel = 'Confirmar',
  onCancel,
  onConfirm,
  confirmVariant = 'primary',
  confirmIcon,
  cancelDisabled = false,
  confirmDisabled = false,
  isLoading = false,
}) {
  return (
    <div>
      <Button
        variant="outline"
        className="flex-1"
        onClick={onCancel}
        disabled={isLoading || cancelDisabled}
        icon="arrow_back"
      >
        {cancelLabel}
      </Button>
      <Button
        variant={confirmVariant}
        className="flex-1"
        onClick={onConfirm}
        disabled={isLoading || confirmDisabled}
        icon={confirmIcon}
      >
        {isLoading && (
          <span
            aria-hidden="true"
            className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
          />
        )}
        {confirmLabel}
      </Button>
    </div>
  );
}