/**
 * @typedef {Object} Tab
 * @property {string} id Identificador único de la pestaña.
 * @property {string} url URL del sitio web.
 * @property {string} name Nombre visible de la pestaña.
 * @property {string} [icon] Icono de la pestaña: símbolo del catálogo Material Symbols
 * o data URL. Puede venir también como favicon remoto http(s) en configs viejas.
 * @property {string} [favicon] Favicon del sitio como data URL, cacheado por el fetch de
 * metadatos (`page:metadata`). Solo se actualiza al ejecutarse un fetch nuevo; una elección
 * manual de `icon` no lo pisa.
 */

/**
 * @typedef {'active-tab' | 'new-window'} OpenBehavior
 * Modo de apertura de una sesión: en la pestaña activa o en una ventana nueva del navegador.
 */

/**
 * @typedef {'es' | 'en'} Language
 * Idioma de la interfaz soportado por la app.
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
 * @property {boolean} [pinned] Si la sesión está fijada (favorito): aparece primero en el Hub.
 * Default `false`. No se copia al duplicar una sesión (el clon arranca desfijado).
 */

/**
 * @typedef {Object} Preferences
 * @property {string} defaultBrowser Navegador predeterminado global. `'system'` deja que el
 * sistema operativo decida; cualquier otro valor es el id de un navegador instalado.
 */

/**
 * @typedef {Object} TabHistoryEntry
 * Entrada del historial de pestañas usadas: registro liviano de tabs agregadas o
 * lanzadas, separado de las sesiones (reuso en el modal de agregar pestaña).
 * @property {string} url URL normalizada de la pestaña (clave de unicidad).
 * @property {string} name Nombre visible guardado al registrar la pestaña.
 * @property {string} [icon] Icono manual de la pestaña (símbolo del catálogo o data URL).
 * @property {string} [favicon] Favicon cacheado como data URL (si estaba disponible al registrar).
 * @property {number} count Cantidad de veces que se usó (agregada o lanzada).
 * @property {string} lastUsedAt Última vez que se usó, en ISO 8601.
 */

/**
 * @typedef {Object} Config
 * @property {string} version Versión del esquema de configuración.
 * @property {Preferences} preferences Preferencias globales de la aplicación.
 * @property {Workspace[]} workspaces Lista de sesiones de trabajo.
 * @property {TabHistoryEntry[]} [tabHistory] Historial de pestañas usadas (v0.5.4).
 */

export {};
