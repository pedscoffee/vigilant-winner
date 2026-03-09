const DEFAULT_STATE = {
  width: 480,
  height: 700,
  alwaysOnTop: true,
  autoCopy: true,
  globalShortcut: 'CommandOrControl+Shift+N',
  outputOrder: ['hpi', 'ros', 'exam', 'assessment', 'plan']
};

function ensureWindowState(preferences = {}) {
  const windowState = preferences.windowState || {};
  return {
    ...DEFAULT_STATE,
    ...windowState,
    x: windowState.x,
    y: windowState.y
  };
}

function extractWindowState(browserWindow, previous = {}) {
  const bounds = browserWindow.getBounds();
  return {
    ...DEFAULT_STATE,
    ...previous,
    ...bounds,
    alwaysOnTop: browserWindow.isAlwaysOnTop()
  };
}

module.exports = {
  DEFAULT_STATE,
  ensureWindowState,
  extractWindowState
};
