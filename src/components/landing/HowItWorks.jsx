import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Search, Send, CheckCircle2, UserPlus, ListTodo, Coins } from 'lucide-react';

const tabs = {
  client: {
    label: 'I need help',
    steps: [
      { icon: Search,       title: 'Browse or post',   body: 'Pick a category or drop your pani as a job.' },
      { icon: Send,         title: 'Pick your person', body: 'Chat, compare rates, lock someone in.' },
      { icon: CheckCircle2, title: 'Get it done',      body: 'They show up. Pay. Drop a review.' },
    ],
  },
  worker: {
    label: 'I offer help',
    steps: [
      { icon: UserPlus, title: 'Set up your profile', body: 'Skills, rate, photo. 5 minutes max.' },
      { icon: ListTodo, title: 'Apply to jobs',       body: 'Or wait for clients to slide into your DMs.' },
      { icon: Coins,    title: 'Cash the pani',       body: 'Get paid, build reviews, show up again.' },
    ],
  },
};

export function HowItWorks() {
  const [active, setActive] = useState('client');
  const data = tabs[active];
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      className="relative py-28 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1A0804 0%, #2D1207 50%, #1A0804 100%)' }}
    >
      {/* Decorative blobs */}
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-amber-700/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-5 sm:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl sm:text-5xl font-black m-0 mb-3 text-white">
            How the <span className="italic text-primary">pani</span> flows.
          </h2>
          <p className="text-white/50 text-lg">No drama. Three steps. That's it.</p>
        </motion.div>

        {/* Tab Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex justify-center mb-12"
        >
          <div className="relative inline-flex p-1 bg-white/10 border border-white/10 rounded-full backdrop-blur-sm">
            {Object.entries(tabs).map(([key, t]) => {
              const isActive = active === key;
              return (
                <button
                  key={key}
                  onClick={() => setActive(key)}
                  className={[
                    'relative px-5 sm:px-7 py-2.5 text-sm font-semibold rounded-full transition-colors z-10',
                    isActive ? 'text-white' : 'text-white/50 hover:text-white/70',
                  ].join(' ')}
                >
                  {isActive && (
                    <motion.span
                      layoutId="howTabPill"
                      className="absolute inset-0 bg-primary rounded-full shadow-glow"
                      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                    />
                  )}
                  <span className="relative">{t.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Step Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="relative grid md:grid-cols-3 gap-5"
          >
            {/* Timeline connector line (desktop only) */}
            <div className="hidden md:block absolute top-[56px] left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-[2px] bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30 pointer-events-none" style={{ zIndex: 0 }} />

            {data.steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 40 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.15 + 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="relative bg-white/[0.04] border border-white/10 rounded-2xl p-7 backdrop-blur-sm overflow-hidden group hover:bg-white/[0.08] transition-all duration-300 hover:border-primary/30"
                  style={{ zIndex: 1 }}
                >
                  {/* Step number watermark */}
                  <span className="absolute top-4 right-5 font-serif text-7xl font-black text-white/[0.04] select-none leading-none">
                    0{i + 1}
                  </span>

                  {/* Step number circle */}
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm mb-5 shadow-glow relative z-10">
                    <Icon size={20} />
                  </div>

                  <p className="font-mono text-[10px] font-bold text-primary/70 mb-2 uppercase tracking-[0.2em]">Step 0{i + 1}</p>
                  <h3 className="font-serif text-xl font-bold m-0 mb-2 text-white">{step.title}</h3>
                  <p className="text-white/50 text-sm m-0 leading-relaxed">{step.body}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
