const TONES = {
  default: 'bg-tag-bg text-tag-text',
  surface: 'bg-surface text-text-secondary',
  success: 'bg-success-bg text-success',
  urgent: 'bg-urgent-bg text-urgent',
  outline: 'bg-transparent text-text-secondary border border-border-strong',
};

export function Tag({ tone = 'default', className = '', children, leftIcon }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
        TONES[tone] ?? TONES.default,
        className,
      ].join(' ')}
    >
      {leftIcon}
      {children}
    </span>
  );
}
