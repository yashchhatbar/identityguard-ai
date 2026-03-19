import { CheckCircle2, ScanFace, ShieldAlert } from 'lucide-react';

export default function UploadResultCard({ title, result, emptyState }) {
    if (!result) {
        return (
            <div className="surface-card p-6">
                <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{emptyState}</p>
            </div>
        );
    }

    const success = result.verified ?? !result.duplicate_detected;

    return (
        <div className="surface-card p-6">
            <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${success ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {result.verified ? <CheckCircle2 className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
                    <p className="text-sm text-slate-500">{result.matching_mode}</p>
                </div>
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Similarity</dt>
                    <dd className="mt-2 text-2xl font-semibold text-slate-950">{(result.similarity_score * 100).toFixed(1)}%</dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Threshold</dt>
                    <dd className="mt-2 text-2xl font-semibold text-slate-950">{(result.threshold * 100).toFixed(0)}%</dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Matched user</dt>
                    <dd className="mt-2 break-all text-sm font-semibold text-slate-950">{result.matched_user_id || 'No match'}</dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Decision</dt>
                    <dd className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
                        <ScanFace className="h-4 w-4" />
                        {result.verified ? 'Verified' : result.duplicate_detected ? 'Duplicate detected' : 'Unique face capture'}
                    </dd>
                </div>
                {'liveness_score' in result ? (
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Liveness</dt>
                        <dd className="mt-2 text-2xl font-semibold text-slate-950">{(result.liveness_score * 100).toFixed(1)}%</dd>
                    </div>
                ) : null}
                {'liveness_passed' in result ? (
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Liveness status</dt>
                        <dd className="mt-2 text-sm font-semibold text-slate-950">{result.liveness_passed ? 'Live face accepted' : 'Retry capture needed'}</dd>
                    </div>
                ) : null}
            </dl>
        </div>
    );
}
