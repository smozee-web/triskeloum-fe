/**
 * Usratul Azkaar Design System
 * Premium black and gold spiritual aesthetic
 */

export const theme = {
  colors: {
    // Primary Palette - Gold/Amber
    primary: {
      50: '#FFF9E6',
      100: '#FFF3CC',
      200: '#FFE799',
      300: '#FFDB66',
      400: '#FFCF33',
      500: '#FFD700', // Pure Gold
      600: '#D4AF37', // Ancient Gold
      700: '#B8860B', // Dark Goldenrod
      800: '#8B6508',
      900: '#5E4405',
    },

    // Amber gradient stops (for backgrounds and accents)
    amber: {
      light: '#FFD700',
      DEFAULT: '#D4AF37',
      dark: '#B8860B',
    },

    // Background colors
    background: {
      primary: '#000000',    // Pure black
      secondary: '#0a0a0a',  // Slightly lighter black
      tertiary: '#1a1a1a',   // Card backgrounds
      elevated: '#1f2937',   // Elevated surfaces
    },

    // Text colors
    text: {
      primary: '#ffffff',     // White
      secondary: '#d1d5db',   // Light gray
      tertiary: '#9ca3af',    // Medium gray
      muted: '#6b7280',       // Muted gray
      accent: '#D4AF37',      // Gold
    },

    // Neutral grays (for borders, dividers, etc.)
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },

    // Semantic colors
    success: {
      light: '#34d399',
      DEFAULT: '#10b981',
      dark: '#059669',
    },
    error: {
      light: '#f87171',
      DEFAULT: '#ef4444',
      dark: '#dc2626',
    },
    warning: {
      light: '#fbbf24',
      DEFAULT: '#f59e0b',
      dark: '#d97706',
    },
    info: {
      light: '#60a5fa',
      DEFAULT: '#3b82f6',
      dark: '#2563eb',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      serif: ['Playfair Display', 'Georgia', 'serif'],
      mono: ['JetBrains Mono', 'Monaco', 'Courier New', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
      ultra: '0.25em',
      supreme: '0.4em',
    },
  },

  // Spacing
  spacing: {
    xs: '0.5rem',    // 8px
    sm: '1rem',      // 16px
    md: '1.5rem',    // 24px
    lg: '2rem',      // 32px
    xl: '3rem',      // 48px
    '2xl': '4rem',   // 64px
    '3xl': '6rem',   // 96px
    '4xl': '8rem',   // 128px
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    DEFAULT: '0.5rem', // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    '2xl': '2rem',   // 32px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    // Gold glow shadows
    gold: '0 0 20px rgba(212, 175, 55, 0.3)',
    'gold-lg': '0 0 40px rgba(212, 175, 55, 0.4)',
    'amber': '0 10px 36px rgba(217, 119, 6, 0.3)',
  },

  // Animations
  animations: {
    durations: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    timings: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      linear: 'linear',
    },
  },

  // Gradients
  gradients: {
    gold: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #B8860B 100%)',
    goldVertical: 'linear-gradient(180deg, #D4AF37 0%, #FFD700 50%, #B8860B 100%)',
    goldRadial: 'radial-gradient(circle, #FFD700 0%, #D4AF37 50%, #B8860B 100%)',
    amber: 'linear-gradient(to right, #f59e0b, #d97706)',
    amberDark: 'linear-gradient(to right, #d97706, #b45309)',
    black: 'linear-gradient(to bottom, #000000, #1a1a1a)',
    blackToTransparent: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
  },

  // Breakpoints (for reference)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// Type exports for TypeScript
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeTypography = typeof theme.typography;
