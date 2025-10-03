export interface TimeSeriesDataPoint {
  timestamp: Date;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface TimeSeriesSeries {
  id: string;
  name: string;
  data: TimeSeriesDataPoint[];
  color?: string;
  lineWidth?: number;
  showPoints?: boolean;
  pointRadius?: number;
}

export interface TimeSeriesChartProps {
  series: TimeSeriesSeries[];
  mode?: 'mini' | 'full';
  title?: string;
  subtitle?: string;
  onExpandPress?: () => void;
  onDataPointPress?: (dataPoint: TimeSeriesDataPoint, series: TimeSeriesSeries) => void;
  height?: number;
  width?: number;

  // Pagination options
  pageSize?: number; // Number of data points to show per page
  currentPage?: number; // Current page (0-indexed)
  totalDataPoints?: number; // Total number of data points across all pages
  onPageChange?: (page: number) => void;

  // Display options
  showLegend?: boolean;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;

  // Value formatting
  valueFormatter?: (value: number) => string;
  dateFormatter?: (date: Date) => string;

  // Range options
  minY?: number;
  maxY?: number;
  autoScale?: boolean;

  // Live streaming options
  enableLiveStreaming?: boolean;
  maxDataPoints?: number; // Maximum number of points to keep in memory (default: 100)
  streamingWindowSize?: number; // Number of data points to display in streaming mode (default: 50)
  onDataUpdate?: (series: TimeSeriesSeries[]) => void; // Callback when data is updated
  showStreamingControls?: boolean; // Show play/pause controls (default: true when streaming)
  onStreamingToggle?: (isStreaming: boolean) => void; // Callback when user toggles streaming
  streamingPaused?: boolean; // External control for paused state
  streamingCallbackId?: string; // ID for global callback registry (for serialized messages)
}

export interface ChartDimensions {
  width: number;
  height: number;
  chartWidth: number;
  chartHeight: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  legendHeight: number;
}

export interface ChartPoint {
  x: number; // Screen x coordinate
  y: number; // Screen y coordinate
  dataPoint: TimeSeriesDataPoint;
  series: TimeSeriesSeries;
}

export interface AxisScale {
  min: number;
  max: number;
  step: number;
  ticks: number[];
}
