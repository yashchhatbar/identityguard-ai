import { motion } from 'framer-motion';
import { Binary, ScanFace, Sparkles, Target } from 'lucide-react';

const steps = [
  { title: 'Face Detection', description: 'The system detects the face in the uploaded image and isolates the relevant facial region.', icon: ScanFace },
  { title: 'Embedding Generation', description: 'The face is converted into a compact 512-dimensional vector that captures unique facial features.', icon: Binary },
  { title: 'Similarity Matching', description: 'That vector is compared with stored face vectors using cosine similarity to measure closeness.', icon: Sparkles },
  { title: 'Decision', description: 'The final result is made using a configurable threshold to classify the image as duplicate or unique.', icon: Target },
];

export default function HowItWorks() {
  return (
    <section className="app-shell py-14 sm:py-16">
      <div className="surface-card overflow-hidden bg-[radial-gradient(circle_at_top,#dbeafe,transparent_30%),linear-gradient(180deg,#ffffff,#f8fbff)] p-8 sm:p-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-label">How AI Works</p>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            A real face-matching pipeline, explained simply
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
            The platform turns an uploaded face into a numerical representation, compares it with stored identities, and makes a threshold-based decision.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-400">0{index + 1}</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
