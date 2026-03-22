/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './composables/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],

  darkMode: 'class',

  theme: {
    extend: {
      // ── TRIVIA colour palette ─────────────────────────────
      colors: {
        navy: {
          950: '#070810',
          900: '#0D0F14',
          800: '#131620',
          700: '#161B24',
          600: '#1E2535',
          500: '#2A3347',
          400: '#3A4560',
        },
        gold: {
          300: '#FFEA66',
          400: '#FFE033',
          500: '#FFD700',
          600: '#D4B000',
          glow: 'rgba(255, 215, 0, 0.25)',
        },
        green: {
          400: '#33EBB4',
          500: '#00E5A0',
          600: '#00B87F',
          glow: 'rgba(0, 229, 160, 0.2)',
        },
        red: {
          400: '#FF7089',
          500: '#FF4F6D',
          600: '#D63558',
          glow: 'rgba(255, 79, 109, 0.2)',
        },
        purple: {
          400: '#9B80FD',
          500: '#7C5CFC',
          600: '#5A3EE0',
        },
      },

      // ── Typography ────────────────────────────────────────
      fontFamily: {
        sans:  ['Sora', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },

      // ── Border radius tokens ──────────────────────────────
      borderRadius: {
        'sm':  '6px',
        'md':  '10px',
        'lg':  '16px',
        'xl':  '24px',
        '2xl': '32px',
      },

      // ── Box shadows — reduced CTA intensity ──────────────
      boxShadow: {
        // General card depth
        'card':   '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-lg':'0 8px 40px rgba(0, 0, 0, 0.5)',
        // Gold glow — REDUCED from previous 0.15/0.05 → 0.08/0.03
        'gold':   '0 0 16px rgba(255, 215, 0, 0.08), 0 0 32px rgba(255, 215, 0, 0.03)',
        // CTA card specifically — very subtle, not backlit
        'cta':    '0 2px 12px rgba(255, 215, 0, 0.06)',
        // Success / green glow
        'green':  '0 0 16px rgba(0, 229, 160, 0.12)',
        // Red alert
        'red':    '0 0 16px rgba(255, 79, 109, 0.12)',
        // Inset highlight
        'inset':  'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'none':   'none',
      },

      // ── Transitions ───────────────────────────────────────
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth':    'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // ── Animations ────────────────────────────────────────
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,215,0,0.25)' },
          '50%':       { boxShadow: '0 0 0 8px transparent' },
        },
        flamePulse: {
          '0%, 100%': { transform: 'scale(1) rotate(-2deg)' },
          '50%':       { transform: 'scale(1.12) rotate(2deg)' },
        },
        spin: {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        wrongShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%':       { transform: 'translateX(-8px)' },
          '40%':       { transform: 'translateX(8px)' },
          '60%':       { transform: 'translateX(-6px)' },
          '80%':       { transform: 'translateX(6px)' },
        },
        correctFlash: {
          '0%':   { background: '#1E2535' },
          '30%':  { background: 'rgba(0,229,160,0.2)' },
          '100%': { background: '#1E2535' },
        },
      },
      animation: {
        'fade-in':    'fadeIn 450ms cubic-bezier(0.4,0,0.2,1) both',
        'slide-up':   'slideUp 450ms cubic-bezier(0.34,1.56,0.64,1) both',
        'scale-in':   'scaleIn 250ms cubic-bezier(0.34,1.56,0.64,1) both',
        'shimmer':    'shimmer 3s linear infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'flame':      'flamePulse 1.2s ease-in-out infinite',
        'spin-slow':  'spin 0.8s linear infinite',
        'wrong':      'wrongShake 0.4s ease both',
        'correct':    'correctFlash 700ms ease both',
      },
    },
  },

  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
