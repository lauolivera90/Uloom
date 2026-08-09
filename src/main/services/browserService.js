import { existsSync } from 'node:fs';
import path from 'node:path';
import { app } from 'electron';

/**
 * Candidatos a navegador con rutas relativas típicas de instalación en Windows.
 * El primer segmento es el nombre de la variable de entorno que ancla la raíz de
 * instalación (PROGRAMFILES, PROGRAMFILES(X86) o LOCALAPPDATA); el resto son
 * subcarpetas hacia el ejecutable. Solo se reportan los que existen en disco.
 */
const BROWSER_CANDIDATES = [
  {
    id: 'chrome',
    name: 'Google Chrome',
    paths: ['PROGRAMFILES/Google/Chrome/Application/chrome.exe'],
  },
  {
    id: 'edge',
    name: 'Microsoft Edge',
    paths: [
      'PROGRAMFILES(X86)/Microsoft/Edge/Application/msedge.exe',
      'PROGRAMFILES/Microsoft/Edge/Application/msedge.exe',
    ],
  },
  {
    id: 'firefox',
    name: 'Mozilla Firefox',
    paths: ['PROGRAMFILES/Mozilla Firefox/firefox.exe'],
  },
  {
    id: 'brave',
    name: 'Brave',
    paths: ['LOCALAPPDATA/BraveSoftware/Brave-Browser/Application/brave.exe'],
  },
  {
    id: 'opera',
    name: 'Opera',
    paths: ['LOCALAPPDATA/Programs/Opera/opera.exe'],
  },
  {
    id: 'vivaldi',
    name: 'Vivaldi',
    paths: ['LOCALAPPDATA/Vivaldi/Application/vivaldi.exe'],
  },
];

/**
 * Resuelve las rutas absolutas de un candidato a partir de las variables de
 * entorno del sistema. Descarta los segmentos cuya raíz (env) no esté definida.
 * @param {{ paths: string[] }} candidate
 * @returns {string[]}
 */
function resolveCandidatePaths(candidate) {
  return candidate.paths
    .map((relative) => {
      const [envKey, ...rest] = relative.split('/');
      const root = process.env[envKey];
      return root ? path.join(root, ...rest) : null;
    })
    .filter(Boolean);
}

/**
 * Detecta los navegadores instalados en el sistema probando rutas típicas de
 * instalación ancladas en las variables de entorno. Solo Windows: en otras
 * plataformas devuelve una lista vacía.
 * @returns {Array<{ id: string, name: string }>}
 */
export function getInstalledBrowsers() {
  if (process.platform !== 'win32') {
    return [];
  }

  return BROWSER_CANDIDATES.filter((candidate) =>
    resolveCandidatePaths(candidate).some((fullPath) => existsSync(fullPath)),
  ).map(({ id, name }) => ({ id, name }));
}

/**
 * Mapea un ejecutable a un id de candidato conocido por el basename del archivo.
 * @param {string} executablePath
 * @returns {string | null}
 */
function matchBrowserIdByPath(executablePath) {
  const basename = path.basename(executablePath).toLowerCase();
  const byExecutableName = {
    'chrome.exe': 'chrome',
    'msedge.exe': 'edge',
    'firefox.exe': 'firefox',
    'brave.exe': 'brave',
    'opera.exe': 'opera',
    'vivaldi.exe': 'vivaldi',
  };
  return byExecutableName[basename] ?? null;
}

/**
 * Resuelve el navegador predeterminado del sistema operativo con su ejecutable,
 * vía el handler registrado del protocolo `https:` (`app.getApplicationInfoForProtocol`).
 * Centraliza la consulta que hoy se hacía por separado en el launcher y en la UI:
 * `id` es `null` si el default no pertenece al catálogo (la heurística por motor
 * del launcher aplica sobre `path`); `null` completo si no hay handler o no se
 * pudo resolver. Solo Windows; en otras plataformas devuelve `null`.
 * @returns {Promise<{ id: string | null, name: string, path: string } | null>}
 */
export async function resolveSystemBrowser() {
  if (process.platform !== 'win32') {
    return null;
  }
  try {
    const info = await app.getApplicationInfoForProtocol('https:');
    if (!info || !info.path) {
      return null;
    }
    return {
      id: matchBrowserIdByPath(info.path),
      name: info.name,
      path: info.path,
    };
  } catch {
    return null;
  }
}

/**
 * Navegador predeterminado del sistema operativo si pertenece al catálogo
 * conocido. Devuelve `null` si el default no se puede resolver o no es uno de los
 * navegadores del catálogo (el renderer cae al ícono genérico). Para la UI del
 * selector; el launcher usa `resolveSystemBrowser` (la misma consulta) porque
 * necesita el ejecutable.
 * @returns {Promise<{ id: string, name: string } | null>}
 */
export async function getSystemDefaultBrowser() {
  const systemBrowser = await resolveSystemBrowser();
  if (!systemBrowser?.id) {
    return null;
  }
  const candidate = BROWSER_CANDIDATES.find((item) => item.id === systemBrowser.id);
  return candidate ? { id: candidate.id, name: candidate.name } : null;
}

/**
 * Devuelve el ejecutable de un navegador por su id, si está instalado. Resuelve la
 * primera ruta que exista en disco para ese candidato. Solo Windows: en otras
 * plataformas devuelve null.
 * @param {string} browserId
 * @returns {{ id: string, name: string, path: string } | null}
 */
export function getBrowserById(browserId) {
  if (process.platform !== 'win32') {
    return null;
  }

  const candidate = BROWSER_CANDIDATES.find((item) => item.id === browserId);
  if (!candidate) {
    return null;
  }

  const executablePath = resolveCandidatePaths(candidate).find((fullPath) => existsSync(fullPath));
  if (!executablePath) {
    return null;
  }

  return { id: candidate.id, name: candidate.name, path: executablePath };
}