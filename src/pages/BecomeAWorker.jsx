import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, Upload, X, Image as ImageIcon, Flame, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { listCategories } from '../lib/api/categories';
import {
  upsertWorkerProfile,
  uploadAvatar,
  uploadPortfolioImage,
  updateUserProfile,
} from '../lib/api/workerOnboarding';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { PageTransition } from '../components/layout/PageTransition';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Tag } from '../components/ui/Tag';
import { Skeleton } from '../components/ui/Skeleton';
import { Avatar } from '../components/ui/Avatar';
import { formatINR } from '../lib/format';

const FALLBACK_CATS = [
  { name: 'Cleaning', icon_emoji: '🧹' }, { name: 'Driving', icon_emoji: '🚗' },
  { name: 'Plumbing', icon_emoji: '🔧' }, { name: 'Electrical', icon_emoji: '⚡' },
  { name: 'Tutoring', icon_emoji: '📚' }, { name: 'Cooking', icon_emoji: '👨‍🍳' },
  { name: 'Carpentry', icon_emoji: '🪚' }, { name: 'Painting', icon_emoji: '🖌️' },
  { name: 'Childcare', icon_emoji: '👶' }, { name: 'Gardening', icon_emoji: '🌿' },
];

const DAYS = [
  { key: 'mon', label: 'Mon' }, { key: 'tue', label: 'Tue' }, { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' }, { key: 'fri', label: 'Fri' }, { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

const DEFAULT_AVAIL = {
  mon: ['09:00', '17:00'], tue: ['09:00', '17:00'], wed: ['09:00', '17:00'],
  thu: ['09:00', '17:00'], fri: ['09:00', '17:00'],
};

const STEP_LABELS = ['Category', 'Skills & Bio', 'Rate', 'Availability', 'Photos', 'Review'];

export default function BecomeAWorker() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [cats, setCats] = useState([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url ?? '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [portfolioFiles, setPortfolioFiles] = useState([]);
  const [portfolioPreviews, setPortfolioPreviews] = useState([]);
  const avatarRef = useRef(null);
  const portfolioRef = useRef(null);

  const [form, setForm] = useState({
    category: '',
    skills: [],
    bio: profile?.bio ?? '',
    experience_years: 0,
    hourly_rate: 250,
    daily_rate: 1500,
    availability: DEFAULT_AVAIL,
    location: profile?.location ?? '',
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!isSupabaseConfigured) { if (alive) { setCats(FALLBACK_CATS); setCatsLoading(false); } return; }
      try {
        const list = await listCategories();
        if (alive) setCats(list.length ? list : FALLBACK_CATS);
      } catch { if (alive) setCats(FALLBACK_CATS); }
      finally { if (alive) setCatsLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  const next = () => { setDirection(1); setStep((s) => Math.min(s + 1, 5)); };
  const back = () => { setDirection(-1); setStep((s) => Math.max(s - 1, 0)); };

  const addSkill = (e) => {
    e.preventDefault();
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) {
      setForm({ ...form, skills: [...form.skills, s] });
    }
    setSkillInput('');
  };

  const removeSkill = (s) => setForm({ ...form, skills: form.skills.filter((x) => x !== s) });

  const toggleDay = (key) => {
    const avail = { ...form.availability };
    if (avail[key]) { delete avail[key]; } else { avail[key] = ['09:00', '17:00']; }
    setForm({ ...form, availability: avail });
  };

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onPortfolioChange = (e) => {
    const files = Array.from(e.target.files ?? []).slice(0, 6 - portfolioFiles.length);
    setPortfolioFiles((prev) => [...prev, ...files]);
    setPortfolioPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removePortfolio = (i) => {
    setPortfolioFiles((prev) => prev.filter((_, j) => j !== i));
    setPortfolioPreviews((prev) => prev.filter((_, j) => j !== i));
  };

  const canAdvance = () => {
    if (step === 0) return Boolean(form.category);
    if (step === 1) return form.skills.length > 0 && form.bio.trim().length > 10;
    if (step === 2) return Number(form.hourly_rate) > 0;
    return true;
  };

  const submit = async () => {
    if (!user) { toast.error('Please log in first.'); navigate('/login'); return; }
    setSubmitting(true);
    try {
      if (!isSupabaseConfigured) {
        toast.success("You're live! Time to get some pani. (Demo — connect Supabase to save.)");
        navigate('/dashboard');
        return;
      }

      // Upload avatar
      let avatarUrl = profile?.avatar_url ?? '';
      if (avatarFile) avatarUrl = await uploadAvatar(user.id, avatarFile);

      // Upload portfolio
      const portfolioUrls = [];
      for (let i = 0; i < portfolioFiles.length; i++) {
        const url = await uploadPortfolioImage(user.id, portfolioFiles[i], i);
        portfolioUrls.push(url);
      }

      // Update user profile
      await updateUserProfile(user.id, {
        bio: form.bio,
        location: form.location,
        avatar_url: avatarUrl || undefined,
        role: profile?.role === 'client' ? 'both' : profile?.role,
      });

      // Upsert worker profile
      await upsertWorkerProfile({
        user_id: user.id,
        category: form.category,
        skills: form.skills,
        hourly_rate: Number(form.hourly_rate),
        daily_rate: Number(form.daily_rate),
        experience_years: Number(form.experience_years),
        availability: form.availability,
        portfolio_urls: portfolioUrls,
        is_available: true,
      });

      refreshProfile();
      toast.success("You're live! Time to get some pani.");
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Try again?');
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
    <PageTransition>
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-4xl sm:text-5xl font-black m-0 mb-2">
            Go <span className="italic text-primary">live</span>.
          </h1>
          <p className="text-text-secondary m-0">
            6 quick steps. Then clients start finding you.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">
              Step {step + 1} of 6 · {STEP_LABELS[step]}
            </span>
            <span className="text-xs text-text-muted">{Math.round(((step + 1) / 6) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-surface rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${((step + 1) / 6) * 100}%` }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
          <div className="mt-3 flex gap-1.5">
            {STEP_LABELS.map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: i <= step ? 1 : 0.35 }}
                className={['flex-1 h-1.5 rounded-full', i < step ? 'bg-primary' : i === step ? 'bg-primary' : 'bg-border'].join(' ')}
              />
            ))}
          </div>
        </div>

        <div className="bg-bg border border-border rounded-3xl p-6 sm:p-8 shadow-card min-h-[400px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={step} custom={direction} variants={variants} initial="enter" animate="center" exit="exit">

              {/* Step 0: Category */}
              {step === 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold m-0 mb-1">What do you do?</h2>
                  <p className="text-text-secondary text-sm m-0 mb-6">Pick your main category. You can add more later.</p>
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

              {/* Step 1: Skills & Bio */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="font-serif text-2xl font-bold m-0 mb-1">Skills & bio.</h2>
                    <p className="text-text-secondary text-sm m-0 mb-4">Clients skim fast. Make it count.</p>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-text-muted font-semibold block mb-2">Skills</label>
                    <div className="flex flex-wrap gap-2 mb-3 min-h-[36px]">
                      {form.skills.map((s) => (
                        <motion.span
                          key={s}
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-light text-primary-dark rounded-full text-sm font-medium"
                        >
                          {s}
                          <button type="button" onClick={() => removeSkill(s)} className="hover:opacity-70">
                            <X size={12} />
                          </button>
                        </motion.span>
                      ))}
                    </div>
                    <form onSubmit={addSkill} className="flex gap-2">
                      <Input
                        label="Add a skill and press Enter"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        containerClassName="flex-1"
                      />
                      <Button type="submit" variant="secondary" size="md">Add</Button>
                    </form>
                  </div>

                  <Textarea
                    label="Your bio (tell clients who you are)"
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    required
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Years of experience"
                      type="number"
                      min="0"
                      value={form.experience_years}
                      onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
                    />
                    <Input
                      label="Location"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Rate */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="font-serif text-2xl font-bold m-0 mb-1">Set your rate.</h2>
                    <p className="text-text-secondary text-sm m-0">You can always change this later.</p>
                  </div>

                  <div className="bg-surface/40 rounded-2xl p-5 space-y-4">
                    <div>
                      <div className="flex justify-between items-baseline mb-2">
                        <label className="text-xs uppercase tracking-wider text-text-muted font-semibold">Hourly rate</label>
                        <span className="font-serif font-black text-2xl text-primary-dark">{formatINR(form.hourly_rate)}<span className="text-sm text-text-muted font-normal">/hr</span></span>
                      </div>
                      <input type="range" min="100" max="2000" step="50"
                        value={form.hourly_rate}
                        onChange={(e) => setForm({ ...form, hourly_rate: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-baseline mb-2">
                        <label className="text-xs uppercase tracking-wider text-text-muted font-semibold">Daily rate</label>
                        <span className="font-serif font-black text-xl text-text-primary">{formatINR(form.daily_rate)}<span className="text-sm text-text-muted font-normal">/day</span></span>
                      </div>
                      <input type="range" min="500" max="10000" step="100"
                        value={form.daily_rate}
                        onChange={(e) => setForm({ ...form, daily_rate: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-text-muted">
                    Average for <span className="font-semibold">{form.category}</span> in Kerala is ₹150–₹500/hr. Set fair, earn trust.
                  </p>
                </div>
              )}

              {/* Step 3: Availability */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="font-serif text-2xl font-bold m-0 mb-1">When are you free?</h2>
                    <p className="text-text-secondary text-sm m-0">Tap days to toggle. Clients see this on your profile.</p>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {DAYS.map((d) => {
                      const on = Boolean(form.availability[d.key]);
                      return (
                        <motion.button
                          key={d.key}
                          type="button"
                          whileTap={{ scale: 0.92 }}
                          onClick={() => toggleDay(d.key)}
                          className={[
                            'rounded-xl p-3 text-center border-2 transition-colors',
                            on
                              ? 'bg-success-bg border-success/40 text-success'
                              : 'bg-surface/40 border-border text-text-muted',
                          ].join(' ')}
                        >
                          <div className="text-xs font-bold">{d.label}</div>
                          <div className="text-[9px] mt-1 font-medium">{on ? 'On' : 'Off'}</div>
                        </motion.button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-text-muted">
                    {Object.keys(form.availability).length} of 7 days active.
                    You can set specific hours from your settings after going live.
                  </p>
                </div>
              )}

              {/* Step 4: Photos */}
              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="font-serif text-2xl font-bold m-0 mb-1">Put a face to the pani.</h2>
                    <p className="text-text-secondary text-sm m-0">Profile photo + up to 6 portfolio images.</p>
                  </div>

                  {/* Avatar upload */}
                  <div className="flex items-center gap-5 p-5 bg-surface/40 rounded-2xl border border-border">
                    <div className="relative">
                      <Avatar src={avatarPreview} name={profile?.full_name} size="2xl" />
                      <button
                        type="button"
                        onClick={() => avatarRef.current?.click()}
                        className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary-dark transition-colors"
                      >
                        <Upload size={14} />
                      </button>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Profile photo</div>
                      <Button type="button" variant="secondary" size="sm" onClick={() => avatarRef.current?.click()}>
                        {avatarPreview ? 'Change photo' : 'Upload photo'}
                      </Button>
                      <input ref={avatarRef} type="file" accept="image/*" className="sr-only" onChange={onAvatarChange} />
                    </div>
                  </div>

                  {/* Portfolio */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-text-muted font-semibold block mb-3">
                      Portfolio photos ({portfolioPreviews.length}/6)
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {portfolioPreviews.map((src, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative aspect-square rounded-2xl overflow-hidden bg-surface"
                        >
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePortfolio(i)}
                            className="absolute top-1.5 right-1.5 w-7 h-7 bg-text-primary/70 text-white rounded-full flex items-center justify-center hover:bg-text-primary transition-colors"
                          >
                            <X size={13} />
                          </button>
                        </motion.div>
                      ))}
                      {portfolioPreviews.length < 6 && (
                        <button
                          type="button"
                          onClick={() => portfolioRef.current?.click()}
                          className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-2 text-text-muted hover:text-primary transition-colors"
                        >
                          <ImageIcon size={22} />
                          <span className="text-xs font-medium">Add photo</span>
                        </button>
                      )}
                    </div>
                    <input
                      ref={portfolioRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={onPortfolioChange}
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Review */}
              {step === 5 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold m-0 mb-1">All set?</h2>
                  <p className="text-text-secondary text-sm m-0 mb-6">One look before you go live.</p>
                  <div className="space-y-3">
                    {[
                      { label: 'Category', value: form.category },
                      { label: 'Skills', value: form.skills.join(', ') || '—' },
                      { label: 'Bio', value: form.bio?.slice(0, 100) + (form.bio?.length > 100 ? '…' : ''), },
                      { label: 'Hourly rate', value: formatINR(form.hourly_rate) + '/hr' },
                      { label: 'Daily rate', value: formatINR(form.daily_rate) + '/day' },
                      { label: 'Available days', value: Object.keys(form.availability).join(', ') || '—' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex gap-3 p-3 bg-surface/40 rounded-xl">
                        <span className="text-xs uppercase tracking-wider text-text-muted font-semibold w-24 shrink-0 mt-0.5">{label}</span>
                        <span className="text-sm font-medium">{value}</span>
                      </div>
                    ))}
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
          {step < 5 ? (
            <Button variant="primary" onClick={next} disabled={!canAdvance()} rightIcon={<ArrowRight size={16} />}>
              Continue
            </Button>
          ) : (
            <Button variant="primary" onClick={submit} loading={submitting} rightIcon={<Check size={16} />}>
              Go live
            </Button>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
