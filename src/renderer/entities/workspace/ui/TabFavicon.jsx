import { useState } from 'react';
import { getHostname, isDataUrl, isRemoteIcon } from '../../../shared/index.js';
import { Icon } from '../../../widgets/index.js';

/**
 * Icono de una pestaña web. Presentacional: prioriza el icono explícito (`icon`),
 * que puede ser un data URL o un nombre de Material Symbol; si no hay icono
 * explícito, usa el favicon cacheado por `page:metadata` (`favicon`, data URL o
 * remote http(s)); y si no hay ninguno, intenta el favicon del sitio vía el
 * servicio externo de Google (sin backend ni CORS); si eso falla, cae a un ícono
 * mapamundi decorativo.
 * @param {{
 *   url?: string,
 *   icon?: string,
 *   favicon?: string,
 * }} props
 */
export function TabFavicon({ url, icon, favicon }) {
  const [failed, setFailed] = useState(false);

  const inlineFavicon = favicon && (isDataUrl(favicon) || isRemoteIcon(favicon))
    ? favicon
    : null;

  if (isDataUrl(icon) || isRemoteIcon(icon)) {
    return <img src={icon} alt="" className="w-5 h-5 rounded-sm flex-shrink-0" />;
  }

  if (inlineFavicon && !failed) {
    return (
      <img
        src={inlineFavicon}
        alt=""
        className="w-5 h-5 rounded-sm flex-shrink-0"
        onError={() => setFailed(true)}
      />
    );
  }

  if (icon) {
    return <Icon icon={icon} size={20} className="text-accent flex-shrink-0" />;
  }

  if (failed || !url) {
    return <Icon icon="public" size={20} className="text-accent flex-shrink-0" />;
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(getHostname(url))}&sz=64`}
      alt=""
      className="w-5 h-5 rounded-sm flex-shrink-0"
      onError={() => setFailed(true)}
    />
  );
}