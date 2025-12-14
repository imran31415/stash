import type { ReactNode } from 'react';
import type { TaskListProps, GanttChartProps, ResourceListProps } from './types';
import type { TimeSeriesChartProps } from './TimeSeriesChart.types';
import type { GraphVisualizationProps } from './GraphVisualization.types';
import type { CodeBlockProps } from './CodeBlock.types';
import type { MediaProps } from './Media.types';

export type DashboardGridSize = '1x1' | '1x2' | '2x1' | '2x2' | '3x3' | '4x4' | 'custom';

export type DashboardItemType =
  | 'time-series'
  | 'time-series-chart'
  | 'gantt-chart'
  | 'graph-visualization'
  | 'task-list'
  | 'resource-list'
  | 'code-block'
  | 'media'
  | 'video'
  | 'video-stream'
  | 'live-camera-stream'
  | 'tree-view'
  | 'kanban-board'
  | 'heatmap'
  | 'workflow'
  | 'data-table'
  | 'flame-graph'
  | 'comparison-table'
  | 'sankey-diagram'
  | 'network-topology'
  | 'funnel-chart'
  | 'calendar-timeline'
  | 'form-builder'
  | 'stats'
  | 'list'
  | 'chart'
  | 'timeline'
  | 'actions'
  | 'custom';

export interface DashboardItemConfig {
  id: string;
  type: DashboardItemType;
  // Optional title for simple widget types (stats, list, chart, timeline, actions)
  title?: string;
  // Grid position and size (optional - will be auto-positioned if not provided)
  gridPosition?: {
    row: number; // 0-indexed
    col: number; // 0-indexed
    rowSpan?: number; // Default: 1
    colSpan?: number; // Default: 1
  };
  // Component-specific data
  data:
    | TimeSeriesChartProps
    | GanttChartProps
    | GraphVisualizationProps
    | TaskListProps
    | ResourceListProps
    | CodeBlockProps
    | MediaProps
    | { uri: string; title?: string } // for video
    | any; // for custom components
  // Optional custom component renderer
  customRenderer?: () => ReactNode;
}

export interface DashboardConfig {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  gridSize: DashboardGridSize;
  // For custom grid sizes
  customGrid?: {
    rows: number;
    cols: number;
  };
  items: DashboardItemConfig[];
  // Styling options
  backgroundColor?: string;
  spacing?: number; // Gap between grid items
  padding?: number; // Padding around the dashboard
}

export type DashboardMode = 'preview' | 'mini' | 'full';

export interface DashboardProps {
  config: DashboardConfig;
  mode?: DashboardMode;
  onItemPress?: (item: DashboardItemConfig) => void;
  onItemLongPress?: (item: DashboardItemConfig) => void;
  onExpandPress?: () => void;
  height?: number;
  width?: number;
  // Whether to show item actions (expand, etc.)
  showItemActions?: boolean;
  // Whether to allow scrolling
  scrollable?: boolean;
  // Whether to show the header (useful in detail views)
  showHeader?: boolean;
}

export interface DashboardDetailViewProps {
  visible: boolean;
  config: DashboardConfig;
  onClose: () => void;
  onItemPress?: (item: DashboardItemConfig) => void;
}

export interface DashboardPreviewProps {
  config: DashboardConfig;
  onPress?: () => void;
  onLongPress?: () => void;
  maxPreviewItems?: number; // Number of items to show in preview (default: 4)
}
