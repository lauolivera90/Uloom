import { randomUUID } from 'node:crypto';
import {
  getConfig as getConfigFromRepository,
  addWorkspace,
  updateWorkspace as updateWorkspaceInRepository,
  deleteWorkspace as deleteWorkspaceInRepository,
} from '../data/workspaceRepository.js';

/**
 * Devuelve el contenido actual de la configuración (workspaces y preferencias normalizados).
 * @returns {import('../../renderer/shared/types.js').Config}
 */
export function getConfig() {
  return getConfigFromRepository();
}

/**
 * Crea un workspace nuevo. El id lo genera el proceso main (randomUUID), no llega
 * del cliente. Arma el workspace completo con `tabs` vacío y lo persiste.
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
  };
  return addWorkspace(workspace);
}

/**
 * Actualiza un workspace existente por su id (update estricto). Delega en el
 * repositorio y deja subir el error si el id no existe.
 * @param {import('../../renderer/shared/types.js').Workspace} nextWorkspace
 * @returns {import('../../renderer/shared/types.js').Workspace}
 */
export function updateWorkspace(nextWorkspace) {
  return updateWorkspaceInRepository(nextWorkspace);
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