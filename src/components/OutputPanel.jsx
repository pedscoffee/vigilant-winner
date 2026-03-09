import { useMemo } from 'react';

export default function OutputPanel({ outputText, copiedAt, onCopyNow, onClear, isAutoCopyEnabled }) {
  const copiedText = useMemo(() => {
    if (!copiedAt) {
      return isAutoCopyEnabled ? 'Auto-copy ready' : 'Auto-copy off';
    }
    return '✓ Auto-copied';
  }, [copiedAt, isAutoCopyEnabled]);

  return (
    <div className="border-t border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Output Preview</p>
        <button
          className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
          onClick={onClear}
          type="button"
        >
          Clear
        </button>
      </div>
      <textarea
        className="h-40 w-full resize-none rounded border border-slate-300 bg-slate-50 p-2 text-xs text-slate-800"
        value={outputText}
        readOnly
      />
      <div className="mt-2 flex items-center justify-between">
        <button
          className="rounded bg-sea px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
          onClick={onCopyNow}
          type="button"
        >
          Copy Now
        </button>
        <span className="text-xs text-slate-500">{copiedText}</span>
      </div>
    </div>
  );
}
