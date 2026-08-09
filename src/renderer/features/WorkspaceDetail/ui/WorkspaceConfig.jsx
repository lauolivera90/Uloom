import { OptionRow, Select } from '../../../widgets/index.js';
import { OPEN_BEHAVIORS, buildBrowserOptions, BrowserIcon } from '../../../entities/workspace/index.js';

/**
 * Configuración de lanzamiento de una sesión (card "Configuración" del Detalle):
 * comportamiento de apertura y navegador de uso, ambos con guardado inmediato.
 * Presentacional: recibe valores y callbacks, no llama hooks ni persiste. Las
 * filas se definen como datos (sessionConfig) para editar una opción sin tocar el JSX.
 * @param {{
 *   browsers: Array<{ id: string, name: string }>,
 *   isLoadingBrowsers: boolean,
 *   openBehavior: string,
 *   browserOverride: string,
 *   resolvedBrowserLabel: string,
 *   resolvedBrowserId: string | null,
 *   onOpenBehaviorChange: (value: string) => void,
 *   onBrowserChange: (value: string) => void,
 *   isSaving: boolean,
 *   error: string | null,
 * }} props
 */
export function WorkspaceConfig({
  browsers,
  isLoadingBrowsers,
  openBehavior,
  browserOverride,
  resolvedBrowserLabel,
  resolvedBrowserId,
  onOpenBehaviorChange,
  onBrowserChange,
  isSaving,
  error,
}) {
  const browserOptions = buildBrowserOptions(browsers);

  const sessionConfig = [
    {
      key: 'openBehavior',
      label: 'Comportamiento de apertura',
      description: 'Define cómo se abren las pestañas al lanzar la sesión.',
      value: openBehavior,
      options: OPEN_BEHAVIORS,
      disabled: isSaving,
      onChange: onOpenBehaviorChange,
    },
    {
      key: 'browser',
      label: 'Navegador de uso',
      description: 'Elige el navegador en el que se abren sus pestañas.',
      control: (
        <div className="flex items-center gap-2">
          <BrowserIcon browserId={resolvedBrowserId} />
          <Select
            value={browserOverride}
            options={browserOptions}
            placeholder={resolvedBrowserLabel}
            disabled={isSaving || isLoadingBrowsers}
            onChange={(event) => onBrowserChange(event.target.value)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col divide-y divide-border/40">
      {sessionConfig.map((item) => (
        <OptionRow
          key={item.key}
          label={item.label}
          description={item.description}
          control={
            item.control ?? (
              <Select
                value={item.value}
                options={item.options}
                placeholder={item.placeholder}
                disabled={item.disabled}
                onChange={(event) => item.onChange(event.target.value)}
              />
            )
          }
        />
      ))}
      {error && <p className="text-sm text-error pt-4">{error}</p>}
    </div>
  );
}