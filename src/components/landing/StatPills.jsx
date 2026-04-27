import { motion } from 'framer-motion';
import { useCountUp } from '../../hooks/useCountUp';

const pills = [
  { value: 500, suffix: '+', label: 'Workers' },
  { value: 1000, suffix: '+', label: 'Jobs Done' },
  { value: 50, suffix: '+', label: 'Categories' },
];

function Pill({ pill, index }) {
  const count = useCountUp(pill.value, 1100 + index * 150);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 + 1.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      className="flex flex-col items-center bg-white/60 backdrop-blur-md border border-border/50 rounded-2xl px-6 py-4 shadow-soft min-w-[120px]"
    >
      <span className="font-serif text-3xl font-black text-primary-dark leading-none">
        {count.toLocaleString('en-IN')}{pill.suffix}
      </span>
      <span className="mt-1 text-xs uppercase tracking-wider text-text-muted font-semibold">
        {pill.label}
      </span>
    </motion.div>
  );
}

export function StatPills() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 px-4">
      {pills.map((p, i) => (
        <Pill key={p.label} pill={p} index={i} />
      ))}
    </div>
  );
}
