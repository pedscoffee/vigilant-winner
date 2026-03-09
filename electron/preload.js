const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('dashboardApi', {
  loadData: () => ipcRenderer.invoke('data:load'),
  saveData: (key, value) => ipcRenderer.invoke('data:save', { key, value }),
  copyToClipboard: (text) => ipcRenderer.invoke('clipboard:copy', text),
  toggleAlwaysOnTop: () => ipcRenderer.invoke('window:toggle-always-on-top'),
  showHideWindow: () => ipcRenderer.invoke('window:show-hide'),
  setToggleShortcut: (accelerator) => ipcRenderer.invoke('shortcuts:set-toggle', accelerator)
});
