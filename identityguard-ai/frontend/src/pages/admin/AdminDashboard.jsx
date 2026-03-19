import { useEffect, useMemo } from 'react';
import { ArrowRight, Database, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

import Charts from '../../components/admin/Charts';
import DuplicateTable from '../../components/admin/DuplicateTable';
import StatsCards from '../../components/admin/StatsCards';
import { useAdminData } from './useAdminData';

function formatCompactDate(value) {
  return value ? new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'N/A';
}

export default function AdminDashboard() {
  const {
    users,
    usersMeta,
    duplicates,
    duplicatesMeta,
    analytics,
    loadingUsers,
    loadingDuplicates,
    loadingAnalytics,
    fetchUsers,
    fetchDuplicates,
    fetchAnalytics,
  } = useAdminData();

  useEffect(() => {
    fetchUsers({ page: 1, page_size: 100 });
    fetchDuplicates({ page: 1, page_size: 12 });
    fetchAnalytics();
  }, [fetchUsers, fetchDuplicates, fetchAnalytics]);

  const usersById = useMemo(() => new Map(users.filter((user) => user?.id).map((user) => [user.id, user])), [users]);
  const totalUploads = useMemo(() => {
    const summaryUploads = analytics.summary?.total_uploads;
    return typeof summaryUploads === 'number'
      ? summaryUploads
      : users.reduce((sum, user) => sum + Number(user.face_embeddings || 0), 0);
  }, [analytics, users]);

  const statItems = [
    { key: 'users', label: 'Total Users', value: usersMeta.total || users.length, hint: 'Registered users currently visible to the admin workspace.' },
    { key: 'uploads', label: 'Total Uploads', value: totalUploads, hint: 'Total biometric enrollments derived from available user and analytics data.' },
    { key: 'duplicates', label: 'Duplicate Detections', value: duplicatesMeta.total || duplicates.length, hint: 'Duplicate alerts surfaced by the existing backend detection flow.' },
  ];

  const daily = analytics.charts?.daily || [];
  const trendData = daily.map((item) => ({ label: formatCompactDate(item.date), duplicates: item.duplicates || 0 }));
  const uploadData = daily.map((item) => ({ label: formatCompactDate(item.date), uploads: item.uploads ?? item.registrations ?? 0 }));
  const loading = loadingUsers || loadingDuplicates || loadingAnalytics;

  return (
    <div className="space-y-6">
      <div className="surface-card overflow-hidden bg-[radial-gradient(circle_at_top_right,#dbeafe,transparent_40%),linear-gradient(180deg,#ffffff,#f8fbff)] p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="section-label">Admin dashboard</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Enterprise duplicate operations</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Monitor user volume, inspect duplicate cases, and understand detection trends from the existing platform APIs without changing the backend contract.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link to="/admin/duplicates" className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-rose-50 p-2 text-rose-700">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  Review duplicates
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
            </Link>
            <Link to="/admin/users" className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-sky-50 p-2 text-sky-700">
                    <Database className="h-4 w-4" />
                  </div>
                  Inspect users
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
            </Link>
          </div>
        </div>
      </div>
      <StatsCards items={statItems} loading={loading} />
      <Charts trendData={trendData} uploadData={uploadData} loading={loadingAnalytics} />
      <div className="space-y-4">
        <div>
          <p className="section-label">Main table</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-950">Duplicate detection queue</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Real duplicate records from the backend with user mapping when matching user data is available.
          </p>
        </div>
        <DuplicateTable rows={duplicates} usersById={usersById} loading={loadingDuplicates || loadingUsers} />
      </div>
    </div>
  );
}
