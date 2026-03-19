import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const NotificationsContext = createContext(null);

const variants = {
    success: { icon: CheckCircle2, accent: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
    error: { icon: AlertCircle, accent: 'border-rose-200 bg-rose-50 text-rose-900' },
    info: { icon: Info, accent: 'border-sky-200 bg-sky-50 text-sky-900' },
};

export function useNotifications() {
    return useContext(NotificationsContext);
}

export default function NotificationsProvider({ children }) {
    const [items, setItems] = useState([]);

    const dismiss = useCallback((id) => {
        setItems((current) => current.filter((item) => item.id !== id));
    }, []);

    const notify = useCallback((message, type = 'info') => {
        const id = crypto.randomUUID();
        setItems((current) => [...current, { id, message, type }]);
        window.setTimeout(() => dismiss(id), 4200);
    }, [dismiss]);

    const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);

    return (
        <NotificationsContext.Provider value={value}>
            {children}
            <div className="fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
                <AnimatePresence>
                    {items.map((item) => {
                        const style = variants[item.type] || variants.info;
                        const Icon = style.icon;
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: -16, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -16, scale: 0.96 }}
                                className={`surface-card flex items-start gap-3 border px-4 py-4 ${style.accent}`}
                            >
                                <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                                <p className="flex-1 text-sm font-medium leading-6">{item.message}</p>
                                <button type="button" className="rounded-full p-1 transition hover:bg-white/70" onClick={() => dismiss(item.id)}>
                                    <X className="h-4 w-4" />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </NotificationsContext.Provider>
    );
}
