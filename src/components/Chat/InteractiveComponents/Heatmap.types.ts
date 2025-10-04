export interface HeatmapDataPoint {
  x: number | string; // X-axis value (e.g., time, category)
  y: number | string; // Y-axis value (e.g., metric, category)
  value: number; // Intensity value
  label?: string;
  metadata?: Record<string, any>;
}

export interface HeatmapProps {
  data: HeatmapDataPoint[];
  mode?: 'mini' | 'full';
  title?: string;
  subtitle?: string;
  onExpandPress?: () => void;
  onCellPress?: (dataPoint: HeatmapDataPoint) => void;
  height?: number;
  width?: number;

  // Pagination options
  pageSize?: number; // Number of rows to show per page
  currentPage?: number; // Current page (0-indexed)
  totalRows?: number; // Total number of rows across all pages
  onPageChange?: (page: number) => void;

  // Display options
  showLegend?: boolean;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;

  // Color scale options
  colorScale?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'custom';
  customColorScale?: string[]; // Custom color gradient [lowColor, midColor, highColor]
  minValue?: number;
  maxValue?: number;
  autoScale?: boolean;

  // Value formatting
  valueFormatter?: (value: number) => string;
  xLabelFormatter?: (value: number | string) => string;
  yLabelFormatter?: (value: number | string) => string;

  // Live streaming options
  enableLiveStreaming?: boolean;
  maxDataPoints?: number; // Maximum number of points to keep in memory (default: 1000)
  streamingWindowSize?: number; // Number of data points to display in streaming mode (default: 500)
  onDataUpdate?: (data: HeatmapDataPoint[]) => void; // Callback when data is updated
  showStreamingControls?: boolean; // Show play/pause controls (default: true when streaming)
  onStreamingToggle?: (isStreaming: boolean) => void; // Callback when user toggles streaming
  streamingPaused?: boolean; // External control for paused state
  streamingCallbackId?: string; // ID for global callback registry (for serialized messages)
}

export interface HeatmapDimensions {
  width: number;
  height: number;
  chartWidth: number;
  chartHeight: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  legendHeight: number;
  cellWidth: number;
  cellHeight: number;
}

export interface HeatmapCell {
  x: number; // Screen x coordinate
  y: number; // Screen y coordinate
  width: number;
  height: number;
  color: string;
  dataPoint: HeatmapDataPoint;
}
