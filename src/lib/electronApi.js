const fallbackApi = {
  loadData: async () => ({
    wellVisit: { _version: 1, ages: {} },
    sickVisit: { _version: 1, complaints: {} },
    examFindings: { _version: 1, systems: {} },
    apLibrary: { _version: 1, entries: [] },
    inbox: { _version: 1, resultResponses: [], messageReplies: [], refillTemplates: [], schoolForms: [], priorAuth: [] },
    corrections: { _version: 1, rules: [] },
    preferences: { _version: 1, windowState: {}, outputFormat: {}, shortcuts: { entries: [] } }
  }),
  saveData: async () => true,
  copyToClipboard: async (text) => navigator.clipboard?.writeText(text ?? ''),
  toggleAlwaysOnTop: async () => false,
  showHideWindow: async () => true,
  setToggleShortcut: async () => true,
  exportBackup: async () => ({ canceled: true }),
  importBackup: async () => ({ canceled: true }),
  onPhraseAppend: () => () => {},
  onCommandPaletteOpen: () => () => {}
};

export function getDashboardApi() {
  if (window.dashboardApi) {
    return window.dashboardApi;
  }
  return fallbackApi;
}
