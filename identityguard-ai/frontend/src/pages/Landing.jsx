import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Camera,
  CheckCircle2,
  Fingerprint,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import HowItWorks from '../components/HowItWorks';
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const trustItems = [
  {
    title: 'Fraud Detection',
    description: 'Stop repeat registrations and synthetic identity attempts before they reach your core systems.',
    icon: ShieldCheck,
  },
  {
    title: 'KYC Workflows',
    description: 'Support onboarding teams with a clean biometric layer that fits modern KYC and compliance journeys.',
    icon: BadgeCheck,
  },
  {
    title: 'Identity Verification',
    description: 'Verify returning users with a fast, guided face matching flow designed for real operators.',
    icon: UserCheck,
  },
];

const steps = [
  {
    title: 'Capture a face',
    description: 'Users upload or scan a face through a guided, confidence-building interface built for trust.',
    icon: Camera,
  },
  {
    title: 'Run AI checks',
    description: 'ArcFace embeddings, liveness checks, and similarity scoring evaluate the submission in seconds.',
    icon: Sparkles,
  },
  {
    title: 'Take action quickly',
    description: 'Operators review clear outcomes, duplicate risk, and admin insights in one premium workspace.',
    icon: Fingerprint,
  },
];

const useCases = [
  {
    title: 'Fintech onboarding',
    description: 'Prevent duplicate account creation and strengthen identity confidence during regulated signups.',
  },
  {
    title: 'Education platforms',
    description: 'Link one person to one account across admissions, exams, and student verification flows.',
  },
  {
    title: 'Enterprise access',
    description: 'Support workforce identity checks for internal tools, HR systems, and secure access journeys.',
  },
  {
    title: 'Digital identity products',
    description: 'Add biometric de-duplication to any SaaS product that cares about account integrity.',
  },
];

function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <span className="section-label">{eyebrow}</span>
      <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">{subtitle}</p>
    </div>
  );
}

export default function Landing() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.replace("#", ""));
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  return (
    <div className="pb-10">
      <section className="app-shell relative overflow-hidden py-16 sm:py-20 lg:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(191,219,254,0.6),transparent_34%),radial-gradient(circle_at_top_right,rgba(196,181,253,0.24),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,248,255,0.94))]" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-5xl text-center"
        >
          <span className="section-label">Biometric identity platform</span>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            AI Face Authentication &amp; Duplicate Detection
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">
            Detect duplicates, verify identities, and secure your system using AI.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/dashboard" className="btn-primary min-w-[220px] justify-center">
              Detect Duplicate Now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/dashboard" className="btn-secondary min-w-[180px] justify-center">
              Try Demo
            </Link>
          </div>
          <div className="mt-4">
            <Link to="/pricing" className="text-sm font-semibold text-sky-700 transition hover:text-sky-900">
              View Pricing
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Duplicate prevention
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Identity verification
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Admin analytics
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="mx-auto mt-14 max-w-6xl surface-card overflow-hidden p-6 shadow-soft sm:p-8"
        >
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[30px] bg-[linear-gradient(180deg,#f8fbff,#edf5ff)] p-5">
              <div className="rounded-[26px] border border-white/80 bg-white/85 p-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Live AI workflow</p>
                    <p className="mt-1 text-sm text-slate-500">What teams see during review</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    Processing
                  </span>
                </div>
                <div className="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-5">
                  <div className="aspect-[4/3] rounded-[18px] bg-[linear-gradient(180deg,#dbeafe,#bfdbfe,#93c5fd)]" />
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                    <span>Face capture ready</span>
                    <span className="font-semibold text-slate-900">Quality good</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">System overview</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Users verified</p>
                    <p className="mt-2 text-3xl font-semibold">12.4k</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Duplicates blocked</p>
                    <p className="mt-2 text-3xl font-semibold">128</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Response speed</p>
                    <p className="mt-2 text-3xl font-semibold">1.2s</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <p className="text-sm font-semibold text-slate-950">Similarity preview</p>
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Match confidence</span>
                      <span className="font-semibold text-slate-950">88.4%</span>
                    </div>
                    <div className="mt-3 h-3 rounded-full bg-slate-200">
                      <div className="h-full w-[88%] rounded-full bg-gradient-to-r from-sky-500 to-cyan-400" />
                    </div>
                    <p className="mt-3 text-sm text-emerald-700">High match confidence surfaced instantly.</p>
                  </div>
                </div>
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <p className="text-sm font-semibold text-slate-950">Operator value</p>
                  <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                    <p>Clear AI decisions</p>
                    <p>Duplicate prevention at signup</p>
                    <p>Premium light-theme admin UX</p>
                    <p>Deployable SaaS architecture</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="app-shell py-10 sm:py-14">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-slate-200 bg-slate-50/80 px-8 py-10 text-center shadow-sm">
          <p className="section-label">Why This Exists</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Why This Exists</h2>
          <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
            Duplicate accounts and identity fraud are major challenges in modern applications. This system uses AI-powered facial recognition to prevent duplicate registrations and ensure secure authentication.
          </p>
        </div>
      </section>

      <section className="app-shell py-14 sm:py-16" id="trusted-outcomes">
        <SectionHeading
          eyebrow="Trusted outcomes"
          title="Built for products that cannot afford identity mistakes"
          subtitle="From onboarding to repeat verification, the platform helps teams reduce fraud while keeping the user experience calm and modern."
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="surface-card rounded-[30px] p-7 transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="app-shell py-14 sm:py-16">
        <SectionHeading
          eyebrow="How it works"
          title="Three steps from capture to confident decision"
          subtitle="A simple operator flow underneath a more sophisticated AI pipeline keeps the experience approachable and persuasive."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="surface-card rounded-[30px] p-7 transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-400">0{index + 1}</span>
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <div id="how-it-works"><HowItWorks /></div>

      <section className="app-shell py-14 sm:py-16">
        <SectionHeading
          eyebrow="Use cases"
          title="Designed for teams where trust drives revenue"
          subtitle="The same product experience can support several identity-heavy workflows without feeling generic."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="surface-card rounded-[30px] p-7 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,#f0f7ff,#dcecff)] text-sky-700">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-slate-950">{useCase.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">{useCase.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="app-shell py-14 sm:py-16" id="demo">
        <SectionHeading
          eyebrow="Demo preview"
          title="A product experience that invites exploration"
          subtitle="This preview gives users just enough of the interface language to make them click through and spend time inside the app."
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="surface-card mt-12 overflow-hidden p-6 sm:p-8"
        >
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-[30px] bg-[linear-gradient(180deg,#f8fbff,#edf5ff)] p-5">
              <div className="rounded-[26px] border border-white/80 bg-white/80 p-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Enrollment flow</p>
                    <p className="mt-1 text-sm text-slate-500">Guided face onboarding</p>
                  </div>
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
                    Step 2/3
                  </span>
                </div>
                <div className="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-5">
                  <div className="aspect-[4/3] rounded-[18px] bg-[linear-gradient(180deg,#dbeafe,#bfdbfe,#93c5fd)]" />
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                    <span>Capture ready</span>
                    <span className="font-semibold text-slate-900">Quality good</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">Operator summary</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Registrations</p>
                    <p className="mt-2 text-3xl font-semibold">2,184</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Duplicate alerts</p>
                    <p className="mt-2 text-3xl font-semibold">42</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Verification rate</p>
                    <p className="mt-2 text-3xl font-semibold">97.4%</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[28px] border border-slate-200 bg-white p-5">
                  <p className="text-sm font-semibold text-slate-950">Risk queue</p>
                  <div className="mt-4 space-y-3">
                    {[91, 84, 78].map((score) => (
                      <div key={score} className="rounded-2xl bg-slate-50 p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Match confidence</span>
                          <span className="font-semibold text-slate-950">{score}%</span>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-slate-200">
                          <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-400" style={{ width: `${score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[28px] border border-slate-200 bg-white p-5">
                  <p className="text-sm font-semibold text-slate-950">Why teams stay</p>
                  <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                    <p>Clear biometric outcomes</p>
                    <p>Fast admin investigation loops</p>
                    <p>Confidence-building identity UX</p>
                    <p>Design that feels enterprise-ready</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
      <section className="app-shell py-16">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-slate-200 bg-gradient-to-br from-white to-slate-50 px-8 py-12 text-center shadow-sm">

          <h2 className="text-3xl font-semibold text-slate-950">
            Ready to secure your platform?
          </h2>

          <p className="mt-4 text-slate-600">
            Start detecting duplicate users and verifying identities in seconds using AI.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary px-6 py-3">
              Get Started Free
            </Link>

            <Link to="/dashboard" className="btn-secondary px-6 py-3">
              Try Demo
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}
