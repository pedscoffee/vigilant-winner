import { useEffect, useMemo, useState } from 'react';

function buildInitialState(systems, includeSystems = {}) {
  const state = {};
  for (const [name, config] of Object.entries(systems || {})) {
    const defaultIncluded = includeSystems[name] ?? config.defaultIncluded ?? true;
    state[name] = {
      mode: defaultIncluded ? 'normal' : 'omit',
      selected: [],
      freeText: ''
    };
  }
  return state;
}

function asExamLine(system, config, status) {
  if (status.mode === 'omit') {
    return null;
  }

  if (status.mode === 'normal') {
    return `${system}: ${config.normal}`;
  }

  const findings = [...status.selected];
  if (status.freeText.trim()) {
    findings.push(status.freeText.trim());
  }
  if (!findings.length) {
    return `${system}: abnormal finding noted.`;
  }
  return `${system}: ${findings.join(', ')}.`;
}

export default function ExamTab({ examFindings, preferences, onSetContribution }) {
  const systems = examFindings?.systems || {};
  const includeSystems = preferences?.examDefaults?.includeSystems || {};

  const [state, setState] = useState(() => buildInitialState(systems, includeSystems));

  useEffect(() => {
    setState(buildInitialState(systems, includeSystems));
  }, [examFindings, preferences]);

  const lines = useMemo(() => {
    return Object.entries(systems)
      .map(([system, config]) => asExamLine(system, config, state[system] || { mode: 'omit', selected: [], freeText: '' }))
      .filter(Boolean);
  }, [systems, state]);

  useEffect(() => {
    onSetContribution('exam', 'exam-builder', lines);
  }, [lines, onSetContribution]);

  const systemEntries = Object.entries(systems);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          className="rounded border border-sea px-3 py-1 text-sm text-sea hover:bg-teal-50"
          type="button"
          onClick={() => {
            const next = {};
            for (const [name] of systemEntries) {
              next[name] = { mode: 'normal', selected: [], freeText: '' };
            }
            setState(next);
          }}
        >
          Normal everything
        </button>
        <button
          className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-700"
          type="button"
          onClick={() => {
            const next = {};
            for (const [name] of systemEntries) {
              next[name] = { mode: 'omit', selected: [], freeText: '' };
            }
            setState(next);
          }}
        >
          Clear all
        </button>
      </div>

      {systemEntries.map(([system, config]) => {
        const status = state[system] || { mode: 'omit', selected: [], freeText: '' };
        return (
          <div key={system} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">{system}</p>
              <div className="flex gap-2">
                <button
                  className={`rounded px-2 py-1 text-xs ${
                    status.mode === 'normal' ? 'bg-sea text-white' : 'border border-slate-300 text-slate-700'
                  }`}
                  type="button"
                  onClick={() => setState((prev) => ({ ...prev, [system]: { ...status, mode: 'normal', selected: [], freeText: '' } }))}
                >
                  Normal
                </button>
                <button
                  className={`rounded px-2 py-1 text-xs ${
                    status.mode === 'abnormal' ? 'bg-ember text-white' : 'border border-slate-300 text-slate-700'
                  }`}
                  type="button"
                  onClick={() => setState((prev) => ({ ...prev, [system]: { ...status, mode: 'abnormal' } }))}
                >
                  Abnormal
                </button>
                <button
                  className={`rounded px-2 py-1 text-xs ${
                    status.mode === 'omit' ? 'bg-slate-500 text-white' : 'border border-slate-300 text-slate-700'
                  }`}
                  type="button"
                  onClick={() => setState((prev) => ({ ...prev, [system]: { ...status, mode: 'omit', selected: [], freeText: '' } }))}
                >
                  Omit
                </button>
              </div>
            </div>

            {status.mode === 'abnormal' ? (
              <div className="mt-2 space-y-2 rounded border border-amber-200 bg-amber-50 p-2">
                <div className="flex flex-wrap gap-2">
                  {(config.abnormal || []).map((finding) => {
                    const selected = status.selected.includes(finding);
                    return (
                      <button
                        key={finding}
                        className={`rounded border px-2 py-1 text-xs ${
                          selected ? 'border-amber-600 bg-amber-200 text-amber-900' : 'border-amber-300 text-amber-900'
                        }`}
                        type="button"
                        onClick={() =>
                          setState((prev) => {
                            const prevStatus = prev[system];
                            const selectedSet = new Set(prevStatus.selected);
                            if (selectedSet.has(finding)) {
                              selectedSet.delete(finding);
                            } else {
                              selectedSet.add(finding);
                            }
                            return {
                              ...prev,
                              [system]: { ...prevStatus, selected: [...selectedSet] }
                            };
                          })
                        }
                      >
                        {finding}
                      </button>
                    );
                  })}
                </div>
                <input
                  className="w-full rounded border border-amber-300 px-2 py-1 text-sm"
                  placeholder="Additional finding"
                  value={status.freeText}
                  onChange={(event) =>
                    setState((prev) => ({ ...prev, [system]: { ...prev[system], freeText: event.target.value } }))
                  }
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
