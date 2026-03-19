import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmationModal({
    open,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    tone = 'rose',
    loading = false,
    onCancel,
    onConfirm,
}) {
    const toneClasses = {
        rose: 'bg-rose-50 text-rose-700',
        sky: 'bg-sky-50 text-sky-700',
    };

    return (
        <AnimatePresence>
            {open ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.98 }}
                        className="surface-card w-full max-w-lg p-7"
                    >
                        <div className="flex items-start gap-4">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneClasses[tone] || toneClasses.rose}`}>
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
                                <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
                            </div>
                        </div>
                        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading}>
                                {cancelLabel}
                            </button>
                            <button type="button" onClick={onConfirm} className="btn-primary bg-rose-600 hover:bg-rose-500" disabled={loading}>
                                {loading ? 'Working...' : confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
