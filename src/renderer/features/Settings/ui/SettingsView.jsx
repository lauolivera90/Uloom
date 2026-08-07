import { useSettings, SETTINGS_SECTION } from '../hook/index.js';
import { Button, OptionRow, Select } from '../../../widgets/index.js';
import {
  SYSTEM_BROWSER,
  SYSTEM_BROWSER_LABEL,
  buildBrowserOptions,
} from '../../../entities/workspace/index.js';

const SECTIONS = [
  { id: SETTINGS_SECTION.preferences, label: 'Preferencias' },
  { id: SETTINGS_SECTION.sessions, label: 'Sesiones' },
];

/**
 * Página de Configuración en fase de maqueta (v0.1.4): navegador de apartados
 * (Preferencias / Sesiones) y listas de opciones con separadores. El navegador
 * predeterminado es funcional (persiste al global); el tema y exportar/importar
 * siguen siendo placeholders sin handler real.
 */
export function SettingsView() {
  const {
    activeSection,
    setActiveSection,
    theme,
    toggleTheme,
    browsers,
    isLoadingBrowsers,
    defaultBrowser,
    setDefaultBrowser,
  } = useSettings();
  const isLight = theme === 'light';

  const defaultBrowserOptions = [
    { value: SYSTEM_BROWSER, label: SYSTEM_BROWSER_LABEL },
    ...buildBrowserOptions(browsers),
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <header>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-text">Configuración</h1>
          <p className="text-sm text-text/60">
            Preferencias generales y portabilidad de tus sesiones.
          </p>
        </div>
      </header>

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

      <div className="mt-5 divide-y divide-border/40">
        {activeSection === SETTINGS_SECTION.preferences ? (
          <>
            <OptionRow
              label="Tema"
              description="Elige tu tema de preferencia."
              control={
                <Button variant="outline" icon={isLight ? 'light_mode' : 'dark_mode'} onClick={toggleTheme}>
                  {isLight ? 'Claro' : 'Oscuro'}
                </Button>
              }
            />
            <OptionRow
              label="Navegador predeterminado"
              description="Navegador que usan las sesiones al lanzarse."
              control={
                <Select
                  value={defaultBrowser}
                  disabled={isLoadingBrowsers}
                  onChange={(event) => setDefaultBrowser(event.target.value)}
                  options={defaultBrowserOptions}
                />
              }
            />
          </>
        ) : (
          <>
            <OptionRow
              label="Exportar todo"
              description="Baja un archivo `.json` con todas tus sesiones."
              control={<Button variant="outline" icon="upload" aria-label="Exportar todo" />}
            />
            <OptionRow
              label="Importar"
              description="Carga un archivo `.json` y reconstruye tus sesiones."
              control={<Button variant="outline" icon="download" aria-label="Importar" />}
            />
          </>
        )}
      </div>
    </div>
  );
}