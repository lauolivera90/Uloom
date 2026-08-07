import { useState } from 'react';
import { Icon } from '../../../widgets/index.js';

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

/**
 * Icono de una pestaña web. Presentacional: prioriza un icono explícito — data
 * URL (subido) como imagen o nombre de Material Symbol (elegido del catálogo) —
 * y si no hay, intenta el favicon del sitio vía el servicio externo de Google
 * (sin backend ni CORS); si eso falla, cae a un ícono mapamundi decorativo.
 * @param {{
 *   url?: string,
 *   icon?: string,
 * }} props
 */
export function TabFavicon({ url, icon }) {
  const [failed, setFailed] = useState(false);

  if (icon?.startsWith('data:')) {
    return <img src={icon} alt="" className="w-5 h-5 rounded-sm flex-shrink-0" />;
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