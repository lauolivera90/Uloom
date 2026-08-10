import { useSettings, SETTINGS_SECTION, usePortability } from '../hook/index.js';
import {
  Button,
  ConfirmDialog,
  OptionRow,
  Page,
  PageHeader,
  Select,
  TextInput,
} from '../../../widgets/index.js';
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
  { id: SETTINGS_SECTION.preferences, label: 'Preferencias' },
  { id: SETTINGS_SECTION.sessions, label: 'Sesiones' },
];

/**
 * Página de Configuración: navegador de apartados (Preferencias / Sesiones) con
 * las opciones como datos (`allOptions`) y un buscador en el header que filtra
 * TODAS las opciones de la página por título o descripción, sin importar la
 * sección activa. El navegador predeterminado y las acciones de Sesiones
 * (exportar todo, borrar caché y eliminar todas las sesiones) son funcionales;
 * el tema sigue siendo maqueta (runtime en v0.4.2) y el import es placeholder.
 */
export function SettingsView() {
  const {
    activeSection,
    setActiveSection,
    theme,
    toggleTheme,
    browsers,
    isLoadingBrowsers,
    systemDefaultId,
    defaultBrowser,
    setDefaultBrowser,
    searchQuery,
    setSearchQuery,
  } = useSettings();
  const {
    isExportingAll,
    exportAll,
    isClearingCache,
    clearCache,
    isDeleteOpen,
    isSecondConfirmOpen,
    isDeleting,
    requestDeleteAll,
    cancelDeleteAll,
    confirmFirstStep,
    confirmDeleteAll,
  } = usePortability();
  const isLight = theme === 'light';

  const defaultBrowserOptions = [
    { value: SYSTEM_BROWSER, label: SYSTEM_BROWSER_LABEL },
    ...buildBrowserOptions(browsers),
  ];

  const defaultBrowserIconId =
    defaultBrowser === SYSTEM_BROWSER ? (systemDefaultId ?? SYSTEM_BROWSER) : defaultBrowser;

  const allOptions = [
    {
      section: SETTINGS_SECTION.preferences,
      key: 'theme',
      label: 'Tema',
      description: 'Elige tu tema de preferencia.',
      control: (
        <Button variant="outline" icon={isLight ? 'light_mode' : 'dark_mode'} onClick={toggleTheme}>
          {isLight ? 'Claro' : 'Oscuro'}
        </Button>
      ),
    },
    {
      section: SETTINGS_SECTION.preferences,
      key: 'defaultBrowser',
      label: 'Navegador predeterminado',
      description: 'Navegador que usan las sesiones al lanzarse.',
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
      label: 'Exportar todo',
      description: 'Baja un archivo `.json` con todas tus sesiones.',
      control: (
        <Button variant="outline" icon="download" disabled={isExportingAll} onClick={exportAll}>
          {EXPORT_LABEL}
        </Button>
      ),
    },
    {
      section: SETTINGS_SECTION.sessions,
      key: 'import',
      label: 'Importar',
      description: 'Carga un archivo `.json` y reconstruye tus sesiones.',
      control: <Button variant="outline" icon="upload">{IMPORT_LABEL}</Button>,
    },
    {
      section: SETTINGS_SECTION.sessions,
      key: 'clearCache',
      label: 'Borrar caché',
      description: 'Limpia los favicons cacheados de tus pestañas.',
      control: (
        <Button
          variant="outline"
          icon="cleaning_services"
          disabled={isClearingCache}
          onClick={clearCache}
        >
          Borrar
        </Button>
      ),
    },
    {
      section: SETTINGS_SECTION.sessions,
      key: 'deleteAll',
      label: 'Eliminar todas las sesiones',
      description: `Borra todas tus sesiones. ${IRREVERSIBLE_ACTION_HINT}`,
      control: (
        <Button variant="danger" icon="delete_sweep" onClick={requestDeleteAll}>
          Eliminar todo
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
        title="Configuración"
        description="Preferencias generales y portabilidad de tus sesiones."
        actions={
          <TextInput
            type="search"
            icon="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Buscar en Configuración"
            aria-label="Buscar en Configuración"
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
              {section.label}
            </Button>
          ))}
        </nav>
      )}

      <div className="mt-5 divide-y divide-border/40">
        {visibleOptions.length === 0 ? (
          <p className="py-5 text-sm text-text/60">
            No hay opciones que coincidan con tu búsqueda.
          </p>
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
        title="Eliminar todas las sesiones"
        description={`Se borrarán todas tus sesiones del catálogo. ${IRREVERSIBLE_ACTION_HINT}`}
        confirmLabel="Continuar"
        variant="danger"
        onConfirm={confirmFirstStep}
        onCancel={cancelDeleteAll}
      />
      <ConfirmDialog
        isOpen={isSecondConfirmOpen}
        title="Confirmar eliminación total"
        description={`¿Seguro que querés eliminar de forma definitiva todas tus sesiones? ${IRREVERSIBLE_ACTION_HINT}`}
        confirmLabel="Eliminar todo"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDeleteAll}
        onCancel={cancelDeleteAll}
      />
    </Page>
  );
}
