import { useSettings, SETTINGS_SECTION, usePortability } from '../hook/index.js';
import {
  Button,
  ConfirmDialog,
  OptionRow,
  Page,
  PageHeader,
  PalettePicker,
  Select,
  TextInput,
} from '../../../widgets/index.js';
import { useI18n, SUPPORTED_LANGUAGES, PALETTES } from '../../../shared/index.js';
import {
  SYSTEM_BROWSER,
  SYSTEM_BROWSER_LABEL,
  buildBrowserOptions,
  BrowserIcon,
  EXPORT_LABEL,
  IMPORT_LABEL,
  IRREVERSIBLE_ACTION_HINT,
} from '../../../entities/workspace/index.js';

const SECTIONS = [
  { id: SETTINGS_SECTION.preferences, labelKey: 'settings.preferences' },
  { id: SETTINGS_SECTION.sessions, labelKey: 'settings.sessions' },
];

/**
 * Página de Configuración: navegador de apartados (Preferencias / Sesiones) con
 * las opciones como datos (`allOptions`) y un buscador en el header que filtra
 * TODAS las opciones de la página por título o descripción, sin importar la
 * sección activa. El idioma (selector global con persistencia en localStorage),
 * el tema (toggle global con runtime), el navegador predeterminado y las
 * acciones de Sesiones (importar, exportar todo, borrar caché y eliminar todas
 * las sesiones) son funcionales.
 */
export function SettingsView() {
  const { t } = useI18n();
  const {
    activeSection,
    setActiveSection,
    theme,
    toggleTheme,
    palette,
    setPalette,
    language,
    setLanguage,
    browsers,
    isLoadingBrowsers,
    systemDefaultId,
    defaultBrowser,
    setDefaultBrowser,
    searchQuery,
    setSearchQuery,
  } = useSettings();
  const {
    isImporting,
    importSessions,
    isExportingAll,
    exportAll,
    isClearingCache,
    clearCache,
    isClearingHistory,
    clearHistory,
    isDeleteOpen,
    isSecondConfirmOpen,
    isDeleting,
    requestDeleteAll,
    cancelDeleteAll,
    confirmFirstStep,
    confirmDeleteAll,
  } = usePortability();
  const isLight = theme === 'light';

  const languageOptions = SUPPORTED_LANGUAGES.map((code) => ({
    value: code,
    label: code === 'es' ? 'Español' : 'English',
  }));

  const defaultBrowserOptions = [
    { value: SYSTEM_BROWSER, label: t(SYSTEM_BROWSER_LABEL) },
    ...buildBrowserOptions(browsers),
  ];

  const defaultBrowserIconId =
    defaultBrowser === SYSTEM_BROWSER ? (systemDefaultId ?? SYSTEM_BROWSER) : defaultBrowser;

  const paletteOptions = PALETTES.map((palette) => ({
    id: palette.id,
    label: t(palette.labelKey),
  }));

  const allOptions = [
    {
      section: SETTINGS_SECTION.preferences,
      key: 'language',
      label: t('settings.language'),
      description: t('settings.languageDescription'),
      control: (
        <Select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          options={languageOptions}
        />
      ),
    },
    {
      section: SETTINGS_SECTION.preferences,
      key: 'theme',
      label: t('settings.theme'),
      description: t('settings.themeDescription'),
      control: (
        <Button variant="outline" icon={isLight ? 'light_mode' : 'dark_mode'} onClick={toggleTheme}>
          {isLight ? t('settings.light') : t('settings.dark')}
        </Button>
      ),
    },
    {
      section: SETTINGS_SECTION.preferences,
      key: 'palette',
      label: t('settings.palette'),
      description: t('settings.paletteDescription'),
      control: (
        <PalettePicker
          label={t('settings.palette')}
          palettes={paletteOptions}
          value={palette}
          onChange={setPalette}
        />
      ),
    },
    {
      section: SETTINGS_SECTION.preferences,
      key: 'defaultBrowser',
      label: t('settings.defaultBrowser'),
      description: t('settings.defaultBrowserDescription'),
      control: (
        <div className="flex items-center gap-2">
          <BrowserIcon browserId={defaultBrowserIconId} />
          <Select
            value={defaultBrowser}
            disabled={isLoadingBrowsers}
            onChange={(event) => setDefaultBrowser(event.target.value)}
            options={defaultBrowserOptions}
          />
        </div>
      ),
    },
    {
      section: SETTINGS_SECTION.sessions,
      key: 'exportAll',
      label: t('settings.exportAll'),
      description: t('settings.exportAllDescription'),
      control: (
        <Button variant="outline" icon="download" disabled={isExportingAll} onClick={exportAll}>
          {t(EXPORT_LABEL)}
        </Button>
      ),
    },
    {
      section: SETTINGS_SECTION.sessions,
      key: 'import',
      label: t(IMPORT_LABEL),
      description: t('settings.importDescription'),
      control: (
        <Button variant="outline" icon="upload" disabled={isImporting} onClick={importSessions}>
          {t(IMPORT_LABEL)}
        </Button>
      ),
    },
    {
      section: SETTINGS_SECTION.sessions,
      key: 'clearCache',
      label: t('settings.clearCache'),
      description: t('settings.clearCacheDescription'),
      control: (
        <Button
          variant="outline"
          icon="cleaning_services"
          disabled={isClearingCache}
          onClick={clearCache}
        >
          {t('settings.clear')}
        </Button>
      ),
    },
    {
      section: SETTINGS_SECTION.sessions,
      key: 'clearHistory',
      label: t('settings.clearHistory'),
      description: t('settings.clearHistoryDescription'),
      control: (
        <Button
          variant="outline"
          icon="history"
          disabled={isClearingHistory}
          onClick={clearHistory}
        >
          {t('settings.clear')}
        </Button>
      ),
    },
    {
      section: SETTINGS_SECTION.sessions,
      key: 'deleteAll',
      label: t('settings.deleteAll'),
      description: t('settings.deleteAllDescription', { hint: t(IRREVERSIBLE_ACTION_HINT) }),
      control: (
        <Button variant="danger" icon="delete_sweep" onClick={requestDeleteAll}>
          {t('settings.deleteAllButton')}
        </Button>
      ),
    },
  ];

  const query = searchQuery.trim().toLowerCase();
  const visibleOptions = query
    ? allOptions.filter(
        (option) =>
          option.label.toLowerCase().includes(query) ||
          option.description.toLowerCase().includes(query),
      )
    : allOptions.filter((option) => option.section === activeSection);

  return (
    <Page>
      <PageHeader
        title={t('common.settings')}
        description={t('settings.headerDescription')}
        actions={
          <TextInput
            type="search"
            icon="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t('settings.searchPlaceholder')}
            aria-label={t('settings.searchPlaceholder')}
            className="w-64"
          />
        }
      />

      {!query && (
        <nav className="flex gap-2">
          {SECTIONS.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? 'primary' : 'ghost'}
              onClick={() => setActiveSection(section.id)}
            >
              {t(section.labelKey)}
            </Button>
          ))}
        </nav>
      )}

      <div className="mt-5 divide-y divide-border/40">
        {visibleOptions.length === 0 ? (
          <p className="py-5 text-sm text-text/60">{t('settings.noResults')}</p>
        ) : (
          visibleOptions.map((option) => (
            <OptionRow
              key={option.key}
              label={option.label}
              description={option.description}
              control={option.control}
            />
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title={t('settings.deleteAll')}
        description={t('settings.deleteAllDialog1', { hint: t(IRREVERSIBLE_ACTION_HINT) })}
        confirmLabel={t('settings.continue')}
        variant="danger"
        onConfirm={confirmFirstStep}
        onCancel={cancelDeleteAll}
      />
      <ConfirmDialog
        isOpen={isSecondConfirmOpen}
        title={t('settings.confirmDeleteAll')}
        description={t('settings.deleteAllDialog2', { hint: t(IRREVERSIBLE_ACTION_HINT) })}
        confirmLabel={t('settings.deleteAllButton')}
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDeleteAll}
        onCancel={cancelDeleteAll}
      />
    </Page>
  );
}