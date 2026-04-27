import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { listCategories } from '../../lib/api/categories';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Skeleton } from '../ui/Skeleton';
import { staggerSlow, slideUp } from '../../lib/motion';

const FALLBACK = [
  { name: 'Cleaning',   icon_emoji: '🧹', worker_count: 12 },
  { name: 'Driving',    icon_emoji: '🚗', worker_count: 18 },
  { name: 'Grocery',    icon_emoji: '🛒', worker_count: 7  },
  { name: 'Plumbing',   icon_emoji: '🔧', worker_count: 9  },
  { name: 'Electrical', icon_emoji: '⚡', worker_count: 11 },
  { name: 'Carpentry',  icon_emoji: '🪚', worker_count: 6  },
  { name: 'Painting',   icon_emoji: '🖌️', worker_count: 5  },
  { name: 'Tutoring',   icon_emoji: '📚', worker_count: 14 },
  { name: 'Cooking',    icon_emoji: '👨‍🍳', worker_count: 10 },
  { name: 'Childcare',  icon_emoji: '👶', worker_count: 4  },
];

const cardVariant = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export function CategoryGrid() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!isSupabaseConfigured) {
        if (alive) { setCats(FALLBACK); setLoading(false); }
        return;
      }
      try {
        const list = await listCategories();
        if (!alive) return;
        setCats(list.length ? list : FALLBACK);
      } catch {
        if (alive) setCats(FALLBACK);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <section ref={ref} className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-12"
      >
        <h2 className="font-serif text-3xl sm:text-5xl font-black m-0 mb-3">
          Pick your <span className="italic text-primary">pani</span>.
        </h2>
        <p className="text-text-secondary max-w-xl mx-auto text-lg">
          From the everyday stuff to the once-a-year stuff. We probably have someone for it.
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} height={140} style={{ borderRadius: 18 }} />
          ))}
        </div>
      ) : (
        <motion.div
          variants={staggerSlow}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
        >
          {cats.slice(0, 20).map((c) => (
            <motion.div key={c.id ?? c.name} variants={cardVariant}>
              <Link
                to={`/workers?category=${encodeURIComponent(c.name)}`}
                className="group glow-card flex flex-col items-center text-center bg-bg border border-border rounded-2xl p-6 h-full"
              >
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-primary-light/50 flex items-center justify-center mb-3"
                  whileHover={{ scale: 1.15, rotate: [0, -6, 6, 0] }}
                  transition={{ duration: 0.35 }}
                >
                  <span className="text-3xl" aria-hidden>
                    {c.icon_emoji}
                  </span>
                </motion.div>
                <span className="font-serif font-bold text-base text-text-primary">{c.name}</span>
                <span className="text-xs text-text-muted mt-1">{c.worker_count ?? 0} workers</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
