import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { buttonSpring } from '../../lib/motion';

const VARIANTS = {
  primary:
    'bg-primary text-white hover:bg-primary-dark shadow-glow ripple-container',
  secondary:
    'bg-surface text-text-primary hover:bg-surface-hover border border-border-strong',
  ghost: 'bg-transparent text-text-primary hover:bg-surface',
  outline:
    'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white',
  danger: 'bg-urgent text-white hover:opacity-90',
};

const SIZES = {
  sm: 'h-9 px-4 text-sm rounded-xl',
  md: 'h-11 px-5 text-[15px] rounded-xl',
  lg: 'h-14 px-7 text-base rounded-2xl',
  xl: 'h-16 px-9 text-lg rounded-2xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  leftIcon,
  rightIcon,
  type = 'button',
  ...rest
}) {
  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      whileHover={!(disabled || loading) ? buttonSpring.whileHover : undefined}
      whileTap={!(disabled || loading) ? buttonSpring.whileTap : undefined}
      transition={buttonSpring.transition}
      className={[
        'inline-flex items-center justify-center gap-2 font-medium tracking-tight',
        'transition-colors duration-200 select-none whitespace-nowrap',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(' ')}
      {...rest}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        leftIcon && <span className="-ml-1 flex">{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && <span className="-mr-1 flex">{rightIcon}</span>}
    </motion.button>
  );
}
