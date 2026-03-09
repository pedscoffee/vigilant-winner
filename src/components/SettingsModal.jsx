import { useMemo, useState } from 'react';

const SECTIONS = ['hpi', 'ros', 'exam', 'assessment', 'plan'];

function moveItem(list, from, to) {
  if (to < 0 || to >= list.length) {
    return list;
  }
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export default function SettingsModal({
  data,
  onClose,
  onSetOutputFormat,
  onSetPreferencePatch,
  onSetDataKey,
  onExportBackup,
  onImportBackup
}) {
  const [active, setActive] = useState('format');

  const outputFormat = data.preferences?.outputFormat || {};
  const labels = outputFormat.labels || {};
  const order = outputFormat.order || SECTIONS;

  const shortcutRows = useMemo(() => {
    const apRows = (data.apLibrary?.entries || []).map((entry) => ({
      name: entry.name,
      local: entry.hotkey || '-',
      global: entry.globalHotkey || '-',
      code: entry.shortCode || '-',
      source: 'A&P'
    }));
    return apRows;
  }, [data]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3">
      <div className="flex h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-lg">
        <aside className="w-52 border-r border-slate-200 bg-slate-50 p-3">
          {[
            ['format', 'Output Format'],
            ['shortcuts', 'Shortcuts'],
            ['templates', 'Template Editor'],
            ['exam', 'Exam Defaults'],
            ['backup', 'Backup/Restore'],
            ['corrections', 'Known Corrections']
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`mb-2 block w-full rounded px-2 py-1 text-left text-sm ${
                active === id ? 'bg-sea text-white' : 'text-slate-700 hover:bg-slate-200'
              }`}
              onClick={() => setActive(id)}
            >
              {label}
            </button>
          ))}
        </aside>

        <section className="flex-1 overflow-y-auto p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-base font-semibold text-slate-900">Settings</p>
            <button className="rounded border border-slate-300 px-2 py-1 text-sm" type="button" onClick={onClose}>
              Close
            </button>
          </div>

          {active === 'format' ? (
            <div className="space-y-4">
              <label className="block text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={outputFormat.showHeaders !== false}
                  onChange={(event) =>
                    onSetOutputFormat({
                      ...outputFormat,
                      showHeaders: event.target.checked
                    })
                  }
                />{' '}
                Show section headers
              </label>

              <div>
                <p className="text-sm font-semibold text-slate-800">Section Order</p>
                <div className="mt-2 space-y-2">
                  {order.map((section, index) => (
                    <div key={section} className="flex items-center gap-2 rounded border border-slate-200 p-2">
                      <span className="w-24 text-sm uppercase text-slate-700">{section}</span>
                      <input
                        className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
                        value={labels[section] || section.toUpperCase()}
                        onChange={(event) =>
                          onSetOutputFormat({
                            ...outputFormat,
                            labels: { ...labels, [section]: event.target.value }
                          })
                        }
                      />
                      <button
                        className="rounded border border-slate-300 px-2 py-1 text-xs"
                        type="button"
                        onClick={() => onSetOutputFormat({ ...outputFormat, order: moveItem(order, index, index - 1) })}
                      >
                        Up
                      </button>
                      <button
                        className="rounded border border-slate-300 px-2 py-1 text-xs"
                        type="button"
                        onClick={() => onSetOutputFormat({ ...outputFormat, order: moveItem(order, index, index + 1) })}
                      >
                        Down
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">Separator Style</p>
                <select
                  className="mt-2 rounded border border-slate-300 px-2 py-1 text-sm"
                  value={outputFormat.separator || 'blank'}
                  onChange={(event) => onSetOutputFormat({ ...outputFormat, separator: event.target.value })}
                >
                  <option value="blank">Blank line</option>
                  <option value="line">Line break only</option>
                  <option value="dash">Bullet dash</option>
                </select>
              </div>
            </div>
          ) : null}

          {active === 'shortcuts' ? (
            <div className="space-y-4">
              <div className="rounded border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-900">Global Dashboard Shortcut</p>
                <input
                  className="mt-2 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                  value={data.preferences?.windowState?.globalShortcut || ''}
                  onChange={(event) =>
                    onSetPreferencePatch({
                      windowState: { ...(data.preferences?.windowState || {}), globalShortcut: event.target.value }
                    })
                  }
                />
              </div>
              <div className="rounded border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-900">Command Palette Shortcut</p>
                <input
                  className="mt-2 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                  value={data.preferences?.shortcuts?.globalCommandPalette || ''}
                  onChange={(event) =>
                    onSetPreferencePatch({
                      shortcuts: {
                        ...(data.preferences?.shortcuts || {}),
                        globalCommandPalette: event.target.value
                      }
                    })
                  }
                />
              </div>
              <div className="rounded border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-900">Assigned Entry Shortcuts</p>
                <div className="mt-2 overflow-x-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-500">
                        <th className="pr-3">Source</th>
                        <th className="pr-3">Entry</th>
                        <th className="pr-3">Local</th>
                        <th className="pr-3">Global</th>
                        <th className="pr-3">Code</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shortcutRows.map((row) => (
                        <tr key={`${row.source}-${row.name}`}>
                          <td className="pr-3">{row.source}</td>
                          <td className="pr-3">{row.name}</td>
                          <td className="pr-3">{row.local}</td>
                          <td className="pr-3">{row.global}</td>
                          <td className="pr-3">{row.code}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}

          {active === 'templates' ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-700">Edit templates inline in A&P and Inbox tabs. This panel offers quick toggles.</p>
              <label className="block text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={data.preferences?.windowState?.autoCopy !== false}
                  onChange={(event) =>
                    onSetPreferencePatch({
                      windowState: {
                        ...(data.preferences?.windowState || {}),
                        autoCopy: event.target.checked
                      }
                    })
                  }
                />{' '}
                Auto-copy on every output change
              </label>
            </div>
          ) : null}

          {active === 'exam' ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">Default included exam systems</p>
              {Object.keys(data.examFindings?.systems || {}).map((system) => {
                const checked = (data.preferences?.examDefaults?.includeSystems || {})[system]
                  ?? data.examFindings.systems[system].defaultIncluded
                  ?? true;
                return (
                  <label key={system} className="block text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => {
                        const includeSystems = {
                          ...(data.preferences?.examDefaults?.includeSystems || {}),
                          [system]: event.target.checked
                        };
                        onSetPreferencePatch({
                          examDefaults: {
                            ...(data.preferences?.examDefaults || {}),
                            includeSystems
                          }
                        });
                      }}
                    />{' '}
                    {system}
                  </label>
                );
              })}
            </div>
          ) : null}

          {active === 'backup' ? (
            <div className="space-y-3">
              <button className="rounded bg-sea px-3 py-1 text-sm text-white" type="button" onClick={onExportBackup}>
                Export Backup
              </button>
              <button className="rounded border border-slate-300 px-3 py-1 text-sm" type="button" onClick={onImportBackup}>
                Import Backup
              </button>
              <button
                className="rounded border border-rose-300 px-3 py-1 text-sm text-rose-700"
                type="button"
                onClick={() => {
                  onSetDataKey('wellVisit', { _version: 1, ages: {} });
                  onSetDataKey('sickVisit', { _version: 1, complaints: {} });
                  onSetDataKey('examFindings', { _version: 1, systems: {} });
                  onSetDataKey('apLibrary', { _version: 1, entries: [] });
                  onSetDataKey('inbox', {
                    _version: 1,
                    resultResponses: [],
                    messageReplies: [],
                    refillTemplates: [],
                    schoolForms: [],
                    priorAuth: []
                  });
                }}
              >
                Reset to minimal defaults
              </button>
            </div>
          ) : null}

          {active === 'corrections' ? (
            <div className="space-y-2">
              {(data.corrections?.rules || []).map((rule) => (
                <div key={rule.id} className="rounded border border-slate-200 p-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="rounded border border-slate-300 px-2 py-1 text-sm"
                      value={rule.find}
                      onChange={(event) =>
                        onSetDataKey('corrections', (current) => ({
                          ...current,
                          rules: current.rules.map((item) =>
                            item.id === rule.id ? { ...item, find: event.target.value } : item
                          )
                        }))
                      }
                    />
                    <input
                      className="rounded border border-slate-300 px-2 py-1 text-sm"
                      value={rule.replace}
                      onChange={(event) =>
                        onSetDataKey('corrections', (current) => ({
                          ...current,
                          rules: current.rules.map((item) =>
                            item.id === rule.id ? { ...item, replace: event.target.value } : item
                          )
                        }))
                      }
                    />
                  </div>
                </div>
              ))}
              <button
                className="rounded border border-slate-300 px-3 py-1 text-sm"
                type="button"
                onClick={() =>
                  onSetDataKey('corrections', (current) => ({
                    ...current,
                    rules: [...(current.rules || []), { id: `rule-${Date.now()}`, find: '', replace: '' }]
                  }))
                }
              >
                Add correction rule
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
