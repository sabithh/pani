import { Link } from 'react-router-dom';

/**
 * Hand icon mark matching the Pani brand identity — graduated fingers,
 * palm base, thumb, and a cream pill badge with "പണി" in Malayalam.
 */
function HandMark({ size = 34 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Rounded square background */}
      <rect width="100" height="100" rx="22" fill="#C1440E" />

      {/* Palm base */}
      <rect x="28" y="62" width="52" height="26" rx="10" fill="#FDF8F4" />

      {/* Thumb */}
      <rect x="18" y="54" width="18" height="26" rx="9" fill="#FDF8F4" />

      {/* Index finger */}
      <rect x="28" y="28" width="13" height="42" rx="6.5" fill="#FDF8F4" />

      {/* Middle finger (tallest) */}
      <rect x="44" y="20" width="13" height="50" rx="6.5" fill="#FDF8F4" />

      {/* Ring finger */}
      <rect x="60" y="26" width="13" height="44" rx="6.5" fill="#FDF8F4" />

      {/* Pinky */}
      <rect x="74" y="34" width="11" height="36" rx="5.5" fill="#FDF8F4" />

      {/* "പണി" pill badge */}
      <rect
        x="38"
        y="80"
        width="54"
        height="18"
        rx="9"
        fill="#FDF8F4"
        stroke="#C1440E"
        strokeWidth="1.5"
      />
      <text
        x="65"
        y="93"
        textAnchor="middle"
        fontFamily="serif"
        fontSize="11"
        fontWeight="700"
        fill="#C1440E"
      >
        പണി
      </text>
    </svg>
  );
}

export function Logo({ to = '/', size = 'md', dark = false, className = '' }) {
  const cfg = {
    sm: { iconSize: 28, text: 'text-xl' },
    md: { iconSize: 34, text: 'text-2xl' },
    lg: { iconSize: 44, text: 'text-3xl' },
  };
  const { iconSize, text } = cfg[size] ?? cfg.md;

  return (
    <Link
      to={to}
      className={[
        'inline-flex items-center gap-2.5 font-serif font-black tracking-tight',
        dark ? 'text-[#FDF8F4] hover:text-white' : 'text-primary-dark hover:text-primary',
        'transition-colors',
        text,
        className,
      ].join(' ')}
    >
      <HandMark size={iconSize} />
      <span>Pani</span>
    </Link>
  );
}
