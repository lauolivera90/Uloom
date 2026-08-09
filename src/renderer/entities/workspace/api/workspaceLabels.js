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