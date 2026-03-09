export default function OnboardingModal({ open, onComplete }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3">
      <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl">
        <p className="text-lg font-semibold text-slate-900">Welcome to Pediatric Clinical Dashboard</p>
        <p className="mt-2 text-sm text-slate-700">
          This app is fully offline and clipboard-based. No patient identifiers are stored. Build phrases in tabs, and output is auto-copied for instant paste into Epic.
        </p>
        <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
          <li>Use tabs to build Well, Sick, Exam, ROS, A&P, and Inbox text.</li>
          <li>Use F1-F12 or custom shortcuts for fast phrase insertion.</li>
          <li>Open Settings for output format, corrections, and backup/restore.</li>
        </ul>
        <button className="mt-4 rounded bg-sea px-3 py-1.5 text-sm text-white" type="button" onClick={onComplete}>
          Start using dashboard
        </button>
      </div>
    </div>
  );
}
