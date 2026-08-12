import { useState } from 'react';
import { useWorkspaces } from '../../../app/index.js';
import { useI18n } from '../../../shared/index.js';
import {
  useInstalledBrowsers,
  useSystemDefaultBrowser,
  SYSTEM_BROWSER,
  DEFAULT_BROWSER_LABEL,
  getBrowserNameById,
} from '../../../entities/workspace/index.js';

/**
 * Configuración de lanzamiento de una sesión: comportamiento de apertura (ventana
 * activa / nueva) y navegador de uso (heredar el predeterminado global o un
 * navegador específico como override fijo). Cada cambio se persiste de forma
 * pesimista a través del líder único de escritura del estado global
 * (`mutateWorkspace`), que serializa las escrituras y parte del último workspace
 * persistido; si falla, se expone el error sin optimismo. La UI queda deshabilitada
 * mientras se guarda. También resuelve el valor efectivo del "Predeterminado"
 * (qué navegador global representa) para la etiqueta del Select.
 * @param {string} [workspaceId]
 * @param {import('../../../shared/types.js').Workspace | null} workspace
 * @returns {{
 *   browsers: Array<{ id: string, name: string }>,
 *   isLoadingBrowsers: boolean,
 *   openBehavior: import('../../../shared/types.js').OpenBehavior,
 *   browser: string,
 *   resolvedBrowserLabel: string,
 *   resolvedBrowserId: string | null,
 *   setOpenBehavior: (value: import('../../../shared/types.js').OpenBehavior) => Promise<void>,
 *   setBrowser: (value: string) => Promise<void>,
 *   isSaving: boolean,
 *   error: string | null,
 * }}
 */
export function useSessionConfig(workspaceId, workspace) {
  const { mutateWorkspace, preferences } = useWorkspaces();
  const { t } = useI18n();
  const { browsers, isLoading: isLoadingBrowsers } = useInstalledBrowsers();
  const { systemDefaultId, systemDefaultName } = useSystemDefaultBrowser();

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const openBehavior = workspace?.openBehavior ?? 'active-tab';
  const browserOverride = workspace?.browser ? workspace.browser : null;
  const globalDefault = preferences?.defaultBrowser ?? SYSTEM_BROWSER;

  const persist = (mutator) => {
    if (!workspaceId) return;
    setIsSaving(true);
    setError(null);
    return mutateWorkspace(workspaceId, mutator).catch((err) => {
      console.error('Error al persistir la configuración de sesión:', err);
      setError(t('detail.saveError'));
    }).finally(() => setIsSaving(false));
  };

  const setOpenBehavior = (value) =>
    persist((base) => ({ ...base, openBehavior: value }));

  const setBrowser = (value) => {
    const next = value ? value : null;
    return persist((base) => ({ ...base, browser: next }));
  };

  const defaultLabel = t(DEFAULT_BROWSER_LABEL);
  const systemLabel = t('launch.system');

  const resolvedBrowserLabel = isLoadingBrowsers
    ? defaultLabel
    : globalDefault === SYSTEM_BROWSER
      ? systemDefaultId
        ? `${defaultLabel} (${systemDefaultName ?? getBrowserNameById(systemDefaultId, browsers)})`
        : `${defaultLabel} (${systemLabel})`
      : `${defaultLabel} (${getBrowserNameById(globalDefault, browsers)})`;

  const resolvedBrowserId = browserOverride ?? (globalDefault === SYSTEM_BROWSER ? (systemDefaultId ?? null) : globalDefault);

  return {
    browsers,
    isLoadingBrowsers,
    openBehavior,
    browser: browserOverride ?? '',
    resolvedBrowserLabel,
    resolvedBrowserId,
    setOpenBehavior,
    setBrowser,
    isSaving,
    error,
  };
}