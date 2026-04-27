/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-hover': 'var(--color-surface-hover)',
        primary: 'var(--color-primary)',
        'primary-dark': 'var(--color-primary-dark)',
        'primary-light': 'var(--color-primary-light)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        border: 'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
        'tag-bg': 'var(--color-tag-bg)',
        'tag-text': 'var(--color-tag-text)',
        success: 'var(--color-success)',
        'success-bg': 'var(--color-success-bg)',
        urgent: 'var(--color-urgent)',
        'urgent-bg': 'var(--color-urgent-bg)',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px rgba(45, 26, 14, 0.06)',
        card: '0 6px 24px rgba(45, 26, 14, 0.08)',
        hover: '0 12px 32px rgba(193, 68, 14, 0.12)',
        glow: '0 4px 20px rgba(193, 68, 14, 0.3)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        ripple: {
          to: { transform: 'scale(3)', opacity: '0' },
        },
        pulse_dot: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
        },
        bell: {
          '0%, 100%': { transform: 'rotate(0)' },
          '20%': { transform: 'rotate(-15deg)' },
          '40%': { transform: 'rotate(15deg)' },
          '60%': { transform: 'rotate(-10deg)' },
          '80%': { transform: 'rotate(10deg)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.4s infinite',
        ripple: 'ripple 0.6s ease-out',
        'pulse-dot': 'pulse_dot 1.6s ease-in-out infinite',
        bell: 'bell 0.8s ease-in-out',
      },
    },
  },
  plugins: [],
};
