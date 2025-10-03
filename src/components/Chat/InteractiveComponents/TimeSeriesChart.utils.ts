import { format, min, max } from 'date-fns';
import type {
  TimeSeriesSeries,
  TimeSeriesDataPoint,
  ChartDimensions,
  ChartPoint,
  AxisScale,
} from './TimeSeriesChart.types';

// Color palette for series
export const seriesColors = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
];

// Shared theme colors
export const colors = {
  primary: {
    50: '#EFF6FF',
    400: '#60A5FA',
    500: '#3B82F6',
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
  grid: '#E5E7EB',
  gridLight: '#F3F4F6',
};

/**
 * Get dimensions for the chart based on mode
 */
export const getChartDimensions = (
  mode: 'mini' | 'full',
  screenWidth: number,
  customHeight?: number,
  showLegend: boolean = true
): ChartDimensions => {
  const isMini = mode === 'mini';

  const width = isMini ? 400 : screenWidth;
  const height = customHeight || (isMini ? 200 : 400);

  const paddingTop = isMini ? 12 : 24;
  const paddingRight = isMini ? 12 : 24;
  const paddingBottom = isMini ? 28 : 48;
  const paddingLeft = isMini ? 36 : 56;

  const legendHeight = showLegend && !isMini ? 32 : 0;

  return {
    width,
    height,
    chartWidth: width - paddingLeft - paddingRight,
    chartHeight: height - paddingTop - paddingBottom - legendHeight,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    legendHeight,
  };
};

/**
 * Assign colors to series if not provided
 */
export const assignSeriesColors = (series: TimeSeriesSeries[]): TimeSeriesSeries[] => {
  return series.map((s, index) => ({
    ...s,
    color: s.color || seriesColors[index % seriesColors.length],
  }));
};

/**
 * Get paginated data for a series
 */
export const getPaginatedData = (
  series: TimeSeriesSeries[],
  pageSize?: number,
  currentPage: number = 0
): TimeSeriesSeries[] => {
  if (!pageSize) return series;

  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;

  return series.map(s => ({
    ...s,
    data: s.data.slice(startIndex, endIndex),
  }));
};

/**
 * Calculate Y-axis scale with nice tick values
 */
export const calculateYScale = (
  series: TimeSeriesSeries[],
  minY?: number,
  maxY?: number,
  autoScale: boolean = true
): AxisScale => {
  const allValues = series.flatMap(s => s.data.map(d => d.value));

  if (allValues.length === 0) {
    return { min: 0, max: 100, step: 20, ticks: [0, 20, 40, 60, 80, 100] };
  }

  let dataMin = Math.min(...allValues);
  let dataMax = Math.max(...allValues);

  // Apply manual range if provided
  if (minY !== undefined) dataMin = minY;
  if (maxY !== undefined) dataMax = maxY;

  // Add padding if auto-scaling
  if (autoScale) {
    const range = dataMax - dataMin;
    const padding = range * 0.1;
    dataMin = dataMin - padding;
    dataMax = dataMax + padding;
  }

  // Calculate nice tick values
  const range = dataMax - dataMin;
  const tickCount = 5;
  const roughStep = range / (tickCount - 1);

  // Round to a nice number
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalized = roughStep / magnitude;
  let niceStep: number;

  if (normalized <= 1) niceStep = magnitude;
  else if (normalized <= 2) niceStep = 2 * magnitude;
  else if (normalized <= 5) niceStep = 5 * magnitude;
  else niceStep = 10 * magnitude;

  // Calculate nice min and max
  const niceMin = Math.floor(dataMin / niceStep) * niceStep;
  const niceMax = Math.ceil(dataMax / niceStep) * niceStep;

  // Generate ticks
  const ticks: number[] = [];
  for (let i = niceMin; i <= niceMax; i += niceStep) {
    ticks.push(i);
  }

  return {
    min: niceMin,
    max: niceMax,
    step: niceStep,
    ticks,
  };
};

/**
 * Calculate X-axis (time) scale
 */
export const calculateXScale = (
  series: TimeSeriesSeries[]
): { minDate: Date; maxDate: Date; range: number } => {
  const allDates = series.flatMap(s => s.data.map(d => d.timestamp));

  if (allDates.length === 0) {
    const now = new Date();
    return { minDate: now, maxDate: now, range: 0 };
  }

  const minDate = min(allDates);
  const maxDate = max(allDates);
  const range = maxDate.getTime() - minDate.getTime();

  return { minDate, maxDate, range };
};

/**
 * Convert data points to screen coordinates
 */
export const dataToScreenCoordinates = (
  series: TimeSeriesSeries[],
  dimensions: ChartDimensions,
  yScale: AxisScale,
  xScale: { minDate: Date; maxDate: Date; range: number }
): ChartPoint[][] => {
  const { paddingLeft, paddingTop, chartWidth, chartHeight } = dimensions;
  const { min: yMin, max: yMax } = yScale;
  const { minDate, range: xRange } = xScale;

  return series.map(s =>
    s.data.map(dataPoint => {
      // Calculate x position (time)
      const timeDiff = dataPoint.timestamp.getTime() - minDate.getTime();
      const xRatio = xRange > 0 ? timeDiff / xRange : 0;
      const x = paddingLeft + xRatio * chartWidth;

      // Calculate y position (value)
      const yRange = yMax - yMin;
      const yRatio = yRange > 0 ? (dataPoint.value - yMin) / yRange : 0.5;
      const y = paddingTop + chartHeight - yRatio * chartHeight; // Invert y-axis

      return {
        x,
        y,
        dataPoint,
        series: s,
      };
    })
  );
};

/**
 * Generate SVG path for line chart
 */
export const generateLinePath = (points: ChartPoint[]): string => {
  if (points.length === 0) return '';

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }

  return path;
};

/**
 * Generate smooth SVG path using cubic Bezier curves
 */
export const generateSmoothLinePath = (points: ChartPoint[]): string => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];

    const controlPointX1 = current.x + (next.x - current.x) / 3;
    const controlPointY1 = current.y;

    const controlPointX2 = current.x + (2 * (next.x - current.x)) / 3;
    const controlPointY2 = next.y;

    path += ` C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${next.x} ${next.y}`;
  }

  return path;
};

/**
 * Format date for X-axis labels
 */
export const formatDateLabel = (date: Date, totalRange: number): string => {
  // Range in milliseconds
  const hour = 3600000;
  const day = 86400000;
  const week = 604800000;
  const month = 2592000000;

  if (totalRange < day) {
    // Hourly
    return format(date, 'HH:mm');
  } else if (totalRange < week) {
    // Daily
    return format(date, 'MMM d');
  } else if (totalRange < month * 3) {
    // Weekly
    return format(date, 'MMM d');
  } else {
    // Monthly
    return format(date, 'MMM yyyy');
  }
};

/**
 * Format value for Y-axis labels
 */
export const formatValueLabel = (value: number): string => {
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  } else if (Math.abs(value) >= 1) {
    return value.toFixed(1);
  } else {
    return value.toFixed(2);
  }
};

/**
 * Calculate total pages
 */
export const calculateTotalPages = (totalDataPoints: number, pageSize: number): number => {
  if (pageSize <= 0) return 1;
  return Math.ceil(totalDataPoints / pageSize);
};

/**
 * Find nearest data point to touch coordinates
 */
export const findNearestPoint = (
  chartPoints: ChartPoint[][],
  touchX: number,
  touchY: number,
  maxDistance: number = 30
): ChartPoint | null => {
  let nearestPoint: ChartPoint | null = null;
  let minDistance = maxDistance;

  for (const seriesPoints of chartPoints) {
    for (const point of seriesPoints) {
      const distance = Math.sqrt(
        Math.pow(point.x - touchX, 2) + Math.pow(point.y - touchY, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = point;
      }
    }
  }

  return nearestPoint;
};

/**
 * Generate X-axis tick dates
 */
export const generateXAxisTicks = (
  minDate: Date,
  maxDate: Date,
  maxTicks: number = 5
): Date[] => {
  const range = maxDate.getTime() - minDate.getTime();
  const step = range / (maxTicks - 1);

  const ticks: Date[] = [];
  for (let i = 0; i < maxTicks; i++) {
    ticks.push(new Date(minDate.getTime() + i * step));
  }

  return ticks;
};
