import { useEffect } from 'react';
import { ShieldAlert, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import MetricCard from '../../components/MetricCard';
import { useAdminData } from './useAdminData';

export default function AdminOverview() {
    const { users, duplicates, usersMeta, duplicatesMeta, fetchUsers, fetchDuplicates } = useAdminData();
    const duplicateRate = usersMeta.total ? `${Math.round((duplicatesMeta.total / usersMeta.total) * 100)}%` : '0%';

    useEffect(() => {
        fetchUsers({ page: 1, page_size: 5 });
        fetchDuplicates({ page: 1, page_size: 5 });
    }, [fetchUsers, fetchDuplicates]);

    return (
        <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-3">
                <MetricCard title="Users" value={usersMeta.total} hint="Total registered accounts available to operators." />
                <MetricCard title="Duplicate alerts" value={duplicatesMeta.total} hint="Current duplicate matches surfaced by the AI pipeline." accent="rose" />
                <MetricCard title="Alert rate" value={duplicateRate} hint="Duplicate alerts relative to the current user base." accent="emerald" />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <div className="surface-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                            <Users className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-950">User inventory</h2>
                            <p className="text-sm text-slate-500">Review the registered population and their face enrollment counts.</p>
                        </div>
                    </div>
                    <p className="mt-5 text-sm leading-6 text-slate-600">The users page gives operators a clean table view with roles, enrollment volume, and registration timestamps.</p>
                    <Link to="/admin/users" className="btn-secondary mt-6">Open users</Link>
                </div>

                <div className="surface-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
                            <ShieldAlert className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-950">Duplicate queue</h2>
                            <p className="text-sm text-slate-500">Prioritize the highest-similarity collisions surfaced by the backend.</p>
                        </div>
                    </div>
                    <p className="mt-5 text-sm leading-6 text-slate-600">The duplicates page highlights the riskiest face collisions and gives operators a faster triage loop.</p>
                    <Link to="/admin/duplicates" className="btn-secondary mt-6">Open duplicates</Link>
                </div>
            </div>
        </div>
    );
}
