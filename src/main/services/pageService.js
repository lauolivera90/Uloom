import { net, session } from 'electron';

const TIMEOUT_MS = 4000;
const MAX_HTML_BYTES = 1 * 1024 * 1024;
const MAX_FAVICON_BYTES = 32 * 1024;

/**
 * Descarga el recurso indicado con timeout y cap de tamaño. Aborta con
 * AbortController si excede el timeout; si el body supera el cap se descarta.
 * Devuelve el buffer contenido y su content-type, o null ante fallo de red,
 * status no-2xx, timeout o exceso de tamaño.
 * @param {string} url
 * @param {number} maxBytes
 * @returns {Promise<{ buffer: Buffer, contentType: string | null } | null>}
 */
async function fetchWithCap(url, maxBytes) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await net.fetch(url, {
      session: session.defaultSession,
      signal: controller.signal,
    });
    if (!response.ok) {
      return null;
    }
    const contentType = response.headers.get('content-type');
    const contentLength = Number(response.headers.get('content-length')) || 0;
    if (contentLength > maxBytes) {
      return null;
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.byteLength > maxBytes) {
      return null;
    }
    return { buffer: bytes, contentType };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Extrae el primer <link rel="icon"|"shortcut icon"> del HTML y resuelve su href
 * contra la URL base. Tolerante al orden de atributos. Devuelve null si no hay.
 * @param {string} html
 * @param {string} baseUrl
 * @returns {string | null}
 */
function extractIconUrl(html, baseUrl) {
  const linkRegex = /<link\b[^>]*>/gi;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const tag = match[0];
    if (!/\brel\s*=\s*["'](?:[^"']*\s)?(?:icon|shortcut icon)(?:\s[^"']*)?["']/i.test(tag)) {
      continue;
    }
    const hrefMatch = tag.match(/\bhref\s*=\s*["']([^"']+)["']/i);
    if (hrefMatch) {
      try {
        return new URL(hrefMatch[1], baseUrl).href;
      } catch {
        // atributo inválido, seguir buscando
      }
    }
  }
  return null;
}

/**
 * Extrae el contenido del primer <title> del HTML, decodificando entidades HTML.
 * @param {string} html
 * @returns {string | null}
 */
function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match) {
    return null;
  }
  return (
    match[1]
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim() || null
  );
}

/**
 * Convierte los bytes de un favicon a data URL usando el content-type real o un
 * mime derivado de la extensión (fallback image/x-icon).
 * @param {{ buffer: Buffer, contentType: string | null }} fetched
 * @param {string} url
 * @returns {string}
 */
function toDataUrl(fetched, url) {
  const mime =
    fetched.contentType?.split(';')[0]?.trim() ||
    (url.endsWith('.png') ? 'image/png' : 'image/x-icon');
  return `data:${mime};base64,${fetched.buffer.toString('base64')}`;
}

/**
 * Trae los metadatos web de una URL: el <title> del sitio y su favicon como data
 * URL. Soft-fallback: cualquier fallo de red, parser o cap devuelve el campo en
 * `null` (no lanza — rules.md §7, service con fallback).
 * @param {string} rawUrl
 * @returns {Promise<{ title: string | null, favicon: string | null }>}
 */
export async function fetchPageMetadata(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return { title: null, favicon: null };
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { title: null, favicon: null };
  }

  const fetched = await fetchWithCap(url.href, MAX_HTML_BYTES);
  if (!fetched) {
    return { title: null, favicon: null };
  }
  const html = fetched.buffer.toString('utf-8');
  const title = extractTitle(html);

  const iconUrl = extractIconUrl(html, url.href) ?? new URL('/favicon.ico', url.href).href;
  const iconFetched = await fetchWithCap(iconUrl, MAX_FAVICON_BYTES);
  const favicon = iconFetched ? toDataUrl(iconFetched, iconUrl) : null;

  return { title, favicon };
}