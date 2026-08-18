/**
 * Diccionario de español. Cada clave es usada por `t()` (ver `translate.js`).
 * Los valores pueden ser un string o un objeto `{ one, other }` para plurales,
 * donde `one` se usa con `count === 1` y `other` con el resto (`{count}` se
 * interpola con el parámetro `count`).
 * @type {Record<string, string | { one: string, other: string }>}
 */
export const es = {
  // common
  'common.cancel': 'Cancelar',
  'common.confirm': 'Confirmar',
  'common.name': 'Nombre',
  'common.icon': 'Icono',
  'common.description': 'Descripción',
  'common.url': 'URL',
  'common.settings': 'Configuración',
  'common.delete': 'Eliminar',
  'common.comingSoon': 'Próximamente',

  // modal
  'modal.close': 'Cerrar',

  // iconPicker
  'iconPicker.label': 'Icono',
  'iconPicker.showAll': 'Mostrar todos los iconos',
  'iconPicker.upload': 'Subir icono',
  'iconPicker.or': 'o',
  'iconPicker.choose': 'Elegir uno',
  'iconPicker.useSuggested': 'Usar icono sugerido',

  // sidebar
  'sidebar.sessions': 'Sesiones',
  'sidebar.settings': 'Configuración',
  'sidebar.expand': 'Expandir sidebar',
  'sidebar.collapse': 'Colapsar sidebar',
  'sidebar.addSession': 'Agregar sesión',

  // labels (constantes de acciones compartidas entre Hub y Detalle)
  'labels.addTab': 'Agregar pestaña',
  'labels.saveChanges': 'Guardar cambios',
  'labels.deleteTab': 'Eliminar pestaña',
  'labels.export': 'Exportar',
  'labels.import': 'Importar',
  'labels.irreversible': 'Esta acción no se puede deshacer.',

  // launch
  'launch.system': 'Sistema',
  'launch.systemBrowser': 'Sistema (predeterminado)',
  'launch.defaultBrowser': 'Predeterminado',
  'launch.emptyTabsTitle': 'Agregá pestañas para poder lanzar la sesión',
  'launch.openBehaviorActiveTab': 'Ventana activa',
  'launch.openBehaviorNewWindow': 'Ventana nueva',
  'launch.sessionUndefined': 'Sesión no definida',

  // workspaceForm
  'workspaceForm.createTitle': 'Nueva sesión',
  'workspaceForm.editTitle': 'Editar sesión',
  'workspaceForm.confirmCreate': 'Crear sesión',
  'workspaceForm.namePlaceholder': 'Nombre de la sesión',
  'workspaceForm.descriptionPlaceholder': 'Descripción de la sesión',

  // tabForm
  'tabForm.editTitle': 'Editar pestaña',
  'tabForm.useSuggestedName': 'Usar nombre sugerido',
  'tabForm.namePlaceholder': 'Nombre de la página',
  'tabForm.urlPlaceholder': 'https://ejemplo.com',

  // workspaceCard
  'workspaceCard.resources': 'Recursos',
  'workspaceCard.tabsCount': { one: '1 pestaña', other: '{count} pestañas' },
  'workspaceCard.openSession': 'Abrir sesión',

  // hub
  'hub.title': 'Sesiones',
  'hub.description': 'Elegí una sesión para abrirla o creá una nueva.',
  'hub.createNew': 'Crear nueva sesión',

  // detail
  'detail.backToHub': 'Volver al Hub',
  'detail.notFound': 'Sesión no encontrada',
  'detail.notFoundDescription': 'La sesión que buscás no existe o fue eliminada.',
  'detail.launch': 'Lanzar',
  'detail.editSession': 'Editar sesión',
  'detail.deleteSession': 'Eliminar sesión',
  'detail.back': 'Volver',
  'detail.resourcesManager': 'Administrador de recursos',
  'detail.add': 'Agregar',
  'detail.deleteTabConfirm': '¿Eliminar "{name}" de esta sesión?',
  'detail.deleteSessionConfirm': '¿Eliminar "{name}" y todas sus pestañas? {hint}',
  'detail.openBehavior': 'Comportamiento de apertura',
  'detail.openBehaviorDescription': 'Define cómo se abren las pestañas al lanzar la sesión.',
  'detail.browser': 'Navegador de uso',
  'detail.browserDescription': 'Elige el navegador en el que se abren sus pestañas.',
  'detail.saveError': 'No se pudo guardar la configuración.',
  'detail.exportSession': 'Exportar esta sesión',
  'detail.exportSessionDescription':
    'Baja un archivo `.json` con esta sesión para respaldarla o compartirla.',

  // tabList
  'tabList.empty': 'Sin pestañas aquí',
  'tabList.emptyAction': 'Agrega algunas',

  // tabRow
  'tabRow.editTab': 'Editar pestaña',

  // settings
  'settings.preferences': 'Preferencias',
  'settings.sessions': 'Sesiones',
  'settings.headerDescription': 'Preferencias generales y portabilidad de tus sesiones.',
  'settings.searchPlaceholder': 'Buscar en Configuración',
  'settings.noResults': 'No hay opciones que coincidan con tu búsqueda.',
  'settings.theme': 'Tema',
  'settings.themeDescription': 'Elige tu tema de preferencia.',
  'settings.light': 'Claro',
  'settings.dark': 'Oscuro',
  'settings.palette': 'Paleta de colores',
  'settings.paletteDescription': 'Paleta de identidad de la interfaz (claro y oscuro).',
  'settings.paletteVioleta': 'Violeta',
  'settings.paletteAzul': 'Azul',
  'settings.paletteEsmeralda': 'Esmeralda',
  'settings.paletteAmbar': 'Ámbar',
  'settings.paletteRosa': 'Rosa',
  'settings.language': 'Idioma',
  'settings.languageDescription': 'Elige el idioma de la interfaz.',
  'settings.defaultBrowser': 'Navegador predeterminado',
  'settings.defaultBrowserDescription': 'Navegador que usan las sesiones al lanzarse.',
  'settings.exportAll': 'Exportar todo',
  'settings.exportAllDescription': 'Baja un archivo `.json` con todas tus sesiones.',
  'settings.importDescription': 'Carga un archivo `.json` y reconstruye tus sesiones.',
  'settings.clearCache': 'Borrar caché',
  'settings.clearCacheDescription': 'Limpia los favicons cacheados de tus pestañas.',
  'settings.clear': 'Borrar',
  'settings.deleteAll': 'Eliminar todas las sesiones',
  'settings.deleteAllDescription': 'Borra todas tus sesiones. {hint}',
  'settings.deleteAllButton': 'Eliminar todo',
  'settings.continue': 'Continuar',
  'settings.confirmDeleteAll': 'Confirmar eliminación total',
  'settings.deleteAllDialog1': 'Se borrarán todas tus sesiones del catálogo. {hint}',
  'settings.deleteAllDialog2':
    '¿Seguro que querés eliminar de forma definitiva todas tus sesiones? {hint}',

  // toast
  'toast.dismiss': 'Cerrar notificación',

  // import (feedback de portabilidad)
  'import.success': { one: 'Se importó {count} sesión', other: 'Se importaron {count} sesiones' },
  'import.errorInvalidJson': 'El archivo no es un JSON válido.',
  'import.errorNotUloom': 'No es un archivo de sesiones de Uloom.',
  'import.errorUnsupportedKind': 'Tipo de archivo no reconocido.',
  'import.errorInvalidSchema': 'El archivo no indica una versión de esquema válida.',
  'import.errorInvalidSessions': 'El archivo no contiene sesiones válidas.',
  'import.errorRead': 'No se pudo leer el archivo seleccionado.',
  'import.errorPersist': 'No se pudieron guardar las sesiones importadas.',
  'import.errorGeneric': 'No se pudo importar el archivo.',

  // export
  'export.success': 'Respaldo exportado',
  'export.error': 'No se pudo exportar el respaldo',
  'exportSession.success': 'Sesión exportada',
  'exportSession.error': 'No se pudo exportar la sesión',

  // cache
  'cache.success': 'Caché de metadatos borrada',
  'cache.error': 'No se pudo borrar la caché de metadatos',

  // delete (bajas destructivas)
  'deleteAll.success': 'Todas las sesiones fueron eliminadas',
  'deleteAll.error': 'No se pudieron eliminar las sesiones',
  'deleteTab.error': 'No se pudo eliminar la pestaña',
  'deleteWorkspace.error': 'No se pudo eliminar la sesión',

  // launch
  'launch.error': 'No se pudo lanzar la sesión',
  'launch.partialFailure': {
    one: '{failed} pestaña no se pudo abrir',
    other: '{failed} pestañas no se pudieron abrir',
  },

  // save / load (errores de persistencia generales)
  'save.error': 'No se pudo guardar.',
  'save.preferencesError': 'No se pudo guardar el navegador predeterminado.',
  'load.error': 'No se pudieron cargar las sesiones.',
};