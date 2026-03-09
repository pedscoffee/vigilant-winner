import { useMemo, useState } from 'react';

const SECTIONS = [
  { id: 'results', label: 'Result Responses' },
  { id: 'messages', label: 'Patient Replies' },
  { id: 'refills', label: 'Refill Approvals' },
  { id: 'school', label: 'School/Camp Forms' },
  { id: 'pa', label: 'Prior Auth' }
];

function applyTokens(text, tokenMap) {
  let next = text;
  for (const [token, value] of Object.entries(tokenMap)) {
    next = next.split(token).join(value || token);
  }
  return next;
}

export default function InboxTab({ inbox, onAddToPlan }) {
  const [section, setSection] = useState('results');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [tokenValues, setTokenValues] = useState({ '[PATIENT_NAME]': '' });
  const [customText, setCustomText] = useState('');
  const [refillRequiresVisit, setRefillRequiresVisit] = useState(false);

  const templates = useMemo(() => {
    if (section === 'results') return inbox?.resultResponses || [];
    if (section === 'messages') return inbox?.messageReplies || [];
    if (section === 'school') return inbox?.schoolForms || [];
    if (section === 'pa') return inbox?.priorAuth || [];
    return [];
  }, [section, inbox]);

  const refillTemplate = (inbox?.refillTemplates || [])[0];

  const rendered = selectedTemplate
    ? applyTokens(customText || selectedTemplate.text || '', tokenValues)
    : '';

  function loadTemplate(template) {
    setSelectedTemplate(template);
    setCustomText(template.text || '');
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap gap-2">
          {SECTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`rounded border px-2 py-1 text-xs ${
                section === item.id ? 'border-sea bg-sea text-white' : 'border-slate-300 text-slate-700'
              }`}
              onClick={() => {
                setSection(item.id);
                setSelectedTemplate(null);
                setCustomText('');
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {section === 'refills' ? (
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-sm font-semibold text-slate-900">Refill approval</p>
          {refillTemplate ? (
            <>
              <p className="mt-2 text-sm text-slate-700">Medication: {refillTemplate.medication}</p>
              <p className="text-sm text-slate-700">Duration: {refillTemplate.duration}</p>
              <p className="text-sm text-slate-700">Quantity: {refillTemplate.quantity}</p>
              <p className="text-sm text-slate-700">Instructions: {refillTemplate.instructions}</p>
              <label className="mt-2 block text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={refillRequiresVisit}
                  onChange={(event) => setRefillRequiresVisit(event.target.checked)}
                />{' '}
                Requires office visit before refill
              </label>
              <button
                className="mt-3 rounded bg-sea px-3 py-1 text-sm text-white"
                type="button"
                onClick={() => {
                  const message = [
                    `Refill approved for ${refillTemplate.medication}: ${refillTemplate.quantity} for ${refillTemplate.duration}.`,
                    refillTemplate.instructions,
                    'No changes to medication since last visit.',
                    refillRequiresVisit ? 'Patient requires office follow-up prior to next refill.' : null
                  ]
                    .filter(Boolean)
                    .join(' ');
                  onAddToPlan('Refill', message);
                }}
              >
                Add refill note
              </button>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No refill template configured.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-sm font-semibold text-slate-900">Templates</p>
            <div className="mt-2 space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  className="block w-full rounded border border-slate-300 px-2 py-2 text-left text-sm text-slate-700"
                  type="button"
                  onClick={() => loadTemplate(template)}
                >
                  {template.name || `${template.condition} - ${template.medication}`}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-sm font-semibold text-slate-900">Editor</p>
            <input
              className="mt-2 w-full rounded border border-slate-300 px-2 py-1 text-sm"
              placeholder="Patient name"
              value={tokenValues['[PATIENT_NAME]']}
              onChange={(event) => setTokenValues((prev) => ({ ...prev, '[PATIENT_NAME]': event.target.value }))}
            />
            <textarea
              className="mt-2 h-40 w-full rounded border border-slate-300 px-2 py-1 text-sm"
              value={customText}
              onChange={(event) => setCustomText(event.target.value)}
              placeholder="Select a template"
            />
            <button
              className="mt-2 rounded bg-sea px-3 py-1 text-sm text-white"
              type="button"
              onClick={() => {
                if (!selectedTemplate) return;
                const label = selectedTemplate.name || selectedTemplate.condition || 'Inbox';
                onAddToPlan(label, rendered || customText);
              }}
            >
              Add to note
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
