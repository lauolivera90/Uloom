import { HashRouter, Routes, Route } from 'react-router-dom';
import { WorkspacesHub, WorkspaceDetail, Settings } from '../pages/index.js';
import {
  WorkspaceProvider,
  ThemeProvider,
  LanguageProvider,
  ToastProvider,
  useSidebar,
  GlobalCreateWorkspace,
} from './index.js';
import { useGlobalCreateWorkspace } from './hook/useGlobalCreateWorkspace.js';
import { MainLayout } from '../widgets/index.js';

/**
 * Shell de la app dentro del WorkspaceProvider: consume el modal global de
 * creación de sesión (lo abre el Sidebar) y cablea las rutas al layout principal.
 * @param {{
 *   collapsed: boolean,
 *   onToggle: () => void,
 *   isSmall: boolean,
 * }} props
 */
function AppShell({ collapsed, onToggle, isSmall }) {
  const createModal = useGlobalCreateWorkspace();

  return (
    <>
      <Routes>
        <Route
          element={
            <MainLayout
              collapsed={collapsed}
              onToggle={onToggle}
              isSmall={isSmall}
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
  const { collapsed, toggle, isSmall } = useSidebar();

  return (
    <LanguageProvider>
      <ThemeProvider>
        <ToastProvider>
          <WorkspaceProvider>
            <HashRouter>
              <AppShell collapsed={collapsed} onToggle={toggle} isSmall={isSmall} />
            </HashRouter>
          </WorkspaceProvider>
        </ToastProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
