/**
 * @typedef {Object} Tab
 * @property {string} id Identificador único de la pestaña.
 * @property {string} url URL del sitio web.
 * @property {string} name Nombre visible de la pestaña.
 * @property {string} [icon] Icono o favicon asociado a la pestaña.
 */

/**
 * @typedef {'active-tab' | 'new-window'} OpenBehavior
 * Modo de apertura de una sesión: en la pestaña activa o en una ventana nueva del navegador.
 */

/**
 * @typedef {Object} Workspace
 * @property {string} id Identificador único del workspace.
 * @property {string} name Nombre de la sesión de trabajo.
 * @property {string} [description] Descripción opcional de la sesión.
 * @property {string} [icon] Icono de la sesión.
 * @property {Tab[]} tabs Lista de pestañas web de la sesión.
 * @property {OpenBehavior} [openBehavior] Cómo abrir la sesión al lanzarla. Default `'active-tab'`.
 * @property {string} [browser] Navegador a usar para la sesión. `null`/ausente = heredar el
 * predeterminado global; un id = override fijo que no se modifica ante cambios globales.
 */

/**
 * @typedef {Object} Preferences
 * @property {string} defaultBrowser Navegador predeterminado global. `'system'` deja que el
 * sistema operativo decida; cualquier otro valor es el id de un navegador instalado.
 */

/**
 * @typedef {Object} Config
 * @property {string} version Versión del esquema de configuración.
 * @property {Preferences} preferences Preferencias globales de la aplicación.
 * @property {Workspace[]} workspaces Lista de sesiones de trabajo.
 */

export {};
