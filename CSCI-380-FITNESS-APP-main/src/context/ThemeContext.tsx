import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

const STORAGE_THEME = 'app:theme';

const themeTokens = {
  light: {
    background: '#f8fafc',
    card: '#ffffff',
    text: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0',
    overlay: 'rgba(0,0,0,0.45)',
  },
  dark: {
    background: '#0b1220',
    card: '#111827',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    border: '#1f2937',
    overlay: 'rgba(0,0,0,0.65)',
  },
} as const;

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
  colors: {
    background: string;
    card: string;
    text: string;
    textMuted: string;
    border: string;
    overlay: string;
    primary: string;
    accent: string;
    danger: string;
  };
  hydrated: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Always default to the white theme.
        // If a previous run persisted dark mode, force it back to light.
        if (mounted) setModeState('light');
        await AsyncStorage.setItem(STORAGE_THEME, 'light');
      } catch {
        // ignore
      } finally {
        if (mounted) setHydrated(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_THEME, m).catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setMode]);

  const colors = useMemo(() => {
    const base = themeTokens[mode];
    return {
      ...base,
      primary: '#2563eb',
      accent: '#10b981',
      danger: '#dc2626',
    };
  }, [mode]);

  const value = useMemo(() => ({ mode, setMode, toggle, colors, hydrated }), [mode, setMode, toggle, colors, hydrated]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

