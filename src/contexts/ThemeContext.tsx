import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useGetLandingPageContentQuery } from '../services/api';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

const STORAGE_KEY = 'usratul-azkaar-theme';

// Darkens a hex color by a given percentage (0-1), used to derive
// --color-primary-dark from the admin's chosen primary color without
// needing a third color picker in Settings.
const darkenHex = (hex: string, amount = 0.25): string => {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!match) return hex;
  const num = parseInt(match[1], 16);
  const r = Math.round(((num >> 16) & 0xff) * (1 - amount));
  const g = Math.round(((num >> 8) & 0xff) * (1 - amount));
  const b = Math.round((num & 0xff) * (1 - amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

export const ThemeProvider = ({ children, defaultTheme = 'dark' }: ThemeProviderProps) => {
  const hadSavedPreference = useRef(!!localStorage.getItem(STORAGE_KEY));

  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (savedTheme) return savedTheme;

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return defaultTheme;
  });

  // Admin-configured brand colors + default mode (CMS 'appearance' section).
  const { data: contentData } = useGetLandingPageContentQuery();
  const appearance = contentData?.payload?.find((s: any) => s.section === 'appearance');

  useEffect(() => {
    if (!appearance?.metadata) return;

    // API responses are auto-normalized from snake_case to camelCase
    // (see utils/urlUtils.ts's normalizeObject, applied in services/api.ts) —
    // so the keys saved as primary_color/secondary_color/default_mode come
    // back as primaryColor/secondaryColor/defaultMode.
    const primary = appearance.metadata.primaryColor;
    const primaryLight = appearance.metadata.secondaryColor;

    if (primary) {
      document.documentElement.style.setProperty('--color-primary', primary);
      document.documentElement.style.setProperty('--color-primary-dark', darkenHex(primary));
    }
    if (primaryLight) {
      document.documentElement.style.setProperty('--color-primary-light', primaryLight);
    }

    // Only let the admin's configured default mode override the
    // auto-detected (system preference) theme for a first-time visitor who
    // has never explicitly chosen light/dark themselves.
    const defaultMode = appearance.metadata.defaultMode as Theme | undefined;
    if (!hadSavedPreference.current && defaultMode && defaultMode !== theme) {
      setThemeState(defaultMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appearance]);

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove previous theme class
    root.classList.remove('light', 'dark');

    // Add current theme class
    root.classList.add(theme);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, theme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff');
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const value = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook to check if dark mode is active
export const useIsDark = () => {
  const { theme } = useTheme();
  return theme === 'dark';
};
