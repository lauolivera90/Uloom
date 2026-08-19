/**
 * Diccionario de inglés. Mismo contrato que `es.js`: cada clave es usada por
 * `t()` y los valores admiten strings o plurales `{ one, other }`.
 * @type {Record<string, string | { one: string, other: string }>}
 */
export const en = {
  // common
  'common.cancel': 'Cancel',
  'common.confirm': 'Confirm',
  'common.name': 'Name',
  'common.icon': 'Icon',
  'common.description': 'Description',
  'common.url': 'URL',
  'common.settings': 'Settings',
  'common.delete': 'Delete',
  'common.comingSoon': 'Coming soon',

  // modal
  'modal.close': 'Close',

  // iconPicker
  'iconPicker.label': 'Icon',
  'iconPicker.showAll': 'Show all icons',
  'iconPicker.upload': 'Upload icon',
  'iconPicker.or': 'or',
  'iconPicker.choose': 'Choose one',
  'iconPicker.useSuggested': 'Use suggested icon',

  // sidebar
  'sidebar.sessions': 'Sessions',
  'sidebar.settings': 'Settings',
  'sidebar.expand': 'Expand sidebar',
  'sidebar.collapse': 'Collapse sidebar',
  'sidebar.addSession': 'Add session',

  // labels (constantes de acciones compartidas entre Hub y Detalle)
  'labels.addTab': 'Add tab',
  'labels.saveChanges': 'Save changes',
  'labels.deleteTab': 'Delete tab',
  'labels.export': 'Export',
  'labels.import': 'Import',
  'labels.irreversible': 'This action cannot be undone.',

  // launch
  'launch.system': 'System',
  'launch.systemBrowser': 'System (default)',
  'launch.defaultBrowser': 'Default',
  'launch.emptyTabsTitle': 'Add tabs to be able to launch the session',
  'launch.openBehaviorActiveTab': 'Active tab',
  'launch.openBehaviorNewWindow': 'New window',
  'launch.sessionUndefined': 'Session not defined',

  // workspaceForm
  'workspaceForm.createTitle': 'New session',
  'workspaceForm.editTitle': 'Edit session',
  'workspaceForm.duplicateTitle': 'Duplicate session',
  'workspaceForm.confirmCreate': 'Create session',
  'workspaceForm.confirmDuplicate': 'Duplicate',
  'workspaceForm.namePlaceholder': 'Session name',
  'workspaceForm.descriptionPlaceholder': 'Session description',

  // tabForm
  'tabForm.editTitle': 'Edit tab',
  'tabForm.useSuggestedName': 'Use suggested name',
  'tabForm.namePlaceholder': 'Page name',
  'tabForm.urlPlaceholder': 'https://example.com',
  'tabForm.modeManual': 'Manual',
  'tabForm.modeHistory': 'History',
  'tabForm.confirmMultiple': 'Add selected',
  'tabForm.historyEmpty': 'No tabs in history yet. Add or launch tabs to reuse them here.',

  // workspaceCard
  'workspaceCard.resources': 'Resources',
  'workspaceCard.tabsCount': { one: '1 tab', other: '{count} tabs' },
  'workspaceCard.openSession': 'Open session',

  // hub
  'hub.title': 'Sessions',
  'hub.description': 'Choose a session to open it or create a new one.',
  'hub.createNew': 'Create new session',

  // detail
  'detail.backToHub': 'Back to Hub',
  'detail.notFound': 'Session not found',
  'detail.notFoundDescription': "The session you're looking for doesn't exist or was deleted.",
  'detail.launch': 'Launch',
  'detail.editSession': 'Edit session',
  'detail.duplicateSession': 'Duplicate session',
  'detail.deleteSession': 'Delete session',
  'detail.back': 'Back',
  'detail.resourcesManager': 'Resource manager',
  'detail.add': 'Add',
  'detail.deleteTabConfirm': 'Delete "{name}" from this session?',
  'detail.deleteSessionConfirm': 'Delete "{name}" and all its tabs? {hint}',
  'detail.openBehavior': 'Opening behavior',
  'detail.openBehaviorDescription': 'Defines how tabs open when launching the session.',
  'detail.browser': 'Browser to use',
  'detail.browserDescription': 'Choose the browser its tabs open in.',
  'detail.saveError': 'Could not save the configuration.',
  'detail.exportSession': 'Export this session',
  'detail.exportSessionDescription':
    'Downloads a `.json` file with this session to back it up or share it.',

  // tabList
  'tabList.empty': 'No tabs here',
  'tabList.emptyAction': 'Add some',

  // tabRow
  'tabRow.editTab': 'Edit tab',

  // settings
  'settings.preferences': 'Preferences',
  'settings.sessions': 'Sessions',
  'settings.headerDescription': 'General preferences and portability for your sessions.',
  'settings.searchPlaceholder': 'Search in Settings',
  'settings.noResults': 'No options match your search.',
  'settings.theme': 'Theme',
  'settings.themeDescription': 'Choose your preferred theme.',
  'settings.light': 'Light',
  'settings.dark': 'Dark',
  'settings.palette': 'Color palette',
  'settings.paletteDescription': 'Identity palette for the interface (light and dark).',
  'settings.paletteVioleta': 'Violet',
  'settings.paletteAzul': 'Blue',
  'settings.paletteEsmeralda': 'Emerald',
  'settings.paletteAmbar': 'Amber',
  'settings.paletteRosa': 'Rose',
  'settings.language': 'Language',
  'settings.languageDescription': 'Choose the interface language.',
  'settings.defaultBrowser': 'Default browser',
  'settings.defaultBrowserDescription': 'Browser sessions use when launched.',
  'settings.exportAll': 'Export all',
  'settings.exportAllDescription': 'Downloads a `.json` file with all your sessions.',
  'settings.importDescription': 'Loads a `.json` file and rebuilds your sessions.',
  'settings.clearCache': 'Clear cache',
  'settings.clearCacheDescription': 'Clears the cached favicons of your tabs.',
  'settings.clearHistory': 'Clear tab history',
  'settings.clearHistoryDescription': 'Clears the record of tabs used when adding and launching.',
  'settings.clear': 'Clear',
  'settings.deleteAll': 'Delete all sessions',
  'settings.deleteAllDescription': 'Deletes all your sessions. {hint}',
  'settings.deleteAllButton': 'Delete all',
  'settings.continue': 'Continue',
  'settings.confirmDeleteAll': 'Confirm full deletion',
  'settings.deleteAllDialog1': 'All your sessions will be deleted from the catalog. {hint}',
  'settings.deleteAllDialog2':
    'Are you sure you want to permanently delete all your sessions? {hint}',

  // toast
  'toast.dismiss': 'Dismiss notification',

  // import (portability feedback)
  'import.success': { one: 'Imported {count} session', other: 'Imported {count} sessions' },
  'import.errorInvalidJson': 'The file is not valid JSON.',
  'import.errorNotUloom': 'This is not a Uloom sessions file.',
  'import.errorUnsupportedKind': 'Unrecognized file type.',
  'import.errorInvalidSchema': 'The file does not specify a valid schema version.',
  'import.errorInvalidSessions': 'The file does not contain valid sessions.',
  'import.errorRead': 'The selected file could not be read.',
  'import.errorPersist': 'The imported sessions could not be saved.',
  'import.errorGeneric': 'The file could not be imported.',

  // export
  'export.success': 'Backup exported',
  'export.error': 'The backup could not be exported',
  'exportSession.success': 'Session exported',
  'exportSession.error': 'The session could not be exported',

  // cache
  'cache.success': 'Metadata cache cleared',
  'cache.error': 'The metadata cache could not be cleared',

  // tab history
  'history.clear.success': 'Tab history cleared',
  'history.clear.error': 'The tab history could not be cleared',

  // delete (destructive removals)
  'deleteAll.success': 'All sessions were deleted',
  'deleteAll.error': 'The sessions could not be deleted',
  'deleteTab.error': 'The tab could not be deleted',
  'deleteWorkspace.error': 'The session could not be deleted',

  // launch
  'launch.error': 'The session could not be launched',
  'launch.partialFailure': {
    one: '{failed} tab could not be opened',
    other: '{failed} tabs could not be opened',
  },

  // create / duplicate (creation with a result not visible from the view)
  'create.success': 'Session created',
  'duplicate.success': 'Session duplicated',

  // save / load (general persistence errors)
  'save.error': 'Could not save.',
  'save.preferencesError': 'The default browser could not be saved.',
  'load.error': 'The sessions could not be loaded.',
};