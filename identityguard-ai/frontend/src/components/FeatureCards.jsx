import { motion } from 'framer-motion';
import { Activity, Fingerprint, Shield, Sparkles } from 'lucide-react';

const features = [
    {
        icon: Shield,
        title: 'Fraud-resistant onboarding',
        description: 'Block duplicate identities before they pollute your user graph.',
    },
    {
        icon: Fingerprint,
        title: 'Biometric verification',
        description: 'Face uploads and verification flows backed by a FastAPI service layer.',
    },
    {
        icon: Activity,
        title: 'Operator-friendly visibility',
        description: 'Clear states, upload feedback, and structured decision outcomes for every request.',
    },
    {
        icon: Sparkles,
        title: 'SaaS presentation layer',
        description: 'Premium light-theme UI designed for a polished internship showcase.',
    },
];

export default function FeatureCards() {
    return (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                    <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.45, delay: index * 0.08 }}
                        className="surface-card p-6"
                    >
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                            <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-950">{feature.title}</h3>
                        <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
                    </motion.div>
                );
            })}
        </div>
    );
}
