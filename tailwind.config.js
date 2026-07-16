/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Primary Gold/Amber palette
        primary: {
          50: '#FFF9E6',
          100: '#FFF3CC',
          200: '#FFE799',
          300: '#FFDB66',
          400: '#FFCF33',
          500: 'var(--color-primary-light)', // Pure Gold
          600: 'var(--color-primary)', // Ancient Gold
          700: 'var(--color-primary-dark)', // Dark Goldenrod
          800: '#8B6508',
          900: '#5E4405',
        },

        // Amber accents
        'gold-light': 'var(--color-primary-light)',
        'gold': 'var(--color-primary)',
        'gold-dark': 'var(--color-primary-dark)',

        // Background colors
        'bg-primary': '#000000',
        'bg-secondary': '#0a0a0a',
        'bg-tertiary': '#1a1a1a',
        'bg-elevated': '#1f2937',

        // Text colors
        'text-primary': '#ffffff',
        'text-secondary': '#d1d5db',
        'text-tertiary': '#9ca3af',
        'text-muted': '#6b7280',
        'text-accent': 'var(--color-primary)',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Monaco', 'Courier New', 'monospace'],
      },

      letterSpacing: {
        'ultra': '0.25em',
        'supreme': '0.4em',
      },

      boxShadow: {
        'gold': '0 0 20px rgba(212, 175, 55, 0.3)',
        'gold-lg': '0 0 40px rgba(212, 175, 55, 0.4)',
        'amber': '0 10px 36px rgba(217, 119, 6, 0.3)',
      },

      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 50%, var(--color-primary-dark) 100%)',
        'gradient-gold-vertical': 'linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-light) 50%, var(--color-primary-dark) 100%)',
        'gradient-gold-radial': 'radial-gradient(circle, var(--color-primary-light) 0%, var(--color-primary) 50%, var(--color-primary-dark) 100%)',
        'gradient-amber': 'linear-gradient(to right, #f59e0b, #d97706)',
        'gradient-amber-dark': 'linear-gradient(to right, #d97706, #b45309)',
        'gradient-black': 'linear-gradient(to bottom, #000000, #1a1a1a)',
        'gradient-black-transparent': 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
      },

      animation: {
        'spin-slow': 'spin 30s linear infinite',
        'spin-slower': 'spin 60s linear infinite',
        'float': 'float 5s ease-in-out infinite',
        'scroll-dot': 'scroll-dot 1.5s ease-in-out infinite',
        'bounce-slow': 'bounce-slow 2s ease-in-out infinite',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '50%': { transform: 'translateY(-20px)', opacity: '0.8' },
        },
        'scroll-dot': {
          '0%': { transform: 'translateX(-50%) translateY(0)', opacity: '1' },
          '100%': { transform: 'translateX(-50%) translateY(16px)', opacity: '0' },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(4px)' },
        },
      },
    },
  },
  plugins: [],
}
