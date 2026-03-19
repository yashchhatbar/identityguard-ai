import { LogOut, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Topbar({ user, onLogout }) {
    return (
        <div className="surface-card mb-6 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p className="section-label">Dashboard workspace</p>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                    Welcome back{user?.name ? `, ${user.name}` : ''}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                    A cleaner, more premium command surface for upload, verification, and biometric decision review.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">User</p>
                    <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
                        <ShieldCheck className="h-4 w-4 text-sky-700" />
                        {user?.role || 'user'}
                    </div>
                </div>
                <Link to="/pricing" className="btn-primary">
                    Upgrade
                </Link>
                <button type="button" onClick={onLogout} className="btn-secondary">
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </div>
    );
}
