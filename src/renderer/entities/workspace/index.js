export {
  getConfig,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getInstalledBrowsers,
  updatePreferences,
  getPageMetadata,
  WORKSPACE_ICONS,
  WORKSPACE_ICON_PREVIEW_COUNT,
  SYSTEM_BROWSER,
  SYSTEM_BROWSER_LABEL,
  DEFAULT_BROWSER_LABEL,
  OPEN_BEHAVIORS,
  getBrowserNameById,
  buildBrowserOptions,
} from './api/index.js';
export { useWorkspaceForm } from './hook/index.js';
export { WorkspaceCard, TabFavicon, WorkspaceFormModal } from './ui/index.js';