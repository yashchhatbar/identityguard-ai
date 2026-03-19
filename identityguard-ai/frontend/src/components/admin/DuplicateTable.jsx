import { motion } from 'framer-motion';

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : 'N/A';
}

function getStatusTone(value) {
  return value === 'Duplicate' || value === 'duplicate' || value === 'arcface_match'
    ? 'bg-rose-50 text-rose-700'
    : 'bg-emerald-50 text-emerald-700';
}

function getSimilarityTone(score) {
  if (score >= 0.8) {
    return 'text-rose-600';
  }
  if (score >= 0.5) {
    return 'text-amber-600';
  }
  return 'text-emerald-600';
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
      <div className="animate-pulse p-6">
        <div className="h-4 w-56 rounded-full bg-slate-100" />
        <div className="mt-6 space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-14 rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DuplicateTable({ rows, usersById, loading }) {
  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              {['User Name', 'User ID', 'Matched User ID', 'Similarity Score', 'Status', 'Detected At'].map((label) => (
                <th key={label} className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, index) => {
                const user = usersById.get(row.user_id);
                const matchedUser = usersById.get(row.matched_user_id);
                const similarity = Number(row.similarity_score || 0);
                const status = row.status === 'arcface_match' ? 'Duplicate' : row.status || 'Unique';

                return (
                  <motion.tr
                    key={row.id || `${row.user_id}-${row.created_at}-${index}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.2) }}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'} text-sm text-slate-700 transition hover:bg-sky-50/60`}
                  >
                    <td className="px-5 py-4 align-top">
                      <div className="min-w-44">
                        <p className="font-semibold text-slate-950">{user?.name || user?.email || row.user_name || row.user_id}</p>
                        {user?.email ? <p className="mt-1 text-xs text-slate-500">{user.email}</p> : null}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <span className="break-all font-medium text-slate-900">{row.user_id || 'N/A'}</span>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="min-w-40">
                        <p className="break-all text-slate-900">{row.matched_user_id || 'N/A'}</p>
                        {matchedUser?.name || matchedUser?.email ? (
                          <p className="mt-1 text-xs text-slate-500">{matchedUser?.name || matchedUser?.email}</p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <span className={`font-semibold ${getSimilarityTone(similarity)}`}>{(similarity * 100).toFixed(1)}%</span>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusTone(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-top text-slate-500">{formatDate(row.created_at)}</td>
                  </motion.tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <p className="text-sm font-semibold text-slate-900">No data available</p>
                  <p className="mt-2 text-sm text-slate-500">Duplicate detections will appear here once the backend returns matching records.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
