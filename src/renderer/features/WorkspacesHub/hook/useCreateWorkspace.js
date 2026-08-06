import { useCallback, useState } from 'react';
import {
  WORKSPACE_ICONS,
  WORKSPACE_ICON_PREVIEW_COUNT,
} from '../../../entities/workspace/index.js';

/**
 * Estado del formulario de creación de sesión. La descripción queda desacoplada del
 * nombre en cuanto el usuario la edita manualmente; antes, se deriva como "Sesión de {name}".
 * El form se resetea al crear (submit) o al cancelar (reset expuesto).
 * @param {{
 *   onCreate: (workspace: import('../../../shared/types.js').Workspace) => void,
 * }} props
 * @returns {{
 *   name: string,
 *   setName: (value: string) => void,
 *   resolvedDescription: string,
 *   handleDescriptionChange: (value: string) => void,
 *   selectedIcon: string,
 *   selectIcon: (icon: string) => void,
 *   showAllIcons: boolean,
 *   toggleShowAllIcons: () => void,
 *   visibleIcons: string[],
 *   isNameValid: boolean,
 *   submit: () => void,
 * }}
 */
export function useCreateWorkspace({ onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionTouched, setDescriptionTouched] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(WORKSPACE_ICONS[0]);
  const [showAllIcons, setShowAllIcons] = useState(false);

  const reset = useCallback(() => {
    setName('');
    setDescription('');
    setDescriptionTouched(false);
    setSelectedIcon(WORKSPACE_ICONS[0]);
    setShowAllIcons(false);
  }, []);

  const resolvedDescription = descriptionTouched ? description : `Sesión de ${name}`;

  const handleDescriptionChange = useCallback((value) => {
    setDescription(value);
    setDescriptionTouched(true);
  }, []);

  const selectIcon = useCallback((icon) => setSelectedIcon(icon), []);

  const toggleShowAllIcons = useCallback(() => setShowAllIcons((prev) => !prev), []);

  const isNameValid = name.trim().length > 0;

  const submit = useCallback(() => {
    if (!isNameValid) return;
    onCreate({
      id: `ws-${Date.now()}`,
      name: name.trim(),
      description: resolvedDescription.trim(),
      icon: selectedIcon,
      tabs: [],
    });
    reset();
  }, [isNameValid, name, resolvedDescription, selectedIcon, onCreate, reset]);

  const visibleIcons = showAllIcons
    ? WORKSPACE_ICONS
    : WORKSPACE_ICONS.slice(0, WORKSPACE_ICON_PREVIEW_COUNT);

  return {
    name,
    setName,
    resolvedDescription,
    handleDescriptionChange,
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
