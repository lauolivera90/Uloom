import { WorkspaceFormModal } from '../entities/workspace/index.js';

/**
 * Modal global de creación de sesión que abre el Sidebar. Presentacional: recibe
 * el estado del hook `useWorkspaceFormModal` (entities) y renderiza
 * `WorkspaceFormModal` (alta, `isEditing: false`).
 * @param {{
 *   isOpen: boolean,
 *   isSaving: boolean,
 *   form: import('../entities/workspace/hook/useWorkspaceForm.js').WorkspaceFormState,
 *   onClose: () => void,
 * }} props
 */
export function GlobalCreateWorkspace({ isOpen, isSaving, form, onClose }) {
  return <WorkspaceFormModal isOpen={isOpen} isSaving={isSaving} form={form} onCancel={onClose} />;
}
