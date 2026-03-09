import { useEffect, useMemo, useState } from 'react';

export default function CommandPalette({ open, apLibrary, inbox, onClose, onApply }) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);

  const items = useMemo(() => {
    const apItems = (apLibrary?.entries || []).map((entry) => ({
      type: 'ap',
      id: entry.id,
      name: entry.name,
      code: entry.shortCode || '',
      text: entry.text,
      source: 'ap'
    }));

    const inboxItems = [
      ...(inbox?.resultResponses || []),
      ...(inbox?.messageReplies || []),
      ...(inbox?.schoolForms || [])
    ].map((entry) => ({
      type: 'inbox',
      id: entry.id,
      name: entry.name,
      code: entry.shortCode || '',
      text: entry.text,
      source: 'inbox'
    }));

    return [...apItems, ...inboxItems];
  }, [apLibrary, inbox]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (!needle) return true;
      return `${item.name} ${item.code}`.toLowerCase().includes(needle);
    });
  }, [items, query]);

  useEffect(() => {
    setIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) return;
    const handler = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setIndex((prev) => Math.min(prev + 1, Math.max(filtered.length - 1, 0)));
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setIndex((prev) => Math.max(prev - 1, 0));
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        const selected = filtered[index];
        if (selected) {
          onApply(selected);
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, filtered, index, onClose, onApply]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-slate-900/30 pt-20">
      <div className="w-full max-w-xl rounded-lg border border-slate-300 bg-white p-3 shadow-xl">
        <input
          autoFocus
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          placeholder="Type short code or phrase..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="mt-2 max-h-72 overflow-y-auto">
          {filtered.slice(0, 15).map((item, idx) => (
            <button
              key={`${item.type}-${item.id}`}
              className={`mb-1 block w-full rounded px-2 py-2 text-left text-sm ${
                idx === index ? 'bg-sea text-white' : 'bg-slate-50 text-slate-800'
              }`}
              onClick={() => {
                onApply(item);
                onClose();
              }}
              type="button"
            >
              <span className="font-semibold">{item.name}</span>
              <span className="ml-2 text-xs opacity-80">{item.code || 'no-code'}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
