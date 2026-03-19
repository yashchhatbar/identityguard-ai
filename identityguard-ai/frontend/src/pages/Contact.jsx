import { motion } from 'framer-motion';
import { Mail, MapPin, Send, TimerReset } from 'lucide-react';
import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    setForm({ name: '', email: '', message: '' });
  }

  return (
    <section className="app-shell py-14 sm:py-16">
      <div className="mx-auto max-w-5xl space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="surface-card overflow-hidden bg-[radial-gradient(circle_at_top,#dbeafe,transparent_32%),linear-gradient(180deg,#ffffff,#f8fbff)] p-8 text-center sm:p-10"
        >
          <p className="section-label">Contact</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Contact Us
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            Have questions or need support? We&apos;re here to help.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="surface-card p-6 sm:p-8"
          >
            <div className="mb-6">
              <p className="section-label">Send a message</p>
              <h2 className="mt-4 text-2xl font-semibold text-slate-950">We&apos;ll get back to you quickly</h2>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700"
              >
                Message sent successfully!
              </motion.div>
            ) : null}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  className="input-field"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Message</label>
                <textarea
                  required
                  rows={6}
                  value={form.message}
                  onChange={(event) => updateField('message', event.target.value)}
                  className="input-field min-h-[150px] resize-y"
                  placeholder="Tell us what you need help with"
                />
              </div>

              <button type="submit" className="btn-primary w-full justify-center sm:w-auto">
                <Send className="h-4 w-4" />
                Send Message
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="space-y-4"
          >
            <div className="surface-card p-6">
              <p className="section-label">Contact info</p>
              <h2 className="mt-4 text-2xl font-semibold text-slate-950">Support that feels human</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Reach out for product questions, onboarding guidance, or partnership conversations.
              </p>
            </div>

            {[
              { label: 'Email', value: 'support@identityguard.ai', icon: Mail },
              { label: 'Location', value: 'India', icon: MapPin },
              { label: 'Response time', value: 'Within 24 hours', icon: TimerReset },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="surface-card rounded-[28px] p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-2 text-base font-semibold text-slate-950">{item.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
