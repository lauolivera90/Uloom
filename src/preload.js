import { contextBridge, ipcRenderer } from 'electron';

const uloomApi = {
  getConfig: () => ipcRenderer.invoke('config:get'),
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
