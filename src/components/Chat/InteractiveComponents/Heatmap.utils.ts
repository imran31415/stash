import type {
  HeatmapDataPoint,
  HeatmapDimensions,
  HeatmapCell,
} from './Heatmap.types';

// Color scales for different themes
export const colors = {
  surface: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
  },
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    tertiary: '#94A3B8',
    inverse: '#FFFFFF',
  },
  border: {
    default: '#E2E8F0',
    light: '#F1F5F9',
    medium: '#CBD5E1',
  },
  gridLight: '#F1F5F9',
  primary: {
    500: '#3B82F6',
  },
};

// Color scale presets
export const colorScales = {
  blue: ['#EFF6FF', '#60A5FA', '#1E40AF'],
  green: ['#F0FDF4', '#4ADE80', '#15803D'],
  red: ['#FEF2F2', '#F87171', '#991B1B'],
  yellow: ['#FEFCE8', '#FACC15', '#854D0E'],
  purple: ['#FAF5FF', '#A78BFA', '#6B21A8'],
};

export const getColorScale = (
  scaleName: string,
  customScale?: string[]
): string[] => {
  if (scaleName === 'custom' && customScale && customScale.length >= 3) {
    return customScale;
  }
  return colorScales[scaleName as keyof typeof colorScales] || colorScales.blue;
};

// Interpolate color based on value
export const interpolateColor = (
  value: number,
  min: number,
  max: number,
  colorScale: string[]
): string => {
  if (max === min) return colorScale[1]; // Return mid color if no range

  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));

  let color1: string;
  let color2: string;
  let localT: number;

  if (normalized < 0.5) {
    // Interpolate between low and mid
    color1 = colorScale[0];
    color2 = colorScale[1];
    localT = normalized * 2;
  } else {
    // Interpolate between mid and high
    color1 = colorScale[1];
    color2 = colorScale[2];
    localT = (normalized - 0.5) * 2;
  }

  return lerpColor(color1, color2, localT);
};

// Linear interpolation between two hex colors
const lerpColor = (color1: string, color2: string, t: number): string => {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);

  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Calculate chart dimensions based on mode
export const getChartDimensions = (
  mode: 'mini' | 'full',
  containerWidth: number,
  customHeight?: number,
  hasLegend: boolean = true,
  uniqueXValues: number = 10,
  uniqueYValues: number = 10
): HeatmapDimensions => {
  const isMini = mode === 'mini';

  const paddingLeft = isMini ? 60 : 80;
  const paddingRight = isMini ? 16 : 40;
  const paddingTop = isMini ? 30 : 50;
  const paddingBottom = isMini ? 40 : 60;
  const legendHeight = hasLegend && !isMini ? 40 : 0;

  const height = customHeight || (isMini ? 200 : 400);

  const chartWidth = containerWidth - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom - legendHeight;

  // Calculate cell dimensions
  const cellWidth = chartWidth / uniqueXValues;
  const cellHeight = chartHeight / uniqueYValues;

  return {
    width: containerWidth,
    height,
    chartWidth,
    chartHeight,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    legendHeight,
    cellWidth,
    cellHeight,
  };
};

// Extract unique X and Y values from data
export const extractUniqueValues = (data: HeatmapDataPoint[]) => {
  const xValues = Array.from(new Set(data.map(d => d.x))).sort();
  const yValues = Array.from(new Set(data.map(d => d.y))).sort();

  return { xValues, yValues };
};

// Calculate value range
export const calculateValueRange = (
  data: HeatmapDataPoint[],
  minValue?: number,
  maxValue?: number,
  autoScale: boolean = true
) => {
  if (!autoScale && minValue !== undefined && maxValue !== undefined) {
    return { min: minValue, max: maxValue };
  }

  if (data.length === 0) {
    return { min: 0, max: 100 };
  }

  const values = data.map(d => d.value);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);

  return {
    min: minValue ?? dataMin,
    max: maxValue ?? dataMax,
  };
};

// Convert data to heatmap cells
export const dataToHeatmapCells = (
  data: HeatmapDataPoint[],
  dimensions: HeatmapDimensions,
  xValues: (number | string)[],
  yValues: (number | string)[],
  valueRange: { min: number; max: number },
  colorScale: string[]
): HeatmapCell[] => {
  const cells: HeatmapCell[] = [];

  data.forEach(dataPoint => {
    const xIndex = xValues.indexOf(dataPoint.x);
    const yIndex = yValues.indexOf(dataPoint.y);

    if (xIndex === -1 || yIndex === -1) return;

    const x = dimensions.paddingLeft + xIndex * dimensions.cellWidth;
    const y = dimensions.paddingTop + yIndex * dimensions.cellHeight;

    const color = interpolateColor(
      dataPoint.value,
      valueRange.min,
      valueRange.max,
      colorScale
    );

    cells.push({
      x,
      y,
      width: dimensions.cellWidth,
      height: dimensions.cellHeight,
      color,
      dataPoint,
    });
  });

  return cells;
};

// Format value label
export const formatValueLabel = (value: number): string => {
  if (Math.abs(value) >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`;
  }
  if (Math.abs(value) >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`;
  }
  if (Math.abs(value) < 1 && value !== 0) {
    return value.toFixed(2);
  }
  return value.toFixed(0);
};

// Format axis label
export const formatAxisLabel = (value: number | string): string => {
  if (typeof value === 'string') {
    return value.length > 10 ? `${value.slice(0, 10)}...` : value;
  }
  return formatValueLabel(value);
};

// Pagination utilities
export const getPaginatedData = (
  data: HeatmapDataPoint[],
  yValues: (number | string)[],
  pageSize?: number,
  currentPage: number = 0
): { data: HeatmapDataPoint[]; yValues: (number | string)[] } => {
  if (!pageSize) {
    return { data, yValues };
  }

  const startRow = currentPage * pageSize;
  const endRow = startRow + pageSize;
  const paginatedYValues = yValues.slice(startRow, endRow);

  const paginatedData = data.filter(d => paginatedYValues.includes(d.y));

  return { data: paginatedData, yValues: paginatedYValues };
};

export const calculateTotalPages = (totalRows: number, pageSize: number): number => {
  return Math.ceil(totalRows / pageSize);
};

// Find nearest cell on press
export const findNearestCell = (
  cells: HeatmapCell[],
  touchX: number,
  touchY: number
): HeatmapCell | null => {
  for (const cell of cells) {
    if (
      touchX >= cell.x &&
      touchX <= cell.x + cell.width &&
      touchY >= cell.y &&
      touchY <= cell.y + cell.height
    ) {
      return cell;
    }
  }
  return null;
};

// Generate legend gradient stops
export const generateLegendGradient = (
  colorScale: string[],
  valueRange: { min: number; max: number }
) => {
  const stops = [
    { offset: '0%', color: colorScale[0], value: valueRange.min },
    { offset: '50%', color: colorScale[1], value: (valueRange.min + valueRange.max) / 2 },
    { offset: '100%', color: colorScale[2], value: valueRange.max },
  ];

  return stops;
};
