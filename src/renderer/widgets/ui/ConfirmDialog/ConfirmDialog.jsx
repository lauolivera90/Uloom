import { Modal } from '../Modal/Modal.jsx';
import { Icon } from '../Icon/Icon.jsx';
import { ModalFooter } from '../ModalFooter/ModalFooter.jsx';

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
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
        <ModalFooter
          cancelLabel={cancelLabel}
          confirmLabel={confirmLabel}
          onCancel={onCancel}
          onConfirm={onConfirm}
          confirmVariant={variant}
          confirmIcon={variant === 'danger' ? 'delete' : undefined}
          cancelDisabled={isLoading}
          confirmDisabled={isLoading}
          isLoading={isLoading}
        />
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
              <Icon
                icon={variant === 'danger' ? 'delete' : 'warning'}
                className={variant === 'danger' ? 'text-error' : 'text-tertiary'}
              />
            </div>
          )}
          <p className="text-sm text-text/60 flex-1">{description}</p>
        </div>
      )}
    </Modal>
  );
}
