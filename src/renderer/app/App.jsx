import { HashRouter, Routes, Route } from 'react-router-dom';
import { WorkspacesHub, WorkspaceDetail, Settings } from '../pages/index.js';
import { WorkspaceProvider, useSidebar } from './index.js';
import { MainLayout } from '../widgets/index.js';

export function App() {
  const { collapsed, toggle } = useSidebar();

  return (
    <WorkspaceProvider>
      <HashRouter>
        <Routes>
          <Route element={<MainLayout collapsed={collapsed} onToggle={toggle} />}>
            <Route path="/" element={<WorkspacesHub />} />
            <Route path="/workspaces/:workspaceId" element={<WorkspaceDetail />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </HashRouter>
    </WorkspaceProvider>
  );
}