/**
 * Claves de UI de acciones de sesión/pestaña compartidas entre Hub y Detalle
 * (rules.md §9: no duplicar strings entre archivos). Viven en el dominio
 * workspace para que los consumidores entren por el barrel; el valor textual lo
 * resuelve cada consumidor con `t(clave)` desde `shared/lib/i18n` (v0.4.3).
 */

/** Acción de alta de una pestaña (botón card, botón header, botón del modal). */
export const ADD_TAB_LABEL = 'labels.addTab';

/** Acción de confirmar la edición de una sesión o pestaña. */
export const SAVE_CHANGES_LABEL = 'labels.saveChanges';

/** Acción de baja de una pestaña (label de icono y título del confirm). */
export const DELETE_TAB_LABEL = 'labels.deleteTab';

/** Acción de bajar una sesión o el respaldo completo como archivo `.json`. */
export const EXPORT_LABEL = 'labels.export';

/** Acción de importar sesiones desde un archivo `.json`. */
export const IMPORT_LABEL = 'labels.import';

/** Advertencia de que una acción destructiva no se puede deshacer. */
export const IRREVERSIBLE_ACTION_HINT = 'labels.irreversible';