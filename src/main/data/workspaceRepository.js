import { randomUUID } from 'node:crypto';
import { readConfig, writeConfig } from './configStore.js';

/**
 * Normaliza un workspace para persistencia: garantiza que `tabs` sea un array y
 * rellena los defaults de navegador (`openBehavior`, `browser`) y de fijado
 * (`pinned`) ante configs viejas.
 * @param {import('../../renderer/shared/types.js').Workspace} workspace
 * @returns {import('../../renderer/shared/types.js').Workspace}
 */
export function normalizeWorkspace(workspace) {
  return {
    ...workspace,
    tabs: Array.isArray(workspace.tabs) ? workspace.tabs : [],
    openBehavior: workspace.openBehavior ?? 'active-tab',
    browser: workspace.browser ?? null,
    pinned: workspace.pinned ?? false,
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

/**
 * Limpia la caché de metadatos web de todas las pestañas: elimina el favicon
 * cacheado (`Tab.favicon`, data URL del fetch de `page:metadata`) de cada tab.
 * Devuelve la cantidad de favicons removidos.
 * @returns {number}
 */
export function clearMetadataCache() {
  const config = readConfig();
  let cleared = 0;
  config.workspaces = config.workspaces.map((workspace) => ({
    ...workspace,
    tabs: workspace.tabs.map((tab) => {
      if (tab.favicon) {
        cleared += 1;
        const next = { ...tab };
        delete next.favicon;
        return next;
      }
      return tab;
    }),
  }));
  writeConfig(config);
  return cleared;
}

/**
 * Elimina todas las sesiones del archivo de configuración preservando las
 * `preferences` globales (el navegador predeterminado queda intacto).
 * Devuelve la cantidad de workspaces removidos.
 * @returns {number}
 */
export function deleteAllWorkspaces() {
  const config = readConfig();
  const deleted = config.workspaces.length;
  config.workspaces = [];
  writeConfig(config);
  return deleted;
}

/**
 * Importa sesiones al catálogo local a partir de una lista ya validada por el
 * service de portabilidad. Con `replace: true` (restauración de respaldo) deja
 * las sesiones locales fuera y escribe como catálogo la lista importada,
 * preservando `preferences`. Con `replace: false` (sesión individual) agrega las
 * sesiones importadas a las existentes, regenerando el id de cualquier importada
 * que colisione con una sesión local (nunca pisa una sesión del usuario).
 * Devuelve la lista final persistida.
 * @param {import('../../renderer/shared/types.js').Workspace[]} workspaces
 * @param {{ replace: boolean }} options Si `true`, reemplaza el catálogo; si no, agrega.
 * @returns {import('../../renderer/shared/types.js').Workspace[]}
 */
export function importWorkspaces(workspaces, { replace }) {
  const config = readConfig();
  const imported = workspaces.map(normalizeWorkspace);

  if (replace) {
    config.workspaces = imported;
  } else {
    const existingIds = new Set(config.workspaces.map((workspace) => workspace.id));
    const merged = imported.map((workspace) => {
      if (!existingIds.has(workspace.id)) {
        existingIds.add(workspace.id);
        return workspace;
      }
      const fresh = { ...workspace, id: randomUUID() };
      existingIds.add(fresh.id);
      return fresh;
    });
    config.workspaces.push(...merged);
  }

  writeConfig(config);
  return replace ? imported : config.workspaces;
}