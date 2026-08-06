import { WorkspaceCard } from '../../../entities/workspace/index.js';
import { CreateTile } from '../../../widgets/index.js';

/**
 * @typedef {import('../../../shared/types.js').Workspace} Workspace
 */

/**
 * Rejilla de sesiones del Hub. Lista las WorkspaceCard y una última tarjeta punteada
 * que invita a crear una sesión nueva.
 * @param {{
 *   workspaces: Workspace[],
 *   onCreate: () => void,
 *   onOpen: (workspaceId: string) => void,
 * }} props
 */
export function WorkspaceGrid({ workspaces, onCreate, onOpen }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {workspaces.map((workspace) => (
        <WorkspaceCard
          key={workspace.id}
          workspace={workspace}
          onClick={() => onOpen(workspace.id)}
        />
      ))}
      <CreateTile label="Crear nueva sesión" onClick={onCreate} />
    </div>
  );
}
