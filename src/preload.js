import { contextBridge, ipcRenderer } from 'electron';

const uloomApi = {
  getConfig: () => ipcRenderer.invoke('config:get'),
  createWorkspace: (workspace) => ipcRenderer.invoke('workspace:create', workspace),
  duplicateWorkspace: (sourceId, input) => ipcRenderer.invoke('workspace:duplicate', sourceId, input),
  updateWorkspace: (workspace) => ipcRenderer.invoke('workspace:update', workspace),
  deleteWorkspace: (workspaceId) => ipcRenderer.invoke('workspace:delete', workspaceId),
  getInstalledBrowsers: () => ipcRenderer.invoke('browser:list'),
  getSystemDefaultBrowser: () => ipcRenderer.invoke('browser:system'),
  updatePreferences: (preferences) => ipcRenderer.invoke('config:updatePreferences', preferences),
  getPageMetadata: (url) => ipcRenderer.invoke('page:metadata', url),
  launchWorkspace: (workspaceId) => ipcRenderer.invoke('workspace:launch', workspaceId),
  exportWorkspace: (workspaceId) => ipcRenderer.invoke('portability:exportWorkspace', workspaceId),
  exportAll: () => ipcRenderer.invoke('portability:exportAll'),
  importFromFile: () => ipcRenderer.invoke('portability:import'),
  clearMetadataCache: () => ipcRenderer.invoke('workspace:clearMetadataCache'),
  clearAllWorkspaces: () => ipcRenderer.invoke('workspace:clearAll'),
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('uloomApi', uloomApi);
  } catch (error) {
    console.error(error);
  }
} else {
  window.uloomApi = uloomApi;
}
