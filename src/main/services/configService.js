import { randomUUID } from 'node:crypto';
import {
  readConfig,
  addWorkspace,
  updateWorkspace as updateWorkspaceInRepository,
} from '../data/configRepository.js';

/**
 * Devuelve el contenido actual de la configuración.
 * @returns {import('../../renderer/shared/types.js').Config}
 */
export function getConfig() {
  return readConfig();
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