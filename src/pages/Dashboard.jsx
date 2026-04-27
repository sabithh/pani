import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Briefcase, Calendar, Heart, ListTodo, Plus, Sparkles, Users,
  CheckCircle, Clock, XCircle, MapPin, Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabase';
import { listJobsByClient } from '../lib/api/jobs';
import { listBookingsForUser, updateBookingStatus } from '../lib/api/bookings';
import { getSavedWorkers } from '../lib/api/saved';
import { listApplicationsForWorker } from '../lib/api/applications';
import { PageTransition } from '../components/layout/PageTransition';
import { DashboardTabs } from '../components/dashboard/DashboardTabs';
import { StatCard } from '../components/dashboard/StatCard';
import { JobCard } from '../components/jobs/JobCard';
import { JobCardSkeleton, WorkerCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Tag } from '../components/ui/Tag';
import { formatINR, prettyDate } from '../lib/format';
import { staggerContainer, fadeUp } from '../lib/motion';

const CLIENT_TABS = [
  { key: 'jobs', label: 'My Jobs', icon: ListTodo },
  { key: 'bookings', label: 'Bookings', icon: Calendar },
  { key: 'saved', label: 'Saved', icon: Heart },
];

const WORKER_TABS = [
  { key: 'apps', label: 'Applications', icon: Briefcase },
  { key: 'bookings', label: 'Bookings', icon: Calendar },
  { key: 'profile', label: 'My Profile', icon: Users },
];

const STATUS_STYLES = {
  upcoming:  { icon: Clock,        bg: 'bg-amber-50 border-amber-200 text-amber-700' },
  ongoing:   { icon: CheckCircle,  bg: 'bg-success-bg border-success/30 text-success' },
  completed: { icon: CheckCircle,  bg: 'bg-surface border-border text-text-secondary' },
  cancelled: { icon: XCircle,      bg: 'bg-red-50 border-red-200 text-urgent' },
};

function BookingCard({ booking, userId, onStatusChange }) {
  const isClient = booking.client_id === userId;
  const other = isClient ? booking.worker : booking.client;
  const workerProfile = booking.worker?.worker_profiles?.[0];
  const { icon: StatusIcon, bg } = STATUS_STYLES[booking.status] ?? STATUS_STYLES.upcoming;

  const handleConfirm = async () => {
    try {
      await updateBookingStatus(booking.id, 'ongoing');
      toast.success('Booking confirmed!');
      onStatusChange();
    } catch {
      toast.error('Could not confirm booking.');
    }
  };

  const handleCancel = async () => {
    try {
      await updateBookingStatus(booking.id, 'cancelled');
      toast('Booking cancelled.', { icon: '🙁' });
      onStatusChange();
    } catch {
      toast.error('Could not cancel booking.');
    }
  };

  return (
    <motion.div variants={fadeUp} className="bg-bg border border-border rounded-2xl p-4 shadow-soft flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={other?.avatar_url} name={other?.full_name} size="md" />
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{other?.full_name}</p>
            {workerProfile && (
              <p className="text-xs text-text-muted">{workerProfile.category}</p>
            )}
            {other?.location && (
              <p className="text-xs text-text-muted flex items-center gap-1">
                <MapPin size={10} /> {other.location}
              </p>
            )}
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${bg}`}>
          <StatusIcon size={11} /> {booking.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-text-secondary border-t border-border pt-3">
        {booking.scheduled_date && (
          <span className="flex items-center gap-1"><Calendar size={12} /> {prettyDate(booking.scheduled_date)}</span>
        )}
        {booking.scheduled_time && (
          <span className="flex items-center gap-1"><Clock size={12} /> {booking.scheduled_time}</span>
        )}
        {booking.agreed_rate && (
          <span className="font-semibold text-primary-dark">{formatINR(booking.agreed_rate)}/hr</span>
        )}
      </div>

      {booking.notes && (
        <p className="text-xs text-text-muted italic">"{booking.notes}"</p>
      )}

      {booking.status === 'upcoming' && !isClient && (
        <div className="flex gap-2 pt-1">
          <Button variant="primary" size="sm" className="flex-1" onClick={handleConfirm}>Confirm</Button>
          <Button variant="ghost" size="sm" className="flex-1 text-urgent" onClick={handleCancel}>Cancel</Button>
        </div>
      )}
      {booking.status === 'upcoming' && isClient && (
        <Button variant="ghost" size="sm" className="text-urgent w-full" onClick={handleCancel}>Cancel booking</Button>
      )}
    </motion.div>
  );
}

function ApplicationCard({ app }) {
  const job = app.job;
  const statusColors = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    accepted: 'bg-success-bg text-success border-success/30',
    rejected: 'bg-red-50 text-urgent border-red-200',
  };

  return (
    <motion.div variants={fadeUp} className="bg-bg border border-border rounded-2xl p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="font-semibold text-sm">{job?.title ?? 'Job'}</p>
          {job?.location && (
            <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
              <MapPin size={10} /> {job.location}
            </p>
          )}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${statusColors[app.status] ?? statusColors.pending}`}>
          {app.status}
        </span>
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-text-secondary border-t border-border pt-2 mt-2">
        {app.proposed_rate && (
          <span className="font-semibold text-primary-dark">{formatINR(app.proposed_rate)} proposed</span>
        )}
        {job?.budget_min && (
          <span>Budget: {formatINR(job.budget_min)}–{formatINR(job.budget_max)}</span>
        )}
      </div>
      {app.message && (
        <p className="text-xs text-text-muted italic mt-2">"{app.message}"</p>
      )}
      <Link to={`/jobs/${job?.id}`} className="mt-3 block">
        <Button variant="ghost" size="sm" className="w-full">View job</Button>
      </Link>
    </motion.div>
  );
}

function SavedWorkerCard({ saved }) {
  const w = saved.worker;
  const wp = w?.worker_profiles?.[0];
  return (
    <motion.div variants={fadeUp}>
      <Link to={`/workers/${wp?.id ?? w?.id}`} className="block bg-bg border border-border rounded-2xl p-4 shadow-soft hover:shadow-hover transition-shadow">
        <div className="flex items-center gap-3">
          <Avatar src={w?.avatar_url} name={w?.full_name} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{w?.full_name}</p>
            {wp?.category && <Tag tone="surface" className="mt-1">{wp.category}</Tag>}
            {w?.location && (
              <p className="text-xs text-text-muted flex items-center gap-1 mt-1">
                <MapPin size={10} /> {w.location}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            {wp?.hourly_rate && (
              <p className="font-bold text-sm text-primary-dark">{formatINR(wp.hourly_rate)}<span className="text-xs font-normal text-text-muted">/hr</span></p>
            )}
            {wp?.rating_avg && (
              <p className="text-xs text-text-muted flex items-center gap-0.5 justify-end mt-0.5">
                <Star size={10} className="text-amber-400 fill-amber-400" /> {wp.rating_avg.toFixed(1)}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Dashboard() {
  const { profile, user } = useAuth();
  const role = profile?.role ?? 'client';
  const [view, setView] = useState(role === 'worker' ? 'worker' : 'client');
  const [tab, setTab] = useState(role === 'worker' ? 'apps' : 'jobs');

  const [jobs, setJobs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [saved, setSaved] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState({ jobs: true, bookings: false, saved: false, apps: false });

  useEffect(() => {
    if (role === 'both') return;
    setView(role === 'worker' ? 'worker' : 'client');
    setTab(role === 'worker' ? 'apps' : 'jobs');
  }, [role]);

  const loadJobs = async () => {
    if (!isSupabaseConfigured || !user?.id) { setLoading((l) => ({ ...l, jobs: false })); return; }
    setLoading((l) => ({ ...l, jobs: true }));
    try { setJobs(await listJobsByClient(user.id)); } catch { setJobs([]); }
    setLoading((l) => ({ ...l, jobs: false }));
  };

  const loadBookings = async () => {
    if (!isSupabaseConfigured || !user?.id) return;
    setLoading((l) => ({ ...l, bookings: true }));
    try { setBookings(await listBookingsForUser(user.id)); } catch { setBookings([]); }
    setLoading((l) => ({ ...l, bookings: false }));
  };

  const loadSaved = async () => {
    if (!isSupabaseConfigured || !user?.id) return;
    setLoading((l) => ({ ...l, saved: true }));
    try { setSaved(await getSavedWorkers(user.id)); } catch { setSaved([]); }
    setLoading((l) => ({ ...l, saved: false }));
  };

  const loadApplications = async () => {
    if (!isSupabaseConfigured || !user?.id) return;
    setLoading((l) => ({ ...l, apps: true }));
    try { setApplications(await listApplicationsForWorker(user.id)); } catch { setApplications([]); }
    setLoading((l) => ({ ...l, apps: false }));
  };

  useEffect(() => { loadJobs(); }, [user?.id]);

  useEffect(() => {
    if (tab === 'bookings') loadBookings();
    if (tab === 'saved') loadSaved();
    if (tab === 'apps') loadApplications();
  }, [tab, user?.id]);

  const tabs = view === 'worker' ? WORKER_TABS : CLIENT_TABS;

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <Avatar src={profile?.avatar_url} name={profile?.full_name} size="xl" animate />
            <div>
              <p className="text-sm text-text-muted m-0">Welcome back,</p>
              <h1 className="font-serif text-3xl sm:text-4xl font-black m-0">
                {profile?.full_name?.split(' ')[0] ?? 'friend'}.
              </h1>
              {profile?.role && (
                <Tag tone="surface" className="mt-2 capitalize">{profile.role} mode</Tag>
              )}
            </div>
          </div>

          {role === 'both' && (
            <div className="flex gap-1 p-1 bg-surface border border-border rounded-full text-sm shrink-0">
              <button
                onClick={() => { setView('client'); setTab('jobs'); }}
                className={[
                  'px-4 py-1.5 rounded-full font-semibold transition-colors',
                  view === 'client' ? 'bg-primary text-white' : 'text-text-secondary',
                ].join(' ')}
              >
                Client
              </button>
              <button
                onClick={() => { setView('worker'); setTab('apps'); }}
                className={[
                  'px-4 py-1.5 rounded-full font-semibold transition-colors',
                  view === 'worker' ? 'bg-primary text-white' : 'text-text-secondary',
                ].join(' ')}
              >
                Worker
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {view === 'worker' ? (
            <>
              <StatCard label="Applications" value={applications.length} icon={Briefcase} delay={0} />
              <StatCard label="Accepted" value={applications.filter((a) => a.status === 'accepted').length} icon={CheckCircle} delay={0.05} />
              <StatCard label="Bookings" value={bookings.filter((b) => b.worker_id === user?.id).length} icon={Calendar} delay={0.1} />
              <StatCard label="Completed" value={bookings.filter((b) => b.worker_id === user?.id && b.status === 'completed').length} icon={Sparkles} delay={0.15} />
            </>
          ) : (
            <>
              <StatCard label="Open jobs" value={jobs.filter((j) => j.status === 'open').length} icon={ListTodo} delay={0} />
              <StatCard label="In progress" value={jobs.filter((j) => j.status === 'in_progress').length} icon={Sparkles} delay={0.05} />
              <StatCard label="Completed" value={jobs.filter((j) => j.status === 'completed').length} icon={Calendar} delay={0.1} />
              <StatCard label="Total posted" value={jobs.length} icon={Briefcase} delay={0.15} />
            </>
          )}
        </div>

        <DashboardTabs tabs={tabs} active={tab} onChange={setTab} />

        {/* Tab content */}
        <motion.div
          key={tab + view}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Client — My Jobs */}
          {view === 'client' && tab === 'jobs' && (
            loading.jobs ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => <JobCardSkeleton key={i} />)}
              </div>
            ) : jobs.length === 0 ? (
              <EmptyState
                icon="📋"
                title="No jobs posted yet."
                description="Once you drop a pani, it'll show up here with all the workers reaching out."
                action={
                  <Link to="/post-job">
                    <Button variant="primary" leftIcon={<Plus size={16} />}>Drop your first pani</Button>
                  </Link>
                }
              />
            ) : (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobs.map((j) => <JobCard key={j.id} job={j} linkToDetail />)}
              </motion.div>
            )
          )}

          {/* Client — Bookings */}
          {view === 'client' && tab === 'bookings' && (() => {
            const clientBookings = bookings.filter((b) => b.client_id === user.id);
            return loading.bookings ? (
              <div className="grid md:grid-cols-2 gap-4">
                {Array.from({ length: 3 }).map((_, i) => <WorkerCardSkeleton key={i} />)}
              </div>
            ) : clientBookings.length === 0 ? (
              <EmptyState
                icon="📅"
                title="No bookings yet."
                description="Book a worker from their profile and it'll show up right here."
                action={<Link to="/workers"><Button variant="primary">Browse workers</Button></Link>}
              />
            ) : (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid md:grid-cols-2 gap-4">
                {clientBookings.map((b) => (
                  <BookingCard key={b.id} booking={b} userId={user.id} onStatusChange={loadBookings} />
                ))}
              </motion.div>
            );
          })()}

          {/* Client — Saved */}
          {view === 'client' && tab === 'saved' && (
            loading.saved ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => <WorkerCardSkeleton key={i} />)}
              </div>
            ) : saved.length === 0 ? (
              <EmptyState
                icon="💛"
                title="No saved workers."
                description="Tap the heart on any worker card to save them for later."
                action={<Link to="/workers"><Button variant="primary">Find someone</Button></Link>}
              />
            ) : (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {saved.map((s) => <SavedWorkerCard key={s.id} saved={s} />)}
              </motion.div>
            )
          )}

          {/* Worker — Applications */}
          {view === 'worker' && tab === 'apps' && (
            loading.apps ? (
              <div className="grid md:grid-cols-2 gap-4">
                {Array.from({ length: 3 }).map((_, i) => <JobCardSkeleton key={i} />)}
              </div>
            ) : applications.length === 0 ? (
              <EmptyState
                icon="📨"
                title="No applications yet."
                description="Apply to open jobs and they'll line up here."
                action={<Link to="/jobs"><Button variant="primary">Browse jobs</Button></Link>}
              />
            ) : (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid md:grid-cols-2 gap-4">
                {applications.map((a) => <ApplicationCard key={a.id} app={a} />)}
              </motion.div>
            )
          )}

          {/* Worker — Bookings */}
          {view === 'worker' && tab === 'bookings' && (() => {
            const workerBookings = bookings.filter((b) => b.worker_id === user.id);
            return loading.bookings ? (
              <div className="grid md:grid-cols-2 gap-4">
                {Array.from({ length: 3 }).map((_, i) => <WorkerCardSkeleton key={i} />)}
              </div>
            ) : workerBookings.length === 0 ? (
              <EmptyState
                icon="🗓️"
                title="No bookings yet."
                description="Once a client locks you in, you'll see it here."
              />
            ) : (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid md:grid-cols-2 gap-4">
                {workerBookings.map((b) => (
                  <BookingCard key={b.id} booking={b} userId={user.id} onStatusChange={loadBookings} />
                ))}
              </motion.div>
            );
          })()}

          {/* Worker — Profile */}
          {view === 'worker' && tab === 'profile' && (
            <div className="max-w-md">
              <EmptyState
                icon="🪄"
                title="Your worker profile."
                description="Set up or update your skills, rates, and availability so clients can find you."
                action={
                  <Link to="/become-a-worker">
                    <Button variant="primary">Set up profile</Button>
                  </Link>
                }
              />
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}
