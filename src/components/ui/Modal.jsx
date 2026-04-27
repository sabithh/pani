import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

export function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const sizeClass =
    size === 'lg' ? 'max-w-2xl' : size === 'sm' ? 'max-w-sm' : 'max-w-md';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-text-primary/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.92, y: 20 },
              visible: {
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { type: 'spring', stiffness: 300, damping: 28 },
              },
            }}
            className={[
              'relative w-full bg-bg border border-border shadow-card',
              'rounded-t-3xl sm:rounded-3xl mx-0 sm:mx-4 sm:my-8',
              'max-h-[92vh] overflow-y-auto',
              sizeClass,
            ].join(' ')}
          >
            {(title || onClose) && (
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-bg/95 backdrop-blur">
                <h3 className="font-serif text-xl font-bold m-0">{title}</h3>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-surface transition-colors"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
