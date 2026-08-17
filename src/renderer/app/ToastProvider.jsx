import { useMemo } from 'react';
import { ToastContext } from '../shared/index.js';
import { useToastState } from './hook/useToastState.js';
import { ToastViewport } from '../widgets/index.js';

/**
 * Provee el emisor de notificaciones toast a toda la aplicación. Maneja la lista
 * de toasts activos (estado + timers de auto-cierre) en `useToastState` y
 * renderiza el viewport flotante con las notificaciones vigentes. El contexto
 * vive en shared (`useToast`) para que widgets y features lo consuman sin
 * depender de la capa app. El value se memoiza (mismo patrón que
 * `LanguageProvider`) para no re-renderizar a los consumidores en cada alta/baja
 * de toast.
 * @param {{ children: React.ReactNode }} props
 */
export function ToastProvider({ children }) {
  const { toasts, toast, dismiss } = useToastState();

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}