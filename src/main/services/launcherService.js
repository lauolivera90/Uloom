import { spawn } from 'node:child_process';
import { shell } from 'electron';
import { getConfig, getWorkspaceById } from '../data/workspaceRepository.js';
import { getBrowserById, resolveSystemBrowser } from './browserService.js';

/**
 * Navegadores Chromium: la bandera que fuerza una ventana nueva es la misma
 * para toda la familia (Chrome, Edge, Brave, Opera, Vivaldi). Firefox usa la suya.
 * @type {Record<string, string>}
 */
const BROWSER_NEW_WINDOW_FLAGS = {
  chrome: '--new-window',
  edge: '--new-window',
  brave: '--new-window',
  opera: '--new-window',
  vivaldi: '--new-window',
  firefox: '-new-window',
};

/**
 * Resuelve el navegador efectivo de una sesión con la herencia de 3 niveles:
 * sesión → global → sistema. `null` significa "decide el sistema operativo".
 * @param {import('../../renderer/shared/types.js').Workspace} workspace
 * @param {import('../../renderer/shared/types.js').Preferences} preferences
 * @returns {string | null}
 */
function resolveBrowser(workspace, preferences) {
  if (workspace.browser) {
    return workspace.browser;
  }
  return preferences.defaultBrowser !== 'system' ? preferences.defaultBrowser : null;
}

/**
 * Bandera de ventana nueva para un ejecutable resuelto desde el sistema sin id de
 * candidato (el `resolveSystemBrowser` de browserService devuelve `id: null` si el
 * default no es del catálogo). Heurística por motor: solo Firefox difiere del
 * estándar Chromium (`--new-window`), que es el motor de todos los demás
 * navegadores reales de Windows.
 * @param {string} executablePath
 * @returns {string}
 */
function getNewWindowFlag(executablePath) {
  return executablePath.toLowerCase().includes('firefox') ? '-new-window' : '--new-window';
}

/**
 * Abre todas las URLs de una sesión en UN spawn del ejecutable de navegador.
 * Según el `openBehavior`: con `new-window` pasa la bandera de ventana nueva del
 * motor (del id si el navegador es un candidato conocido, o heurística de motor
 * si vino del sistema sin id) seguida de todas las URLs como argumentos (el
 * navegador abre el conjunto en una sola ventana nueva, cada URL como pestaña);
 * con `active-tab` pasa solo las URLs (el navegador las abre como pestañas en su
 * ventana/tab vigente). Un solo spawn evita que cada pestaña abra una ventana
 * propia con `new-window` y la race de spawns paralelos con `active-tab` cuando
 * el navegador arranca en frío.
 * Resuelve cuando el proceso se lanza (`spawn`) y rechaza si el spawn falla
 * (`error`), p. ej. un ejecutable que ya no existe.
 * @param {string[]} urls
 * @param {{ id?: string, path: string }} browser
 * @param {import('../../renderer/shared/types.js').OpenBehavior} openBehavior
 * @returns {Promise<void>}
 */
function openUrlsInBrowser(urls, browser, openBehavior) {
  const newWindowFlag = browser.id ? BROWSER_NEW_WINDOW_FLAGS[browser.id] : getNewWindowFlag(browser.path);
  const args = openBehavior === 'new-window' && newWindowFlag ? [newWindowFlag, ...urls] : urls;

  return new Promise((resolve, reject) => {
    const child = spawn(browser.path, args, { detached: true, stdio: 'ignore' });
    child.once('spawn', resolve);
    child.once('error', reject);
    child.unref();
  });
}

/**
 * Abre una URL con el navegador predeterminado del sistema operativo
 * (`shell.openExternal`). Último recurso cuando el ejecutable del predeterminado
 * no se puede resolver; en ese caso no se puede forzar ventana nueva.
 * @param {string} url
 * @returns {Promise<void>}
 */
function openUrlWithSystem(url) {
  return shell.openExternal(url);
}

/**
 * Abre todas las pestañas de una sesión en el navegador resuelto (sesión →
 * global → sistema). Con un navegador concreto o el predeterminado del sistema
 * resuelto a un ejecutable, hace UN spawn con todas las URLs como argumentos:
 * con `openBehavior: 'new-window'` pasa la bandera de ventana nueva y el
 * conjunto se abre en una sola ventana (cada URL como pestaña); con
 * `active-tab` las URLs se abren como pestañas en la ventana vigente. Si el
 * predeterminado del sistema no se pudo resolver a un ejecutable, cae a
 * `shell.openExternal` por URL. Lanza ante errores estructurales (sesión
 * inexistente, navegador configurado que no está instalado o spawn que falla);
 * el fallback de sistema devuelve cuántas URLs se abrieron y cuántas fallaron.
 * @param {string} workspaceId
 * @returns {Promise<{ opened: number, failed: number }>}
 */
export async function launchWorkspace(workspaceId) {
  const config = getConfig();
  const workspace = getWorkspaceById(workspaceId);
  const browserId = resolveBrowser(workspace, config.preferences);
  let browser = browserId ? getBrowserById(browserId) : null;

  if (browserId && !browser) {
    throw new Error('Navegador configurado no encontrado');
  }

  const urls = (workspace.tabs ?? []).map((tab) => tab.url);
  if (urls.length === 0) {
    return { opened: 0, failed: 0 };
  }

  if (!browser) {
    browser = await resolveSystemBrowser();
  }

  if (!browser) {
    const results = await Promise.allSettled(urls.map((url) => openUrlWithSystem(url)));
    return {
      opened: results.filter((result) => result.status === 'fulfilled').length,
      failed: results.filter((result) => result.status === 'rejected').length,
    };
  }

  await openUrlsInBrowser(urls, browser, workspace.openBehavior);
  return { opened: urls.length, failed: 0 };
}