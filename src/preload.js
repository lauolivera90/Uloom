import { contextBridge, ipcRenderer } from 'electron';

const uloomApi = {
  getConfig: () => ipcRenderer.invoke('config:get'),
  createWorkspace: (workspace) => ipcRenderer.invoke('workspace:create', workspace),
  updateWorkspace: (workspace) => ipcRenderer.invoke('workspace:update', workspace),
  getInstalledBrowsers: () => ipcRenderer.invoke('browser:list'),
  updatePreferences: (preferences) => ipcRenderer.invoke('config:updatePreferences', preferences),
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
