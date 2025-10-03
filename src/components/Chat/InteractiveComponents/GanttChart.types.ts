export interface GanttTask {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  progress: number; // 0-100
  status: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  dependencies?: string[]; // Array of task IDs this task depends on
  color?: string; // Custom color override
  milestones?: GanttMilestone[];
}

export interface GanttMilestone {
  id: string;
  title: string;
  date: Date;
  completed: boolean;
}

export interface GanttChartProps {
  tasks: GanttTask[];
  startDate?: Date; // Chart start date (calculated from tasks if not provided)
  endDate?: Date; // Chart end date (calculated from tasks if not provided)
  mode?: 'mini' | 'full'; // Display mode
  onTaskPress?: (task: GanttTask) => void;
  onTaskLongPress?: (task: GanttTask) => void;
  onMilestonePress?: (milestone: GanttMilestone, task: GanttTask) => void;
  onExpandPress?: () => void; // Called when user wants to expand from mini to full
  onTaskSelect?: (task: GanttTask) => void; // Called when a task is selected (for highlighting and scrolling)
  selectedTaskId?: string; // ID of the currently selected task
  showProgress?: boolean; // Show progress bars within tasks
  showDependencies?: boolean; // Show dependency lines
  showMilestones?: boolean; // Show milestone markers
  showToday?: boolean; // Highlight today's date
  timeScale?: 'day' | 'week' | 'month'; // Granularity of time axis
  height?: number; // Custom height
  title?: string; // Chart title
  subtitle?: string; // Chart subtitle
  enablePagination?: boolean; // Enable pagination for large task lists
  itemsPerPage?: number; // Number of items to show per page (default: 10)
}

export interface TimelineCell {
  date: Date;
  isToday: boolean;
  isWeekend: boolean;
  isFirstOfMonth: boolean;
  isFirstOfWeek: boolean;
}

export interface TaskBar {
  task: GanttTask;
  left: number; // Position from left in percentage
  width: number; // Width in percentage
  row: number; // Row index
}

export interface ChartDimensions {
  rowHeight: number;
  taskBarHeight: number;
  cellWidth: number;
  headerHeight: number;
  sidebarWidth: number;
  chartWidth: number;
  chartHeight: number;
  padding: number;
}
