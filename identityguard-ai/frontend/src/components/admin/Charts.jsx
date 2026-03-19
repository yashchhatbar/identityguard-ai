import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function ChartShell({ title, subtitle, children, loading, empty }) {
  return (
    <div className="surface-card p-6">
      <p className="section-label">{title}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{subtitle}</p>
      <div className="mt-6 h-72">
        {loading ? (
          <div className="h-full animate-pulse rounded-[24px] bg-slate-100" />
        ) : empty ? (
          <div className="flex h-full items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
            No data available
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold text-slate-950">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="mt-1 text-sm text-slate-600">
          <span className="font-semibold" style={{ color: item.color }}>
            {item.name}:
          </span>{' '}
          {item.value}
        </p>
      ))}
    </div>
  );
}

export default function Charts({ trendData, uploadData, loading }) {
  const noTrendData = !trendData.length;
  const noUploadData = !uploadData.length;

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <ChartShell
          title="Duplicate Detection Trend"
          subtitle="Daily duplicate activity from the existing admin analytics feed."
          loading={loading}
          empty={noTrendData}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="duplicates"
                name="Duplicates"
                stroke="#e11d48"
                strokeWidth={3}
                dot={{ r: 4, fill: '#e11d48' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartShell>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <ChartShell
          title="Upload Activity"
          subtitle="Approximate upload volume derived from available user enrollment and analytics data."
          loading={loading}
          empty={noUploadData}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={uploadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="uploads" name="Uploads" fill="#0f172a" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartShell>
      </motion.div>
    </div>
  );
}
