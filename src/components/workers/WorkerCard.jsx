import { memo } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Tag } from '../ui/Tag';
import { RatingStars } from './RatingStars';
import { SaveHeartButton } from './SaveHeartButton';
import { fadeUp } from '../../lib/motion';
import { formatINR } from '../../lib/format';

function WorkerCardImpl({ worker }) {
  const u = worker.user ?? {};

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 20 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div variants={fadeUp} style={{ perspective: 800 }}>
      <Link to={`/workers/${worker.id}`} className="block group">
        <motion.div
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative bg-bg border border-border rounded-2xl p-5 shadow-soft group-hover:border-primary/40 group-hover:shadow-[0_16px_40px_rgba(193,68,14,0.1)] transition-[border-color,box-shadow] duration-300"
        >
          <div className="absolute top-3 right-3">
            <SaveHeartButton workerUserId={u.id} />
          </div>

          <div className="flex items-start gap-3 mb-4">
            <Avatar src={u.avatar_url} name={u.full_name} size="lg" />
            <div className="min-w-0 flex-1 pr-8">
              <h3 className="font-serif text-lg font-bold m-0 truncate flex items-center gap-1.5">
                {u.full_name ?? 'Anonymous'}
                {u.is_verified && (
                  <ShieldCheck size={14} className="text-success shrink-0" aria-label="Verified" />
                )}
              </h3>
              <div className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                <MapPin size={11} /> {u.location ?? '—'}
              </div>
              <div className="mt-2"><RatingStars value={worker.rating_avg} /></div>
            </div>
          </div>

          {u.bio && (
            <p className="text-sm text-text-secondary line-clamp-2 m-0 mb-4 min-h-[2.5rem]">
              {u.bio}
            </p>
          )}

          <div className="flex items-end justify-between gap-2">
            <Tag>{worker.category}</Tag>
            <div className="text-right">
              <div className="text-base font-bold text-primary-dark leading-none">
                {formatINR(worker.hourly_rate)}
                <span className="text-xs text-text-muted font-medium">/hr</span>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-text-muted mt-1">
                {worker.total_jobs_done ?? 0} jobs done
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export const WorkerCard = memo(WorkerCardImpl);
