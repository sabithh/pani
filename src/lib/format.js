import { formatDistanceToNow, format } from 'date-fns';

export const formatINR = (n) => {
  if (n == null || Number.isNaN(Number(n))) return '—';
  return `₹${Number(n).toLocaleString('en-IN')}`;
};

export const formatRange = (min, max) => {
  if (min == null && max == null) return '—';
  if (min != null && max != null && min !== max) return `${formatINR(min)}–${formatINR(max)}`;
  return formatINR(min ?? max);
};

export const timeAgo = (date) => {
  if (!date) return '';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return '';
  }
};

export const prettyDate = (date) => {
  if (!date) return '';
  try {
    return format(new Date(date), 'MMM d, yyyy');
  } catch {
    return '';
  }
};

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');
