import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ meta, onChange }) {
    if (!meta || meta.pages <= 1) {
        return null;
    }

    return (
        <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
                Page <span className="font-semibold text-slate-900">{meta.page}</span> of{' '}
                <span className="font-semibold text-slate-900">{meta.pages}</span> · {meta.total} total records
            </p>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    className="btn-secondary px-3 py-2"
                    onClick={() => onChange(meta.page - 1)}
                    disabled={meta.page <= 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    className="btn-secondary px-3 py-2"
                    onClick={() => onChange(meta.page + 1)}
                    disabled={meta.page >= meta.pages}
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
