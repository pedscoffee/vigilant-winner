import { useEffect, useMemo, useState } from 'react';

const COMPLAINTS = [
  'Fever',
  'Cough',
  'Congestion',
  'Ear pain',
  'Sore throat',
  'Rash',
  'Vomiting',
  'Diarrhea',
  'Abdominal pain',
  'Headache',
  'Limp/extremity pain',
  'Eye discharge',
  'Urinary symptoms',
  'Wound check',
  'Allergic reaction',
  'Behavioral concern',
  'Anxiety/depression screen',
  'ADHD follow-up',
  'Medication refill',
  'Sports physical',
  'Other'
];

function mergedUnique(arrays) {
  return [...new Set(arrays.flat().filter(Boolean))];
}

export default function SickTab({ sickVisit, apLibrary, onSetContribution, onAddToNote, onAppendAssessment }) {
  const [selected, setSelected] = useState([]);
  const [otherComplaint, setOtherComplaint] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('');
  const [assoc, setAssoc] = useState([]);
  const [exposures, setExposures] = useState([]);
  const [notes, setNotes] = useState('');

  const activeComplaints = selected.includes('Other') && otherComplaint.trim()
    ? [...selected.filter((item) => item !== 'Other'), otherComplaint.trim()]
    : selected;

  const complaintData = useMemo(() => {
    return selected
      .map((name) => sickVisit?.complaints?.[name])
      .filter(Boolean);
  }, [selected, sickVisit]);

  const associatedOptions = useMemo(() => mergedUnique(complaintData.map((item) => item.associated || [])), [complaintData]);
  const exposureOptions = useMemo(() => mergedUnique(complaintData.map((item) => item.exposures || [])), [complaintData]);
  const suggestedDiagnoses = useMemo(() => mergedUnique(complaintData.map((item) => item.diagnoses || [])), [complaintData]);
  const rosLines = useMemo(() => mergedUnique(complaintData.map((item) => item.ros || [])), [complaintData]);
  const examLines = useMemo(() => mergedUnique(complaintData.map((item) => item.exam || [])), [complaintData]);

  useEffect(() => {
    setAssoc((prev) => prev.filter((item) => associatedOptions.includes(item)));
    setExposures((prev) => prev.filter((item) => exposureOptions.includes(item)));
  }, [associatedOptions, exposureOptions]);

  useEffect(() => {
    if (!activeComplaints.length) {
      onSetContribution('hpi', 'sick', []);
      onSetContribution('ros', 'sick', []);
      onSetContribution('exam', 'sick', []);
      return;
    }

    const hpi = [
      `Seen for ${activeComplaints.join(', ')}.`,
      duration ? `Duration: ${duration}.` : null,
      severity ? `Severity: ${severity}.` : null,
      assoc.length ? `Associated symptoms: ${assoc.join(', ')}.` : null,
      exposures.length ? `Relevant exposures: ${exposures.join(', ')}.` : null,
      notes.trim() ? notes.trim() : null
    ].filter(Boolean);

    onSetContribution('hpi', 'sick', hpi);
    onSetContribution('ros', 'sick', rosLines.map((line) => `Focused ROS: ${line}.`));
    onSetContribution('exam', 'sick', examLines.map((line) => `Focused exam: ${line}.`));
  }, [activeComplaints, duration, severity, assoc, exposures, notes, rosLines, examLines, onSetContribution]);

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-sm font-semibold text-slate-900">Chief complaints</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {COMPLAINTS.map((item) => {
            const active = selected.includes(item);
            return (
              <button
                key={item}
                type="button"
                className={`rounded-full border px-2 py-1 text-xs ${
                  active ? 'border-sea bg-sea text-white' : 'border-slate-300 text-slate-700'
                }`}
                onClick={() => {
                  setSelected((prev) => {
                    const next = new Set(prev);
                    if (next.has(item)) next.delete(item);
                    else next.add(item);
                    return [...next];
                  });
                }}
              >
                {item}
              </button>
            );
          })}
        </div>
        {selected.includes('Other') ? (
          <input
            className="mt-2 w-full rounded border border-slate-300 px-2 py-1 text-sm"
            placeholder="Other complaint"
            value={otherComplaint}
            onChange={(event) => setOtherComplaint(event.target.value)}
          />
        ) : null}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-sm font-semibold text-slate-900">HPI builder</p>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            className="rounded border border-slate-300 px-2 py-1 text-sm"
            placeholder="Duration"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
          />
          <input
            className="rounded border border-slate-300 px-2 py-1 text-sm"
            placeholder="Severity"
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
          />
        </div>

        <p className="mt-3 text-xs font-semibold uppercase text-slate-500">Associated symptoms</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {associatedOptions.map((item) => (
            <label key={item} className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={assoc.includes(item)}
                onChange={(event) => {
                  setAssoc((prev) => {
                    const next = new Set(prev);
                    if (event.target.checked) next.add(item);
                    else next.delete(item);
                    return [...next];
                  });
                }}
              />{' '}
              {item}
            </label>
          ))}
        </div>

        <p className="mt-3 text-xs font-semibold uppercase text-slate-500">Exposures</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {exposureOptions.map((item) => (
            <label key={item} className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={exposures.includes(item)}
                onChange={(event) => {
                  setExposures((prev) => {
                    const next = new Set(prev);
                    if (event.target.checked) next.add(item);
                    else next.delete(item);
                    return [...next];
                  });
                }}
              />{' '}
              {item}
            </label>
          ))}
        </div>

        <textarea
          className="mt-3 h-24 w-full rounded border border-slate-300 px-2 py-1 text-sm"
          placeholder="Additional HPI details"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-sm font-semibold text-slate-900">Suggested A&P quick add</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {suggestedDiagnoses.map((name) => {
            const apMatch = (apLibrary?.entries || []).find((entry) => entry.name === name);
            return (
              <button
                key={name}
                type="button"
                className="rounded border border-sea px-2 py-1 text-xs text-sea hover:bg-teal-50"
                onClick={() => {
                  if (apMatch) {
                    onAddToNote(apMatch);
                  } else {
                    onAppendAssessment(name);
                  }
                }}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
