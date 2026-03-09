import { useEffect } from 'react';
import TabBar from './components/TabBar';
import OutputPanel from './components/OutputPanel';
import PlaceholderTab from './components/PlaceholderTab';
import SettingsModal from './components/SettingsModal';
import CommandPalette from './components/CommandPalette';
import OnboardingModal from './components/OnboardingModal';
import APTab from './tabs/APTab';
import ExamTab from './tabs/ExamTab';
import RosTab from './tabs/RosTab';
import WellTab from './tabs/WellTab';
import SickTab from './tabs/SickTab';
import InboxTab from './tabs/InboxTab';
import { useDashboardStore } from './state/useDashboardStore';
import { getDashboardApi } from './lib/electronApi';

const api = getDashboardApi();

function ContentArea({ activeTab, data, actions }) {
  if (activeTab === 'ap') {
    return <APTab apLibrary={data.apLibrary} onSave={(updater) => actions.setDataKey('apLibrary', updater)} onAddToNote={actions.addAssessmentPlan} />;
  }

  if (activeTab === 'exam') {
    return (
      <ExamTab
        examFindings={data.examFindings}
        preferences={data.preferences}
        onSetContribution={actions.setContribution}
      />
    );
  }

  if (activeTab === 'ros') {
    return <RosTab onSetContribution={actions.setContribution} />;
  }

  if (activeTab === 'well') {
    return <WellTab wellVisit={data.wellVisit} onSetContribution={actions.setContribution} />;
  }

  if (activeTab === 'sick') {
    return (
      <SickTab
        sickVisit={data.sickVisit}
        apLibrary={data.apLibrary}
        onSetContribution={actions.setContribution}
        onAddToNote={actions.addAssessmentPlan}
        onAppendAssessment={(text) => actions.appendLine('assessment', 'sick-dx', text)}
      />
    );
  }

  if (activeTab === 'inbox') {
    return (
      <InboxTab
        inbox={data.inbox}
        onAddToPlan={(label, text) => actions.addInboxText(label, text)}
      />
    );
  }

  if (activeTab === 'scribe') {
    return (
      <PlaceholderTab
        title="Scribe Helpers"
        description="Use Known Corrections in Settings to define find/replace cleanup rules that are automatically applied to output text."
      />
    );
  }

  return <PlaceholderTab title="Dashboard" description="Select a tab to begin." />;
}

export default function App() {
  const {
    loaded,
    loadError,
    activeTab,
    data,
    outputText,
    copiedAt,
    settingsOpen,
    commandPaletteOpen,
    onboardingOpen,
    initialize,
    setActiveTab,
    openSettings,
    closeSettings,
    openCommandPalette,
    closeCommandPalette,
    clearOutput,
    copyNow,
    toggleAlwaysOnTop,
    setOutputFormat,
    setPreferencePatch,
    setDataKey,
    setContribution,
    appendLine,
    addAssessmentPlan,
    addInboxText,
    applyShortcutPhrase,
    handleLocalShortcut,
    exportBackup,
    importBackup,
    completeOnboarding
  } = useDashboardStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const localHandler = (event) => {
      handleLocalShortcut(event);
    };
    window.addEventListener('keydown', localHandler);
    return () => window.removeEventListener('keydown', localHandler);
  }, [handleLocalShortcut]);

  useEffect(() => {
    const disposePhrase = api.onPhraseAppend((payload) => {
      applyShortcutPhrase(payload);
    });
    const disposePalette = api.onCommandPaletteOpen(() => {
      openCommandPalette();
    });
    return () => {
      disposePhrase();
      disposePalette();
    };
  }, [applyShortcutPhrase, openCommandPalette]);

  useEffect(() => {
    if (!loaded) {
      return undefined;
    }

    const autoCopyEnabled = data.preferences?.windowState?.autoCopy !== false;
    if (!autoCopyEnabled) {
      return undefined;
    }

    const handle = setTimeout(async () => {
      await copyNow();
    }, 300);

    return () => clearTimeout(handle);
  }, [loaded, outputText, data.preferences, copyNow]);

  if (!loaded) {
    return <div className="flex h-full items-center justify-center bg-fog text-sm text-slate-500">Loading...</div>;
  }

  if (loadError) {
    return <div className="m-4 rounded border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700">{loadError}</div>;
  }

  const isPinned = data.preferences?.windowState?.alwaysOnTop !== false;
  const isAutoCopyEnabled = data.preferences?.windowState?.autoCopy !== false;

  return (
    <div className="flex h-full flex-col bg-fog">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2">
        <div>
          <p className="text-sm font-semibold text-slate-800">Clinical Dashboard</p>
          <p className="text-[11px] text-slate-500">Offline phrase workflow for pediatric outpatient notes</p>
        </div>
        <div className="flex gap-2">
          <button
            className={`rounded border px-2 py-1 text-xs ${
              isPinned ? 'border-sea text-sea' : 'border-slate-300 text-slate-600'
            }`}
            onClick={toggleAlwaysOnTop}
            type="button"
          >
            {isPinned ? 'Pinned' : 'Unpinned'}
          </button>
          <button className="rounded border border-slate-300 px-2 py-1 text-xs" type="button" onClick={openCommandPalette}>
            Palette
          </button>
        </div>
      </header>

      <TabBar activeTab={activeTab} onTabClick={setActiveTab} onOpenSettings={openSettings} />

      <main className="min-h-0 flex-1 overflow-y-auto p-3">
        <ContentArea
          activeTab={activeTab}
          data={data}
          actions={{ setDataKey, addAssessmentPlan, addInboxText, setContribution, appendLine }}
        />
      </main>

      <OutputPanel
        outputText={outputText}
        copiedAt={copiedAt}
        onCopyNow={copyNow}
        onClear={clearOutput}
        isAutoCopyEnabled={isAutoCopyEnabled}
      />

      {settingsOpen ? (
        <SettingsModal
          data={data}
          onClose={closeSettings}
          onSetOutputFormat={setOutputFormat}
          onSetPreferencePatch={setPreferencePatch}
          onSetDataKey={setDataKey}
          onExportBackup={exportBackup}
          onImportBackup={importBackup}
        />
      ) : null}

      <CommandPalette
        open={commandPaletteOpen}
        apLibrary={data.apLibrary}
        inbox={data.inbox}
        onClose={closeCommandPalette}
        onApply={(item) => applyShortcutPhrase(item)}
      />

      <OnboardingModal open={onboardingOpen} onComplete={completeOnboarding} />
    </div>
  );
}
