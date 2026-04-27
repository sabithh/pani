import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Flame, DollarSign, Users, ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getJob } from '../lib/api/jobs';
import { createApplication, listApplicationsForWorker } from '../lib/api/applications';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { PageTransition } from '../components/layout/PageTransition';
import { Avatar } from '../components/ui/Avatar';
import { Tag } from '../components/ui/Tag';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { Textarea, Input } from '../components/ui/Input';
import { fadeUp, scaleIn, staggerContainer } from '../lib/motion';
import { formatRange, formatINR, timeAgo } from '../lib/format';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [form, setForm] = useState({ message: '', proposed_rate: '' });

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      if (!isSupabaseConfigured) { if (alive) setLoading(false); return; }
      try {
        const j = await getJob(id);
        if (alive) setJob(j);
        // Check if this worker already applied
        if (j && user?.id) {
          const apps = await listApplicationsForWorker(user.id);
          if (alive) setApplied(apps.some((a) => a.job_id === j.id));
        }
      } catch { if (alive) setJob(null); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [id, user?.id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) { toast('Log in to apply for this job.', { icon: '👉' }); navigate('/login'); return; }
    setApplying(true);
    try {
      const workerProfiles = profile?.role === 'worker' || profile?.role === 'both';
      if (!workerProfiles) {
        toast.error("You're signed up as a client. Become a worker first.");
        navigate('/become-a-worker');
        return;
      }
      await createApplication({
        job_id: id,
        worker_id: user.id,
        message: form.message,
        proposed_rate: form.proposed_rate ? Number(form.proposed_rate) : null,
      });
      setApplied(true);
      setApplyOpen(false);
      toast.success('Application sent. Now sit back and wait for the call.');
    } catch (err) {
      toast.error(err.message?.includes('unique') ? 'You already applied to this job.' : (err.message || 'Could not apply. Try again?'));
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 space-y-4">
          <Skeleton height={180} />
          <Skeleton height={120} />
          <Skeleton height={80} />
        </div>
      </PageTransition>
    );
  }

  if (!job) {
    return (
      <PageTransition>
        <EmptyState
          icon="📋"
          title="Job not found."
          description="This pani may have already been handled."
          action={<Button variant="primary" onClick={() => navigate('/jobs')}>See open jobs</Button>}
        />
      </PageTransition>
    );
  }

  const c = job.client ?? {};
  const isOwner = user?.id === job.client_id;
  const isWorker = profile?.role === 'worker' || profile?.role === 'both';

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
        <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to jobs
        </Link>

        {/* Header card */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="bg-bg border border-border rounded-3xl p-6 sm:p-8 shadow-card mb-6"
        >
          <motion.div variants={fadeUp} className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div className="flex gap-3 items-start flex-wrap">
              <Tag>{job.category}</Tag>
              {job.urgency === 'urgent' && <Tag tone="urgent" leftIcon={<Flame size={12} />}>Urgent</Tag>}
              <Tag tone={job.status === 'open' ? 'success' : 'surface'} className="capitalize">{job.status}</Tag>
            </div>
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Clock size={11} /> {timeAgo(job.created_at)}
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="font-serif text-3xl sm:text-4xl font-black m-0 mb-3">
            {job.title}
          </motion.h1>

          <motion.p variants={fadeUp} className="text-text-secondary leading-relaxed mb-6">
            {job.description}
          </motion.p>

          <motion.div variants={staggerContainer} className="grid sm:grid-cols-3 gap-3">
            {[
              { icon: DollarSign, label: 'Budget', value: formatRange(job.budget_min, job.budget_max) },
              { icon: MapPin, label: 'Location', value: job.location ?? '—' },
            ].map(({ icon: Icon, label, value }) => (
              <motion.div key={label} variants={scaleIn} className="bg-surface/60 rounded-2xl p-4">
                <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">{label}</div>
                <div className="font-serif font-bold text-text-primary flex items-center gap-1.5">
                  <Icon size={14} className="text-primary" /> {value}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Client info */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="bg-bg border border-border rounded-2xl p-5 shadow-soft mb-6">
          <h2 className="font-serif text-lg font-bold m-0 mb-3">Posted by</h2>
          <div className="flex items-center gap-3">
            <Avatar src={c.avatar_url} name={c.full_name} size="lg" />
            <div>
              <div className="font-semibold">{c.full_name ?? 'Anonymous'}</div>
              <div className="text-sm text-text-muted flex items-center gap-1 mt-0.5">
                <MapPin size={12} /> {c.location ?? '—'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA for workers */}
        {!isOwner && job.status === 'open' && (
          <motion.div variants={scaleIn} initial="hidden" animate="visible" className="sticky bottom-20 lg:bottom-6 z-30">
            <div className="bg-bg/95 backdrop-blur-md border border-border rounded-2xl shadow-card p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="font-serif font-bold text-lg">{formatRange(job.budget_min, job.budget_max)}</div>
                <div className="text-xs text-text-muted">Budget range</div>
              </div>
              {applied ? (
                <div className="flex items-center gap-2 text-success font-semibold text-sm">
                  <CheckCircle size={16} /> Applied
                </div>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => {
                    if (!user) { toast('Log in to apply.', { icon: '👉' }); navigate('/login'); return; }
                    setApplyOpen(true);
                  }}
                >
                  Apply now
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {isOwner && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="bg-surface/40 border border-dashed border-border-strong rounded-2xl p-6 text-center text-text-secondary">
            <Users size={20} className="inline-block mb-2 text-text-muted" />
            <p className="m-0">You posted this job. Application management coming in the next update.</p>
          </motion.div>
        )}
      </div>

      {/* Apply modal */}
      <Modal open={applyOpen} onClose={() => setApplyOpen(false)} title="Apply for this job">
        <form onSubmit={handleApply} className="space-y-4">
          <div className="bg-surface/50 rounded-xl p-3 text-sm text-text-secondary">
            <span className="font-semibold text-text-primary">{job.title}</span> · {job.category}
          </div>
          <Textarea
            label="Why you? (cover message)"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
          />
          <Input
            label={`Your rate (₹/hr) — budget is ${formatRange(job.budget_min, job.budget_max)}`}
            type="number"
            value={form.proposed_rate}
            onChange={(e) => setForm({ ...form, proposed_rate: e.target.value })}
            min="0"
          />
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setApplyOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={applying} className="flex-1">
              Send application
            </Button>
          </div>
        </form>
      </Modal>
    </PageTransition>
  );
}
