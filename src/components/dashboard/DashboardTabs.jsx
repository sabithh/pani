import { motion } from 'framer-motion';

export function DashboardTabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 p-1 bg-surface/60 border border-border rounded-2xl mb-8 overflow-x-auto no-scrollbar">
      {tabs.map((t) => {
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={[
              'relative flex-1 sm:flex-none px-4 sm:px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap',
              isActive ? 'text-white' : 'text-text-secondary hover:text-text-primary',
            ].join(' ')}
          >
            {isActive && (
              <motion.span
                layoutId="dashTabPill"
                className="absolute inset-0 bg-primary rounded-xl"
                transition={{ type: 'spring', stiffness: 360, damping: 30 }}
              />
            )}
            <span className="relative inline-flex items-center gap-2">
              {t.icon && <t.icon size={14} />}
              {t.label}
              {typeof t.count === 'number' && (
                <span className={[
                  'inline-flex items-center justify-center text-[10px] font-bold px-1.5 min-w-[18px] h-[18px] rounded-full',
                  isActive ? 'bg-white text-primary' : 'bg-bg text-text-secondary border border-border',
                ].join(' ')}>{t.count}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
