import { useMemo, useState } from 'react';

const CATEGORIES = [
  'Infections',
  'Respiratory',
  'GI',
  'Skin',
  'Behavioral/Dev',
  'Musculoskeletal',
  'Well Visit Diagnoses',
  'Preventive/Screenings',
  'Referrals',
  'Chronic Conditions',
  'Medications',
  'Follow-up'
];

function parseTags(tagValue) {
  return tagValue
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function makeEntryId() {
  return `entry_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function APTab({ apLibrary, onSave, onAddToNote }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ name: '', category: 'Infections', tags: '', text: '' });
  const [isCreating, setIsCreating] = useState(false);

  const entries = apLibrary?.entries || [];

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return entries.filter((entry) => {
      const categoryMatch = category === 'All' || entry.category === category;
      const text = `${entry.name} ${entry.text} ${(entry.tags || []).join(' ')}`.toLowerCase();
      const searchMatch = !needle || text.includes(needle);
      return categoryMatch && searchMatch;
    });
  }, [entries, search, category]);

  async function saveEdit(id) {
    await onSave((current) => ({
      ...current,
      entries: current.entries.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              name: draft.name,
              category: draft.category,
              tags: parseTags(draft.tags),
              text: draft.text
            }
          : entry
      )
    }));
    setEditingId(null);
  }

  async function createEntry() {
    await onSave((current) => ({
      ...current,
      entries: [
        ...current.entries,
        {
          id: makeEntryId(),
          name: draft.name,
          category: draft.category,
          tags: parseTags(draft.tags),
          text: draft.text,
          shortCode: '',
          hotkey: ''
        }
      ]
    }));
    setDraft({ name: '', category: 'Infections', tags: '', text: '' });
    setIsCreating(false);
  }

  async function deleteEntry(id) {
    await onSave((current) => ({
      ...current,
      entries: current.entries.filter((entry) => entry.id !== id)
    }));
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search diagnoses, text, tags"
          />
          <select
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <button
          className="mt-2 rounded border border-sea px-3 py-1 text-sm text-sea hover:bg-teal-50"
          onClick={() => {
            setDraft({ name: '', category: 'Infections', tags: '', text: '' });
            setIsCreating(true);
          }}
          type="button"
        >
          New entry
        </button>
      </div>

      {isCreating ? (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3">
          <p className="mb-2 text-sm font-semibold text-emerald-900">Create A&P Entry</p>
          <div className="space-y-2">
            <input
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              value={draft.name}
              onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Diagnosis name"
            />
            <select
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              value={draft.category}
              onChange={(event) => setDraft((prev) => ({ ...prev, category: event.target.value }))}
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <input
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              value={draft.tags}
              onChange={(event) => setDraft((prev) => ({ ...prev, tags: event.target.value }))}
              placeholder="Tags (comma-separated)"
            />
            <textarea
              className="h-28 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              value={draft.text}
              onChange={(event) => setDraft((prev) => ({ ...prev, text: event.target.value }))}
              placeholder="Plan text"
            />
            <div className="flex gap-2">
              <button
                className="rounded bg-sea px-3 py-1 text-sm text-white hover:bg-teal-700 disabled:opacity-50"
                onClick={createEntry}
                disabled={!draft.name.trim() || !draft.text.trim()}
                type="button"
              >
                Save
              </button>
              <button
                className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-700"
                onClick={() => setIsCreating(false)}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        {filtered.map((entry) => {
          const isExpanded = expandedId === entry.id;
          const isEditing = editingId === entry.id;

          return (
            <div key={entry.id} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{entry.name}</p>
                  <p className="text-xs text-slate-500">{entry.category}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  >
                    {isExpanded ? 'Hide' : 'View'}
                  </button>
                  <button
                    className="rounded bg-sea px-2 py-1 text-xs text-white"
                    type="button"
                    onClick={() => onAddToNote(entry)}
                  >
                    Add to note
                  </button>
                </div>
              </div>

              {isExpanded ? (
                <div className="mt-2 rounded border border-slate-200 bg-slate-50 p-2">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                        value={draft.name}
                        onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
                      />
                      <select
                        className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                        value={draft.category}
                        onChange={(event) => setDraft((prev) => ({ ...prev, category: event.target.value }))}
                      >
                        {CATEGORIES.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                      <input
                        className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                        value={draft.tags}
                        onChange={(event) => setDraft((prev) => ({ ...prev, tags: event.target.value }))}
                      />
                      <textarea
                        className="h-28 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                        value={draft.text}
                        onChange={(event) => setDraft((prev) => ({ ...prev, text: event.target.value }))}
                      />
                      <div className="flex gap-2">
                        <button
                          className="rounded bg-sea px-2 py-1 text-xs text-white"
                          type="button"
                          onClick={() => saveEdit(entry.id)}
                        >
                          Save
                        </button>
                        <button
                          className="rounded border border-slate-300 px-2 py-1 text-xs"
                          type="button"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="whitespace-pre-wrap text-sm text-slate-800">{entry.text}</p>
                      <div className="mt-2 flex gap-2">
                        <button
                          className="rounded border border-slate-300 px-2 py-1 text-xs"
                          type="button"
                          onClick={() => {
                            setDraft({
                              name: entry.name,
                              category: entry.category,
                              tags: (entry.tags || []).join(', '),
                              text: entry.text
                            });
                            setEditingId(entry.id);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700"
                          type="button"
                          onClick={() => deleteEntry(entry.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}

        {!filtered.length ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-500">
            No A&P entries match this filter.
          </div>
        ) : null}
      </div>
    </div>
  );
}
