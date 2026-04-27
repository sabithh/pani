import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { listWorkers } from '../lib/api/workers';
import { isSupabaseConfigured } from '../lib/supabase';
import { useDebounce } from '../hooks/useDebounce';
import { PageTransition } from '../components/layout/PageTransition';
import { WorkerCard } from '../components/workers/WorkerCard';
import { WorkerFilters } from '../components/workers/WorkerFilters';
import { WorkerCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { staggerContainer } from '../lib/motion';

export default function Workers() {
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState(() => {
    const f = {};
    const cat = params.get('category');
    if (cat) f.category = cat;
    return f;
  });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const debouncedFilters = useDebounce(filters, 300);

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // sync category to URL for share-ability
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (filters.category) next.set('category', filters.category);
    else next.delete('category');
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      if (!isSupabaseConfigured) {
        if (alive) {
          setWorkers([]);
          setLoading(false);
        }
        return;
      }
      try {
        const list = await listWorkers({ ...debouncedFilters, search: debouncedSearch });
        if (alive) setWorkers(list);
      } catch {
        if (alive) setWorkers([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [debouncedFilters, debouncedSearch]);

  const headline = useMemo(() => {
    if (filters.category) return `${filters.category} workers`;
    return 'Browse the crew';
  }, [filters.category]);

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-4xl sm:text-5xl font-black m-0 mb-2">
            {headline}.
          </h1>
          <p className="text-text-secondary m-0">
            {loading ? 'Loading…' : `${workers.length} ${workers.length === 1 ? 'person' : 'people'} ready to do some pani.`}
          </p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted z-10" />
            <Input
              label="Search by name, skill, or category"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="!pl-10"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <WorkerFilters filters={filters} onChange={setFilters} />

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <WorkerCardSkeleton key={i} />)}
              </div>
            ) : workers.length === 0 ? (
              <EmptyState
                icon="☕"
                title="No workers here yet."
                description={
                  isSupabaseConfigured
                    ? "Maybe they're on chai break? Try adjusting your filters."
                    : "Connect Supabase to see real workers, or run the seed.sql file in the supabase/ folder."
                }
                action={
                  <Button variant="primary" onClick={() => setFilters({})}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {workers.map((w) => <WorkerCard key={w.id} worker={w} />)}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
