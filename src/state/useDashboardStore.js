import { create } from 'zustand';
import { buildOutputText } from '../lib/outputBuilder';
import { getDashboardApi } from '../lib/electronApi';

const api = getDashboardApi();

const SECTIONS = ['hpi', 'ros', 'exam', 'assessment', 'plan'];

const emptyContrib = {
  hpi: {},
  ros: {},
  exam: {},
  assessment: {},
  plan: {}
};

function withVersion(nextValue, currentVersion = 1) {
  return {
    ...nextValue,
    _version: typeof nextValue._version === 'number' ? nextValue._version + 1 : currentVersion + 1
  };
}

function uniqueLinesBySource(sourceMap) {
  const seen = new Set();
  const lines = [];
  for (const source of Object.keys(sourceMap)) {
    for (const line of sourceMap[source] || []) {
      const text = String(line || '').trim();
      if (!text || seen.has(text)) {
        continue;
      }
      seen.add(text);
      lines.push(text);
    }
  }
  return lines;
}

function computeSections(contributions) {
  const sections = {};
  for (const key of SECTIONS) {
    sections[key] = uniqueLinesBySource(contributions[key] || {});
  }
  return sections;
}

function applyCorrections(text, corrections) {
  let result = text;
  for (const rule of corrections?.rules || []) {
    if (!rule.find) {
      continue;
    }
    result = result.split(rule.find).join(rule.replace ?? '');
  }
  return result;
}

function parseShortcut(event) {
  const parts = [];
  if (event.ctrlKey || event.metaKey) {
    parts.push('Control');
  }
  if (event.shiftKey) {
    parts.push('Shift');
  }
  if (event.altKey) {
    parts.push('Alt');
  }

  const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
  if (!['Shift', 'Control', 'Alt', 'Meta'].includes(key)) {
    parts.push(key);
  }

  return parts.join('+');
}

function blankData() {
  return {
    wellVisit: { _version: 1, ages: {} },
    sickVisit: { _version: 1, complaints: {} },
    examFindings: { _version: 1, systems: {} },
    apLibrary: { _version: 1, entries: [] },
    inbox: { _version: 1, resultResponses: [], messageReplies: [], refillTemplates: [], schoolForms: [], priorAuth: [] },
    corrections: { _version: 1, rules: [] },
    preferences: {
      _version: 1,
      windowState: { autoCopy: true, alwaysOnTop: true, globalShortcut: 'CommandOrControl+Shift+N' },
      outputFormat: { order: ['hpi', 'ros', 'exam', 'assessment', 'plan'], showHeaders: true },
      shortcuts: { globalCommandPalette: 'Control+Space', entries: [] },
      firstLaunchCompleted: false
    }
  };
}

export const useDashboardStore = create((set, get) => ({
  loaded: false,
  loadError: null,
  activeTab: 'ap',
  copiedAt: null,
  settingsOpen: false,
  commandPaletteOpen: false,
  onboardingOpen: false,
  contributions: emptyContrib,
  sections: { hpi: [], ros: [], exam: [], assessment: [], plan: [] },
  outputText: '',
  data: blankData(),

  initialize: async () => {
    try {
      const data = await api.loadData();
      const contributions = {
        hpi: {},
        ros: {},
        exam: {},
        assessment: {},
        plan: {}
      };
      const sections = computeSections(contributions);
      const output = buildOutputText(sections, data.preferences || {});
      set({
        loaded: true,
        data,
        contributions,
        sections,
        outputText: applyCorrections(output, data.corrections),
        onboardingOpen: data.preferences?.firstLaunchCompleted === false
      });
    } catch (error) {
      set({ loaded: true, loadError: String(error) });
    }
  },

  setActiveTab: (activeTab) => set({ activeTab }),
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),

  syncOutput: () => {
    const { contributions, data } = get();
    const sections = computeSections(contributions);
    const output = buildOutputText(sections, data.preferences || {});
    set({
      sections,
      outputText: applyCorrections(output, data.corrections)
    });
  },

  setContribution: (section, source, lines) => {
    const { contributions } = get();
    const next = {
      ...contributions,
      [section]: {
        ...contributions[section],
        [source]: lines
      }
    };
    set({ contributions: next });
    get().syncOutput();
  },

  clearContributionSource: (source) => {
    const { contributions } = get();
    const next = { ...contributions };
    for (const section of SECTIONS) {
      if (next[section][source]) {
        const sourceMap = { ...next[section] };
        delete sourceMap[source];
        next[section] = sourceMap;
      }
    }
    set({ contributions: next });
    get().syncOutput();
  },

  appendLine: (section, source, text) => {
    const { contributions } = get();
    const sourceLines = contributions[section][source] || [];
    if (sourceLines.includes(text)) {
      return;
    }
    get().setContribution(section, source, [...sourceLines, text]);
  },

  clearOutput: () => {
    set({
      contributions: { hpi: {}, ros: {}, exam: {}, assessment: {}, plan: {} }
    });
    get().syncOutput();
  },

  copyNow: async () => {
    const { outputText } = get();
    await api.copyToClipboard(outputText || '');
    set({ copiedAt: Date.now() });
  },

  toggleAlwaysOnTop: async () => {
    const next = await api.toggleAlwaysOnTop();
    const { data } = get();
    const preferences = withVersion(
      {
        ...data.preferences,
        windowState: {
          ...(data.preferences.windowState || {}),
          alwaysOnTop: next
        }
      },
      data.preferences._version || 1
    );

    const nextData = { ...data, preferences };
    set({ data: nextData });
    await api.saveData('preferences', preferences);
  },

  setOutputFormat: async (nextOutputFormat) => {
    const { data } = get();
    const preferences = withVersion(
      {
        ...data.preferences,
        outputFormat: nextOutputFormat
      },
      data.preferences._version || 1
    );

    const nextData = { ...data, preferences };
    set({ data: nextData });
    await api.saveData('preferences', preferences);
    get().syncOutput();
  },

  setPreferencePatch: async (patch) => {
    const { data } = get();
    const preferences = withVersion(
      {
        ...data.preferences,
        ...patch
      },
      data.preferences._version || 1
    );
    const nextData = { ...data, preferences };
    set({ data: nextData });
    await api.saveData('preferences', preferences);
    get().syncOutput();
  },

  setDataKey: async (key, updater) => {
    const { data } = get();
    const current = data[key];
    const nextRaw = typeof updater === 'function' ? updater(current) : updater;
    const nextValue = withVersion(nextRaw, current?._version || 1);
    const nextData = { ...data, [key]: nextValue };
    set({ data: nextData });
    await api.saveData(key, nextValue);
    get().syncOutput();
  },

  addAssessmentPlan: (entry) => {
    get().appendLine('assessment', 'ap', entry.name);
    get().appendLine('plan', 'ap', entry.text);
  },

  addInboxText: (label, text) => {
    get().appendLine('plan', 'inbox', `${label}: ${text}`);
  },

  applyShortcutPhrase: (entry) => {
    if (!entry?.text) {
      return;
    }
    if (entry.source === 'ap') {
      get().appendLine('assessment', 'ap', entry.name);
      get().appendLine('plan', 'ap', entry.text);
      return;
    }
    get().appendLine('plan', 'inbox', `${entry.name}: ${entry.text}`);
  },

  handleLocalShortcut: (event) => {
    const { data } = get();
    const key = parseShortcut(event);
    const entries = data.apLibrary?.entries || [];
    const match = entries.find((entry) => entry.hotkey === key);
    if (match) {
      event.preventDefault();
      get().addAssessmentPlan(match);
      return true;
    }

    if (key === 'Escape') {
      event.preventDefault();
      get().clearOutput();
      return true;
    }

    return false;
  },

  exportBackup: async () => api.exportBackup(),

  importBackup: async () => {
    const result = await api.importBackup();
    if (!result.canceled) {
      await get().initialize();
    }
    return result;
  },

  completeOnboarding: async () => {
    await get().setPreferencePatch({ firstLaunchCompleted: true });
    set({ onboardingOpen: false });
  }
}));
