import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import MetricCard from '../../components/MetricCard';
import AdminTable from '../../components/AdminTable';
import Pagination from '../../components/Pagination';
import { useNotifications } from '../../components/NotificationsProvider';
import { useAdminData } from './useAdminData';

function formatDate(value) {
    return value ? new Date(value).toLocaleString() : 'N/A';
}

export default function AdminDuplicates() {
    const { duplicates, duplicatesMeta, loadingDuplicates, fetchDuplicates } = useAdminData();
    const { notify } = useNotifications();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        fetchDuplicates({ page: 1, page_size: 10 });
    }, [fetchDuplicates]);

    async function applyFilters(page = 1) {
        try {
            await fetchDuplicates({ search, status, page, page_size: duplicatesMeta.page_size || 10 });
        } catch (error) {
            notify(error.message, 'error');
        }
    }

    const highest = duplicates.reduce((max, item) => Math.max(max, item.similarity_score || 0), 0);
    const exact = duplicates.filter((item) => (item.similarity_score || 0) >= 0.9).length;

    const columns = [
        { key: 'user_id', label: 'User ID', render: (value) => <span className="break-all font-medium text-slate-900">{value}</span> },
        { key: 'matched_user_id', label: 'Matched ID', render: (value) => <span className="break-all text-slate-600">{value}</span> },
        {
            key: 'similarity_score',
            label: 'Similarity',
            render: (value) => (
                <div className="min-w-28">
                    <div className="mb-2 flex justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        <span>Risk</span>
                        <span>{(value * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-400" style={{ width: `${Math.min(value * 100, 100)}%` }} />
                    </div>
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (value) => <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">{value}</span>,
        },
        { key: 'created_at', label: 'Detected', render: (value) => formatDate(value) },
    ];

    return (
        <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-3">
                <MetricCard title="Open alerts" value={duplicatesMeta.total} hint="Total duplicate signals visible to admins." accent="rose" />
                <MetricCard title="High similarity" value={exact} hint="Alerts at or above 90% similarity." accent="amber" />
                <MetricCard title="Peak score" value={`${(highest * 100).toFixed(1)}%`} hint="Highest collision score returned by the API." accent="sky" />
            </div>
            <div className="surface-card border-rose-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,247,237,0.95))] p-6">
                <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="mt-1 h-3 w-3 rounded-full bg-rose-500" />
                        <div>
                            <h2 className="text-lg font-semibold text-slate-950">Duplicate alert queue</h2>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                                These records represent likely duplicate identities. Highest similarity cases should be reviewed first.
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
                        <label className="relative">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input className="input-field pl-11" placeholder="Search user IDs" value={search} onChange={(event) => setSearch(event.target.value)} />
                        </label>
                        <select className="input-field" value={status} onChange={(event) => setStatus(event.target.value)}>
                            <option value="">All statuses</option>
                            <option value="arcface_match">ArcFace match</option>
                        </select>
                        <button type="button" onClick={() => applyFilters(1)} className="btn-primary">
                            Filter alerts
                        </button>
                    </div>
                </div>
                <AdminTable
                    columns={columns}
                    rows={duplicates}
                    emptyMessage={loadingDuplicates ? 'Loading duplicate alerts...' : 'No duplicate alerts returned by the backend.'}
                />
                <Pagination meta={duplicatesMeta} onChange={applyFilters} />
            </div>
        </div>
    );
}
