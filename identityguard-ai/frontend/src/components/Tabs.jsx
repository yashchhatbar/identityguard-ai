const tabs = [
  { id: 'upload', label: 'Upload' },
  { id: 'verify', label: 'Verify' },
  { id: 'insights', label: 'Insights' },
  { id: 'history', label: 'History' },
];

export default function Tabs({ activeTab, onChange }) {
  return (
    <div className="surface-card mb-6 overflow-x-auto p-2">
      <div className="flex min-w-max gap-2">
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                active
                  ? 'bg-slate-950 text-white shadow-soft'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
