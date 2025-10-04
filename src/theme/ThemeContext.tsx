import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Theme, ThemeMode, LightTheme, DarkTheme, createTheme } from './theme';
import { ColorScheme } from './colors';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  updateThemeColors: (colors: Partial<ColorScheme>) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: ThemeMode;
  customColors?: Partial<ColorScheme>;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = 'light',
  customColors,
}) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialTheme);
  const [customThemeColors, setCustomThemeColors] = useState<Partial<ColorScheme> | undefined>(customColors);

  const theme = useMemo(() => {
    return customThemeColors
      ? createTheme(themeMode, customThemeColors)
      : themeMode === 'dark'
      ? DarkTheme
      : LightTheme;
  }, [themeMode, customThemeColors]);

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const updateThemeColors = useCallback((colors: Partial<ColorScheme>) => {
    setCustomThemeColors((prev) => ({
      ...prev,
      ...colors,
    }));
  }, []);

  const resetTheme = useCallback(() => {
    setCustomThemeColors(undefined);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      themeMode,
      setThemeMode,
      toggleTheme,
      updateThemeColors,
      resetTheme,
    }),
    [theme, themeMode, toggleTheme, updateThemeColors, resetTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * Hook to access the theme context
 * Falls back to LightTheme if used outside ThemeProvider
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return a default implementation when used outside ThemeProvider
    return {
      theme: LightTheme,
      themeMode: 'light',
      setThemeMode: () => console.warn('useTheme: Not wrapped in ThemeProvider'),
      toggleTheme: () => console.warn('useTheme: Not wrapped in ThemeProvider'),
      updateThemeColors: () => console.warn('useTheme: Not wrapped in ThemeProvider'),
      resetTheme: () => console.warn('useTheme: Not wrapped in ThemeProvider'),
    };
  }
  return context;
};

/**
 * Hook to get just the theme colors
 * Falls back to LightTheme colors if used outside ThemeProvider
 */
export const useThemeColors = () => {
  const { theme } = useTheme();
  return theme.colors;
};
