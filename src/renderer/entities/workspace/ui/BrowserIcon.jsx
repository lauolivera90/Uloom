import { Icon } from '../../../widgets/index.js';
import { getBrowserIconUrl } from '../api/index.js';

/**
 * Ícono de un navegador conocido (chrome/edge/firefox/brave/opera/vivaldi).
 * Renderiza el SVG empaquetado correspondiente; si el id no tiene asset (p. ej.
 * el valor `'system'` o un id desconocido) cae a un glifo genérico de "globo".
 * Decorativo: alternativo vacío y aria-hidden.
 * @param {{
 *   browserId: string | null | undefined,
 *   className?: string,
 * }} props
 */
export function BrowserIcon({ browserId, className = '' }) {
  const iconUrl = getBrowserIconUrl(browserId);

  if (!iconUrl) {
    return <Icon icon="public" size={20} className="text-text/50" />;
  }

  return (
    <img
      src={iconUrl}
      alt=""
      aria-hidden="true"
      className={`w-5 h-5 flex-shrink-0${className ? ` ${className}` : ''}`}
    />
  );
}