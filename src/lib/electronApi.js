const fallbackApi = {
  loadData: async () => ({
    wellVisit: { _version: 1, ages: {} },
    sickVisit: { _version: 1, complaints: {} },
    examFindings: { _version: 1, systems: {} },
    apLibrary: { _version: 1, entries: [] },
    inbox: { _version: 1, templates: [] },
    corrections: { _version: 1, rules: [] },
    preferences: { _version: 1, windowState: {}, outputFormat: {} }
  }),
  saveData: async () => true,
  copyToClipboard: async (text) => navigator.clipboard?.writeText(text ?? ''),
  toggleAlwaysOnTop: async () => false,
  showHideWindow: async () => true,
  setToggleShortcut: async () => true
};

export function getDashboardApi() {
  if (window.dashboardApi) {
    return window.dashboardApi;
  }
  return fallbackApi;
}
