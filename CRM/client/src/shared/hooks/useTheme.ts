import { useCallback, useState } from 'react';

export type Theme = 'light' | 'dark';

const getInitialTheme = (): Theme => {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
};

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem('manifest-theme', next);
    } catch {
      // Storage can be unavailable in restricted contexts.
    }
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [setTheme, theme]);

  return { theme, setTheme, toggleTheme };
};
