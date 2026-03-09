const TABS = [
  { id: 'well', label: 'Well' },
  { id: 'sick', label: 'Sick' },
  { id: 'exam', label: 'Exam' },
  { id: 'ros', label: 'ROS' },
  { id: 'ap', label: 'A&P' },
  { id: 'inbox', label: 'Inbox' },
  { id: 'scribe', label: 'Scribe' }
];

export default function TabBar({ activeTab, onTabClick }) {
  return (
    <div className="border-b border-slate-200 bg-white px-2 py-2">
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`rounded-full border px-3 py-1 text-sm ${
                isActive
                  ? 'border-sea bg-sea text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-500'
              }`}
              onClick={() => onTabClick(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
