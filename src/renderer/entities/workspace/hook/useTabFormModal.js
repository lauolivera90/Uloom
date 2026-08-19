import { buildTabsFromHistory } from '../../../shared/index.js';
import { useTabForm } from './useTabForm.js';
import { useTabHistory } from './useTabHistory.js';
import { useTabModal } from './useTabModal.js';

/**
 * Orquesta el modal de pestaña (alta/edición) para las vistas que lo consumen
 * (Hub y Detalle), evitando duplicar el wiring entre features (rules.md §4):
 * combina `useTabModal` (apertura/cierre, persistencia individual `onSubmitTab`
 * y en lote `onSubmitTabs`, modo `manual|history`), `useTabForm` (form manual,
 * reseteado al cancelar y tras confirmar un lote) y `useTabHistory` (lista +
 * selección múltiple filtrada por `existingUrls`). Los handlers de cancelar y de
 * confirmar el lote viven acá: el lote construye las `Tab[]` con
 * `buildTabsFromHistory` y al éxito resetea el form (el alta individual ya se
 * resetea dentro de `useTabForm.submit`).
 * @param {{
 *   workspaceId?: string | null,
 *   existingUrls?: string[],
 *   addTab: (workspaceId: string, tab: import('../../../shared/types.js').Tab) => Promise<unknown>,
 *   addTabs?: (workspaceId: string, tabs: import('../../../shared/types.js').Tab[]) => Promise<unknown>,
 *   updateTab: (workspaceId: string, tab: import('../../../shared/types.js').Tab) => Promise<unknown>,
 * }} props
 * @returns {{
 *   isOpen: boolean,
 *   editingTab: import('../../../shared/types.js').Tab | null,
 *   isEditing: boolean,
 *   isSaving: boolean,
 *   mode: 'manual' | 'history',
 *   form: import('./useTabForm.js').TabFormState,
 *   openAdd: () => void,
 *   openEdit: (tab: import('../../../shared/types.js').Tab) => void,
 *   close: () => void,
 *   onCancel: () => void,
 *   onModeChange: (mode: 'manual' | 'history') => void,
 *   visibleEntries: import('../../../shared/types.js').TabHistoryEntry[],
 *   historyDisabled: boolean,
 *   selectedCount: number,
 *   selectedUrls: Set<string>,
 *   onToggleHistoryEntry: (url: string) => void,
 *   onConfirmBatch: () => void,
 * }}
 */
export function useTabFormModal({ workspaceId, existingUrls = [], addTab, addTabs, updateTab }) {
  const {
    isOpen,
    editingTab,
    isSaving,
    mode,
    setMode,
    openAdd,
    openEdit,
    close,
    onSubmitTab,
    onSubmitTabs,
  } = useTabModal({ workspaceId, addTab, addTabs, updateTab });
  const tabForm = useTabForm({ initialTab: isOpen ? editingTab : null, onSubmit: onSubmitTab });
  const tabHistory = useTabHistory({
    isActive: isOpen && editingTab === null,
    existingUrls,
  });

  const handleCancel = () => {
    tabForm.reset();
    close();
  };

  const handleConfirmBatch = () => {
    onSubmitTabs(buildTabsFromHistory(tabHistory.selectedEntries))
      .then(() => tabForm.reset())
      .catch((error) => console.error(error));
  };

  return {
    isOpen,
    editingTab,
    isEditing: editingTab !== null,
    isSaving,
    mode,
    form: tabForm,
    openAdd,
    openEdit,
    close,
    onCancel: handleCancel,
    onModeChange: setMode,
    visibleEntries: tabHistory.visibleEntries,
    historyDisabled: tabHistory.isLoaded && tabHistory.visibleEntries.length === 0,
    selectedCount: tabHistory.selectedCount,
    selectedUrls: tabHistory.selectedUrls,
    onToggleHistoryEntry: tabHistory.toggle,
    onConfirmBatch: handleConfirmBatch,
  };
}