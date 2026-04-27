import { memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Flame } from 'lucide-react';
import { Tag } from '../ui/Tag';
import { Avatar } from '../ui/Avatar';
import { fadeUp } from '../../lib/motion';
import { formatRange, timeAgo } from '../../lib/format';

function JobCardImpl({ job, compact = false, linkToDetail = false }) {
  const c = job.client ?? {};
  const href = linkToDetail
    ? `/jobs/${job.id}`
    : `/workers?category=${encodeURIComponent(job.category)}`;
  return (
    <motion.div variants={fadeUp}>
      <Link to={href} className="block group">
        <motion.div
          whileHover={{ y: -6, boxShadow: '0 12px 32px rgba(193,68,14,0.12)' }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="bg-bg border border-border rounded-2xl p-5 shadow-soft transition-colors group-hover:border-primary/40 h-full flex flex-col"
          style={{ willChange: 'transform' }}
        >
          <div className="flex justify-between items-start gap-3 mb-2">
            <h3 className="font-serif text-base sm:text-lg font-bold m-0 leading-tight">
              {job.title}
            </h3>
            {job.urgency === 'urgent' && (
              <Tag tone="urgent" leftIcon={<Flame size={12} />}>Urgent</Tag>
            )}
          </div>

          <p className={`text-sm text-text-secondary m-0 mb-4 ${compact ? 'line-clamp-2' : 'line-clamp-3'}`}>
            {job.description}
          </p>

          <div className="mt-auto flex flex-wrap gap-2 mb-4">
            <Tag tone="surface" leftIcon={<MapPin size={11} />}>{job.location ?? '—'}</Tag>
            <Tag>{job.category}</Tag>
            <Tag tone="success">{formatRange(job.budget_min, job.budget_max)}</Tag>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <Avatar src={c.avatar_url} name={c.full_name} size="xs" />
              <div className="text-xs">
                <span className="font-semibold">{c.full_name?.split(' ')[0] ?? 'Client'}</span>
                <span className="text-text-muted"> · {c.location ?? ''}</span>
              </div>
            </div>
            <span className="text-xs text-text-muted inline-flex items-center gap-1">
              <Clock size={11} /> {timeAgo(job.created_at)}
            </span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export const JobCard = memo(JobCardImpl);
