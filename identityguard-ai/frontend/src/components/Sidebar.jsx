import { BarChart3, Clock3, LayoutDashboard, ScanFace, UploadCloud } from 'lucide-react';

const items = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'upload', label: 'Upload', icon: UploadCloud },
  { id: 'verify', label: 'Verify', icon: ScanFace },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
  { id: 'history', label: 'History', icon: Clock3 },
];

export default function Sidebar({ activeTab, onSelect }) {
  return (
    <aside className="surface-card h-fit p-4 lg:sticky lg:top-24">
      <div className="rounded-[28px] bg-[linear-gradient(180deg,#0f172a,#172554)] px-5 py-6 text-white shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">Navigation</p>
        <h2 className="mt-3 text-xl font-semibold">Operator Console</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Move between upload, verification, insights, and session activity without leaving the workspace.
        </p>
      </div>

      <nav className="mt-4 space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                active
                  ? 'bg-sky-50 text-sky-800 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
