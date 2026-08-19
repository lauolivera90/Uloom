import { randomUUID } from 'node:crypto';
import {
  getConfig as getConfigFromRepository,
  getWorkspaceById,
  addWorkspace,
  updateWorkspace as updateWorkspaceInRepository,
  deleteWorkspace as deleteWorkspaceInRepository,
  clearMetadataCache as clearMetadataCacheInRepository,
  deleteAllWorkspaces as deleteAllWorkspacesInRepository,
} from '../data/workspaceRepository.js';
import { recordTabsBestEffort } from './tabHistoryService.js';

/**
 * Devuelve el contenido actual de la configuración (workspaces y preferencias normalizados).
 * @returns {import('../../renderer/shared/types.js').Config}
 */
export function getConfig() {
  return getConfigFromRepository();
}

/**
 * Crea un workspace nuevo. El id lo genera el proceso main (randomUUID), no llega
 * del cliente. Arma el workspace completo con `tabs` vacío, sin fijar (`pinned:
 * false`) y sin historial de uso (`lastLaunchedAt: null`, `launchCount: 0`) y lo
 * persiste.
 * @param {{ name: string, description?: string, icon?: string }} input
 * @returns {import('../../renderer/shared/types.js').Workspace}
 */
export function createWorkspace({ name, description, icon }) {
  const workspace = {
    id: randomUUID(),
    name,
    description,
    icon,
    tabs: [],
    openBehavior: 'active-tab',
    browser: null,
    pinned: false,
    lastLaunchedAt: null,
    launchCount: 0,
  };
  return addWorkspace(workspace);
}

/**
 * Actualiza un workspace existente por su id (update estricto). Delega en el
 * repositorio y deja subir el error si el id no existe. Además registra en el
 * historial de pestañas las URLs que aparecieron nuevas en la actualización
 * (alta de pestañas — no hay canal `addTab`, el alta va por `workspace:update`):
 * editar/borrar no re-registra porque la URL ya estaba o desaparece.
 * @param {import('../../renderer/shared/types.js').Workspace} nextWorkspace
 * @returns {import('../../renderer/shared/types.js').Workspace}
 */
export function updateWorkspace(nextWorkspace) {
  const previous = getWorkspaceById(nextWorkspace.id);
  const saved = updateWorkspaceInRepository(nextWorkspace);
  const previousUrls = new Set((previous.tabs ?? []).map((tab) => tab.url));
  const newTabs = (nextWorkspace.tabs ?? []).filter((tab) => !previousUrls.has(tab.url));
  if (newTabs.length > 0) {
    recordTabsBestEffort(newTabs);
  }
  return saved;
}

/**
 * Duplica una sesión existente: clona su configuración de lanzamiento
 * (`openBehavior`, `browser`) y todas sus pestañas con ids nuevos, generando un
 * workspace nuevo con id nuevo y los datos básicos provistos (`name`,
 * `description`, `icon` — que pueden diferir de la fuente). El clon arranca
 * desfijado (`pinned: false`) y sin historial de uso (`lastLaunchedAt: null`,
 * `launchCount: 0`), aunque la fuente tenga lanzamientos. Lee la sesión
 * original del disco (nunca modifica la fuente) y persiste el clon.
 * @param {string} sourceId
 * @param {{ name: string, description?: string, icon?: string }} input
 * @returns {import('../../renderer/shared/types.js').Workspace}
 */
export function duplicateWorkspace(sourceId, { name, description, icon }) {
  const source = getWorkspaceById(sourceId);
  const clone = {
    id: randomUUID(),
    name,
    description,
    icon,
    tabs: source.tabs.map((tab) => ({ ...tab, id: randomUUID() })),
    openBehavior: source.openBehavior,
    browser: source.browser,
    pinned: false,
    lastLaunchedAt: null,
    launchCount: 0,
  };
  return addWorkspace(clone);
}

/**
 * Elimina un workspace existente por su id (baja estricta). Delega en el
 * repositorio y deja subir el error si el id no existe.
 * @param {string} workspaceId
 * @returns {void}
 */
export function deleteWorkspace(workspaceId) {
  return deleteWorkspaceInRepository(workspaceId);
}

/**
 * Limpia la caché de metadatos web de todas las pestañas (favicons en
 * `Tab.favicon`). Delega en el repositorio y devuelve la cantidad removida.
 * @returns {number}
 */
export function clearMetadataCache() {
  return clearMetadataCacheInRepository();
}

/**
 * Elimina todas las sesiones preservando las preferencias globales. Delega en el
 * repositorio y devuelve la cantidad de workspaces removidos.
 * @returns {number}
 */
export function deleteAllWorkspaces() {
  return deleteAllWorkspacesInRepository();
}