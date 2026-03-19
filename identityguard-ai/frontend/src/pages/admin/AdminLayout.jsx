import { Outlet } from 'react-router-dom';

import AdminSidebar from '../../components/AdminSidebar';

export default function AdminLayout() {
    return (
        <section className="app-shell py-12">
            <div className="mb-8">
                <p className="section-label">Admin workspace</p>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Platform command center</h1>
                <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                    Dedicated operator views for user inventory, duplicate alerts, and high-level analytics. Access is restricted to admin sessions only.
                </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                <AdminSidebar />
                <div className="min-w-0">
                    <Outlet />
                </div>
            </div>
        </section>
    );
}
