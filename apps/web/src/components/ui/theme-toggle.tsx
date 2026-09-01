'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTranslations } from 'next-intl';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({ theme: 'light', toggle: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const saved = localStorage.getItem('yellow-theme') as Theme;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('yellow-theme', theme);
  }, [theme]);

  const toggle = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('common');

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="p-2" aria-hidden="true" />;
  }

  return (
    <button
      onClick={toggle}
      className="p-2 hover:bg-muted dark:hover:bg-primary/90 rounded-lg transition-colors"
      title={theme === 'light' ? t('darkMode') : t('lightMode')}
      suppressHydrationWarning
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 text-foreground" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400" />
      )}
    </button>
  );
}
