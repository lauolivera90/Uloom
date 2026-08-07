import { existsSync } from 'node:fs';
import path from 'node:path';

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