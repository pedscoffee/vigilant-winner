import { create } from 'zustand';
import { buildOutputText, upsertUniqueLine } from '../lib/outputBuilder';
import { getDashboardApi } from '../lib/electronApi';

const api = getDashboardApi();

const defaultSections = {
  hpi: [],
  ros: [],
  exam: [],
  assessment: [],
  plan: []
};

function withVersion(nextValue, currentVersion = 1) {
  return {
    ...nextValue,
    _version: typeof nextValue._version === 'number' ? nextValue._version + 1 : currentVersion + 1
  };
}

export const useDashboardStore = create((set, get) => ({
  loaded: false,
  loadError: null,
  activeTab: 'ap',
  copiedAt: null,
  data: {
    wellVisit: { _version: 1, ages: {} },
    sickVisit: { _version: 1, complaints: {} },
    examFindings: { _version: 1, systems: {} },
    apLibrary: { _version: 1, entries: [] },
    inbox: { _version: 1, templates: [] },
    corrections: { _version: 1, rules: [] },
    preferences: { _version: 1, windowState: { autoCopy: true }, outputFormat: {} }
  },
  sections: defaultSections,
  outputText: '',

  initialize: async () => {
    try {
      const data = await api.loadData();
      set({
        loaded: true,
        data,
        outputText: buildOutputText(defaultSections, data.preferences)
      });
    } catch (error) {
      set({ loaded: true, loadError: String(error) });
    }
  },

  setActiveTab: (activeTab) => set({ activeTab }),

  clearOutput: () => {
    const { data } = get();
    const sections = { ...defaultSections };
    set({ sections, outputText: buildOutputText(sections, data.preferences) });
  },

  copyNow: async () => {
    const { outputText } = get();
    await api.copyToClipboard(outputText || '');
    set({ copiedAt: Date.now() });
  },

  toggleAlwaysOnTop: async () => {
    const next = await api.toggleAlwaysOnTop();
    const { data } = get();
    const preferences = withVersion({
      ...data.preferences,
      windowState: {
        ...(data.preferences.windowState || {}),
        alwaysOnTop: next
      }
    }, data.preferences._version || 1);

    const nextData = { ...data, preferences };
    set({ data: nextData });
    await api.saveData('preferences', preferences);
  },

  setApLibrary: async (updater) => {
    const { data } = get();
    const current = data.apLibrary;
    const apLibrary = withVersion(
      typeof updater === 'function' ? updater(current) : updater,
      current._version || 1
    );
    const nextData = { ...data, apLibrary };
    set({ data: nextData });
    await api.saveData('apLibrary', apLibrary);
  },

  addAssessmentPlan: (entry) => {
    const { sections, data } = get();
    const nextSections = {
      ...sections,
      assessment: upsertUniqueLine(sections.assessment, entry.name),
      plan: upsertUniqueLine(sections.plan, entry.text)
    };

    set({
      sections: nextSections,
      outputText: buildOutputText(nextSections, data.preferences)
    });
  }
}));
