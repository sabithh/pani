import { motion } from 'framer-motion';
import { useCountUp } from '../../hooks/useCountUp';

export function StatCard({ label, value, icon: Icon, suffix = '', delay = 0 }) {
  const count = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-bg border border-border rounded-2xl p-5 shadow-soft"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">{label}</span>
        {Icon && (
          <span className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center text-primary-dark">
            <Icon size={16} />
          </span>
        )}
      </div>
      <div className="font-serif text-3xl font-black text-text-primary leading-none">
        {count.toLocaleString('en-IN')}{suffix}
      </div>
    </motion.div>
  );
}
