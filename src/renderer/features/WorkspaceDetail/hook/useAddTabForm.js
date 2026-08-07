import { useCallback, useState } from 'react';
import {
  WORKSPACE_ICONS,
  WORKSPACE_ICON_PREVIEW_COUNT,
} from '../../../entities/workspace/index.js';

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
 * Estado del formulario de agregar pestaña. La URL es obligatoria y se normaliza
 * (prefijo https:// si falta); el nombre es opcional y se sugiere desde el
 * hostname de la URL mientras el usuario no lo complete. El icono por defecto es
 * el mapamundi; se puede elegir uno del catálogo de sesiones. El form se resetea
 * al crear (submit) o al cancelar (reset expuesto).
 * @param {{
 *   onSubmit: (tab: import('../../../shared/types.js').Tab) => Promise<void>,
 * }} props
 * @returns {{
 *   url: string,
 *   setUrl: (value: string) => void,
 *   name: string,
 *   setName: (value: string) => void,
 *   selectedIcon: string,
 *   selectIcon: (icon: string) => void,
 *   showPicker: boolean,
 *   toggleShowPicker: () => void,
 *   showAllIcons: boolean,
 *   toggleShowAllIcons: () => void,
 *   visibleIcons: string[],
 *   isUrlValid: boolean,
 *   submit: () => Promise<void>,
 * }}
 */
export function useAddTabForm({ onSubmit }) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('public');
  const [showPicker, setShowPicker] = useState(false);
  const [showAllIcons, setShowAllIcons] = useState(false);

  const reset = useCallback(() => {
    setUrl('');
    setName('');
    setSelectedIcon('public');
    setShowPicker(false);
    setShowAllIcons(false);
  }, []);

  const selectIcon = useCallback((icon) => {
    setSelectedIcon(icon);
    setShowPicker(false);
  }, []);
  const toggleShowPicker = useCallback(() => setShowPicker((prev) => !prev), []);
  const toggleShowAllIcons = useCallback(() => setShowAllIcons((prev) => !prev), []);

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

  const visibleIcons = showAllIcons
    ? WORKSPACE_ICONS
    : WORKSPACE_ICONS.slice(0, WORKSPACE_ICON_PREVIEW_COUNT);

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