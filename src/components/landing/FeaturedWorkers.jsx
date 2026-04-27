import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { listFeaturedWorkers } from '../../lib/api/workers';
import { isSupabaseConfigured } from '../../lib/supabase';
import { WorkerCard } from '../workers/WorkerCard';
import { WorkerCardSkeleton } from '../ui/Skeleton';
import { Button } from '../ui/Button';
import { staggerSlow, scaleUp } from '../../lib/motion';

export function FeaturedWorkers() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!isSupabaseConfigured) {
        if (alive) setLoading(false);
        return;
      }
      try {
        const list = await listFeaturedWorkers(8);
        if (alive) setWorkers(list);
      } catch {
        // swallow — empty state will render
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
        className="flex items-end justify-between mb-10 flex-wrap gap-3"
      >
        <div>
          <h2 className="font-serif text-3xl sm:text-5xl font-black m-0 mb-1">
            Top <span className="italic text-primary">crew</span>.
          </h2>
          <p className="text-text-secondary m-0 text-lg">Hand-picked, well-rated, often busy.</p>
        </div>
        <Link to="/workers">
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>
            See all
          </Button>
        </Link>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <WorkerCardSkeleton key={i} />)}
        </div>
      ) : workers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-surface/50 border border-dashed border-border-strong rounded-2xl p-10 text-center"
        >
          <p className="text-text-secondary m-0">
            No workers seeded yet. Run the SQL files in <code className="px-1 py-0.5 bg-bg rounded">supabase/</code> to see real data here.
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerSlow}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {workers.slice(0, 8).map((w) => (
            <motion.div key={w.id} variants={scaleUp}>
              <WorkerCard worker={w} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
