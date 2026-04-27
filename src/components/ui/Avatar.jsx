import { motion } from 'framer-motion';
import { initials } from '../../lib/format';

const SIZES = {
  xs: 'w-7 h-7 text-[10px]',
  sm: 'w-9 h-9 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
  xl: 'w-24 h-24 text-xl',
  '2xl': 'w-32 h-32 text-2xl',
};

export function Avatar({ src, name = '', size = 'md', className = '', animate = false }) {
  const Tag = animate ? motion.div : 'div';
  const animProps = animate
    ? { whileHover: { scale: 1.05 }, transition: { type: 'spring', stiffness: 400, damping: 18 } }
    : {};
  return (
    <Tag
      className={[
        'inline-flex items-center justify-center rounded-full overflow-hidden',
        'bg-primary-light text-primary-dark font-semibold ring-2 ring-bg select-none',
        SIZES[size],
        className,
      ].join(' ')}
      {...animProps}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <span>{initials(name) || '?'}</span>
      )}
    </Tag>
  );
}
