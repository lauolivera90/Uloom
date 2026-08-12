import { HashRouter, Routes, Route } from 'react-router-dom';
import { WorkspacesHub, WorkspaceDetail, Settings } from '../pages/index.js';
import {
  WorkspaceProvider,
  ThemeProvider,
  LanguageProvider,
  useSidebar,
  useWorkspaces,
  GlobalCreateWorkspace,
} from './index.js';
import { useWorkspaceFormModal } from '../entities/workspace/index.js';
import { MainLayout } from '../widgets/index.js';

/**
 * Shell de la app dentro del WorkspaceProvider: consume el modal global de
 * creación de sesión (lo abre el Sidebar) y cablea las rutas al layout principal.
 * @param {{
 *   collapsed: boolean,
 *   onToggle: () => void,
 * }} props
 */
function AppShell({ collapsed, onToggle }) {
  const { createWorkspace } = useWorkspaces();
  const createModal = useWorkspaceFormModal({ workspace: null, onSubmit: createWorkspace });

  return (
    <>
      <Routes>
        <Route
          element={
            <MainLayout
              collapsed={collapsed}
              onToggle={onToggle}
              onAddSession={createModal.open}
            />
          }
        >
          <Route path="/" element={<WorkspacesHub />} />
          <Route path="/workspaces/:workspaceId" element={<WorkspaceDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
      <GlobalCreateWorkspace
        isOpen={createModal.isOpen}
        isSaving={createModal.isSaving}
        form={createModal.form}
        onClose={createModal.close}
      />
    </>
  );
}

export function App() {
  const { collapsed, toggle } = useSidebar();

  return (
    <LanguageProvider>
      <ThemeProvider>
        <WorkspaceProvider>
          <HashRouter>
            <AppShell collapsed={collapsed} onToggle={toggle} />
          </HashRouter>
        </WorkspaceProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
