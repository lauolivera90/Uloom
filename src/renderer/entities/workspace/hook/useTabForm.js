import { useCallback, useEffect, useRef, useState } from 'react';
import { getHostname, isCatalogIcon, useIconPicker } from '../../../shared/index.js';
import {
  getPageMetadata,
  WORKSPACE_ICONS,
  WORKSPACE_ICON_PREVIEW_COUNT,
} from '../api/index.js';

function normalizeUrl(value) {
  const trimmed = value.trim();
  if (trimmed === '') return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/**
 * @typedef {Object} TabFormState
 * Estado del formulario de alta/edición de pestaña retornado por `useTabForm`.
 * @property {string} url URL a normalizar (obligatoria y válida).
 * @property {(value: string) => void} setUrl Actualiza la URL.
 * @property {string} name Nombre de la pestaña.
 * @property {(value: string) => void} setName Actualiza el nombre.
 * @property {string | null} selectedIcon Ícono del catálogo a resaltar en el picker (null si no matchea ninguno).
 * @property {(icon: string) => void} selectIcon Elige un icono manual y cierra el picker.
 * @property {boolean} showPicker Indica si el selector de icono está visible.
 * @property {() => void} toggleShowPicker Muestra/oculta el selector de iconos.
 * @property {boolean} showAllIcons Indica si el selector muestra todos los iconos.
 * @property {() => void} toggleShowAllIcons Expande/contrae la grilla de iconos.
 * @property {string[]} visibleIcons Iconos visibles según la expansión.
 * @property {boolean} isUrlValid Valida que la URL sea parseable.
 * @property {string} suggestedName Título real del sitio (sugerencia para el campo Nombre).
 * @property {string} autoFavicon Favicon del sitio como data URL (cache de `page:metadata`).
 * @property {string} previewIcon Icono a mostrar: la elección manual o el favicon/default.
 * @property {boolean} showSuggestionSwap Indica si mostrar "Usar nombre sugerido".
 * @property {() => void} useSuggestedName Aplica el nombre sugerido al campo Nombre.
 * @property {boolean} showSuggestedIcon Indica si hay favicon disponible y el icono actual no lo usa (mostrar "Usar icono sugerido").
 * @property {() => void} useSuggestedIcon Aplica el favicon del sitio como icono (descarta la elección manual).
 * @property {() => Promise<void>} submit Persiste la pestaña y resetea el form.
 * @property {() => void} reset Resetea el form (submit o cancelar).
 */

/**
 * Estado del formulario de pestaña, usado para alta (con `initialTab: null`) y
 * edición (con el objeto a editar). La URL es obligatoria y se normaliza (prefijo
 * https:// si falta). Mientras la URL es válida se consultan los metadatos web
 * (debaiteado 400ms, con flag de cancelación): el `<title>` real va a la sugerencia
 * de nombre (placeholder + botón swap) y el favicon a `autoFavicon` (data URL),
 * cache persistido en `Tab.favicon` por si se reabre la edición sin red.
 *
 * El icono tiene dos fuentes: una elección manual del catálogo (`manualIcon`,
 * nunca pisada por el autofetch) y el default real del sitio (`autoFavicon ?? 'public'`).
 * El resaltado del picker es **derivado** (fuente de verdad única): `manualIcon`
 * solo cuando está activo y no es el default; si el tab venía con favicon (data
 * URL/http) o sin icono, no se resalta ningún slot del catálogo.
 *
 * El favicon y la sugerencia se guardan como snapshot con la URL que los produjo:
 * solo se muestran si la URL del form aún coincide (invalida el cache al cambiar
 * la URL, sin necesidad de limpiarlo a mano).
 * @param {{
 *   initialTab?: import('../../../shared/types.js').Tab | null,
 *   onSubmit: (tab: import('../../../shared/types.js').Tab) => Promise<void>,
 * }} props
 * @returns {TabFormState}
 */
export function useTabForm({ initialTab = null, onSubmit }) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [isIconManual, setIsIconManual] = useState(false);
  const [manualIcon, setManualIcon] = useState('');
  const [metadata, setMetadata] = useState({ url: null, title: null, favicon: null });
  const skipNextFetchRef = useRef(false);
  const previousIdRef = useRef(null);

  const highlightIcon = isIconManual && manualIcon !== 'public' ? manualIcon : null;
  const selectIcon = useCallback(
    (icon) => {
      setManualIcon(icon);
      setIsIconManual(true);
    },
    [],
  );
  const picker = useIconPicker({
    icons: WORKSPACE_ICONS,
    previewCount: WORKSPACE_ICON_PREVIEW_COUNT,
    selected: highlightIcon,
    onSelect: selectIcon,
  });
  const { reset: resetPicker, showPicker, toggleShowPicker, selectIcon: pickerSelectIcon, showAllIcons, toggleShowAllIcons, visibleIcons, ensureVisible } = picker;

  const syncInitial = useCallback(
    (tab) => {
      const catalogIcon = tab?.icon && isCatalogIcon(tab.icon) && tab.icon !== 'public' ? tab.icon : null;
      setUrl(tab?.url ?? '');
      setName(tab?.name ?? '');
      resetPicker();
      setIsIconManual(Boolean(catalogIcon));
      setManualIcon(catalogIcon ?? '');
      setMetadata({
        url: tab?.favicon ? normalizeUrl(tab.url ?? '') : null,
        title: null,
        favicon: tab?.favicon ?? null,
      });
      skipNextFetchRef.current = Boolean(tab?.favicon && normalizeUrl(tab.url ?? ''));
      if (catalogIcon) {
        ensureVisible(catalogIcon);
      }
    },
    [resetPicker, ensureVisible],
  );

  useEffect(() => {
    const currentId = initialTab?.id ?? null;
    if (currentId === previousIdRef.current) {
      return;
    }
    previousIdRef.current = currentId;
    syncInitial(initialTab);
  }, [initialTab, syncInitial]);

  const isUrlValid = getHostname(normalizeUrl(url)) !== null;
  const normalizedUrl = normalizeUrl(url);

  useEffect(() => {
    if (!isUrlValid || normalizedUrl === '') {
      return;
    }
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const result = await getPageMetadata(normalizedUrl);
        if (cancelled) return;
        setMetadata({ url: normalizedUrl, title: result.title, favicon: result.favicon });
      } catch (error) {
        console.error(`Error al obtener metadatos de "${normalizedUrl}":`, error);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isUrlValid, normalizedUrl]);

  const reset = useCallback(() => {
    syncInitial(initialTab);
  }, [syncInitial, initialTab]);

  const metadataMatches = normalizedUrl !== '' && metadata.url === normalizedUrl;
  const suggestedName = metadataMatches ? metadata.title : null;
  const autoFavicon = metadataMatches ? metadata.favicon : null;

  const defaultIcon = autoFavicon ?? 'public';
  const previewIcon = isIconManual ? manualIcon : defaultIcon;
  const useSuggestedIcon = useCallback(() => {
    setIsIconManual(false);
    resetPicker();
  }, [resetPicker]);
  const showSuggestedIcon = autoFavicon !== null && isIconManual;

  const showSuggestionSwap = name.trim() !== '' && suggestedName !== null && name.trim() !== suggestedName;
  const useSuggestedName = useCallback(() => {
    if (suggestedName !== null) setName(suggestedName);
  }, [suggestedName]);

  const submit = useCallback(async () => {
    if (!isUrlValid) return;
    const finalName = name.trim() || suggestedName || getHostname(normalizedUrl);
    const icon = isIconManual && manualIcon !== 'public' ? manualIcon : undefined;
    await onSubmit({
      id: initialTab?.id ?? `tab-${Date.now()}`,
      url: normalizedUrl,
      name: finalName,
      icon,
      favicon: autoFavicon || undefined,
    });
    reset();
  }, [isUrlValid, name, suggestedName, normalizedUrl, isIconManual, manualIcon, autoFavicon, initialTab, onSubmit, reset]);

  return {
    url,
    setUrl,
    name,
    setName,
    selectedIcon: highlightIcon,
    selectIcon: pickerSelectIcon,
    showPicker,
    toggleShowPicker,
    showAllIcons,
    toggleShowAllIcons,
    visibleIcons,
    isUrlValid,
    suggestedName,
    autoFavicon,
    previewIcon,
    showSuggestionSwap,
    useSuggestedName,
    showSuggestedIcon,
    useSuggestedIcon,
    submit,
    reset,
  };
}