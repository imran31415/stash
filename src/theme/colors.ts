/**
 * Color palette for the component library
 * Supports both light and dark themes
 */

export const LightColors = {
  // Primary colors
  primary: '#007AFF',
  primaryLight: '#5AC8FA',
  primaryDark: '#0051D5',

  // Secondary colors
  secondary: '#5856D6',
  secondaryLight: '#AF52DE',
  secondaryDark: '#3634A3',

  // Neutral colors
  background: '#FFFFFF',
  surface: '#F2F2F7',
  border: '#E5E5EA',
  divider: '#D1D1D6',

  // Text colors
  text: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textDisabled: '#C7C7CC',
  textOnPrimary: '#FFFFFF',

  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Message bubble colors
  messageBubbleOwn: '#007AFF',
  messageBubbleOther: '#E5E5EA',
  messageTextOwn: '#FFFFFF',
  messageTextOther: '#000000',

  // Interactive elements
  inputBackground: '#F2F2F7',
  buttonBackground: '#D1D1D6',
  buttonBackgroundActive: '#007AFF',

  // Component-specific
  avatarBackground: '#007AFF',
  systemMessageBackground: '#F0F0F0',
  systemMessageText: '#999999',
  replyBorder: '#007AFF',

  // Code block
  codeBackground: '#282C34',
  codeLineNumberBackground: '#21252B',
  codeLineNumberText: '#5C6370',
  codeBorder: '#21252B',
  codeHeaderBackground: '#21252B',
  codeHeaderText: '#ABB2BF',
  codeText: '#ABB2BF',
  codeHighlightLine: '#2C313A',

  // Priority colors
  priorityCritical: '#DC2626',
  priorityHigh: '#F59E0B',
  priorityMedium: '#3B82F6',
  priorityLow: '#6B7280',

  // Task status colors
  statusCompleted: '#10B981',
  statusInProgress: '#3B82F6',
  statusBlocked: '#EF4444',
  statusCancelled: '#6B7280',
  statusPending: '#F59E0B',
} as const;

export const DarkColors = {
  // Primary colors
  primary: '#0A84FF',
  primaryLight: '#64D2FF',
  primaryDark: '#0066CC',

  // Secondary colors
  secondary: '#BF5AF2',
  secondaryLight: '#DA8FFF',
  secondaryDark: '#9A41C4',

  // Neutral colors
  background: '#000000',
  surface: '#1C1C1E',
  border: '#38383A',
  divider: '#48484A',

  // Text colors
  text: '#FFFFFF',
  textSecondary: '#EBEBF5',
  textTertiary: '#EBEBF599',
  textDisabled: '#636366',
  textOnPrimary: '#FFFFFF',

  // Status colors
  success: '#30D158',
  warning: '#FFD60A',
  error: '#FF453A',
  info: '#64D2FF',

  // Message bubble colors
  messageBubbleOwn: '#0A84FF',
  messageBubbleOther: '#2C2C2E',
  messageTextOwn: '#FFFFFF',
  messageTextOther: '#FFFFFF',

  // Interactive elements
  inputBackground: '#2C2C2E',
  buttonBackground: '#48484A',
  buttonBackgroundActive: '#0A84FF',

  // Component-specific
  avatarBackground: '#0A84FF',
  systemMessageBackground: '#2C2C2E',
  systemMessageText: '#EBEBF599',
  replyBorder: '#0A84FF',

  // Code block
  codeBackground: '#1C1C1E',
  codeLineNumberBackground: '#0D0D0D',
  codeLineNumberText: '#636366',
  codeBorder: '#38383A',
  codeHeaderBackground: '#2C2C2E',
  codeHeaderText: '#EBEBF5',
  codeText: '#EBEBF5',
  codeHighlightLine: '#2C2C2E',

  // Priority colors
  priorityCritical: '#FF453A',
  priorityHigh: '#FFD60A',
  priorityMedium: '#64D2FF',
  priorityLow: '#98989D',

  // Task status colors
  statusCompleted: '#30D158',
  statusInProgress: '#64D2FF',
  statusBlocked: '#FF453A',
  statusCancelled: '#98989D',
  statusPending: '#FFD60A',
} as const;

// Define the type first, then use it to constrain both color schemes
export type ColorScheme = {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  background: string;
  surface: string;
  border: string;
  divider: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  textOnPrimary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  messageBubbleOwn: string;
  messageBubbleOther: string;
  messageTextOwn: string;
  messageTextOther: string;
  inputBackground: string;
  buttonBackground: string;
  buttonBackgroundActive: string;
  avatarBackground: string;
  systemMessageBackground: string;
  systemMessageText: string;
  replyBorder: string;
  codeBackground: string;
  codeLineNumberBackground: string;
  codeLineNumberText: string;
  codeBorder: string;
  codeHeaderBackground: string;
  codeHeaderText: string;
  codeText: string;
  codeHighlightLine: string;
  priorityCritical: string;
  priorityHigh: string;
  priorityMedium: string;
  priorityLow: string;
  statusCompleted: string;
  statusInProgress: string;
  statusBlocked: string;
  statusCancelled: string;
  statusPending: string;
};
