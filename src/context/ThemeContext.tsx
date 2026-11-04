import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { LightTheme, DarkTheme, ThemeType } from '../theme/colors';
import { storageService } from '../services/storage';

interface ThemeContextProps {
  theme: ThemeType;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: LightTheme,
  isDark: false,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState<boolean>(systemScheme === 'dark');

  useEffect(() => {
    storageService.getItem('theme_preference').then((saved) => {
      if (saved !== null) {
        setIsDark(saved === 'dark');
      }
    });
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      storageService.setItem('theme_preference', next ? 'dark' : 'light');
      return next;
    });
  };

  const setThemeMode = (dark: boolean) => {
    setIsDark(dark);
    storageService.setItem('theme_preference', dark ? 'dark' : 'light');
  };

  const currentTheme = isDark ? DarkTheme : LightTheme;

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, isDark, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
