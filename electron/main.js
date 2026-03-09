const fs = require('node:fs');
const path = require('node:path');
const { app, BrowserWindow, Menu, Tray, nativeImage, globalShortcut, clipboard } = require('electron');
const { ensureUserDataFiles, loadAllData, saveDataFile, DATA_FILES } = require('./dataStore');
const { ensureWindowState, extractWindowState } = require('./windowState');
const { registerIpc } = require('./ipc');

let mainWindow;
let tray;
let userDataDir;
let currentData;
let isQuitting = false;
let toggleAccelerator;
let paletteAccelerator;
let phraseAccelerators = [];

function getPreferences() {
  return currentData.preferences || {};
}

function savePreferences(nextPreferences) {
  currentData.preferences = nextPreferences;
  saveDataFile(userDataDir, 'preferences', nextPreferences);
}

function sendToRenderer(channel, payload) {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }
  mainWindow.webContents.send(channel, payload);
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

function clearPhraseHotkeys() {
  for (const accelerator of phraseAccelerators) {
    globalShortcut.unregister(accelerator);
  }
  phraseAccelerators = [];
}

function registerToggleShortcut(accelerator) {
  const nextAccelerator = accelerator || 'CommandOrControl+Shift+N';
  if (toggleAccelerator) {
    globalShortcut.unregister(toggleAccelerator);
  }
  const ok = globalShortcut.register(nextAccelerator, toggleWindowVisibility);
  if (ok) {
    toggleAccelerator = nextAccelerator;
  }
  return ok;
}

function registerPaletteShortcut() {
  const prefs = getPreferences();
  const nextAccelerator = prefs.shortcuts?.globalCommandPalette || 'Control+Space';
  if (paletteAccelerator) {
    globalShortcut.unregister(paletteAccelerator);
  }

  const ok = globalShortcut.register(nextAccelerator, () => {
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    }
    mainWindow.focus();
    sendToRenderer('command-palette:open', {});
  });

  if (ok) {
    paletteAccelerator = nextAccelerator;
  }
}

function registerPhraseHotkeys() {
  clearPhraseHotkeys();

  const apEntries = currentData.apLibrary?.entries || [];
  const inboxTemplates = [
    ...(currentData.inbox?.resultResponses || []),
    ...(currentData.inbox?.messageReplies || []),
    ...(currentData.inbox?.schoolForms || [])
  ];

  const candidates = [
    ...apEntries.map((entry) => ({
      source: 'ap',
      id: entry.id,
      name: entry.name,
      text: entry.text,
      accelerator: entry.globalHotkey
    })),
    ...inboxTemplates.map((entry) => ({
      source: 'inbox',
      id: entry.id,
      name: entry.name,
      text: entry.text,
      accelerator: entry.globalHotkey
    }))
  ].filter((entry) => entry.accelerator && entry.text);

  for (const entry of candidates) {
    if (entry.accelerator === toggleAccelerator || entry.accelerator === paletteAccelerator) {
      continue;
    }

    const ok = globalShortcut.register(entry.accelerator, () => {
      clipboard.writeText(entry.text);
      sendToRenderer('phrase:append', entry);
    });

    if (ok) {
      phraseAccelerators.push(entry.accelerator);
    }
  }
}

function createMainWindow() {
  const windowState = ensureWindowState(getPreferences());

  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    minWidth: 420,
    minHeight: 560,
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

function createTray() {
  const tinyPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wn7gN8AAAAASUVORK5CYII=';
  const icon = nativeImage.createFromDataURL(`data:image/png;base64,${tinyPng}`);
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

function exportBundle(targetPath) {
  const data = DATA_FILES.reduce((acc, fileName) => {
    const key = fileName.replace('.json', '');
    acc[key] = currentData[key];
    return acc;
  }, {});

  const bundle = {
    exportedAt: new Date().toISOString(),
    data
  };

  fs.writeFileSync(targetPath, `${JSON.stringify(bundle, null, 2)}\n`, 'utf8');
}

function importBundle(sourcePath) {
  const raw = fs.readFileSync(sourcePath, 'utf8');
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || !parsed.data) {
    throw new Error('Invalid backup file format.');
  }

  for (const fileName of DATA_FILES) {
    const key = fileName.replace('.json', '');
    if (parsed.data[key] === undefined) {
      continue;
    }
    currentData[key] = parsed.data[key];
    saveDataFile(userDataDir, key, parsed.data[key]);
  }

  registerPaletteShortcut();
  registerPhraseHotkeys();
}

app.whenReady().then(() => {
  userDataDir = ensureUserDataFiles(app.getPath('userData'));
  currentData = loadAllData(userDataDir);

  createMainWindow();
  createTray();
  registerToggleShortcut(ensureWindowState(getPreferences()).globalShortcut);
  registerPaletteShortcut();
  registerPhraseHotkeys();

  registerIpc({
    getMainWindow: () => mainWindow,
    getUserData: () => currentData,
    saveData: (key, value) => {
      currentData[key] = value;
      saveDataFile(userDataDir, key, value);
      if (key === 'preferences') {
        registerToggleShortcut(value.windowState?.globalShortcut || 'CommandOrControl+Shift+N');
        registerPaletteShortcut();
      }
      if (key === 'apLibrary' || key === 'inbox') {
        registerPhraseHotkeys();
      }
    },
    getPreferences,
    savePreferences,
    toggleWindow: toggleWindowVisibility,
    registerToggleShortcut,
    exportBundle,
    importBundle
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
