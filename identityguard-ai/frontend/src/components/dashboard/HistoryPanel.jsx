import { motion } from 'framer-motion';
import { Clock3, History, Trash2 } from 'lucide-react';

function formatTime(timestamp) {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(timestamp));
  } catch {
    return timestamp;
  }
}

export default function HistoryPanel({ items, onClear }) {
  return (
    <div className="surface-card p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="section-label">History</p>
          <h2 className="mt-4 text-2xl font-semibold text-slate-950">Recent uploads</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Revisit recent upload decisions, compare scores, and continue exploring how the system classifies duplicate risk.
          </p>
        </div>

        <button type="button" onClick={onClear} className="btn-secondary" disabled={!items.length}>
          <Trash2 className="h-4 w-4" />
          Clear history
        </button>
      </div>

      {items.length ? (
        <div className="mt-6 grid gap-4">
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-4 rounded-[28px] border border-slate-200 bg-slate-50 p-4 md:grid-cols-[132px_minmax(0,1fr)]"
            >
              <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
                <img src={item.image} alt="Uploaded face history preview" className="aspect-square w-full object-cover" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {item.result?.duplicate_detected ? 'Duplicate detected' : 'Unique face captured'}
                    </p>
                    <div className="mt-2 inline-flex rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Score {(Number(item.result?.similarity_score || 0) * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock3 className="h-4 w-4" />
                    {formatTime(item.timestamp)}
                  </div>
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full ${
                      item.result?.duplicate_detected ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(4, Math.min(100, Number(item.result?.similarity_score || 0) * 100))}%` }}
                  />
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {item.result?.duplicate_detected
                    ? 'This upload produced a duplicate signal, which makes it useful for review and comparison.'
                    : 'This upload was treated as a unique capture, which helps users compare successful non-duplicate cases.'}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
            <History className="h-5 w-5 text-slate-700" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-900">No upload history yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Complete a face upload to save the image preview, score, and timestamp for later review.
          </p>
        </div>
      )}
    </div>
  );
}
