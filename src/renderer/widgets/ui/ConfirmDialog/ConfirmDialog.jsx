import { Button } from '../Button/Button.jsx';
import { Modal } from '../Modal/Modal.jsx';

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'primary',
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <div>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
            disabled={isLoading}
            icon="arrow_back"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            className="flex-1"
            onClick={onConfirm}
            disabled={isLoading}
            icon={variant === 'danger' ? 'delete' : undefined}
          >
            {isLoading && (
              <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {confirmLabel}
          </Button>
        </div>
      }
    >
      {description && (
        <div className="flex items-start gap-4">
          {(variant === 'danger' || variant === 'warning') && (
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                variant === 'danger' ? 'bg-error/15' : 'bg-tertiary/20'
              }`}
            >
              <span
                aria-hidden="true"
                className={`material-symbols-outlined ${
                  variant === 'danger' ? 'text-error' : 'text-tertiary'
                }`}
              >
                {variant === 'danger' ? 'delete' : 'warning'}
              </span>
            </div>
          )}
          <p className="text-sm text-text/60 flex-1">{description}</p>
        </div>
      )}
    </Modal>
  );
}
