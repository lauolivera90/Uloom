import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WorkspacesHub } from '../pages/WorkspacesHub.jsx';
import { WorkspaceDetail } from '../pages/WorkspaceDetail.jsx';
import { Settings } from '../pages/Settings.jsx';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WorkspacesHub />} />
        <Route path="/workspaces/:workspaceId" element={<WorkspaceDetail />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}
