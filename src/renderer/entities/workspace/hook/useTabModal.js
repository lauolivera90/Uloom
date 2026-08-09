import { useCallback, useState } from 'react';

/**
 * Estado del modal de pestaña (alta y edición): apertura/cierre y la acción de
 * persistir que delega en las funciones de persistencia inyectadas (`addTab`/
 * `updateTab` las aporta el caller desde el contexto global de la app, evitando
 * que entities dependa de app y cerrando el ciclo de imports). `editingTab`
 * distingue el modo: `null` = alta, un objeto = edición (su id se conserva al
 * guardar). La persistencia es pesimista (await del disco); el modal se cierra
 * solo al confirmar con éxito y en caso de error el error se propaga
 * (console.error en la vista).
 * @param {{
 *   workspaceId?: string | null,
 *   addTab: (workspaceId: string, tab: import('../../../shared/types.js').Tab) => Promise<unknown>,
 *   updateTab: (workspaceId: string, tab: import('../../../shared/types.js').Tab) => Promise<unknown>,
 * }} props
 * @returns {{
 *   isOpen: boolean,
 *   editingTab: import('../../../shared/types.js').Tab | null,
 *   openAdd: () => void,
 *   openEdit: (tab: import('../../../shared/types.js').Tab) => void,
 *   close: () => void,
 *   isSaving: boolean,
 *   onSubmitTab: (tab: import('../../../shared/types.js').Tab) => Promise<void>,
 * }}
 */
export function useTabModal({ workspaceId, addTab, updateTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTab, setEditingTab] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const openAdd = useCallback(() => {
    setEditingTab(null);
    setIsOpen(true);
  }, []);
  const openEdit = useCallback((tab) => {
    setEditingTab(tab);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  const onSubmitTab = useCallback(
    async (tab) => {
      if (!workspaceId) return;
      setIsSaving(true);
      try {
        if (tab.id === editingTab?.id) {
          await updateTab(workspaceId, tab);
        } else {
          await addTab(workspaceId, tab);
        }
        setIsOpen(false);
      } finally {
        setIsSaving(false);
      }
    },
    [workspaceId, addTab, updateTab, editingTab],
  );

  return { isOpen, editingTab, openAdd, openEdit, close, isSaving, onSubmitTab };
}