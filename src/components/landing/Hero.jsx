import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { StatPills } from './StatPills';
import { staggerFast, fadeUp, scaleIn } from '../../lib/motion';

const headline = 'Got pani?';
const headline2 = 'We got people.';

const splitWords = (s) => s.split(' ');

const wordVariant = {
  hidden: { opacity: 0, y: 28, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Hero() {
  const navigate = useNavigate();
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    let cancelled = false;

    function init() {
      try {
        if (cancelled || !vantaRef.current) return;
        if (!window.VANTA?.TOPOLOGY) {
          // Scripts may not have loaded yet — retry after a short delay
          setTimeout(init, 200);
          return;
        }
        if (vantaEffect.current) { vantaEffect.current.destroy(); }
        vantaEffect.current = window.VANTA.TOPOLOGY({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          scale: 1.0,
          scaleMobile: 0.75,
          backgroundColor: 0xFDF8F4,
          color: 0xC1440E,
        });
        // Push Vanta canvas behind content
        const canvas = vantaRef.current?.querySelector('canvas');
        if (canvas) {
          canvas.style.position = 'absolute';
          canvas.style.inset = '0';
          canvas.style.zIndex = '0';
        }
      } catch (e) {
        console.error('[Vanta]', e);
      }
    }

    init();

    return () => {
      cancelled = true;
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  return (
    <section
      ref={vantaRef}
      className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden bg-bg"
    >
      {/* Radial vignette for text readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(253,248,244,0.7) 0%, rgba(253,248,244,0.35) 55%, transparent 100%)',
        }}
      />

      {/* Content */}
      <div className="relative w-full max-w-5xl mx-auto px-5 sm:px-8 text-center" style={{ zIndex: 2 }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/60 backdrop-blur-md text-tag-text text-xs font-semibold mb-8 border border-primary/15 shadow-soft"
        >
          <Sparkles size={13} className="text-primary" /> Pani · പണി · Work, done.
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={staggerFast}
          initial="hidden"
          animate="visible"
          className="font-serif text-5xl sm:text-7xl lg:text-[6.5rem] font-black tracking-tight leading-[1.02] mb-4"
        >
          {splitWords(headline).map((w, i) => (
            <motion.span key={i} variants={wordVariant} className="inline-block mr-3 sm:mr-5">
              {w}
            </motion.span>
          ))}
          <br />
          <motion.span
            variants={staggerFast}
            initial="hidden"
            animate="visible"
            className="inline-block"
          >
            {splitWords(headline2).map((w, i) => (
              <motion.span
                key={i}
                variants={wordVariant}
                className={[
                  'inline-block mr-3 sm:mr-5',
                  i === 1 ? 'text-primary italic' : '',
                ].join(' ')}
              >
                {w}
              </motion.span>
            ))}
          </motion.span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
          className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mt-4 mb-10 leading-relaxed"
        >
          Your work. Their skill. Hire help around the corner — cleaners,
          drivers, plumbers, tutors, and every kind of pani in between.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12"
        >
          <Button variant="primary" size="lg" onClick={() => navigate('/post-job')} rightIcon={<ArrowRight size={18} />}>
            Drop your pani
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/workers')}>
            Browse workers
          </Button>
        </motion.div>

        {/* Stat pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          <StatPills />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        style={{ zIndex: 2 }}
      >
        <ChevronDown size={24} className="text-text-muted animate-scroll-bounce" />
      </motion.div>
    </section>
  );
}
