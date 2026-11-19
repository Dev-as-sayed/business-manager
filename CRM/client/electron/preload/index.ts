import { contextBridge, ipcRenderer } from 'electron';

const desktopBridge = {
  isElectron: true as const,
  platform: process.platform,
  auth: {
    getRefreshToken: (): Promise<string | null> =>
      ipcRenderer.invoke('desktop:auth:get-refresh-token'),
    setRefreshToken: (token: string): Promise<void> =>
      ipcRenderer.invoke('desktop:auth:set-refresh-token', token),
    clearRefreshToken: (): Promise<void> => ipcRenderer.invoke('desktop:auth:clear-refresh-token'),
  },
};

contextBridge.exposeInMainWorld('desktop', desktopBridge);
