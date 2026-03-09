const { clipboard, ipcMain } = require('electron');

function registerIpc({ getMainWindow, getUserData, saveData, getPreferences, savePreferences, toggleWindow, registerToggleShortcut }) {
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
    registerToggleShortcut(accelerator);
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
}

module.exports = {
  registerIpc
};
