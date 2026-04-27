import { AnimatePresence, motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useSavedWorker } from '../../hooks/useSavedWorker';

// workerUserId = the auth user id of the worker (users.id), not worker_profiles.id
export function SaveHeartButton({ workerUserId, className = '' }) {
  const { saved, loading, toggle } = useSavedWorker(workerUserId);

  const onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle();
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={loading}
      whileTap={{ scale: 1.4 }}
      transition={{ type: 'spring', stiffness: 500, damping: 14 }}
      className={[
        'w-9 h-9 rounded-full flex items-center justify-center bg-bg/85 backdrop-blur-sm',
        'border border-border hover:border-primary/40 transition-colors',
        loading ? 'opacity-50' : '',
        className,
      ].join(' ')}
      aria-label={saved ? 'Remove from saved' : 'Save worker'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={saved ? 'on' : 'off'}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.15 }}
          className="inline-flex"
        >
          <Heart
            size={16}
            fill={saved ? 'var(--color-primary)' : 'transparent'}
            color={saved ? 'var(--color-primary)' : 'var(--color-text-muted)'}
            strokeWidth={2}
          />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
