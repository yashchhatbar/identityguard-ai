import { motion } from 'framer-motion';
import { Fingerprint, ShieldAlert, Users } from 'lucide-react';

const icons = {
  users: Users,
  uploads: Fingerprint,
  duplicates: ShieldAlert,
};

const accents = {
  users: 'bg-sky-50 text-sky-700',
  uploads: 'bg-emerald-50 text-emerald-700',
  duplicates: 'bg-rose-50 text-rose-700',
};

function SkeletonCard() {
  return (
    <div className="surface-card animate-pulse p-6">
      <div className="h-10 w-10 rounded-2xl bg-slate-100" />
      <div className="mt-6 h-4 w-24 rounded-full bg-slate-100" />
      <div className="mt-4 h-10 w-28 rounded-2xl bg-slate-100" />
      <div className="mt-4 h-4 w-full rounded-full bg-slate-100" />
    </div>
  );
}

export default function StatsCards({ items, loading }) {
  if (loading) {
    return (
      <div className="grid gap-5 md:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {items.map((item, index) => {
        const Icon = icons[item.key] || Users;
        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="surface-card overflow-hidden p-6"
          >
            <div className={`inline-flex rounded-2xl p-3 ${accents[item.key] || accents.users}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{item.value}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.hint}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
