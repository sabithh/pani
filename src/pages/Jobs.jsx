import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, LocateFixed, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { listJobs } from '../lib/api/jobs';
import { listCategories } from '../lib/api/categories';
import { isSupabaseConfigured } from '../lib/supabase';
import { useDebounce } from '../hooks/useDebounce';
import { useGeolocation } from '../hooks/useGeolocation';
import { PageTransition } from '../components/layout/PageTransition';
import { JobCard } from '../components/jobs/JobCard';
import { JobCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Tag } from '../components/ui/Tag';
import { staggerContainer } from '../lib/motion';

export default function Jobs() {
  const [params, setParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState(params.get('category') ?? '');
  const [urgencyOnly, setUrgencyOnly] = useState(false);
  const [budgetMax, setBudgetMax] = useState(20000);
  const [nearCoords, setNearCoords] = useState(null); // { lat, lng }
  const [radiusKm, setRadiusKm] = useState(25);

  const { getPosition, loading: geoLoading } = useGeolocation();
  const debouncedSearch = useDebounce(search, 300);

  const toggleNearMe = async () => {
    if (nearCoords) { setNearCoords(null); return; }
    try {
      const pos = await getPosition();
      setNearCoords(pos);
    } catch {
      toast.error('Could not get your location. Please allow location access.');
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    listCategories().then(setCats).catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      if (!isSupabaseConfigured) { if (alive) setLoading(false); return; }
      try {
        const list = await listJobs({
          status: 'open',
          category: selectedCat || undefined,
          urgency: urgencyOnly ? 'urgent' : undefined,
          nearLat: nearCoords?.lat,
          nearLng: nearCoords?.lng,
          radiusKm,
          limit: 80,
        });
        let filtered = list;
        if (debouncedSearch) {
          const n = debouncedSearch.toLowerCase();
          filtered = list.filter(
            (j) => j.title?.toLowerCase().includes(n) || j.description?.toLowerCase().includes(n)
          );
        }
        if (budgetMax < 20000) {
          filtered = filtered.filter((j) => !j.budget_max || j.budget_max <= budgetMax);
        }
        if (alive) setJobs(filtered);
      } catch { if (alive) setJobs([]); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [selectedCat, urgencyOnly, budgetMax, debouncedSearch, nearCoords, radiusKm]);

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-4xl sm:text-5xl font-black m-0 mb-2">
            Open <span className="italic text-primary">pani</span>.
          </h1>
          <p className="text-text-secondary m-0">
            {loading ? 'Loading…' : `${jobs.length} jobs waiting for the right person.`}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted z-10" />
            <Input
              label="Search jobs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="!pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={toggleNearMe}
              disabled={geoLoading}
              className={[
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-colors',
                nearCoords
                  ? 'bg-primary text-white border-primary'
                  : 'bg-bg text-text-secondary border-border hover:border-border-strong',
              ].join(' ')}
            >
              <LocateFixed size={12} />
              {geoLoading ? 'Locating…' : nearCoords ? 'Near me (on)' : 'Near me'}
            </motion.button>

            {nearCoords && [5, 10, 25, 50].map((r) => (
              <button
                key={r}
                onClick={() => setRadiusKm(r)}
                className={[
                  'px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-colors',
                  radiusKm === r
                    ? 'bg-primary text-white border-primary'
                    : 'bg-bg text-text-secondary border-border hover:border-border-strong',
                ].join(' ')}
              >
                {r} km
              </button>
            ))}

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setUrgencyOnly((v) => !v)}
              className={[
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-colors',
                urgencyOnly
                  ? 'bg-urgent text-white border-urgent'
                  : 'bg-bg text-text-secondary border-border hover:border-border-strong',
              ].join(' ')}
            >
              <Flame size={12} /> Urgent only
            </motion.button>

            <button
              onClick={() => setSelectedCat('')}
              className={[
                'px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-colors',
                !selectedCat
                  ? 'bg-primary text-white border-primary'
                  : 'bg-bg text-text-secondary border-border hover:border-border-strong',
              ].join(' ')}
            >
              All categories
            </button>

            {cats.slice(0, 10).map((c) => {
              const active = selectedCat === c.name;
              return (
                <motion.button
                  key={c.name}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCat(active ? '' : c.name)}
                  className={[
                    'px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-colors',
                    active
                      ? 'bg-primary text-white border-primary'
                      : 'bg-bg text-text-secondary border-border hover:border-border-strong',
                  ].join(' ')}
                >
                  {c.icon_emoji} {c.name}
                </motion.button>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-text-muted whitespace-nowrap">
              Budget ≤ ₹{budgetMax === 20000 ? 'Any' : budgetMax.toLocaleString('en-IN')}
            </span>
            <input
              type="range" min="500" max="20000" step="500"
              value={budgetMax}
              onChange={(e) => setBudgetMax(Number(e.target.value))}
              className="flex-1"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            icon="📋"
            title="All quiet on the Pani front."
            description={
              isSupabaseConfigured
                ? 'No open jobs match your filters. Try clearing them.'
                : 'Connect Supabase and run seed.sql to see sample jobs.'
            }
            action={
              <Button variant="primary" onClick={() => { setSelectedCat(''); setUrgencyOnly(false); setBudgetMax(20000); setSearch(''); setNearCoords(null); }}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {jobs.map((j) => <JobCard key={j.id} job={j} linkToDetail />)}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
