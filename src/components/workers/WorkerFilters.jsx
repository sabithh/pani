import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, LocateFixed } from 'lucide-react';
import toast from 'react-hot-toast';
import { listCategories } from '../../lib/api/categories';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useGeolocation } from '../../hooks/useGeolocation';
import { Input } from '../ui/Input';
import { Tag } from '../ui/Tag';
import { Button } from '../ui/Button';

const RADIUS_OPTIONS = [5, 10, 25, 50];

export function WorkerFilters({ filters, onChange }) {
  const [cats, setCats] = useState([]);
  const [open, setOpen] = useState(false);
  const { getPosition, loading: geoLoading } = useGeolocation();

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    listCategories().then(setCats).catch(() => {});
  }, []);

  const update = (patch) => onChange({ ...filters, ...patch });
  const reset = () => onChange({});

  const toggleNearMe = async () => {
    if (filters.nearLat != null) {
      onChange({ ...filters, nearLat: undefined, nearLng: undefined, radiusKm: undefined });
      return;
    }
    try {
      const pos = await getPosition();
      onChange({ ...filters, nearLat: pos.lat, nearLng: pos.lng, radiusKm: filters.radiusKm ?? 25 });
    } catch {
      toast.error('Could not get your location. Please allow location access.');
    }
  };

  const nearMeActive = filters.nearLat != null;

  const filterBody = (
    <div className="space-y-7">
      <div>
        <h4 className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-3">Category</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => update({ category: undefined })}
            className={[
              'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
              !filters.category
                ? 'bg-primary text-white border-primary'
                : 'bg-bg text-text-secondary border-border hover:border-border-strong',
            ].join(' ')}
          >
            All
          </button>
          {cats.map((c) => {
            const active = filters.category === c.name;
            return (
              <motion.button
                key={c.id ?? c.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => update({ category: active ? undefined : c.name })}
                className={[
                  'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                  active
                    ? 'bg-primary text-white border-primary'
                    : 'bg-bg text-text-secondary border-border hover:border-border-strong',
                ].join(' ')}
              >
                <span className="mr-1">{c.icon_emoji}</span>{c.name}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-3">Location</h4>
        <Input
          label="City or area"
          value={filters.location ?? ''}
          onChange={(e) => update({ location: e.target.value || undefined })}
        />
      </div>

      <div>
        <h4 className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-3">
          Hourly rate · ₹{filters.minRate ?? 0} – ₹{filters.maxRate ?? 2000}
        </h4>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-text-muted">Min</label>
            <input
              type="range"
              min="0"
              max="2000"
              step="50"
              value={filters.minRate ?? 0}
              onChange={(e) => update({ minRate: Number(e.target.value) || undefined })}
            />
          </div>
          <div>
            <label className="text-xs text-text-muted">Max</label>
            <input
              type="range"
              min="0"
              max="2000"
              step="50"
              value={filters.maxRate ?? 2000}
              onChange={(e) => update({ maxRate: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-3">Min rating</h4>
        <div className="flex gap-2">
          {[0, 3, 4, 4.5].map((r) => {
            const active = (filters.minRating ?? 0) === r;
            return (
              <button
                key={r}
                onClick={() => update({ minRating: r === 0 ? undefined : r })}
                className={[
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  active
                    ? 'bg-primary text-white border-primary'
                    : 'bg-bg text-text-secondary border-border hover:border-border-strong',
                ].join(' ')}
              >
                {r === 0 ? 'Any' : `${r}+ ★`}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer select-none">
        <span className="relative">
          <input
            type="checkbox"
            checked={Boolean(filters.availableOnly)}
            onChange={(e) => update({ availableOnly: e.target.checked || undefined })}
            className="sr-only peer"
          />
          <span className="block w-10 h-6 rounded-full bg-border peer-checked:bg-primary transition-colors" />
          <span className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-bg shadow-sm transition-transform peer-checked:translate-x-4" />
        </span>
        <span className="text-sm font-medium">Available now only</span>
      </label>

      <div>
        <h4 className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-3">Proximity</h4>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={toggleNearMe}
          disabled={geoLoading}
          className={[
            'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-colors w-full justify-center',
            nearMeActive
              ? 'bg-primary text-white border-primary'
              : 'bg-bg text-text-secondary border-border hover:border-border-strong',
          ].join(' ')}
        >
          <LocateFixed size={14} />
          {geoLoading ? 'Getting location…' : nearMeActive ? 'Near me (on)' : 'Near me'}
        </motion.button>
        {nearMeActive && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => update({ radiusKm: r })}
                className={[
                  'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
                  (filters.radiusKm ?? 25) === r
                    ? 'bg-primary text-white border-primary'
                    : 'bg-bg text-text-secondary border-border hover:border-border-strong',
                ].join(' ')}
              >
                {r} km
              </button>
            ))}
          </div>
        )}
      </div>

      <Button variant="ghost" size="sm" onClick={reset}>
        Clear filters
      </Button>
    </div>
  );

  return (
    <>
      {/* Mobile open button */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)} leftIcon={<SlidersHorizontal size={14} />}>
          Filters
        </Button>
        {Object.keys(filters).filter((k) => filters[k] !== undefined).length > 0 && (
          <Tag tone="urgent">{Object.keys(filters).filter((k) => filters[k] !== undefined).length} active</Tag>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 sticky top-20 h-fit bg-bg border border-border rounded-2xl p-6 shadow-soft">
        <h3 className="font-serif text-lg font-bold m-0 mb-6">Refine</h3>
        {filterBody}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-text-primary/40 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 z-[90] w-[88%] max-w-sm bg-bg p-6 overflow-y-auto lg:hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-xl font-bold m-0">Refine</h3>
                <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-surface">
                  <X size={20} />
                </button>
              </div>
              {filterBody}
              <Button variant="primary" className="w-full mt-6" onClick={() => setOpen(false)}>
                See results
              </Button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
