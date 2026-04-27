import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { getReviewsForWorker } from '../../lib/api/reviews';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Avatar } from '../ui/Avatar';
import { Skeleton } from '../ui/Skeleton';
import { RatingStars } from './RatingStars';
import { prettyDate } from '../../lib/format';
import { staggerContainer, fadeUp } from '../../lib/motion';

export function ReviewsList({ workerUserId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !workerUserId) { setLoading(false); return; }
    let alive = true;
    (async () => {
      try {
        const list = await getReviewsForWorker(workerUserId);
        if (alive) setReviews(list);
      } catch { /* swallow */ }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [workerUserId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton circle width={44} height={44} />
            <div className="flex-1 space-y-2">
              <Skeleton height={12} width="40%" />
              <Skeleton height={10} width="90%" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <div className="bg-surface/40 border border-dashed border-border-strong rounded-2xl p-6 text-center text-text-secondary">
        <Star size={20} className="inline-block mb-2 text-text-muted" />
        <p className="m-0">No reviews yet. Be the first to drop one after a booking.</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {reviews.map((r) => (
        <motion.div key={r.id} variants={fadeUp} className="bg-bg border border-border rounded-2xl p-5 shadow-soft">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <Avatar src={r.reviewer?.avatar_url} name={r.reviewer?.full_name} size="md" />
              <div>
                <div className="font-semibold text-sm">{r.reviewer?.full_name ?? 'Anonymous'}</div>
                <div className="text-xs text-text-muted">{prettyDate(r.created_at)}</div>
              </div>
            </div>
            <RatingStars value={r.rating} size={14} showValue={false} />
          </div>
          {r.comment && <p className="text-sm text-text-secondary m-0">{r.comment}</p>}
        </motion.div>
      ))}
    </motion.div>
  );
}
