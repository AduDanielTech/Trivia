// tailwind.config.js
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Deep navy "Millionaire" backgrounds (dark mode hero / landing)
        ink: {
          950: '#070A12',
          900: '#0B1020',
          800: '#0F1730',
          700: '#131F3D',
        },

        // The Primary "Educative Green" System
        scholar: {
          50: '#f0fdf4',   // Background tint
          100: '#dcfce7',
          600: '#16a34a',  // Primary Button
          700: '#15803d',  // Hover state
          800: '#166534',  // Deep Emphasis
          900: '#14532d',  // High-contrast text
        },

        // Warm Neutrals (Replaces cold grays)
        paper: {
          50: '#FAF9F6',   // Light Mode Background
          100: '#F2F0E9',  // Card Background
          200: '#E5E2D9',  // Borders
          800: '#2C2E2A',  // Dark Mode Background
          900: '#1C1D1B',  // Dark Mode Surface
        },

        // Gold accents (used sparingly for "win"/gamification moments)
        gold: {
          50: '#FFF9E6',
          100: '#FFF1BF',
          500: '#F5C518',
          600: '#C49A00',
          700: '#9A7700',
        },

        // Accents (Used sparingly)
        sage: '#717D6E',
        warn: '#D97706',
        error: '#BE123C',
      },
      fontFamily: {
        // High legibility fonts
        sans: ['"Public Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Lexend"', 'sans-serif'], // For big bold headings
      },
      fontSize: {
        'base': ['18px', '1.6'], // Increased base font size for legibility
      },
      borderRadius: {
        'xl': '18px',
        '2xl': '24px',
      },
      animation: {
        'reveal': 'reveal 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        reveal: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
}
