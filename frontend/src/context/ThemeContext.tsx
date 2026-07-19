import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('theme');
    const initialMode = saved !== 'light';
    setIsDarkMode(initialMode);
    
    if (initialMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }
  }, [isDarkMode, isClient]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
