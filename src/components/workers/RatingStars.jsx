import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { popIn } from '../../lib/motion';

export function RatingStars({ value = 0, size = 14, animate = false, showValue = true }) {
  const filled = Math.round(value);
  const stars = Array.from({ length: 5 });
  return (
    <span className="inline-flex items-center gap-1">
      <motion.span
        className="inline-flex"
        initial={animate ? 'hidden' : false}
        animate={animate ? 'visible' : false}
        variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
      >
        {stars.map((_, i) => (
          <motion.span
            key={i}
            variants={animate ? popIn : undefined}
            className="inline-block"
            style={{ marginRight: 1 }}
          >
            <Star
              size={size}
              strokeWidth={1.6}
              fill={i < filled ? 'var(--color-primary)' : 'transparent'}
              color={i < filled ? 'var(--color-primary)' : 'var(--color-border-strong)'}
            />
          </motion.span>
        ))}
      </motion.span>
      {showValue && value > 0 && (
        <span className="text-xs font-semibold text-text-secondary">{Number(value).toFixed(1)}</span>
      )}
    </span>
  );
}
