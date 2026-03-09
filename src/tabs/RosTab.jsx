import { useEffect, useMemo, useState } from 'react';

const SYSTEMS = ['Constitutional', 'HEENT', 'Respiratory', 'Cardiovascular', 'GI', 'GU', 'Skin', 'Neuro', 'Psych'];

const DEFAULT_NORMAL = {
  Constitutional: 'No fever or fatigue',
  HEENT: 'No ear pain, no sore throat',
  Respiratory: 'No shortness of breath',
  Cardiovascular: 'No chest pain',
  GI: 'No vomiting or diarrhea',
  GU: 'No dysuria',
  Skin: 'No new rash',
  Neuro: 'No headache or focal weakness',
  Psych: 'No acute mood concerns'
};

export default function RosTab({ onSetContribution }) {
  const [state, setState] = useState(
    SYSTEMS.reduce((acc, system) => {
      acc[system] = { mode: 'normal', text: DEFAULT_NORMAL[system] };
      return acc;
    }, {})
  );

  const lines = useMemo(() => {
    return SYSTEMS.map((system) => {
      const row = state[system];
      if (!row || row.mode === 'omit') {
        return null;
      }
      const prefix = row.mode === 'positive' ? 'Positive for' : 'Negative for';
      return `${system}: ${prefix} ${row.text}.`;
    }).filter(Boolean);
  }, [state]);

  useEffect(() => {
    onSetContribution('ros', 'ros-builder', lines);
  }, [lines, onSetContribution]);

  return (
    <div className="space-y-2">
      {SYSTEMS.map((system) => {
        const row = state[system];
        return (
          <div key={system} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">{system}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`rounded px-2 py-1 text-xs ${
                    row.mode === 'normal' ? 'bg-sea text-white' : 'border border-slate-300 text-slate-700'
                  }`}
                  onClick={() => setState((prev) => ({ ...prev, [system]: { ...prev[system], mode: 'normal' } }))}
                >
                  Negative
                </button>
                <button
                  type="button"
                  className={`rounded px-2 py-1 text-xs ${
                    row.mode === 'positive' ? 'bg-ember text-white' : 'border border-slate-300 text-slate-700'
                  }`}
                  onClick={() => setState((prev) => ({ ...prev, [system]: { ...prev[system], mode: 'positive' } }))}
                >
                  Positive
                </button>
                <button
                  type="button"
                  className={`rounded px-2 py-1 text-xs ${
                    row.mode === 'omit' ? 'bg-slate-500 text-white' : 'border border-slate-300 text-slate-700'
                  }`}
                  onClick={() => setState((prev) => ({ ...prev, [system]: { ...prev[system], mode: 'omit' } }))}
                >
                  Omit
                </button>
              </div>
            </div>
            <input
              className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
              value={row.text}
              onChange={(event) => setState((prev) => ({ ...prev, [system]: { ...prev[system], text: event.target.value } }))}
            />
          </div>
        );
      })}
    </div>
  );
}
