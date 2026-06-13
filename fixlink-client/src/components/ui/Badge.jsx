// iOS-style pill badges — same API as before, just better looking
const variants = {
  default: {
    background: 'rgba(255,255,255,0.06)',
    color: '#5A6882',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  accent: {
    background: 'rgba(59,130,246,0.12)',
    color: '#3B82F6',
    border: '1px solid rgba(59,130,246,0.25)',
  },
  success: {
    background: 'rgba(34,197,94,0.12)',
    color: '#22C55E',
    border: '1px solid rgba(34,197,94,0.25)',
  },
  warn: {
    background: 'rgba(245,158,11,0.12)',
    color: '#F59E0B',
    border: '1px solid rgba(245,158,11,0.25)',
  },
  danger: {
    background: 'rgba(239,68,68,0.12)',
    color: '#EF4444',
    border: '1px solid rgba(239,68,68,0.25)',
  },
  muted: {
    background: 'transparent',
    color: '#5A6882',
    border: '1px solid rgba(90,104,130,0.30)',
  },
};

export function Badge({ children, variant = 'default', className = '' }) {
  const s = variants[variant] || variants.default;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium tracking-wide ${className}`}
      style={s}
    >
      {children}
    </span>
  );
}
