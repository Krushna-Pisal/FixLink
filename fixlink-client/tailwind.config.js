/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'fl-bg':           '#090B10',
        'fl-surface':      'rgba(22,26,35,0.72)',
        'fl-surface-solid':'#161A23',
        'fl-glass':        'rgba(255,255,255,0.04)',
        'fl-glass-border': 'rgba(255,255,255,0.08)',
        'fl-border':       '#252A36',
        'fl-accent':       '#3B82F6',
        'fl-accent-soft':  '#1D3557',
        'fl-success':      '#22C55E',
        'fl-warn':         '#F59E0B',
        'fl-danger':       '#EF4444',
        'fl-primary':      '#F1F5F9',
        'fl-muted':        '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.6s ease-out infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'glow-accent': '0 0 0 1px #3B82F620',
        'glow-success': '0 0 0 1px #22C55E20',
      },
    },
  },
  plugins: [],
};
