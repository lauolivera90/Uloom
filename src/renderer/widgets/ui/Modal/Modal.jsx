import { useScrollLock } from '../../hooks/useScrollLock.js';
import { IconButton } from '../IconButton/IconButton.jsx';

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  isOpen = false,
  onClose,
  header = null,
  title = '',
  children,
  footer = null,
  size = 'md',
  className = '',
  hideCloseButton = false,
}) {
  useScrollLock(isOpen);

  if (!isOpen) return null;

  const resolvedHeader = header ?? (title || null);
  const hasHeader = resolvedHeader !== null || !hideCloseButton;
  const showClose = !hideCloseButton;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-overlay/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative z-10 w-full mx-4 ${
          SIZE_CLASSES[size] || SIZE_CLASSES.md
        } border border-border bg-surface rounded-xl shadow-xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-base ${className}`}
      >
        {hasHeader && (
          <div className="p-5 border-b border-border/40 flex-shrink-0">
            <div className="flex items-center gap-2">
              {resolvedHeader ? (
                <div className="flex-1 min-w-0">
                  {typeof resolvedHeader === 'string' ? (
                    <h2 className="text-lg font-semibold text-text">{resolvedHeader}</h2>
                  ) : (
                    resolvedHeader
                  )}
                </div>
              ) : (
                <div className="flex-1" />
              )}
              {showClose && (
                <IconButton
                  variant="ghost"
                  icon="close"
                  label="Cerrar"
                  onClick={onClose}
                  className="flex-shrink-0"
                />
              )}
            </div>
          </div>
        )}

        <div className="p-5 overflow-y-auto flex-1 min-h-0">{children}</div>

        {footer && (
          <div className="p-5 border-t border-border/40 flex-shrink-0 flex flex-col-reverse gap-3 xl:flex-row [&>*]:contents">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}