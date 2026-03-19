import { motion } from 'framer-motion';

export default function StatCard({ label, value, caption }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="surface-card p-5"
        >
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
            <p className="mt-2 text-sm text-slate-500">{caption}</p>
        </motion.div>
    );
}
