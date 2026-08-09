import { contextBridge, ipcRenderer } from 'electron';

const uloomApi = {
  getConfig: () => ipcRenderer.invoke('config:get'),
  createWorkspace: (workspace) => ipcRenderer.invoke('workspace:create', workspace),
  updateWorkspace: (workspace) => ipcRenderer.invoke('workspace:update', workspace),
  deleteWorkspace: (workspaceId) => ipcRenderer.invoke('workspace:delete', workspaceId),
  getInstalledBrowsers: () => ipcRenderer.invoke('browser:list'),
  updatePreferences: (preferences) => ipcRenderer.invoke('config:updatePreferences', preferences),
  getPageMetadata: (url) => ipcRenderer.invoke('page:metadata', url),
  launchWorkspace: (workspaceId) => ipcRenderer.invoke('workspace:launch', workspaceId),
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
