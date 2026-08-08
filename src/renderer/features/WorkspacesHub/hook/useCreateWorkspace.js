import { useCallback, useState } from 'react';
import { useIconPicker } from '../../../shared/index.js';
import { WORKSPACE_ICONS, WORKSPACE_ICON_PREVIEW_COUNT } from '../../../entities/workspace/index.js';

/**
 * @typedef {Object} CreateWorkspaceFormState
 * Estado del formulario de creación de sesión retornado por `useCreateWorkspace`.
 * @property {string} name Nombre de la sesión.
 * @property {(value: string) => void} setName Actualiza el nombre.
 * @property {string} description Descripción opcional.
 * @property {(value: string) => void} setDescription Actualiza la descripción.
 * @property {string} selectedIcon Icono seleccionado del catálogo.
 * @property {(icon: string) => void} selectIcon Elige un icono.
 * @property {boolean} showAllIcons Indica si el selector muestra todos los iconos.
 * @property {() => void} toggleShowAllIcons Expande/contrae la grilla de iconos.
 * @property {string[]} visibleIcons Iconos visibles según la expansión.
 * @property {boolean} isNameValid Valida que el nombre no esté vacío.
 * @property {() => Promise<void>} submit Persiste el workspace y resetea el form.
 * @property {() => void} reset Resetea el form (submit o cancelar).
 */

/**
 * Estado del formulario de creación de sesión. Nombre obligatorio; la descripción
 * es opcional y arranca vacía (se omite al crear si no se completó). El form se
 * resetea al crear (submit) o al cancelar (reset expuesto).
 * @param {{
 *   onCreate: (workspace: { name: string, description?: string, icon?: string }) => Promise<void>,
 * }} props
 * @returns {CreateWorkspaceFormState}
 */
export function useCreateWorkspace({ onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const picker = useIconPicker({
    defaultIcon: WORKSPACE_ICONS[0],
    icons: WORKSPACE_ICONS,
    previewCount: WORKSPACE_ICON_PREVIEW_COUNT,
  });
  const { selectIcon, reset: resetPicker, showAllIcons, toggleShowAllIcons, visibleIcons, selectedIcon } = picker;

  const reset = useCallback(() => {
    setName('');
    setDescription('');
    resetPicker();
  }, [resetPicker]);

  const isNameValid = name.trim().length > 0;

  const submit = useCallback(async () => {
    if (!isNameValid) return;
    const trimmedDescription = description.trim();
    await onCreate({
      name: name.trim(),
      description: trimmedDescription || undefined,
      icon: selectedIcon,
    });
    reset();
  }, [isNameValid, name, description, selectedIcon, onCreate, reset]);

  return {
    name,
    setName,
    description,
    setDescription,
    selectedIcon,
    selectIcon,
    showAllIcons,
    toggleShowAllIcons,
    visibleIcons,
    isNameValid,
    submit,
    reset,
  };
}