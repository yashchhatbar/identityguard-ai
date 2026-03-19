import { motion } from 'framer-motion';

export default function MetricCard({ title, value, hint, accent = 'sky' }) {
    const accents = {
        sky: 'bg-sky-50 text-sky-800',
        rose: 'bg-rose-50 text-rose-800',
        emerald: 'bg-emerald-50 text-emerald-800',
        amber: 'bg-amber-50 text-amber-800',
    };

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="surface-card p-5">
            <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${accents[accent] || accents.sky}`}>
                {title}
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{hint}</p>
        </motion.div>
    );
}
