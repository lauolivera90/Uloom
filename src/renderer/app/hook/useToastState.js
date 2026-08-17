import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_DURATION = 4000;
const MAX_VISIBLE_TOASTS = 4;

/**
 * Estado global de la lista de toasts activos. `toast(config)` agrega una
 * notificación con auto-cierre (timer por id, con cleanup total al desmontar —
 * regla 2.2) y `dismiss(id)` la cierra manualmente. Se mantiene un tope de
 * toasts visibles (descarta el más viejo) para no tapar la interfaz.
 * @returns {{
 *   toasts: Array<{ id: string, variant: import('../../shared/hook/useToast.js').ToastVariant, message: string, duration: number }>,
 *   toast: (config: import('../../shared/hook/useToast.js').ToastConfig) => string,
 *   dismiss: (id: string) => void,
 * }}
 */
export function useToastState() {
  const [toasts, setToasts] = useState([]);
  const toastsRef = useRef([]);
  const timersRef = useRef(new Map());
  const nextIdRef = useRef(0);

  useEffect(() => {
    toastsRef.current = toasts;
  }, [toasts]);

  const dismiss = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (config) => {
      const id = `toast-${nextIdRef.current++}`;
      const duration = config.duration ?? DEFAULT_DURATION;
      const dropped = toastsRef.current.slice(
        0,
        Math.max(0, toastsRef.current.length + 1 - MAX_VISIBLE_TOASTS),
      );
      dropped.forEach((item) => {
        const timer = timersRef.current.get(item.id);
        if (timer !== undefined) {
          clearTimeout(timer);
          timersRef.current.delete(item.id);
        }
      });
      setToasts((prev) => {
        const next = [...prev, { id, variant: config.variant, message: config.message, duration }];
        return next.length > MAX_VISIBLE_TOASTS ? next.slice(-MAX_VISIBLE_TOASTS) : next;
      });
      timersRef.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      );
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return { toasts, toast, dismiss };
}