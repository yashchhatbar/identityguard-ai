import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, GaugeCircle, Sparkles } from 'lucide-react';

function getConfidence(score) {
  if (score > 0.8) {
    return {
      label: 'High',
      tone: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      bar: 'bg-emerald-500',
      text: 'The match signal is strong, which suggests this face is very close to an existing enrolled profile.',
      interpretation: 'High match (same person likely)',
    };
  }

  if (score > 0.5) {
    return {
      label: 'Medium',
      tone: 'text-amber-700 bg-amber-50 border-amber-200',
      bar: 'bg-amber-500',
      text: 'The similarity is moderate. Review the score together with the duplicate decision before taking action.',
      interpretation: 'Possible match',
    };
  }

  return {
    label: 'Low',
    tone: 'text-rose-700 bg-rose-50 border-rose-200',
    bar: 'bg-rose-500',
    text: 'The similarity signal is weak, which usually means this face is less likely to match a stored identity.',
    interpretation: 'Different person',
  };
}

export default function InsightsPanel({ result }) {
  if (!result) {
    return (
      <div className="surface-card p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="section-label">AI insights</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-950">Visual feedback appears after upload</h3>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Submit a face image to view similarity, confidence, and a short explanation of the duplicate analysis.
        </p>
      </div>
    );
  }

  const score = Number(result.similarity_score || 0);
  const percentage = Math.max(0, Math.min(100, Math.round(score * 100)));
  const confidence = getConfidence(score);
  const duplicate = Boolean(result.duplicate_detected);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="surface-card p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-label">AI insights</p>
          <h3 className="mt-3 text-xl font-semibold text-slate-950">Similarity analysis</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            The uploaded face is converted into an embedding and compared against existing enrolled vectors.
          </p>
        </div>
        <div
          className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold ${
            duplicate
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {duplicate ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          {duplicate ? 'Duplicate signal' : 'Unique signal'}
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <GaugeCircle className="h-4 w-4" />
              Similarity score
            </div>
            <span className="text-lg font-semibold text-slate-950">{percentage}%</span>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={`h-full rounded-full ${confidence.bar}`}
            />
          </div>

          <div className={`mt-4 inline-flex rounded-2xl border px-3 py-2 text-sm font-semibold ${confidence.tone}`}>
            {confidence.interpretation}
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            {duplicate
              ? 'A higher score increases the chance that this upload matches a face already present in the system.'
              : 'The current score does not strongly indicate a duplicate against the stored face set.'}
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Confidence</p>
          <div className={`mt-4 inline-flex rounded-2xl border px-3 py-2 text-sm font-semibold ${confidence.tone}`}>
            {confidence.label}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{confidence.text}</p>
        </div>
      </div>
    </motion.div>
  );
}
