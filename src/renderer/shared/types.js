/**
 * @typedef {Object} Tab
 * @property {string} id Identificador único de la pestaña.
 * @property {string} url URL del sitio web.
 * @property {string} name Nombre visible de la pestaña.
 * @property {string} [icon] Icono o favicon asociado a la pestaña.
 */

/**
 * @typedef {Object} Workspace
 * @property {string} id Identificador único del workspace.
 * @property {string} name Nombre de la sesión de trabajo.
 * @property {string} [description] Descripción opcional de la sesión.
 * @property {string} [icon] Icono de la sesión.
 * @property {Tab[]} tabs Lista de pestañas web de la sesión.
 */

/**
 * @typedef {Object} Config
 * @property {string} version Versión del esquema de configuración.
 * @property {Workspace[]} workspaces Lista de sesiones de trabajo.
 */

export {};
