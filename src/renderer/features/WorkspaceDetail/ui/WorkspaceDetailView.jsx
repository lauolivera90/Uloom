import { useNavigate } from 'react-router-dom';
import { Button, Icon, IconButton } from '../../../widgets/index.js';

/**
 * Vista del Detalle de Sesión en su fase funcional mínima (v0.1.3): encabezado con
 * nombre, descripción, conteo de pestañas y navegación de vuelta al Hub. El diseño
 * del Lienzo (Command Center) se desarrolla en una sesión propia. Si la sesión no
 * existe, muestra un estado de no encontrada.
 * @param {{
 *   workspace: import('../../../shared/types.js').Workspace | null,
 *   isNotFound: boolean,
 * }} props
 */
export function WorkspaceDetailView({ workspace, isNotFound }) {
  const navigate = useNavigate();

  if (isNotFound) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <header className="flex items-center gap-2">
          <IconButton variant="ghost" icon="arrow_back" label="Volver al Hub" onClick={() => navigate('/')} />
          <h1 className="text-xl font-semibold text-text">Sesión no encontrada</h1>
        </header>
        <p className="text-sm text-text/60">La sesión que buscás no existe o fue eliminada.</p>
        <Button className="w-fit" icon="home" onClick={() => navigate('/')}>
          Volver al Hub
        </Button>
      </div>
    );
  }

  const tabsCount = workspace.tabs?.length ?? 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <header>
        <div className="flex items-center gap-3 min-w-0">
          <IconButton variant="ghost" icon="arrow_back" label="Volver al Hub" onClick={() => navigate('/')} />
          <Icon icon={workspace.icon || 'work'} className="text-primary" />
          <div className="flex flex-col gap-1 min-w-0">
            <h1 className="text-2xl font-semibold text-text truncate">{workspace.name}</h1>
            {workspace.description && <p className="text-sm text-text/60 truncate">{workspace.description}</p>}
            <span className="text-xs text-text/60">
              {`${tabsCount} ${tabsCount === 1 ? 'pestaña' : 'pestañas'}`}
            </span>
          </div>
        </div>
      </header>
    </div>
  );
}
