export default function LineChart({ title, subtitle, data, dataKey, color = '#0f172a', formatValue = (value) => value }) {
    const width = 520;
    const height = 220;
    const padding = 28;
    const maxValue = Math.max(...data.map((item) => item[dataKey] || 0), 1);

    const points = data.map((item, index) => {
        const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
        const y = height - padding - (((item[dataKey] || 0) / maxValue) * (height - padding * 2));
        return { x, y, label: item.date, value: item[dataKey] || 0 };
    });

    const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

    return (
        <div className="surface-card p-6">
            <div className="mb-5">
                <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>
            {data.length === 0 ? (
                <div className="rounded-3xl bg-slate-50 px-6 py-14 text-center text-sm text-slate-500">
                    No time-series data available yet.
                </div>
            ) : (
                <div>
                    <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full overflow-visible">
                        <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
                        {points.map((point) => (
                            <g key={`${point.label}-${point.x}`}>
                                <circle cx={point.x} cy={point.y} r="4" fill={color} />
                            </g>
                        ))}
                    </svg>
                    <div className="mt-3 grid gap-3 text-xs text-slate-500 sm:grid-cols-3">
                        {points.slice(-3).map((point) => (
                            <div key={point.label} className="rounded-2xl bg-slate-50 px-3 py-3">
                                <p className="font-semibold uppercase tracking-[0.16em] text-slate-400">{point.label}</p>
                                <p className="mt-2 text-sm font-semibold text-slate-900">{formatValue(point.value)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
