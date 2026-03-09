import { useEffect } from 'react';
import TabBar from './components/TabBar';
import OutputPanel from './components/OutputPanel';
import PlaceholderTab from './components/PlaceholderTab';
import APTab from './tabs/APTab';
import { useDashboardStore } from './state/useDashboardStore';

function ContentArea({ activeTab, data, onSaveAp, onAddToNote }) {
  if (activeTab === 'ap') {
    return <APTab apLibrary={data.apLibrary} onSave={onSaveAp} onAddToNote={onAddToNote} />;
  }

  const placeholders = {
    well: {
      title: 'Well Visit Builder',
      description: 'Phase 3 target: age-specific scaffolding, growth, screenings, and immunization language.'
    },
    sick: {
      title: 'Sick Visit Builder',
      description: 'Phase 3 target: chief complaint driven HPI/ROS/exam suggestions with merge + dedupe.'
    },
    exam: {
      title: 'Exam Builder',
      description: 'Phase 2 target: system-by-system normal/abnormal toggles with normal-everything macro.'
    },
    ros: {
      title: 'ROS Builder',
      description: 'Phase 2 target: structured ROS phrases aligned to complaints and exam templates.'
    },
    inbox: {
      title: 'Inbox Templates',
      description: 'Phase 4 target: result messaging, refill snippets, school note language, and PA templates.'
    },
    scribe: {
      title: 'Scribe Utilities',
      description: 'Reserved tab for future workflow helpers and correction snippets.'
    }
  };

  const tab = placeholders[activeTab] || placeholders.well;
  return <PlaceholderTab title={tab.title} description={tab.description} />;
}

export default function App() {
  const {
    loaded,
    loadError,
    activeTab,
    data,
    outputText,
    copiedAt,
    initialize,
    setActiveTab,
    clearOutput,
    copyNow,
    toggleAlwaysOnTop,
    setApLibrary,
    addAssessmentPlan
  } = useDashboardStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const escapeHandler = (event) => {
      if (event.key === 'Escape') {
        clearOutput();
      }
    };
    window.addEventListener('keydown', escapeHandler);
    return () => window.removeEventListener('keydown', escapeHandler);
  }, [clearOutput]);

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
        <button
          className={`rounded border px-2 py-1 text-xs ${
            isPinned ? 'border-sea text-sea' : 'border-slate-300 text-slate-600'
          }`}
          onClick={toggleAlwaysOnTop}
          type="button"
        >
          {isPinned ? 'Pinned' : 'Unpinned'}
        </button>
      </header>

      <TabBar activeTab={activeTab} onTabClick={setActiveTab} />

      <main className="min-h-0 flex-1 overflow-y-auto p-3">
        <ContentArea
          activeTab={activeTab}
          data={data}
          onSaveAp={setApLibrary}
          onAddToNote={addAssessmentPlan}
        />
      </main>

      <OutputPanel
        outputText={outputText}
        copiedAt={copiedAt}
        onCopyNow={copyNow}
        onClear={clearOutput}
        isAutoCopyEnabled={isAutoCopyEnabled}
      />
    </div>
  );
}
