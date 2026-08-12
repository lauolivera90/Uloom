import { WorkspaceCard } from '../../../entities/workspace/index.js';
import { CreateTile } from '../../../widgets/index.js';
import { useI18n } from '../../../shared/index.js';

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
 *   onPlay: (workspaceId: string) => void,
 *   onAddTab: (workspaceId: string) => void,
 * }} props
 */
export function WorkspaceGrid({ workspaces, onCreate, onOpen, onPlay, onAddTab }) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {workspaces.map((workspace) => (
        <WorkspaceCard
          key={workspace.id}
          workspace={workspace}
          onClick={() => onOpen(workspace.id)}
          onPlay={onPlay}
          onAddTab={onAddTab}
        />
      ))}
      <CreateTile label={t('hub.createNew')} onClick={onCreate} />
    </div>
  );
}
