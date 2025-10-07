import {
  startOfDay,
  endOfDay,
  addDays,
  addWeeks,
  addMonths,
  differenceInCalendarDays,
  format,
  isToday,
  isWeekend,
  startOfWeek,
  isSameDay,
  min,
  max,
} from 'date-fns';
import { GanttTask, TimelineCell, TaskBar, ChartDimensions } from './GanttChart.types';

// Inline theme colors - simplified and self-contained
export const colors = {
  primary: {
    50: '#EFF6FF',
    400: '#60A5FA',
    500: '#3B82F6',
  },
  accent: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#3B82F6',
    600: '#2563EB',
  },
  success: {
    100: '#D1FAE5',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
  },
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',
    600: '#DC2626',
  },
  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },
  info: {
    50: '#EFF6FF',
    500: '#3B82F6',
    600: '#2563EB',
  },
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    400: '#9CA3AF',
    500: '#6B7280',
  },
  surface: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    glass: 'rgba(255, 255, 255, 0.9)',
  },
  border: {
    default: '#E5E7EB',
    light: '#F3F4F6',
    medium: '#D1D5DB',
  },
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },
};

/**
 * Calculate the chart's date range from tasks
 */
export const calculateDateRange = (
  tasks: GanttTask[],
  providedStartDate?: Date,
  providedEndDate?: Date
): { startDate: Date; endDate: Date } => {
  if (tasks.length === 0) {
    const today = new Date();
    return {
      startDate: startOfDay(today),
      endDate: endOfDay(addDays(today, 30)),
    };
  }

  const taskDates = tasks.flatMap(task => [task.startDate, task.endDate]);
  const minDate = min(taskDates);
  const maxDate = max(taskDates);

  // Add padding to the range
  const startDate = providedStartDate || startOfDay(addDays(minDate, -3));
  const endDate = providedEndDate || endOfDay(addDays(maxDate, 7));

  return { startDate, endDate };
};

/**
 * Generate timeline cells based on date range and time scale
 */
export const generateTimelineCells = (
  startDate: Date,
  endDate: Date,
  timeScale: 'day' | 'week' | 'month',
  isMini?: boolean
): TimelineCell[] => {
  const cells: TimelineCell[] = [];
  let currentDate = startDate;

  // In mini mode, auto-adjust time scale to reduce cells
  let effectiveTimeScale = timeScale;
  if (isMini) {
    const daysDiff = differenceInCalendarDays(endDate, startDate);
    // If too many days, switch to week or month scale
    if (daysDiff > 30 && timeScale === 'day') {
      effectiveTimeScale = 'week';
    } else if (daysDiff > 90 && timeScale === 'week') {
      effectiveTimeScale = 'month';
    }
  }

  while (currentDate <= endDate) {
    cells.push({
      date: currentDate,
      isToday: isToday(currentDate),
      isWeekend: isWeekend(currentDate),
      isFirstOfMonth: currentDate.getDate() === 1,
      isFirstOfWeek: isSameDay(currentDate, startOfWeek(currentDate, { weekStartsOn: 1 })),
    });

    // Increment based on time scale
    switch (effectiveTimeScale) {
      case 'day':
        currentDate = addDays(currentDate, 1);
        break;
      case 'week':
        currentDate = addWeeks(currentDate, 1);
        break;
      case 'month':
        currentDate = addMonths(currentDate, 1);
        break;
    }
  }

  // In mini mode, if still too many cells, sample them
  if (isMini && cells.length > 20) {
    const step = Math.ceil(cells.length / 20);
    return cells.filter((_, index) => index % step === 0);
  }

  return cells;
};

/**
 * Calculate task bar positions and dimensions
 */
export const calculateTaskBars = (
  tasks: GanttTask[],
  chartStartDate: Date,
  chartEndDate: Date
): TaskBar[] => {
  const totalDays = differenceInCalendarDays(chartEndDate, chartStartDate);

  return tasks.map((task, index) => {
    const startDate = typeof task.startDate === 'string' ? new Date(task.startDate) : task.startDate;
    const endDate = typeof task.endDate === 'string' ? new Date(task.endDate) : task.endDate;
    const taskStartDays = differenceInCalendarDays(startDate, chartStartDate);
    const taskDurationDays = differenceInCalendarDays(endDate, startDate);

    // Calculate position and width as percentages
    const left = Math.max(0, (taskStartDays / totalDays) * 100);
    const width = Math.max(1, (taskDurationDays / totalDays) * 100);

    return {
      task,
      left,
      width,
      row: index,
    };
  });
};

/**
 * Format date for header display based on time scale
 */
export const formatHeaderDate = (date: Date, timeScale: 'day' | 'week' | 'month'): string => {
  switch (timeScale) {
    case 'day':
      return format(date, 'EEE d');
    case 'week':
      return format(date, 'MMM d');
    case 'month':
      return format(date, 'MMM yyyy');
    default:
      return format(date, 'MMM d');
  }
};

/**
 * Format date range for display
 */
export const formatDateRange = (startDate: Date, endDate: Date): string => {
  const start = format(startDate, 'MMM d');
  const end = format(endDate, 'MMM d, yyyy');
  return `${start} - ${end}`;
};

/**
 * Get color for task based on status and priority
 */
export const getTaskColor = (
  task: GanttTask
): { background: string; border: string; progress: string } => {
  // Use custom color if provided
  if (task.color) {
    return {
      background: task.color,
      border: task.color,
      progress: task.color,
    };
  }

  // Color by status
  switch (task.status) {
    case 'completed':
      return {
        background: colors.success[100],
        border: colors.success[500],
        progress: colors.success[600],
      };
    case 'in-progress':
      return {
        background: colors.accent[100],
        border: colors.accent[500],
        progress: colors.accent[600],
      };
    case 'blocked':
      return {
        background: colors.error[100],
        border: colors.error[500],
        progress: colors.error[600],
      };
    case 'cancelled':
      return {
        background: colors.neutral[100],
        border: colors.neutral[400],
        progress: colors.neutral[500],
      };
    case 'pending':
    default:
      // Color by priority for pending tasks
      switch (task.priority) {
        case 'critical':
          return {
            background: colors.error[50],
            border: colors.error[500],
            progress: colors.error[600],
          };
        case 'high':
          return {
            background: colors.warning[50],
            border: colors.warning[500],
            progress: colors.warning[600],
          };
        case 'medium':
          return {
            background: colors.info[50],
            border: colors.info[500],
            progress: colors.info[600],
          };
        case 'low':
        default:
          return {
            background: colors.primary[50],
            border: colors.primary[400],
            progress: colors.primary[500],
          };
      }
  }
};

/**
 * Get chart dimensions based on mode
 */
export const getChartDimensions = (
  mode: 'mini' | 'full',
  containerWidth: number,
  taskCount: number,
  customHeight?: number,
  timelineCellCount?: number
): ChartDimensions => {
  const isMini = mode === 'mini';

  // For mini mode, calculate cellWidth to fit available space
  let cellWidth = isMini ? 20 : 60;
  const sidebarWidth = isMini ? 70 : 180;

  if (isMini && timelineCellCount && timelineCellCount > 0) {
    // Calculate available width for timeline (container - sidebar - padding)
    const availableTimelineWidth = containerWidth - sidebarWidth - 16; // 16px for borders/padding
    // Ensure cellWidth fits within available space, with a minimum of 8px
    cellWidth = Math.max(8, Math.floor(availableTimelineWidth / timelineCellCount));
  }

  return {
    rowHeight: isMini ? 32 : 48,
    taskBarHeight: isMini ? 20 : 32,
    cellWidth,
    headerHeight: isMini ? 36 : 56,
    sidebarWidth,
    chartWidth: isMini ? containerWidth : containerWidth,
    chartHeight: customHeight || (isMini ? 200 : Math.min(600, taskCount * 48 + 56)),
    padding: isMini ? 6 : 12,
  };
};

/**
 * Calculate milestone position
 */
export const calculateMilestonePosition = (
  milestoneDate: Date,
  chartStartDate: Date,
  chartEndDate: Date
): number => {
  const totalDays = differenceInCalendarDays(chartEndDate, chartStartDate);
  const milestoneDays = differenceInCalendarDays(milestoneDate, chartStartDate);
  return (milestoneDays / totalDays) * 100;
};

/**
 * Sort tasks by start date
 */
export const sortTasksByStartDate = (tasks: GanttTask[]): GanttTask[] => {
  return [...tasks].sort((a, b) => {
    const dateA = typeof a.startDate === 'string' ? new Date(a.startDate) : a.startDate;
    const dateB = typeof b.startDate === 'string' ? new Date(b.startDate) : b.startDate;
    return dateA.getTime() - dateB.getTime();
  });
};

/**
 * Get status icon
 */
export const getStatusIcon = (status: GanttTask['status']): string => {
  switch (status) {
    case 'completed':
      return '✓';
    case 'in-progress':
      return '▶';
    case 'blocked':
      return '⚠';
    case 'cancelled':
      return '✕';
    case 'pending':
    default:
      return '○';
  }
};

/**
 * Calculate progress percentage text
 */
export const formatProgress = (progress: number): string => {
  return `${Math.round(progress)}%`;
};

/**
 * Get readable duration
 */
export const getTaskDuration = (task: GanttTask): string => {
  const days = differenceInCalendarDays(task.endDate, task.startDate);
  if (days === 0) return '1 day';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  const weeks = Math.round(days / 7);
  if (weeks === 1) return '1 week';
  if (weeks < 4) return `${weeks} weeks`;
  const months = Math.round(days / 30);
  if (months === 1) return '1 month';
  return `${months} months`;
};
