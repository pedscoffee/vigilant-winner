const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('dashboardApi', {
  loadData: () => ipcRenderer.invoke('data:load'),
  saveData: (key, value) => ipcRenderer.invoke('data:save', { key, value }),
  copyToClipboard: (text) => ipcRenderer.invoke('clipboard:copy', text),
  toggleAlwaysOnTop: () => ipcRenderer.invoke('window:toggle-always-on-top'),
  showHideWindow: () => ipcRenderer.invoke('window:show-hide'),
  setToggleShortcut: (accelerator) => ipcRenderer.invoke('shortcuts:set-toggle', accelerator),
  exportBackup: () => ipcRenderer.invoke('backup:export'),
  importBackup: () => ipcRenderer.invoke('backup:import'),
  onPhraseAppend: (callback) => {
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on('phrase:append', handler);
    return () => ipcRenderer.removeListener('phrase:append', handler);
  },
  onCommandPaletteOpen: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('command-palette:open', handler);
    return () => ipcRenderer.removeListener('command-palette:open', handler);
  }
});
