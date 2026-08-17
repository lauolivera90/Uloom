import { createContext, useContext } from 'react';

/**
 * Tipo de variante de un toast: semántica que define el color del fill y el
 * ícono. `success` usa `primary` (confirmación = acción), `error` usa `error`,
 * `warning` usa `tertiary` y `info` usa la superficie.
 * @typedef {'success' | 'error' | 'warning' | 'info'} ToastVariant
 */

/**
 * Configuración de un toast al momento de emitirlo.
 * @typedef {Object} ToastConfig
 * @property {ToastVariant} variant Semántica del toast (define fill e ícono).
 * @property {string} message Texto visible (ya resuelto por `t()`).
 * @property {number} [duration] Milisegundos de auto-cierre (default del provider).
 */

/**
 * Contexto global de notificaciones toast. Lo provee `ToastProvider` (app/);
 * vive en shared para que widgets, features y la app lo consuman sin depender
 * de la capa app (mismo patrón que `I18nContext`).
 * @type {import('react').Context<{
 *   toast: (config: ToastConfig) => string,
 *   dismiss: (id: string) => void,
 * } | null>}
 */
export const ToastContext = createContext(null);

/**
 * Acceso al emisor de toasts. Debe usarse dentro de un `ToastProvider`; fuera
 * de él lanza un error descriptivo.
 * @returns {{
 *   toast: (config: ToastConfig) => string,
 *   dismiss: (id: string) => void,
 * }}
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (context === null) {
    throw new Error('useToast debe usarse dentro de <ToastProvider>');
  }
  return context;
}