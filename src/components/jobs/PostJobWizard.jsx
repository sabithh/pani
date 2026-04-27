import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Flame, LocateFixed, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGeolocation } from '../../hooks/useGeolocation';
import { listCategories } from '../../lib/api/categories';
import { createJob } from '../../lib/api/jobs';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Tag } from '../ui/Tag';
import { Skeleton } from '../ui/Skeleton';
import { formatINR, formatRange } from '../../lib/format';

const FALLBACK_CATS = [
  { name: 'Cleaning', icon_emoji: '🧹' },
  { name: 'Driving', icon_emoji: '🚗' },
  { name: 'Plumbing', icon_emoji: '🔧' },
  { name: 'Electrical', icon_emoji: '⚡' },
  { name: 'Tutoring', icon_emoji: '📚' },
  { name: 'Cooking', icon_emoji: '👨‍🍳' },
];

const STEP_TITLES = ['Category', 'Details', 'Budget & urgency', 'Review'];

export function PostJobWizard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [cats, setCats] = useState([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [form, setForm] = useState({
    category: '',
    title: '',
    description: '',
    location: profile?.location ?? '',
    lat: null,
    lng: null,
    budget_min: 500,
    budget_max: 2000,
    urgency: 'normal',
  });
  const { getPosition, loading: geoLoading } = useGeolocation();

  const useMyLocation = async () => {
    try {
      const pos = await getPosition();
      setForm((f) => ({ ...f, lat: pos.lat, lng: pos.lng }));
      toast.success('Location pinned to this job.');
    } catch {
      toast.error('Could not get your location. Please allow location access.');
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!isSupabaseConfigured) {
        if (alive) {
          setCats(FALLBACK_CATS);
          setCatsLoading(false);
        }
        return;
      }
      try {
        const list = await listCategories();
        if (alive) setCats(list.length ? list : FALLBACK_CATS);
      } catch {
        if (alive) setCats(FALLBACK_CATS);
      } finally {
        if (alive) setCatsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (profile?.location && !form.location) setForm((f) => ({ ...f, location: profile.location }));
  }, [profile?.location]); // eslint-disable-line react-hooks/exhaustive-deps

  const next = () => { setDirection(1); setStep((s) => Math.min(s + 1, 3)); };
  const back = () => { setDirection(-1); setStep((s) => Math.max(s - 1, 0)); };

  const canAdvance = () => {
    if (step === 0) return Boolean(form.category);
    if (step === 1) return form.title.trim().length > 3 && form.description.trim().length > 10 && form.location.trim().length > 1;
    if (step === 2) return Number(form.budget_min) >= 0 && Number(form.budget_max) > Number(form.budget_min);
    return true;
  };

  const submit = async () => {
    if (!user) {
      toast.error('You need to be logged in to post a job.');
      navigate('/login');
      return;
    }
    setSubmitting(true);
    try {
      if (!isSupabaseConfigured) {
        toast.success("Job dropped! (Demo only — connect Supabase to actually save it.)");
        navigate('/dashboard');
        return;
      }
      await createJob({
        client_id: user.id,
        title: form.title,
        description: form.description,
        category: form.category,
        budget_min: Number(form.budget_min),
        budget_max: Number(form.budget_max),
        location: form.location,
        urgency: form.urgency,
        status: 'open',
        lat: form.lat ?? null,
        lng: form.lng ?? null,
      });
      toast.success('Job dropped. Workers will start sliding in soon.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Could not post the job. Try again?');
    } finally {
      setSubmitting(false);
    }
  };

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60, transition: { duration: 0.25 } }),
  };

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-4xl sm:text-5xl font-black m-0 mb-2">
          Drop your <span className="italic text-primary">pani</span>.
        </h1>
        <p className="text-text-secondary m-0">
          Tell us what needs doing. Workers will reach out fast.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">
            Step {step + 1} of 4 · {STEP_TITLES[step]}
          </span>
          <span className="text-xs text-text-muted">{Math.round(((step + 1) / 4) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-surface rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={false}
            animate={{ width: `${((step + 1) / 4) * 100}%` }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
        <div className="mt-3 flex gap-2">
          {STEP_TITLES.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: i === step ? 1 : 0.85,
                opacity: i <= step ? 1 : 0.4,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className={[
                'flex-1 h-1.5 rounded-full',
                i < step ? 'bg-primary' : i === step ? 'bg-primary' : 'bg-border',
              ].join(' ')}
            />
          ))}
        </div>
      </div>

      <div className="bg-bg border border-border rounded-3xl p-6 sm:p-8 shadow-card min-h-[400px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {step === 0 && (
              <div>
                <h2 className="font-serif text-2xl font-bold m-0 mb-1">What kind of pani?</h2>
                <p className="text-text-secondary text-sm m-0 mb-6">Pick the category that fits best.</p>
                {catsLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={88} style={{ borderRadius: 18 }} />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {cats.map((c) => {
                      const active = form.category === c.name;
                      return (
                        <motion.button
                          key={c.name}
                          type="button"
                          whileHover={{ scale: 1.04, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setForm({ ...form, category: c.name })}
                          className={[
                            'flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-colors',
                            active
                              ? 'border-primary bg-primary-light text-primary-dark'
                              : 'border-border hover:border-border-strong text-text-secondary',
                          ].join(' ')}
                        >
                          <span className="text-3xl mb-1">{c.icon_emoji}</span>
                          <span className="font-semibold text-sm">{c.name}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="font-serif text-2xl font-bold m-0 mb-1">Details, please.</h2>
                <p className="text-text-secondary text-sm m-0 mb-6">Be specific. The more workers know, the better the match.</p>
                <div className="space-y-4">
                  <Input
                    label="Job title (e.g. Need a plumber for kitchen leak)"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    maxLength={100}
                    required
                  />
                  <Textarea
                    label="Describe the work in detail"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                  />
                  <div>
                    <Input
                      label="Location (city / area)"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value, lat: null, lng: null })}
                      required
                    />
                    <button
                      type="button"
                      onClick={useMyLocation}
                      disabled={geoLoading}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary-dark hover:underline disabled:opacity-50"
                    >
                      <LocateFixed size={12} />
                      {geoLoading ? 'Getting location…' : form.lat ? 'Location pinned ✓' : 'Use my exact location'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="font-serif text-2xl font-bold m-0 mb-1">Budget & urgency.</h2>
                <p className="text-text-secondary text-sm m-0 mb-6">Set a fair range. Workers can negotiate from here.</p>

                <div className="bg-surface/40 rounded-2xl p-5 mb-6">
                  <div className="flex justify-between items-baseline mb-3">
                    <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">Budget range</span>
                    <span className="font-serif font-black text-2xl text-primary-dark">
                      {formatRange(form.budget_min, form.budget_max)}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-text-muted">Min: {formatINR(form.budget_min)}</label>
                      <input
                        type="range"
                        min="100"
                        max="20000"
                        step="100"
                        value={form.budget_min}
                        onChange={(e) => setForm({ ...form, budget_min: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-muted">Max: {formatINR(form.budget_max)}</label>
                      <input
                        type="range"
                        min="100"
                        max="20000"
                        step="100"
                        value={form.budget_max}
                        onChange={(e) => setForm({ ...form, budget_max: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-2">Urgency</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setForm({ ...form, urgency: 'normal' })}
                      className={[
                        'p-4 rounded-2xl border-2 text-left transition-colors',
                        form.urgency === 'normal'
                          ? 'border-primary bg-primary-light text-primary-dark'
                          : 'border-border hover:border-border-strong text-text-secondary',
                      ].join(' ')}
                    >
                      <Sparkles size={18} className="mb-1" />
                      <div className="font-semibold">Normal</div>
                      <div className="text-xs text-text-muted">Anytime in the next few days</div>
                    </motion.button>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setForm({ ...form, urgency: 'urgent' })}
                      className={[
                        'p-4 rounded-2xl border-2 text-left transition-colors',
                        form.urgency === 'urgent'
                          ? 'border-urgent bg-urgent-bg text-urgent'
                          : 'border-border hover:border-border-strong text-text-secondary',
                      ].join(' ')}
                    >
                      <Flame size={18} className="mb-1" />
                      <div className="font-semibold">Urgent</div>
                      <div className="text-xs text-text-muted">ASAP — today or tomorrow</div>
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="font-serif text-2xl font-bold m-0 mb-1">Looks good?</h2>
                <p className="text-text-secondary text-sm m-0 mb-6">One last look before we let workers see it.</p>
                <div className="space-y-4 bg-surface/40 rounded-2xl p-5">
                  <Row label="Category" value={form.category} />
                  <Row label="Title" value={form.title} />
                  <Row label="Description" value={form.description} multiline />
                  <Row label="Location" value={form.location} />
                  <Row label="Budget" value={formatRange(form.budget_min, form.budget_max)} />
                  <Row
                    label="Urgency"
                    value={form.urgency === 'urgent'
                      ? <Tag tone="urgent" leftIcon={<Flame size={11} />}>Urgent</Tag>
                      : <Tag tone="surface">Normal</Tag>
                    }
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between mt-6">
        <Button variant="ghost" onClick={back} disabled={step === 0} leftIcon={<ArrowLeft size={16} />}>
          Back
        </Button>
        {step < 3 ? (
          <Button variant="primary" onClick={next} disabled={!canAdvance()} rightIcon={<ArrowRight size={16} />}>
            Continue
          </Button>
        ) : (
          <Button variant="primary" onClick={submit} loading={submitting} rightIcon={<Check size={16} />}>
            Drop the pani
          </Button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, multiline = false }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-0.5">
        {label}
      </div>
      <div className={['font-medium text-text-primary', multiline ? 'whitespace-pre-line' : ''].join(' ')}>
        {value || <span className="text-text-muted">—</span>}
      </div>
    </div>
  );
}
