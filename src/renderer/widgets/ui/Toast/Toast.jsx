import { useI18n } from '../../../shared/index.js';
import { Icon } from '../Icon/Icon.jsx';

/**
 * Variantes del toast: mapa de clases de fill + texto e ícono por semántica.
 * Solo tokens del sistema: `success` usa primary (confirmación = acción),
 * `error` usa error, `warning` usa tertiary e `info` usa superficie con borde.
 * @type {Record<string, { container: string, icon: string }>}
 */
const VARIANT_STYLES = {
  success: { container: 'bg-primary text-on-primary', icon: 'check_circle' },
  error: { container: 'bg-error text-on-error', icon: 'error' },
  warning: { container: 'bg-tertiary text-on-tertiary', icon: 'warning' },
  info: { container: 'bg-surface text-text border border-border', icon: 'info' },
};

/**
 * Notificación toast individual. Presentacional: recibe la variante y el mensaje
 * (ya resuelto por `t()`) y expone un botón de cierre con `aria-label` para
 * accesibilidad. El auto-cierre lo maneja el provider, no este componente.
 * @param {{
 *   toast: { id: string, variant: import('../../../shared/hook/useToast.js').ToastVariant, message: string },
 *   onDismiss: (id: string) => void,
 * }} props
 */
export function Toast({ toast, onDismiss }) {
  const { t } = useI18n();
  const { container, icon } = VARIANT_STYLES[toast.variant] ?? VARIANT_STYLES.info;

  return (
    <div
      role="status"
      className={`flex items-center gap-3 pl-4 pr-1.5 py-1.5 rounded-lg shadow-xl duration-slow animate-in fade-in slide-in-from-bottom-2 ${container}`}
    >
      <Icon icon={icon} className="flex-shrink-0" />
      <p className="text-sm font-medium flex-1 min-w-0">{toast.message}</p>
      <button
        type="button"
        aria-label={t('toast.dismiss')}
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 p-1.5 rounded-md hover:bg-overlay/10 transition duration-fast active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
      >
        <Icon icon="close" />
      </button>
    </div>
  );
}