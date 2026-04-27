import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ShieldCheck, Calendar, MessageCircle, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { getWorker } from '../lib/api/workers';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { createBooking } from '../lib/api/bookings';
import { getOrCreateConversation } from '../lib/api/messages';
import { PageTransition } from '../components/layout/PageTransition';
import { Avatar } from '../components/ui/Avatar';
import { Tag } from '../components/ui/Tag';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Lightbox } from '../components/ui/Lightbox';
import { RatingStars } from '../components/workers/RatingStars';
import { SaveHeartButton } from '../components/workers/SaveHeartButton';
import { ReviewsList } from '../components/workers/ReviewsList';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea } from '../components/ui/Input';
import { formatINR, prettyDate } from '../lib/format';
import { popIn, scaleIn, staggerContainer } from '../lib/motion';

const DAYS = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

export default function WorkerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState({ date: '', time: '', notes: '' });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      if (!isSupabaseConfigured) {
        if (alive) setLoading(false);
        return;
      }
      try {
        const w = await getWorker(id);
        if (alive) setWorker(w);
      } catch {
        if (alive) setWorker(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast('Log in first to book this person.', { icon: '👉' });
      navigate('/login');
      return;
    }
    setBookingSubmitting(true);
    try {
      if (isSupabaseConfigured && user?.id && worker) {
        await createBooking({
          client_id: user.id,
          worker_id: worker.user_id,
          scheduled_date: bookingData.date || null,
          scheduled_time: bookingData.time || null,
          notes: bookingData.notes || null,
          agreed_rate: worker.hourly_rate,
          status: 'upcoming',
        });
      }
      toast.success('Booked! Now sit back and let someone else handle the pani.');
      setBookingOpen(false);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Booking failed. Try again?');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleMessage = async () => {
    if (!isAuthenticated) {
      toast('Log in to send a message.', { icon: '👉' });
      navigate('/login');
      return;
    }
    if (!worker?.user_id) return;
    if (isSupabaseConfigured && user?.id) {
      try {
        await getOrCreateConversation(user.id, worker.user_id);
        navigate(`/messages?with=${worker.user_id}`);
      } catch {
        navigate(`/messages?with=${worker.user_id}`);
      }
    } else {
      navigate('/messages');
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton circle width={96} height={96} />
            <div className="flex-1 space-y-3">
              <Skeleton width="60%" height={28} />
              <Skeleton width="40%" height={14} />
              <Skeleton width="30%" height={14} />
            </div>
          </div>
          <Skeleton height={140} />
          <Skeleton height={200} />
        </div>
      </PageTransition>
    );
  }

  if (!worker) {
    return (
      <PageTransition>
        <EmptyState
          icon="🤷"
          title="Couldn't find this person."
          description="They might have stepped out for chai. Browse the crew below."
          action={<Button variant="primary" onClick={() => navigate('/workers')}>Browse workers</Button>}
        />
      </PageTransition>
    );
  }

  const u = worker.user ?? {};
  const skills = worker.skills ?? [];
  const portfolio = worker.portfolio_urls ?? [];
  const availability = worker.availability ?? {};

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10 pb-32 lg:pb-16">
        {/* Header */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="relative bg-bg border border-border rounded-3xl p-6 sm:p-8 shadow-card overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary-light/60 blur-3xl pointer-events-none" />
          <div className="absolute top-4 right-4">
            <SaveHeartButton workerUserId={u.id} />
          </div>
          <div className="relative flex flex-col sm:flex-row items-start gap-5">
            <motion.div variants={scaleIn}>
              <Avatar src={u.avatar_url} name={u.full_name} size="2xl" animate />
            </motion.div>
            <div className="flex-1">
              <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { delay: 0.1 } } }}>
                <h1 className="font-serif text-3xl sm:text-4xl font-black m-0 leading-tight flex items-center gap-2 flex-wrap">
                  {u.full_name}
                  {u.is_verified && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-success-bg text-success rounded-full">
                      <ShieldCheck size={12} /> Verified
                    </span>
                  )}
                </h1>
              </motion.div>
              <motion.div
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { delay: 0.2 } } }}
                className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-secondary"
              >
                <Tag>{worker.category}</Tag>
                <span className="inline-flex items-center gap-1"><MapPin size={13} /> {u.location ?? '—'}</span>
                <span className="inline-flex items-center gap-1"><Briefcase size={13} /> {worker.experience_years ?? 0} yrs</span>
              </motion.div>
              <motion.div
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { delay: 0.3 } } }}
                className="mt-3"
              >
                <RatingStars value={worker.rating_avg ?? 0} size={18} animate />
                <span className="text-xs text-text-muted ml-2">· {worker.total_jobs_done ?? 0} jobs done</span>
              </motion.div>
              <motion.div
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { delay: 0.35 } } }}
                className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1"
              >
                <span className="font-serif text-3xl font-black text-primary-dark">
                  {formatINR(worker.hourly_rate)}<span className="text-sm font-medium text-text-muted">/hr</span>
                </span>
                {worker.daily_rate && (
                  <span className="text-text-secondary text-sm">
                    or <span className="font-semibold">{formatINR(worker.daily_rate)}</span>/day
                  </span>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Skills */}
        {skills.length > 0 && (
          <section className="mt-8">
            <h2 className="font-serif text-2xl font-bold m-0 mb-3">Skills</h2>
            <motion.div
              variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } } }}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-2"
            >
              {skills.map((s) => (
                <motion.span key={s} variants={popIn}>
                  <Tag tone="surface">{s}</Tag>
                </motion.span>
              ))}
            </motion.div>
          </section>
        )}

        {/* About */}
        {u.bio && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <h2 className="font-serif text-2xl font-bold m-0 mb-3">About</h2>
            <p className="text-text-secondary leading-relaxed">{u.bio}</p>
          </motion.section>
        )}

        {/* Availability */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-8"
        >
          <h2 className="font-serif text-2xl font-bold m-0 mb-3">Availability</h2>
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((d) => {
              const slot = availability[d.key];
              const open = Boolean(slot?.length);
              return (
                <div
                  key={d.key}
                  className={[
                    'rounded-xl p-3 text-center border',
                    open ? 'bg-success-bg/60 border-success/30 text-success' : 'bg-surface/50 border-border text-text-muted',
                  ].join(' ')}
                >
                  <div className="text-xs font-bold uppercase tracking-wider">{d.label}</div>
                  <div className="text-[10px] mt-1">
                    {open ? `${slot[0]}–${slot[1]}` : 'Off'}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Portfolio */}
        {portfolio.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <h2 className="font-serif text-2xl font-bold m-0 mb-3">Portfolio</h2>
            <motion.div
              variants={{ visible: { transition: { staggerChildren: 0.07, delayChildren: 0.5 } } }}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-3 gap-3"
            >
              {portfolio.map((url, i) => (
                <motion.div
                  key={i}
                  variants={scaleIn}
                  whileHover={{ scale: 1.05 }}
                  className="aspect-[4/3] rounded-2xl overflow-hidden bg-surface cursor-pointer"
                  onClick={() => { setLightboxIdx(i); setLightboxOpen(true); }}
                >
                  <img src={url} loading="lazy" alt="" className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}

        {/* Reviews */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <h2 className="font-serif text-2xl font-bold m-0 mb-3">Reviews</h2>
          <ReviewsList workerUserId={u.id} />
        </motion.section>

        {/* Actions (desktop) */}
        <div className="hidden lg:flex gap-3 mt-10">
          <Button variant="primary" size="lg" onClick={() => setBookingOpen(true)} leftIcon={<Calendar size={18} />}>
            Book {u.full_name?.split(' ')[0]}
          </Button>
          <Button variant="secondary" size="lg" leftIcon={<MessageCircle size={18} />} onClick={handleMessage}>
            Send a message
          </Button>
        </div>
      </div>

      {/* Lightbox */}
      <Lightbox
        images={portfolio}
        initialIndex={lightboxIdx}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      {/* Mobile sticky bar */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-40 px-4 pb-2">
        <div className="bg-bg/95 backdrop-blur-md border border-border rounded-2xl shadow-card p-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-text-muted">Rate</div>
            <div className="font-bold text-primary-dark text-base">
              {formatINR(worker.hourly_rate)}<span className="text-xs font-medium text-text-muted">/hr</span>
            </div>
          </div>
          <Button variant="primary" onClick={() => setBookingOpen(true)} className="flex-1">
            Book {u.full_name?.split(' ')[0]}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleMessage} leftIcon={<MessageCircle size={14} />}>
            Chat
          </Button>
        </div>
      </div>

      {/* Booking modal */}
      <Modal open={bookingOpen} onClose={() => setBookingOpen(false)} title={`Book ${u.full_name}`}>
        <form onSubmit={handleBook} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date" type="date" value={bookingData.date} onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })} required />
            <Input label="Time" type="time" value={bookingData.time} onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })} required />
          </div>
          <Textarea label="Anything specific? (notes)" value={bookingData.notes} onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })} />
          <p className="text-xs text-text-muted">
            You're requesting <span className="font-semibold">{u.full_name}</span> for{' '}
            <span className="font-semibold">{prettyDate(bookingData.date) || '…'}</span>.
            They'll confirm in the next step.
          </p>
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setBookingOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={bookingSubmitting} className="flex-1">
              Confirm booking
            </Button>
          </div>
        </form>
      </Modal>
    </PageTransition>
  );
}
