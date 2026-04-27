import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

export function CTABanner() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const navigate = useNavigate();

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-28"
      style={{ background: 'linear-gradient(135deg, #2D1A0E 0%, #1A0804 50%, #2D1207 100%)' }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-primary/15 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-4xl mx-auto px-5 sm:px-8 text-center"
      >
        {/* Logo icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="inline-flex mb-8"
        >
          <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="22" fill="#C1440E" />
            <rect x="28" y="62" width="52" height="26" rx="10" fill="#FDF8F4" />
            <rect x="18" y="54" width="18" height="26" rx="9" fill="#FDF8F4" />
            <rect x="28" y="28" width="13" height="42" rx="6.5" fill="#FDF8F4" />
            <rect x="44" y="20" width="13" height="50" rx="6.5" fill="#FDF8F4" />
            <rect x="60" y="26" width="13" height="44" rx="6.5" fill="#FDF8F4" />
            <rect x="74" y="34" width="11" height="36" rx="5.5" fill="#FDF8F4" />
            <rect x="38" y="80" width="54" height="18" rx="9" fill="#FDF8F4" stroke="#C1440E" strokeWidth="1.5" />
            <text x="65" y="93" textAnchor="middle" fontFamily="serif" fontSize="11" fontWeight="700" fill="#C1440E">
              പണി
            </text>
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-primary text-xs font-semibold mb-6 border border-white/10"
        >
          <Sparkles size={12} /> Ready to get things done?
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-4xl sm:text-6xl font-black text-white mb-5 leading-tight"
        >
          Drop your <span className="italic text-primary">pani</span>.
          <br />
          We handle the rest.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-white/50 text-lg max-w-xl mx-auto mb-10"
        >
          Whether you need help or want to offer it — Pani connects you
          with the right people, right around the corner.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button variant="primary" size="lg" onClick={() => navigate('/post-job')} rightIcon={<ArrowRight size={18} />}>
            Post a job
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/become-a-worker')}
            className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20"
          >
            Join as a worker
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
