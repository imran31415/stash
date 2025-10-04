import { LightColors, DarkColors, ColorScheme } from './colors';

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: ColorScheme;
}

export const LightTheme: Theme = {
  mode: 'light',
  colors: LightColors,
};

export const DarkTheme: Theme = {
  mode: 'dark',
  colors: DarkColors,
};

/**
 * Get theme by mode
 */
export const getTheme = (mode: ThemeMode): Theme => {
  return mode === 'dark' ? DarkTheme : LightTheme;
};

/**
 * Create a custom theme by extending a base theme
 */
export const createTheme = (mode: ThemeMode, customColors?: Partial<ColorScheme>): Theme => {
  const baseTheme = getTheme(mode);
  return {
    mode,
    colors: {
      ...baseTheme.colors,
      ...customColors,
    },
  };
};
