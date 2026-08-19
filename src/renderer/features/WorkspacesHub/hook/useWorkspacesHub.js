import { useCallback, useMemo, useState } from 'react';
import { useWorkspaces } from '../../../app/index.js';
import {
  useLaunchWorkspace,
  useTabFormModal,
  useToggleWorkspacePin,
  useWorkspaceFormModal,
} from '../../../entities/workspace/index.js';

/** Criterios de ordenamiento del Hub (persistidos en `localStorage['uloom-sort']`). */
export const HUB_SORT = {
  created: 'created',
  alpha: 'alpha',
  usage: 'usage',
  lastLaunched: 'lastLaunched',
};

/** Opciones del SortBy con claves i18n (`labelKey` se resuelve con `t()`). */
export const HUB_SORT_OPTIONS = [
  { value: HUB_SORT.created, labelKey: 'hub.sortCreated' },
  { value: HUB_SORT.alpha, labelKey: 'hub.sortAlpha' },
  { value: HUB_SORT.usage, labelKey: 'hub.sortUsage' },
  { value: HUB_SORT.lastLaunched, labelKey: 'hub.sortLastLaunched' },
];

const SORT_STORAGE_KEY = 'uloom-sort';
const VALID_SORTS = new Set(Object.values(HUB_SORT));

/**
 * Normaliza un valor a un criterio de orden soportado (fallback al default).
 * @param {string} [value]
 * @returns {string}
 */
function normalizeSort(value) {
  return VALID_SORTS.has(value) ? value : HUB_SORT.created;
}

/**
 * Comparadores por criterio (reciben dos workspaces). `created` devuelve 0 para
 * que el sort estable preserve el orden de creación del array. El criterio
 * `lastLaunched` deja las sesiones nunca lanzadas al final (`null` → 0).
 */
const SORT_FNS = {
  [HUB_SORT.created]: () => 0,
  [HUB_SORT.alpha]: (a, b) =>
    (a.name ?? '').localeCompare(b.name ?? '', undefined, { sensitivity: 'base' }),
  [HUB_SORT.usage]: (a, b) => (b.launchCount ?? 0) - (a.launchCount ?? 0),
  [HUB_SORT.lastLaunched]: (a, b) => {
    const ta = a.lastLaunchedAt ? new Date(a.lastLaunchedAt).getTime() : 0;
    const tb = b.lastLaunchedAt ? new Date(b.lastLaunchedAt).getTime() : 0;
    return tb - ta;
  },
};

/**
 * Estado del feature Hub de Sesiones: delega la lista de workspaces al context
 * global de la app y orquesta el modal de creación (hook genérico
 * `useWorkspaceFormModal`, alta) y el modal de agregar pestaña que abre el botón
 * (+) de una card sin pestañas: `tabTargetId` recuerda sobre qué sesión se abre y
 * la persistencia del modal de pestaña delega en la global (addTab/addTabs/
 * updateTab inyectadas a `useTabFormModal`, sin que entities dependa de app). El
 * `existingUrls` del modal sale de la sesión objetivo para filtrar el historial.
 *
 * Desde v0.6.1 maneja además la búsqueda de sesiones (filtra por nombre/
 * descripción, patrón de Configuración) y el fijado de sesiones: `togglePin`
 * delega en el hook de entidad compartido (`useToggleWorkspacePin`, mismo
 * precedente que `useLaunchWorkspace`) y `visibleWorkspaces` deriva la lista
 * filtrada y ordenada — las fijadas primero (sort estable, mantiene el orden de
 * creación dentro de cada grupo; el orden aplica también al buscar).
 *
 * Desde v0.6.2: criterio de orden `sort` (SortBy del header, persistido en
 * localStorage) que se aplica dentro de cada grupo de fijado, y el lanzamiento
 * vive acá (`launch`/`isLaunching` vía `useLaunchWorkspace` con `onLaunched`
 * cableado a `syncWorkspace` — el backend registra los datos de uso durante
 * `workspace:launch` y el estado global se sincroniza sin escritura extra).
 * @returns {{
 *   visibleWorkspaces: import('../../../shared/types.js').Workspace[],
 *   isSearching: boolean,
 *   searchQuery: string,
 *   setSearchQuery: (value: string) => void,
 *   sort: string,
 *   setSort: (value: string) => void,
 *   isLaunching: boolean,
 *   launch: (workspaceId?: string) => Promise<{ opened: number, failed: number, workspace: import('../../../shared/types.js').Workspace | null } | null>,
 *   togglePin: (workspaceId: string) => Promise<void>,
 *   createModal: {
 *     isOpen: boolean,
 *     isSaving: boolean,
 *     form: import('../../../entities/workspace/hook/useWorkspaceForm.js').WorkspaceFormState,
 *     open: () => void,
 *     close: () => void,
 *   },
 *   tabModal: {
 *     isOpen: boolean,
 *     isEditing: boolean,
 *     isSaving: boolean,
 *     editingTab: import('../../../shared/types.js').Tab | null,
 *     mode: 'manual' | 'history',
 *     form: import('../../../entities/workspace/hook/useTabForm.js').TabFormState,
 *     openAdd: () => void,
 *     onCancel: () => void,
 *     onModeChange: (mode: 'manual' | 'history') => void,
 *     visibleEntries: import('../../../shared/types.js').TabHistoryEntry[],
 *     historyDisabled: boolean,
 *     selectedCount: number,
 *     selectedUrls: Set<string>,
 *     onToggleHistoryEntry: (url: string) => void,
 *     onConfirmBatch: () => void,
 *   },
 *   openAddTab: (workspaceId: string) => void,
 * }}
 */
export function useWorkspacesHub() {
  const {
    workspaces,
    createWorkspace,
    addTab,
    addTabs,
    updateTab,
    mutateWorkspace,
    syncWorkspace,
  } = useWorkspaces();
  const createModal = useWorkspaceFormModal({ workspace: null, onSubmit: createWorkspace });
  const [tabTargetId, setTabTargetId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSortState] = useState(() =>
    normalizeSort(localStorage.getItem(SORT_STORAGE_KEY)),
  );
  const tabTargetWorkspace = workspaces.find((workspace) => workspace.id === tabTargetId) ?? null;
  const tabModal = useTabFormModal({
    workspaceId: tabTargetId,
    existingUrls: (tabTargetWorkspace?.tabs ?? []).map((tab) => tab.url),
    addTab,
    addTabs,
    updateTab,
  });
  const { openAdd } = tabModal;
  const { togglePin } = useToggleWorkspacePin({ mutateWorkspace });
  const { isLaunching, launch } = useLaunchWorkspace(null, { onLaunched: syncWorkspace });

  const openAddTab = useCallback(
    (workspaceId) => {
      setTabTargetId(workspaceId);
      openAdd();
    },
    [setTabTargetId, openAdd],
  );

  const setSort = useCallback((value) => {
    const next = normalizeSort(value);
    setSortState(next);
    localStorage.setItem(SORT_STORAGE_KEY, next);
  }, []);

  const isSearching = searchQuery.trim().length > 0;

  const visibleWorkspaces = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = query
      ? workspaces.filter(
          (workspace) =>
            (workspace.name ?? '').toLowerCase().includes(query) ||
            (workspace.description ?? '').toLowerCase().includes(query),
        )
      : workspaces;
    const sortFn = SORT_FNS[sort];
    return [...filtered].sort((a, b) => {
      const pinnedDiff = Number(b.pinned) - Number(a.pinned);
      if (pinnedDiff !== 0) return pinnedDiff;
      return sortFn(a, b);
    });
  }, [workspaces, searchQuery, sort]);

  return {
    visibleWorkspaces,
    isSearching,
    searchQuery,
    setSearchQuery,
    sort,
    setSort,
    isLaunching,
    launch,
    togglePin,
    createModal,
    tabModal,
    openAddTab,
  };
}