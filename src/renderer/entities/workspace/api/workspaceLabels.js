/**
 * Etiquetas de UI de acciones de sesión/pestaña compartidas entre Hub y Detalle
 * (rules.md §9: no duplicar strings entre archivos). Viven en el dominio
 * workspace para que los consumidores entren por el barrel.
 */

/** Acción de alta de una pestaña (botón card, botón header, botón del modal). */
export const ADD_TAB_LABEL = 'Agregar pestaña';

/** Acción de confirmar la edición de una sesión o pestaña. */
export const SAVE_CHANGES_LABEL = 'Guardar cambios';

/** Acción de baja de una pestaña (label de icono y título del confirm). */
export const DELETE_TAB_LABEL = 'Eliminar pestaña';

/** Acción de bajar una sesión o el respaldo completo como archivo `.json`. */
export const EXPORT_LABEL = 'Exportar';

/** Acción de importar sesiones desde un archivo `.json` (placeholder en v0.4.1). */
export const IMPORT_LABEL = 'Importar';

/** Advertencia de que una acción destructiva no se puede deshacer. */
export const IRREVERSIBLE_ACTION_HINT = 'Esta acción no se puede deshacer.';