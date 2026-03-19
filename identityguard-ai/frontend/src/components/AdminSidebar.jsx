import { BarChart3, LayoutDashboard, ShieldAlert, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/duplicates', label: 'Duplicates', icon: ShieldAlert },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function AdminSidebar() {
    return (
        <aside className="surface-card flex h-fit flex-col gap-3 p-4 lg:sticky lg:top-24">
            <div className="rounded-3xl bg-slate-950 px-4 py-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">Admin console</p>
                <h2 className="mt-3 text-xl font-semibold">IdentityGuard Ops</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">Review duplicate signals, inspect user inventory, and monitor platform health.</p>
            </div>
            <nav className="flex flex-col gap-1.5">
                {items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${isActive ? 'bg-sky-50 text-sky-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );
}
