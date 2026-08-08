import { useCallback, useState } from 'react';
import { useIconPicker } from '../../../shared/index.js';
import { WORKSPACE_ICONS, WORKSPACE_ICON_PREVIEW_COUNT } from '../../../entities/workspace/index.js';

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function normalizeUrl(value) {
  const trimmed = value.trim();
  if (trimmed === '') return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/**
 * @typedef {Object} AddTabFormState
 * Estado del formulario de agregar pestaña retornado por `useAddTabForm`.
 * @property {string} url URL a normalizar (obligatoria y válida).
 * @property {(value: string) => void} setUrl Actualiza la URL.
 * @property {string} name Nombre sugerido de la pestaña.
 * @property {(value: string) => void} setName Actualiza el nombre.
 * @property {string} selectedIcon Icono seleccionado (default mapamundi).
 * @property {(icon: string) => void} selectIcon Elige un icono y cierra el picker.
 * @property {boolean} showPicker Indica si el selector de icono está visible.
 * @property {() => void} toggleShowPicker Muestra/oculta el selector de iconos.
 * @property {boolean} showAllIcons Indica si el selector muestra todos los iconos.
 * @property {() => void} toggleShowAllIcons Expande/contrae la grilla de iconos.
 * @property {string[]} visibleIcons Iconos visibles según la expansión.
 * @property {boolean} isUrlValid Valida que la URL sea parseable.
 * @property {() => Promise<void>} submit Persiste la pestaña y resetea el form.
 * @property {() => void} reset Resetea el form (submit o cancelar).
 */

/**
 * Estado del formulario de agregar pestaña. La URL es obligatoria y se normaliza
 * (prefijo https:// si falta); el nombre es opcional y se sugiere desde el
 * hostname de la URL mientras el usuario no lo complete. El icono por defecto es
 * el mapamundi; se puede elegir uno del catálogo de sesiones. El form se resetea
 * al crear (submit) o al cancelar (reset expuesto).
 * @param {{
 *   onSubmit: (tab: import('../../../shared/types.js').Tab) => Promise<void>,
 * }} props
 * @returns {AddTabFormState}
 */
export function useAddTabForm({ onSubmit }) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const picker = useIconPicker({
    defaultIcon: 'public',
    icons: WORKSPACE_ICONS,
    previewCount: WORKSPACE_ICON_PREVIEW_COUNT,
  });
  const { selectIcon: pickerSelectIcon, reset: resetPicker, showAllIcons, toggleShowAllIcons, visibleIcons, selectedIcon } = picker;

  const reset = useCallback(() => {
    setUrl('');
    setName('');
    setShowPicker(false);
    resetPicker();
  }, [resetPicker]);

  const selectIcon = useCallback(
    (icon) => {
      pickerSelectIcon(icon);
      setShowPicker(false);
    },
    [pickerSelectIcon],
  );
  const toggleShowPicker = useCallback(() => setShowPicker((prev) => !prev), []);

  const isUrlValid = getHostname(normalizeUrl(url)) !== null;

  const submit = useCallback(async () => {
    if (!isUrlValid) return;
    const normalizedUrl = normalizeUrl(url);
    const suggestedName = name.trim() || getHostname(normalizedUrl);
    await onSubmit({
      id: `tab-${Date.now()}`,
      url: normalizedUrl,
      name: suggestedName,
      icon: selectedIcon === 'public' ? undefined : selectedIcon,
    });
    reset();
  }, [isUrlValid, url, name, selectedIcon, onSubmit, reset]);

  return {
    url,
    setUrl,
    name,
    setName,
    selectedIcon,
    selectIcon,
    showPicker,
    toggleShowPicker,
    showAllIcons,
    toggleShowAllIcons,
    visibleIcons,
    isUrlValid,
    submit,
    reset,
  };
}