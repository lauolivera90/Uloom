import { spawn } from 'node:child_process';
import { app, shell } from 'electron';
import { getConfig, getWorkspaceById } from '../data/workspaceRepository.js';
import { getBrowserById } from './browserService.js';

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
 * Bandera de ventana nueva para un ejecutable resuelto desde el sistema (sin id
 * de candidato conocido). Heurística por motor: solo Firefox difiere del estándar
 * Chromium (`--new-window`), que es el motor de todos los demás navegadores reales
 * de Windows. Exacta para los navegadores del catálogo y para los defaults típicos.
 * @param {string} executablePath
 * @returns {string}
 */
function getNewWindowFlag(executablePath) {
  return executablePath.toLowerCase().includes('firefox') ? '-new-window' : '--new-window';
}

/**
 * Resuelve el ejecutable del navegador predeterminado del sistema vía el handler
 * registrado del protocolo `https:` (`app.getApplicationInfoForProtocol`). Devuelve
 * `null` si no hay handler o no se pudo resolver (en ese caso el caller cae a
 * `shell.openExternal`).
 * @returns {Promise<{ name: string, path: string } | null>}
 */
async function resolveSystemBrowser() {
  try {
    const info = await app.getApplicationInfoForProtocol('https:');
    return info?.path ? { name: info.name, path: info.path } : null;
  } catch {
    return null;
  }
}

/**
 * Abre una URL por spawn de un ejecutable de navegador. Solicita ventana nueva
 * según el `openBehavior`: con `new-window` pasa la bandera del motor (del id si
 * es un candidato conocido, o heurística de motor si vino del sistema); con
 * `active-tab` solo pasa la URL (el navegador la abre en su ventana/tab vigente).
 * Resuelve cuando el proceso se lanza (`spawn`) y rechaza si el spawn falla
 * (`error`), p. ej. un ejecutable que ya no existe.
 * @param {string} url
 * @param {{ id?: string, path: string }} browser
 * @param {import('../../renderer/shared/types.js').OpenBehavior} openBehavior
 * @returns {Promise<void>}
 */
function openUrlInBrowser(url, browser, openBehavior) {
  const newWindowFlag = browser.id ? BROWSER_NEW_WINDOW_FLAGS[browser.id] : getNewWindowFlag(browser.path);
  const args = openBehavior === 'new-window' && newWindowFlag ? [newWindowFlag, url] : [url];

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
 * resuelto a un ejecutable, spawn del navegador (bandera de ventana nueva si
 * `openBehavior` lo pide, ya sea por id de candidato o por heurística de motor);
 * si el predeterminado del sistema no se pudo resolver a un ejecutable, cae a
 * `shell.openExternal`. Devuelve cuántas URLs se abrieron y cuántas fallaron;
 * lanza solo ante errores estructurales (sesión inexistente o navegador
 * configurado que no está instalado).
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

  if (!browser) {
    browser = await resolveSystemBrowser();
  }

  const openUrl = browser ? (url) => openUrlInBrowser(url, browser, workspace.openBehavior) : openUrlWithSystem;
  const results = await Promise.allSettled((workspace.tabs ?? []).map((tab) => openUrl(tab.url)));

  return {
    opened: results.filter((result) => result.status === 'fulfilled').length,
    failed: results.filter((result) => result.status === 'rejected').length,
  };
}