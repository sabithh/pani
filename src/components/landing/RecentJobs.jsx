import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { listJobs } from '../../lib/api/jobs';
import { isSupabaseConfigured } from '../../lib/supabase';
import { JobCard } from '../jobs/JobCard';
import { JobCardSkeleton } from '../ui/Skeleton';
import { Button } from '../ui/Button';
import { staggerSlow, scaleUp } from '../../lib/motion';

export function RecentJobs() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!isSupabaseConfigured) {
        if (alive) setLoading(false);
        return;
      }
      try {
        const list = await listJobs({ status: 'open', limit: 3 });
        if (alive) setJobs(list);
      } catch {
        // swallow
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
            Fresh <span className="italic text-primary">pani</span>.
          </h2>
          <p className="text-text-secondary m-0 text-lg">Open jobs, posted recently. Workers — slide in.</p>
        </div>
        <Link to="/post-job">
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>
            Drop your pani
          </Button>
        </Link>
      </motion.div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <JobCardSkeleton key={i} />)}
        </div>
      ) : jobs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-surface/50 border border-dashed border-border-strong rounded-2xl p-10 text-center"
        >
          <p className="text-text-secondary m-0">All quiet on the Pani front. Post a job to get things moving.</p>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerSlow}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-4"
        >
          {jobs.map((j) => (
            <motion.div key={j.id} variants={scaleUp}>
              <JobCard job={j} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
