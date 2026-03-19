import { motion } from 'framer-motion';
import { ArrowRight, Check, Crown, Rocket, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Free',
    price: '₹0',
    cadence: '',
    icon: Rocket,
    accent: 'bg-sky-50 text-sky-700',
    description: 'A lightweight entry point for demos, pilots, and early-stage product exploration.',
    cta: { label: 'Get Started', to: '/contact', tone: 'btn-secondary' },
    features: [
      '5 uploads per day',
      'Basic verification',
      'Limited history',
    ],
  },
  {
    name: 'Pro',
    price: '₹499',
    cadence: '/month',
    icon: Crown,
    accent: 'bg-amber-50 text-amber-700',
    description: 'For serious usage with unlimited daily processing and a more premium experience.',
    cta: { label: 'Upgrade', to: '/contact', tone: 'btn-primary' },
    featured: true,
    features: [
      'Unlimited uploads',
      'Fast processing',
      'Full history access',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    cadence: '',
    icon: Shield,
    accent: 'bg-emerald-50 text-emerald-700',
    description: 'For large-scale identity systems that need API access and hands-on rollout support.',
    cta: { label: 'Get Started', to: '/contact', tone: 'btn-secondary' },
    features: [
      'API access',
      'Dedicated support',
      'High-scale usage',
    ],
  },
];

const faqs = [
  {
    question: 'How does billing work?',
    answer: 'The pricing page presents clear SaaS packaging today. Billing and payment flows can be connected later without changing the user-facing plan structure.',
  },
  {
    question: 'Can I upgrade later?',
    answer: 'Yes. Teams can start on the free plan and move to Pro or Enterprise whenever usage, scale, or support needs increase.',
  },
  {
    question: 'Is my data secure?',
    answer: 'The product is designed around secure identity workflows, protected access, and production-style authentication patterns.',
  },
];

export default function Pricing() {
  return (
    <section className="app-shell py-14 sm:py-16">
      <div className="surface-card overflow-hidden bg-[radial-gradient(circle_at_top,#dbeafe,transparent_35%),linear-gradient(180deg,#ffffff,#f7fbff)] p-8 sm:p-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-label">Pricing</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Simple plans for a serious identity product
          </h1>
          <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
            Start free, upgrade when daily identity checks become mission critical, and move to enterprise when API access and scale matter.
          </p>
        </div>

        <div className="mt-12 grid gap-6 xl:grid-cols-3">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-[32px] border p-7 shadow-sm ${plan.featured
                  ? 'border-slate-950 bg-slate-950 text-white'
                  : 'border-slate-200 bg-white text-slate-900'
                  }`}
              >
                <div className={`inline-flex rounded-2xl p-3 ${plan.featured ? 'bg-white/10 text-white' : plan.accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-6 flex items-end gap-2">
                  <h2 className={`text-2xl font-semibold ${plan.featured ? 'text-white' : 'text-slate-950'}`}>{plan.name}</h2>
                  {plan.featured ? (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                      Most Popular
                    </span>
                  ) : null}
                </div>
                <div className="mt-6 flex items-end gap-2">
                  <p className={`text-4xl font-semibold tracking-tight ${plan.featured ? 'text-white' : 'text-slate-950'}`}>{plan.price}</p>
                  {plan.cadence ? <p className={`pb-1 text-sm ${plan.featured ? 'text-white/70' : 'text-slate-500'}`}>{plan.cadence}</p> : null}
                </div>
                <p className={`mt-4 text-sm leading-7 ${plan.featured ? 'text-white/75' : 'text-slate-600'}`}>{plan.description}</p>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className={`flex items-start gap-3 text-sm ${plan.featured ? 'text-white/85' : 'text-slate-600'}`}>
                      <span className={`mt-0.5 rounded-full p-1 ${plan.featured ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'}`}>
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link to={plan.cta.to} className={`${plan.cta.tone} mt-8 w-full justify-center`}>
                  {plan.cta.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mx-auto mt-14 max-w-4xl">
          <div className="text-center">
            <p className="section-label">FAQ</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Questions teams ask before upgrading
            </h2>
          </div>

          <div className="mt-8 space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-950">{faq.question}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
