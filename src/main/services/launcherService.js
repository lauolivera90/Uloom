import { spawn } from 'node:child_process';
import { shell } from 'electron';
import { getConfig, getWorkspaceById, recordLaunch } from '../data/workspaceRepository.js';
import { getBrowserById, resolveSystemBrowser } from './browserService.js';
import { recordTabsBestEffort } from './tabHistoryService.js';

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
 * Registra el uso de una sesión (`lastLaunchedAt` + `launchCount`) de forma
 * best-effort: un fallo del registro nunca convierte el launch en error (mismo
 * precedente que el historial de pestañas). Devuelve el workspace persistido
 * actualizado, o `null` si el registro no pudo completarse.
 * @param {string} workspaceId
 * @returns {import('../../renderer/shared/types.js').Workspace | null}
 */
function recordLaunchBestEffort(workspaceId) {
  try {
    return recordLaunch(workspaceId);
  } catch (error) {
    console.error('No se pudo registrar el lanzamiento de la sesión:', error);
    return null;
  }
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
 * Desde v0.6.2, si se abrió al menos una pestaña, registra el uso de la sesión
 * (best-effort) y devuelve el workspace persistido actualizado en `workspace`
 * (o `null` si el registro falló o no hubo apertura).
 * @param {string} workspaceId
 * @returns {Promise<{ opened: number, failed: number, workspace: import('../../renderer/shared/types.js').Workspace | null }>}
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
    return { opened: 0, failed: 0, workspace: null };
  }

  if (!browser) {
    browser = await resolveSystemBrowser();
  }

  if (!browser) {
    const results = await Promise.allSettled(urls.map((url) => openUrlWithSystem(url)));
    const openedTabs = (workspace.tabs ?? []).filter(
      (tab, index) => results[index].status === 'fulfilled',
    );
    if (openedTabs.length > 0) {
      recordTabsBestEffort(openedTabs);
    }
    const opened = results.filter((result) => result.status === 'fulfilled').length;
    const failed = results.filter((result) => result.status === 'rejected').length;
    return {
      opened,
      failed,
      workspace: opened > 0 ? recordLaunchBestEffort(workspace.id) : null,
    };
  }

  await openUrlsInBrowser(urls, browser, workspace.openBehavior);
  recordTabsBestEffort(workspace.tabs ?? []);
  return {
    opened: urls.length,
    failed: 0,
    workspace: recordLaunchBestEffort(workspace.id),
  };
}