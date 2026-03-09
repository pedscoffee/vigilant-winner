const path = require('node:path');
const { app, BrowserWindow, Menu, Tray, nativeImage, globalShortcut } = require('electron');
const { ensureUserDataFiles, loadAllData, saveDataFile } = require('./dataStore');
const { ensureWindowState, extractWindowState } = require('./windowState');
const { registerIpc } = require('./ipc');

let mainWindow;
let tray;
let userDataDir;
let currentData;
let isQuitting = false;

function getPreferences() {
  return currentData.preferences || {};
}

function savePreferences(nextPreferences) {
  currentData.preferences = nextPreferences;
  saveDataFile(userDataDir, 'preferences', nextPreferences);
}

function createMainWindow() {
  const windowState = ensureWindowState(getPreferences());

  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    minWidth: 400,
    minHeight: 520,
    frame: true,
    title: 'Clinical Dashboard',
    alwaysOnTop: windowState.alwaysOnTop,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.on('close', (event) => {
    const prefs = getPreferences();
    savePreferences({
      ...prefs,
      windowState: extractWindowState(mainWindow, prefs.windowState)
    });

    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function toggleWindowVisibility() {
  if (!mainWindow) {
    return;
  }

  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
}

function registerToggleShortcut(accelerator) {
  globalShortcut.unregisterAll();
  globalShortcut.register(accelerator, toggleWindowVisibility);
}

function createTray() {
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show/Hide Dashboard', click: toggleWindowVisibility },
    {
      label: 'Always on top',
      type: 'checkbox',
      checked: mainWindow.isAlwaysOnTop(),
      click: (item) => {
        mainWindow.setAlwaysOnTop(item.checked, 'screen-saver');
        const prefs = getPreferences();
        savePreferences({
          ...prefs,
          windowState: {
            ...(prefs.windowState || {}),
            alwaysOnTop: item.checked
          }
        });
      }
    },
    { type: 'separator' },
    { role: 'quit' }
  ]);

  tray.setToolTip('Pediatric Clinical Dashboard');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', toggleWindowVisibility);
}

app.whenReady().then(() => {
  userDataDir = ensureUserDataFiles(app.getPath('userData'));
  currentData = loadAllData(userDataDir);

  createMainWindow();
  createTray();
  registerToggleShortcut(ensureWindowState(getPreferences()).globalShortcut);

  registerIpc({
    getMainWindow: () => mainWindow,
    getUserData: () => currentData,
    saveData: (key, value) => {
      currentData[key] = value;
      saveDataFile(userDataDir, key, value);
    },
    getPreferences,
    savePreferences,
    toggleWindow: toggleWindowVisibility,
    registerToggleShortcut
  });
});

app.on('window-all-closed', (event) => {
  event.preventDefault();
});

app.on('activate', () => {
  if (!mainWindow) {
    createMainWindow();
  }
  mainWindow.show();
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
