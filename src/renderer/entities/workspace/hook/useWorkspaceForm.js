import { useCallback, useEffect, useRef, useState } from 'react';
import { isCatalogIcon, useIconPicker } from '../../../shared/index.js';
import { WORKSPACE_ICONS, WORKSPACE_ICON_PREVIEW_COUNT } from '../api/workspaceIcons.js';

/**
 * @typedef {Object} WorkspaceFormState
 * Estado del formulario de creación/edición de sesión retornado por `useWorkspaceForm`.
 * @property {string} name Nombre de la sesión.
 * @property {(value: string) => void} setName Actualiza el nombre.
 * @property {string} description Descripción opcional.
 * @property {(value: string) => void} setDescription Actualiza la descripción.
 * @property {string} selectedIcon Icono seleccionado del catálogo.
 * @property {(icon: string) => void} selectIcon Elige un icono y cierra el selector.
 * @property {boolean} showPicker Indica si el selector de icono está visible.
 * @property {() => void} toggleShowPicker Muestra/oculta el selector de iconos.
 * @property {string} previewIcon Icono a mostrar en el tile de preview (default 'work').
 * @property {boolean} showAllIcons Indica si el selector muestra todos los iconos.
 * @property {() => void} toggleShowAllIcons Expande/contrae la grilla de iconos.
 * @property {string[]} visibleIcons Iconos visibles según la expansión.
 * @property {boolean} isNameValid Valida que el nombre no esté vacío.
 * @property {() => Promise<void>} submit Persiste la sesión y resetea el form.
 * @property {() => void} reset Resetea el form (submit o cancelar).
 */

/**
 * Estado del formulario de sesión, compartido entre alta (Hub) y edición (Detalle).
 * Con `initialWorkspace: null` arranca vacío (creación); con un workspace, precarga
 * sus datos y el submit emite `{ name, description?, icon }` para que el caller
 * decida cómo persistir (create en el Hub, mutateWorkspace en el Detalle). El form
 * se repuebla solo si cambia el id del workspace inicial (no en cada update del
 * objeto), para no pisar una edición en curso tras mutaciones no relacionadas.
 * @param {{
 *   initialWorkspace?: import('../../shared/types.js').Workspace | null,
 *   onSubmit: (workspace: { name: string, description?: string, icon?: string }) => Promise<void>,
 * }} props
 * @returns {WorkspaceFormState}
 */
export function useWorkspaceForm({ initialWorkspace = null, onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState(() => initialWorkspace?.icon ?? (initialWorkspace ? '' : WORKSPACE_ICONS[0]));
  const picker = useIconPicker({
    icons: WORKSPACE_ICONS,
    previewCount: WORKSPACE_ICON_PREVIEW_COUNT,
    selected: icon,
    onSelect: setIcon,
  });
  const { reset: resetPicker, selectIcon, showPicker, toggleShowPicker, showAllIcons, toggleShowAllIcons, visibleIcons, selectedIcon, ensureVisible } = picker;
  const previousIdRef = useRef(null);

  const previewIcon = selectedIcon || 'work';

  const syncIcon = useCallback(() => {
    resetPicker();
    if (initialWorkspace?.icon) {
      setIcon(initialWorkspace.icon);
      if (isCatalogIcon(initialWorkspace.icon)) {
        ensureVisible(initialWorkspace.icon);
      }
    } else {
      setIcon(initialWorkspace ? '' : WORKSPACE_ICONS[0]);
    }
  }, [initialWorkspace, resetPicker, ensureVisible]);

  const reset = useCallback(() => {
    setName(initialWorkspace?.name ?? '');
    setDescription(initialWorkspace?.description ?? '');
    syncIcon();
  }, [initialWorkspace, syncIcon]);

  useEffect(() => {
    const currentId = initialWorkspace?.id ?? null;
    if (currentId === previousIdRef.current) {
      return;
    }
    previousIdRef.current = currentId;
    reset();
  }, [initialWorkspace, reset]);

  const isNameValid = name.trim().length > 0;

  const submit = useCallback(async () => {
    if (!isNameValid) return;
    const trimmedDescription = description.trim();
    await onSubmit({
      name: name.trim(),
      description: trimmedDescription || undefined,
      icon: icon || undefined,
    });
    reset();
  }, [isNameValid, name, description, icon, onSubmit, reset]);

  return {
    name,
    setName,
    description,
    setDescription,
    selectedIcon,
    selectIcon,
    showPicker,
    toggleShowPicker,
    previewIcon,
    showAllIcons,
    toggleShowAllIcons,
    visibleIcons,
    isNameValid,
    submit,
    reset,
  };
}