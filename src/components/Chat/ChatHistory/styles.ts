import { StyleSheet, Platform } from 'react-native';

// Shared color palette
export const colors = {
  primary: '#007AFF',
  primaryLight: '#E5F1FF',
  background: '#FFFFFF',
  backgroundSecondary: '#F9F9F9',
  backgroundTertiary: '#F2F2F7',
  border: '#E5E5EA',
  text: '#000000',
  textSecondary: '#8E8E93',
  error: '#FF3B30',
  shadow: '#000000',
};

// Shared spacing values
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

// Shared border radius values
export const borderRadius = {
  sm: 10,
  md: 12,
  lg: 16,
  round: 999,
};

// Common shadow styles
export const shadows = {
  light: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
    web: {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
  }),
  medium: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    web: {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
  }),
  heavy: Platform.select({
    ios: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
    web: {
      boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
    },
  }),
  sidebar: Platform.select({
    web: {
      boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
    },
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
  }),
};

// Shared header styles
export const sharedStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: colors.text,
  },
});
