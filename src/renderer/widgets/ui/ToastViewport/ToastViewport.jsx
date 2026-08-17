import { Toast } from '../Toast/Toast.jsx';

/**
 * Contenedor flotante de las notificaciones activas. Presentacional: recibe la
 * lista y el callback de cierre y las apila en la esquina inferior derecha, por
 * encima de cualquier modal (z-60 > z-50). Los toasts se componen hacia abajo
 * desde el borde (flex-col) y el último emitido queda más abajo.
 * @param {{
 *   toasts: Array<{ id: string, variant: import('../../../shared/hook/useToast.js').ToastVariant, message: string }>,
 *   onDismiss: (id: string) => void,
 * }} props
 */
export function ToastViewport({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-2"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}