import { motion } from 'framer-motion';

export function Card({
  as: Tag = motion.div,
  className = '',
  children,
  hover = false,
  ...rest
}) {
  return (
    <Tag
      className={[
        'bg-bg border border-border rounded-2xl shadow-soft',
        hover &&
          'transition-colors duration-200 hover:border-primary/40 hover:shadow-hover',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  );
}
