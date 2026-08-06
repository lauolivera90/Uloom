import { useParams } from 'react-router-dom';
import { useWorkspaceDetail, WorkspaceDetailView } from '../features/WorkspaceDetail/index.js';

export function WorkspaceDetail() {
  const { workspaceId } = useParams();
  const { workspace, isNotFound } = useWorkspaceDetail(workspaceId);

  return <WorkspaceDetailView workspace={workspace} isNotFound={isNotFound} />;
}
