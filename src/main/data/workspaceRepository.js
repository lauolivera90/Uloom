import { readConfig, writeConfig } from './configStore.js';

/**
 * Normaliza un workspace para persistencia: garantiza que `tabs` sea un array y
 * rellena los defaults de navegador (`openBehavior`, `browser`) ante configs viejas.
 * @param {import('../../renderer/shared/types.js').Workspace} workspace
 * @returns {import('../../renderer/shared/types.js').Workspace}
 */
export function normalizeWorkspace(workspace) {
  return {
    ...workspace,
    tabs: Array.isArray(workspace.tabs) ? workspace.tabs : [],
    openBehavior: workspace.openBehavior ?? 'active-tab',
    browser: workspace.browser ?? null,
  };
}

/**
 * Devuelve la configuración completa con los workspaces normalizados
 * (migración ante edición manual del JSON o configs viejas).
 * @returns {import('../../renderer/shared/types.js').Config}
 */
export function getConfig() {
  const config = readConfig();
  return {
    ...config,
    workspaces: config.workspaces.map(normalizeWorkspace),
  };
}

/**
 * Devuelve la lista de workspaces persistida, normalizada al leer.
 * @returns {import('../../renderer/shared/types.js').Workspace[]}
 */
export function readWorkspaces() {
  return getConfig().workspaces;
}

/**
 * Devuelve un workspace por su id (lectura estricta). Si el id no existe, lanza;
 * de lo contrario devuelve el workspace normalizado.
 * @param {string} workspaceId
 * @returns {import('../../renderer/shared/types.js').Workspace}
 */
export function getWorkspaceById(workspaceId) {
  const workspace = getConfig().workspaces.find((item) => item.id === workspaceId);
  if (!workspace) {
    throw new Error('Workspace no encontrado');
  }
  return workspace;
}

/**
 * Agrega un workspace nuevo al archivo de configuración y lo persiste.
 * @param {import('../../renderer/shared/types.js').Workspace} workspace
 * @returns {import('../../renderer/shared/types.js').Workspace}
 */
export function addWorkspace(workspace) {
  const config = readConfig();
  const saved = normalizeWorkspace(workspace);
  config.workspaces.push(saved);
  writeConfig(config);
  return saved;
}

/**
 * Actualiza un workspace existente por su id (update estricto: no inserta).
 * Si el id no existe, lanza; de lo contrario escribe y devuelve el persistido.
 * @param {import('../../renderer/shared/types.js').Workspace} nextWorkspace
 * @returns {import('../../renderer/shared/types.js').Workspace}
 */
export function updateWorkspace(nextWorkspace) {
  const config = readConfig();
  const index = config.workspaces.findIndex((workspace) => workspace.id === nextWorkspace.id);
  if (index === -1) {
    throw new Error('Workspace no encontrado');
  }
  const saved = normalizeWorkspace(nextWorkspace);
  config.workspaces[index] = saved;
  writeConfig(config);
  return saved;
}

/**
 * Elimina un workspace existente por su id (baja estricta: no tolera ids
 * ausentes ni huérfanos). Si el id no existe, lanza; de lo contrario escribe.
 * @param {string} workspaceId
 * @returns {void}
 */
export function deleteWorkspace(workspaceId) {
  const config = readConfig();
  const index = config.workspaces.findIndex((workspace) => workspace.id === workspaceId);
  if (index === -1) {
    throw new Error('Workspace no encontrado');
  }
  config.workspaces.splice(index, 1);
  writeConfig(config);
}