const { clipboard, dialog, ipcMain } = require('electron');

function registerIpc({
  getMainWindow,
  getUserData,
  saveData,
  getPreferences,
  savePreferences,
  toggleWindow,
  registerToggleShortcut,
  exportBundle,
  importBundle
}) {
  ipcMain.handle('data:load', async () => getUserData());

  ipcMain.handle('data:save', async (_event, { key, value }) => {
    saveData(key, value);
    return true;
  });

  ipcMain.handle('clipboard:copy', async (_event, text) => {
    clipboard.writeText(text || '');
    return true;
  });

  ipcMain.handle('window:toggle-always-on-top', async () => {
    const mainWindow = getMainWindow();
    const isPinned = !mainWindow.isAlwaysOnTop();
    mainWindow.setAlwaysOnTop(isPinned, 'screen-saver');

    const prefs = getPreferences();
    savePreferences({
      ...prefs,
      windowState: {
        ...(prefs.windowState || {}),
        alwaysOnTop: isPinned
      }
    });

    return isPinned;
  });

  ipcMain.handle('window:show-hide', async () => {
    toggleWindow();
    return true;
  });

  ipcMain.handle('shortcuts:set-toggle', async (_event, accelerator) => {
    const ok = registerToggleShortcut(accelerator);
    if (!ok) {
      throw new Error(`Could not register shortcut: ${accelerator}`);
    }

    const prefs = getPreferences();
    savePreferences({
      ...prefs,
      windowState: {
        ...(prefs.windowState || {}),
        globalShortcut: accelerator
      }
    });
    return true;
  });

  ipcMain.handle('backup:export', async () => {
    const mainWindow = getMainWindow();
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Clinical Dashboard Backup',
      defaultPath: 'clinical-dashboard-backup.json',
      filters: [{ name: 'JSON', extensions: ['json'] }]
    });

    if (canceled || !filePath) {
      return { canceled: true };
    }

    exportBundle(filePath);
    return { canceled: false, filePath };
  });

  ipcMain.handle('backup:import', async () => {
    const mainWindow = getMainWindow();
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Import Clinical Dashboard Backup',
      properties: ['openFile'],
      filters: [{ name: 'JSON', extensions: ['json'] }]
    });

    if (canceled || !filePaths?.length) {
      return { canceled: true };
    }

    importBundle(filePaths[0]);
    return { canceled: false, filePath: filePaths[0] };
  });
}

module.exports = {
  registerIpc
};
