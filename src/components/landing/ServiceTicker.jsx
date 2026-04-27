import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const ITEMS = [
  { emoji: '🧹', label: 'Cleaning' },
  { emoji: '🔧', label: 'Plumbing' },
  { emoji: '📚', label: 'Tutoring' },
  { emoji: '🚗', label: 'Driving' },
  { emoji: '👨‍🍳', label: 'Cooking' },
  { emoji: '⚡', label: 'Electrical' },
  { emoji: '🪚', label: 'Carpentry' },
  { emoji: '🌿', label: 'Gardening' },
  { emoji: '🐾', label: 'Pet Care' },
  { emoji: '📦', label: 'Moving' },
  { emoji: '🖌️', label: 'Painting' },
  { emoji: '✂️', label: 'Tailoring' },
  { emoji: '💪', label: 'Fitness' },
  { emoji: '💻', label: 'IT Help' },
  { emoji: '🎉', label: 'Events' },
  { emoji: '👕', label: 'Laundry' },
];

// duplicate for seamless loop
const TRACK = [...ITEMS, ...ITEMS];

function Track({ direction = 1, duration = 32 }) {
  return (
    <div className="flex overflow-hidden">
      <motion.div
        className="flex gap-3 shrink-0"
        animate={{ x: direction > 0 ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{ duration, ease: 'linear', repeat: Infinity }}
      >
        {TRACK.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-bg/80 backdrop-blur-sm text-sm font-medium text-text-secondary whitespace-nowrap select-none hover:border-primary/40 hover:bg-primary-light/30 transition-colors"
          >
            <span className="text-base">{item.emoji}</span>
            {item.label}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export function ServiceTicker() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.6 }}
      className="py-8 border-y border-border overflow-hidden space-y-3 bg-surface/30 ticker-mask"
    >
      <Track direction={1} duration={34} />
      <Track direction={-1} duration={28} />
    </motion.div>
  );
}
