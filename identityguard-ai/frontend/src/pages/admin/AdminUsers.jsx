import { Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import MetricCard from '../../components/MetricCard';
import AdminTable from '../../components/AdminTable';
import ConfirmationModal from '../../components/ConfirmationModal';
import Pagination from '../../components/Pagination';
import { useNotifications } from '../../components/NotificationsProvider';
import { useAdminData } from './useAdminData';

function formatDate(value) {
    return value ? new Date(value).toLocaleString() : 'N/A';
}

export default function AdminUsers() {
    const { users, usersMeta, loadingUsers, fetchUsers, deleteUser } = useAdminData();
    const { notify } = useNotifications();
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');
    const [confirmingUser, setConfirmingUser] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchUsers({ page: 1, page_size: 10 });
    }, [fetchUsers]);

    async function applyFilters(page = 1) {
        try {
            await fetchUsers({ search, role, page, page_size: usersMeta.page_size || 10 });
        } catch (error) {
            notify(error.message, 'error');
        }
    }

    async function handleDeleteUser() {
        if (!confirmingUser) {
            return;
        }
        setDeleting(true);
        try {
            await deleteUser(confirmingUser.id);
            notify('User deleted successfully.', 'success');
            setConfirmingUser(null);
            await applyFilters(usersMeta.page);
        } catch (error) {
            notify(error.message, 'error');
        } finally {
            setDeleting(false);
        }
    }

    const columns = [
        { key: 'name', label: 'User' },
        { key: 'email', label: 'Email' },
        {
            key: 'role',
            label: 'Role',
            render: (value) => <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${value === 'admin' ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-700'}`}>{value}</span>,
        },
        { key: 'face_embeddings', label: 'Embeddings' },
        { key: 'created_at', label: 'Created', render: (value) => formatDate(value) },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <button
                    type="button"
                    onClick={() => setConfirmingUser(row)}
                    className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-rose-700 transition hover:bg-rose-50"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                </button>
            ),
        },
    ];

    const admins = users.filter((user) => user.role === 'admin').length;
    const enrolled = users.filter((user) => user.face_embeddings > 0).length;

    return (
        <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-3">
                <MetricCard title="Total users" value={usersMeta.total} hint="All user records returned by the admin API." />
                <MetricCard title="Admins" value={admins} hint="Operator accounts with elevated access." accent="sky" />
                <MetricCard title="Enrolled" value={enrolled} hint="Users with at least one stored face embedding." accent="emerald" />
            </div>
            <div className="surface-card p-6">
                <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <h2 className="text-lg font-semibold text-slate-950">Registered users</h2>
                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
                        <label className="relative">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input className="input-field pl-11" placeholder="Search by name or email" value={search} onChange={(event) => setSearch(event.target.value)} />
                        </label>
                        <select className="input-field" value={role} onChange={(event) => setRole(event.target.value)}>
                            <option value="">All roles</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>
                        <button type="button" onClick={() => applyFilters(1)} className="btn-primary">
                            Apply filters
                        </button>
                    </div>
                </div>
                <AdminTable
                    columns={columns}
                    rows={users}
                    emptyMessage={loadingUsers ? 'Loading users...' : 'No users returned by the admin API.'}
                />
                <Pagination meta={usersMeta} onChange={applyFilters} />
            </div>
            <ConfirmationModal
                open={Boolean(confirmingUser)}
                title="Delete user record?"
                description={confirmingUser ? `This will remove ${confirmingUser.email} and associated face embeddings.` : ''}
                confirmLabel="Delete user"
                loading={deleting}
                onCancel={() => setConfirmingUser(null)}
                onConfirm={handleDeleteUser}
            />
        </div>
    );
}
