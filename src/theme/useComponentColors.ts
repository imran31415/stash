import { useThemeColors } from './ThemeContext';
import { ColorScheme } from './colors';

/**
 * Hook that provides theme-aware colors for interactive components
 * Falls back to theme colors if component doesn't have theming yet
 */
export const useComponentColors = () => {
  const colors = useThemeColors();

  return {
    // Base colors
    ...colors,

    // Task status colors (theme-aware)
    getStatusColor: (status: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'cancelled') => {
      switch (status) {
        case 'completed':
          return colors.statusCompleted;
        case 'in-progress':
          return colors.statusInProgress;
        case 'blocked':
          return colors.statusBlocked;
        case 'cancelled':
          return colors.statusCancelled;
        default:
          return colors.statusPending;
      }
    },

    // Priority colors (theme-aware)
    getPriorityColor: (priority: 'low' | 'medium' | 'high' | 'critical') => {
      switch (priority) {
        case 'critical':
          return colors.priorityCritical;
        case 'high':
          return colors.priorityHigh;
        case 'medium':
          return colors.priorityMedium;
        default:
          return colors.priorityLow;
      }
    },

    // Code block colors (already theme-aware in color scheme)
    codeBlock: {
      background: colors.codeBackground,
      lineNumberBackground: colors.codeLineNumberBackground,
      lineNumberText: colors.codeLineNumberText,
      border: colors.codeBorder,
      headerBackground: colors.codeHeaderBackground,
      headerText: colors.codeHeaderText,
      text: colors.codeText,
      highlightLine: colors.codeHighlightLine,
    },
  };
};
