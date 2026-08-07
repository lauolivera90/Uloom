import { useCallback, useState } from 'react';
import { useWorkspaces } from '../../../app/index.js';

/**
 * Estado del modal de agregar pestaña: apertura/cierre y la acción de agregar que
 * delega en el estado global de sesiones. La pestaña se persiste de forma
 * pesimista (await del disco); el modal se cierra solo al confirmar con éxito y en
 * caso de error el error se propaga (console.error en la vista).
 * @param {string} [workspaceId]
 * @returns {{
 *   isAddOpen: boolean,
 *   openAdd: () => void,
 *   closeAdd: () => void,
 *   isSaving: boolean,
 *   onAddTab: (tab: import('../../../shared/types.js').Tab) => Promise<void>,
 * }}
 */
export function useAddTab(workspaceId) {
  const { addTab } = useWorkspaces();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const openAdd = useCallback(() => setIsAddOpen(true), []);
  const closeAdd = useCallback(() => setIsAddOpen(false), []);

  const onAddTab = useCallback(
    async (tab) => {
      if (!workspaceId) return;
      setIsSaving(true);
      try {
        await addTab(workspaceId, tab);
        setIsAddOpen(false);
      } finally {
        setIsSaving(false);
      }
    },
    [workspaceId, addTab],
  );

  return { isAddOpen, openAdd, closeAdd, isSaving, onAddTab };
}