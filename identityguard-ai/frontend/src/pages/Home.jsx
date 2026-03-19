import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import FeatureCards from '../components/FeatureCards';
import StatCard from '../components/StatCard';

export default function Home() {
    return (
        <div className="pb-8">
            <section className="app-shell grid gap-14 pb-24 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-24">
                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <span className="section-label">Identity intelligence for modern platforms</span>
                    <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
                        Prevent duplicate signups with a frontend that looks ready for production.
                    </h1>
                    <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                        IdentityGuard pairs biometric onboarding with a polished SaaS interface: lightweight auth, guided face capture, and clear verification outcomes for operators and end users.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link to="/register" className="btn-primary">
                            Create account
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link to="/login" className="btn-secondary">
                            Sign in to dashboard
                        </Link>
                    </div>
                    <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            Light theme only
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-sky-700" />
                            FastAPI-ready workflows
                        </div>
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-amber-500" />
                            Startup-style presentation
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.08 }}
                    className="surface-card relative overflow-hidden p-7 shadow-soft"
                >
                    <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(90deg,rgba(56,189,248,0.15),rgba(165,180,252,0.08),rgba(255,255,255,0))]" />
                    <div className="grid gap-5 sm:grid-cols-2">
                        <StatCard label="Precision target" value="95%+" caption="Designed around duplicate detection quality goals." />
                        <StatCard label="API latency" value="<1.5s" caption="Fast upload and verification loops." />
                        <StatCard label="Deployment split" value="Vercel + Render" caption="Frontend and backend ready for hosted rollout." />
                        <StatCard label="Security" value="JWT + RBAC" caption="Role-aware flows for user and operator journeys." />
                    </div>
                </motion.div>
            </section>

            <section className="app-shell py-6">
                <FeatureCards />
            </section>
        </div>
    );
}
