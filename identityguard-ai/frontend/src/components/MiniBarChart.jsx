export default function MiniBarChart({ title, items, tone = 'sky' }) {
    const tones = {
        sky: 'from-sky-500 to-cyan-400',
        rose: 'from-rose-500 to-orange-400',
        emerald: 'from-emerald-500 to-lime-400',
    };
    const max = Math.max(...items.map((item) => item.value), 1);

    return (
        <div className="surface-card p-6">
            <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
            <div className="mt-6 space-y-4">
                {items.map((item) => (
                    <div key={item.label}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-600">{item.label}</span>
                            <span className="font-semibold text-slate-950">{item.value}</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className={`h-full rounded-full bg-gradient-to-r ${tones[tone] || tones.sky}`}
                                style={{ width: `${(item.value / max) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
