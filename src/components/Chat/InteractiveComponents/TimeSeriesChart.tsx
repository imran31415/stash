import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
  ScrollView,
  LayoutChangeEvent,
} from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText } from 'react-native-svg';
import type { TimeSeriesChartProps, TimeSeriesSeries } from './TimeSeriesChart.types';
import {
  colors,
  getChartDimensions,
  assignSeriesColors,
  getPaginatedData,
  calculateYScale,
  calculateXScale,
  dataToScreenCoordinates,
  generateLinePath,
  formatDateLabel,
  formatValueLabel,
  calculateTotalPages,
  findNearestPoint,
  generateXAxisTicks,
} from './TimeSeriesChart.utils';
import { streamingCallbackRegistry } from './StreamingCallbackRegistry';

const borderRadius = {
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
};

const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
};

const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
  },
  fontWeight: {
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
};

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  series,
  mode = 'full',
  title,
  subtitle,
  onExpandPress,
  onDataPointPress,
  height: customHeight,
  width: customWidth,
  pageSize,
  currentPage = 0,
  totalDataPoints,
  onPageChange,
  showLegend = true,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  xAxisLabel,
  yAxisLabel,
  valueFormatter,
  dateFormatter,
  minY,
  maxY,
  autoScale = true,
  enableLiveStreaming = false,
  maxDataPoints = 100,
  streamingWindowSize = 50,
  onDataUpdate,
  showStreamingControls = true,
  onStreamingToggle,
  streamingPaused = false,
  streamingCallbackId,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const isMini = mode === 'mini';
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [internalPaused, setInternalPaused] = useState(false);

  // Track actual container width via onLayout
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);

  // Calculate container width - only use measured or custom width
  const containerWidth = customWidth || measuredWidth;

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && !customWidth && width !== measuredWidth) {
      setMeasuredWidth(width);
    }
  };

  // Use external paused state if provided, otherwise use internal
  const isPaused = streamingPaused !== undefined ? streamingPaused : internalPaused;

  // Live streaming state - use ref for fixed memory management
  const streamingDataRef = useRef<TimeSeriesSeries[]>(series);
  const [streamingSeries, setStreamingSeries] = useState<TimeSeriesSeries[]>(series);

  // Keep track of the data buffer with fixed size
  const maintainFixedMemory = useCallback((newSeries: TimeSeriesSeries[]): TimeSeriesSeries[] => {
    return newSeries.map(s => ({
      ...s,
      data: s.data.slice(-maxDataPoints), // Keep only the last N points
    }));
  }, [maxDataPoints]);

  // Update streaming data when series prop changes (e.g., WebSocket data arrives)
  useEffect(() => {
    if (enableLiveStreaming && !isPaused) {
      // Apply fixed memory constraint
      const constrainedSeries = maintainFixedMemory(series);
      streamingDataRef.current = constrainedSeries;
      setStreamingSeries(constrainedSeries);

      // Notify parent of data update
      onDataUpdate?.(constrainedSeries);
    }
  }, [series, enableLiveStreaming, isPaused, maintainFixedMemory, onDataUpdate]);

  // Handle streaming toggle
  const handleStreamingToggle = useCallback(() => {
    console.log('[TimeSeriesChart] Toggle button clicked, isPaused:', isPaused, 'callbackId:', streamingCallbackId);
    const newPausedState = !isPaused;
    if (streamingPaused === undefined) {
      setInternalPaused(newPausedState);
    }

    // Try callback registry first (for serialized messages), then direct callback
    if (streamingCallbackId) {
      const called = streamingCallbackRegistry.call(streamingCallbackId, !newPausedState);
      console.log('[TimeSeriesChart] Callback registry call result:', called, 'streaming value:', !newPausedState);
    } else {
      console.log('[TimeSeriesChart] Using direct callback');
      onStreamingToggle?.(!newPausedState);
    }
  }, [isPaused, streamingPaused, onStreamingToggle, streamingCallbackId]);

  // Use streaming series if enabled, otherwise use original series
  const activeSeries = enableLiveStreaming ? streamingSeries : series;

  // Assign colors to series
  const coloredSeries = useMemo(() => assignSeriesColors(activeSeries), [activeSeries]);

  // Apply pagination or streaming window
  const paginatedSeries = useMemo(() => {
    if (enableLiveStreaming) {
      // In streaming mode, show the most recent N points
      return coloredSeries.map(s => ({
        ...s,
        data: s.data.slice(-streamingWindowSize),
      }));
    }
    return getPaginatedData(coloredSeries, pageSize, currentPage);
  }, [coloredSeries, pageSize, currentPage, enableLiveStreaming, streamingWindowSize]);

  // Calculate dimensions
  const dimensions = useMemo(
    () => containerWidth ? getChartDimensions(mode, containerWidth, customHeight, showLegend && !isMini) : null,
    [mode, containerWidth, customHeight, showLegend, isMini]
  );

  // Calculate scales
  const yScale = useMemo(
    () => dimensions ? calculateYScale(paginatedSeries, minY, maxY, autoScale) : { min: 0, max: 100, step: 10, ticks: [] },
    [paginatedSeries, minY, maxY, autoScale, dimensions]
  );

  const xScale = useMemo(() => dimensions ? calculateXScale(paginatedSeries) : { minDate: new Date(), maxDate: new Date(), range: 0 }, [paginatedSeries, dimensions]);

  // Convert to screen coordinates
  const chartPoints = useMemo(
    () => (dimensions ? dataToScreenCoordinates(paginatedSeries, dimensions, yScale, xScale) : []),
    [paginatedSeries, dimensions, yScale, xScale]
  );

  // Generate X-axis ticks
  const xAxisTicks = useMemo(
    () => generateXAxisTicks(xScale.minDate, xScale.maxDate, isMini ? 3 : 5),
    [xScale, isMini]
  );

  // Calculate total pages
  const totalPages = useMemo(() => {
    if (!pageSize || !totalDataPoints) return 1;
    return calculateTotalPages(totalDataPoints, pageSize);
  }, [totalDataPoints, pageSize]);

  const handleChartPress = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const nearestPoint = findNearestPoint(chartPoints, locationX, locationY);

    if (nearestPoint) {
      setSelectedPoint(nearestPoint);
      onDataPointPress?.(nearestPoint.dataPoint, nearestPoint.series);
    } else {
      setSelectedPoint(null);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      onPageChange?.(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      onPageChange?.(currentPage + 1);
    }
  };

  const formatValue = (value: number): string => {
    return valueFormatter ? valueFormatter(value) : formatValueLabel(value);
  };

  const formatDate = (date: Date): string => {
    return dateFormatter ? dateFormatter(date) : formatDateLabel(date, xScale.range);
  };

  // Helper to safely calculate Y position from value (handles zero range)
  const getYPosition = useCallback((value: number): number => {
    if (!dimensions) return 0;
    const yRange = yScale.max - yScale.min;
    const yRatio = yRange > 0 ? (value - yScale.min) / yRange : 0.5;
    return dimensions.paddingTop + dimensions.chartHeight - yRatio * dimensions.chartHeight;
  }, [yScale, dimensions]);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {title && <Text style={[styles.title, isMini && styles.titleMini]}>{title}</Text>}
        {subtitle && <Text style={[styles.subtitle, isMini && styles.subtitleMini]}>{subtitle}</Text>}
        {enableLiveStreaming && (
          <View style={styles.liveIndicator}>
            <View style={[styles.liveDot, isPaused && styles.liveDotPaused]} />
            <Text style={[styles.liveText, isPaused && styles.liveTextPaused]}>
              {isPaused ? 'PAUSED' : 'LIVE'}
            </Text>
          </View>
        )}
      </View>
      {onExpandPress && (
        <TouchableOpacity
          style={styles.expandButton}
          onPress={onExpandPress}
          accessibilityLabel="Expand chart"
          accessibilityRole="button"
        >
          <Text style={styles.expandButtonText}>👁️ Expand</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderStreamingControls = () => {
    if (!enableLiveStreaming || !showStreamingControls) return null;

    return (
      <View style={styles.streamingControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleStreamingToggle}
          accessibilityLabel={isPaused ? 'Resume streaming' : 'Pause streaming'}
          accessibilityRole="button"
        >
          <Text style={styles.controlButtonIcon}>{isPaused ? '▶️' : '⏸'}</Text>
          <Text style={styles.controlButtonText}>{isPaused ? 'Resume' : 'Pause'}</Text>
        </TouchableOpacity>
        <View style={styles.streamingStats}>
          <Text style={styles.streamingStatsText}>
            {activeSeries[0]?.data.length || 0} points
          </Text>
          <Text style={styles.streamingStatsSeparator}>•</Text>
          <Text style={styles.streamingStatsText}>
            {streamingWindowSize} displayed
          </Text>
        </View>
      </View>
    );
  };

  const renderLegend = () => {
    if (!showLegend || isMini) return null;

    return (
      <View style={styles.legend}>
        {coloredSeries.map((s) => (
          <View key={s.id} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: s.color }]} />
            <Text style={styles.legendText} numberOfLines={1}>
              {s.name}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderChart = () => {
    if (!dimensions) return null;

    return (
    <Pressable onPress={handleChartPress}>
      <Svg width={dimensions.width} height={dimensions.height}>
        {/* Grid lines */}
        {showGrid && (
          <>
            {/* Horizontal grid lines (Y-axis) */}
            {yScale.ticks.map((tick, index) => {
              const y = getYPosition(tick);

              return (
                <Line
                  key={`h-grid-${index}`}
                  x1={dimensions.paddingLeft}
                  y1={y}
                  x2={dimensions.paddingLeft + dimensions.chartWidth}
                  y2={y}
                  stroke={index === 0 ? colors.border.medium : colors.gridLight}
                  strokeWidth={index === 0 ? 1.5 : 1}
                  strokeDasharray={index === 0 ? '0' : '4 4'}
                />
              );
            })}

            {/* Vertical grid lines (X-axis) */}
            {xAxisTicks.map((tick, index) => {
              const timeDiff = tick.getTime() - xScale.minDate.getTime();
              const xRatio = xScale.range > 0 ? timeDiff / xScale.range : 0;
              const x = dimensions.paddingLeft + xRatio * dimensions.chartWidth;

              return (
                <Line
                  key={`v-grid-${index}`}
                  x1={x}
                  y1={dimensions.paddingTop}
                  x2={x}
                  y2={dimensions.paddingTop + dimensions.chartHeight}
                  stroke={colors.gridLight}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
              );
            })}
          </>
        )}

        {/* Y-axis labels */}
        {showYAxis &&
          yScale.ticks.map((tick, index) => {
            const y = getYPosition(tick);

            return (
              <SvgText
                key={`y-label-${index}`}
                x={dimensions.paddingLeft - 8}
                y={y + 4}
                fontSize={isMini ? 10 : 12}
                fill={colors.text.secondary}
                textAnchor="end"
              >
                {formatValue(tick)}
              </SvgText>
            );
          })}

        {/* X-axis labels */}
        {showXAxis &&
          xAxisTicks.map((tick, index) => {
            const timeDiff = tick.getTime() - xScale.minDate.getTime();
            const xRatio = xScale.range > 0 ? timeDiff / xScale.range : 0;
            const x = dimensions.paddingLeft + xRatio * dimensions.chartWidth;

            return (
              <SvgText
                key={`x-label-${index}`}
                x={x}
                y={dimensions.paddingTop + dimensions.chartHeight + 20}
                fontSize={isMini ? 10 : 12}
                fill={colors.text.secondary}
                textAnchor="middle"
              >
                {formatDate(tick)}
              </SvgText>
            );
          })}

        {/* Axis labels */}
        {!isMini && yAxisLabel && (
          <SvgText
            x={12}
            y={dimensions.paddingTop + dimensions.chartHeight / 2}
            fontSize={12}
            fill={colors.text.secondary}
            textAnchor="middle"
            transform={`rotate(-90, 12, ${dimensions.paddingTop + dimensions.chartHeight / 2})`}
          >
            {yAxisLabel}
          </SvgText>
        )}

        {!isMini && xAxisLabel && (
          <SvgText
            x={dimensions.paddingLeft + dimensions.chartWidth / 2}
            y={dimensions.height - 8}
            fontSize={12}
            fill={colors.text.secondary}
            textAnchor="middle"
          >
            {xAxisLabel}
          </SvgText>
        )}

        {/* Data lines */}
        {chartPoints.map((seriesPoints, seriesIndex) => {
          if (seriesPoints.length === 0) return null;

          const path = generateLinePath(seriesPoints);
          const series = coloredSeries[seriesIndex];

          return (
            <Path
              key={`line-${series.id}`}
              d={path}
              stroke={series.color}
              strokeWidth={series.lineWidth || (isMini ? 2 : 3)}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {/* Data points */}
        {!isMini &&
          chartPoints.map((seriesPoints, seriesIndex) => {
            const series = coloredSeries[seriesIndex];
            if (series.showPoints === false) return null;

            return seriesPoints.map((point, pointIndex) => (
              <Circle
                key={`point-${series.id}-${pointIndex}`}
                cx={point.x}
                cy={point.y}
                r={series.pointRadius || 4}
                fill={series.color}
                stroke={colors.surface.primary}
                strokeWidth={2}
              />
            ));
          })}

        {/* Selected point highlight */}
        {selectedPoint && (
          <>
            <Circle
              cx={selectedPoint.x}
              cy={selectedPoint.y}
              r={8}
              fill={selectedPoint.series.color}
              opacity={0.3}
            />
            <Circle
              cx={selectedPoint.x}
              cy={selectedPoint.y}
              r={5}
              fill={selectedPoint.series.color}
              stroke={colors.surface.primary}
              strokeWidth={2}
            />
          </>
        )}
      </Svg>
    </Pressable>
    );
  };

  const renderPagination = () => {
    // Hide pagination in mini mode - users should expand to detail view for pagination
    if (isMini || !pageSize || !totalDataPoints || totalPages <= 1) return null;

    return (
      <View style={styles.pagination}>
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === 0 && styles.paginationButtonDisabled]}
          onPress={handlePreviousPage}
          disabled={currentPage === 0}
        >
          <Text style={[styles.paginationButtonText, currentPage === 0 && styles.paginationButtonTextDisabled]}>
            ‹
          </Text>
        </TouchableOpacity>

        <Text style={styles.paginationText}>
          Page {currentPage + 1} of {totalPages}
        </Text>

        <TouchableOpacity
          style={[
            styles.paginationButton,
            currentPage === totalPages - 1 && styles.paginationButtonDisabled,
          ]}
          onPress={handleNextPage}
          disabled={currentPage === totalPages - 1}
        >
          <Text
            style={[
              styles.paginationButtonText,
              currentPage === totalPages - 1 && styles.paginationButtonTextDisabled,
            ]}
          >
            ›
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSelectedPointInfo = () => {
    if (!selectedPoint || isMini) return null;

    return (
      <View style={styles.selectedPointInfo}>
        <Text style={styles.selectedPointSeries}>{selectedPoint.series.name}</Text>
        <Text style={styles.selectedPointValue}>
          {formatValue(selectedPoint.dataPoint.value)}
        </Text>
        <Text style={styles.selectedPointTime}>
          {formatDate(selectedPoint.dataPoint.timestamp)}
        </Text>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        isMini && styles.containerMini,
        {
          width: customWidth || '100%',
          maxWidth: '100%',
          alignSelf: 'stretch'
        }
      ]}
      onLayout={handleLayout}
    >
      {renderHeader()}
      {renderStreamingControls()}
      {renderLegend()}

      {containerWidth ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chartScrollContent}
          >
            {renderChart()}
          </ScrollView>

          {renderSelectedPointInfo()}
          {renderPagination()}
        </>
      ) : (
        <View style={{ height: customHeight || (isMini ? 200 : 400), justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.text.secondary }}>Loading chart...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  containerMini: {
    borderRadius: borderRadius.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    backgroundColor: colors.surface.secondary,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  titleMini: {
    fontSize: typography.fontSize.base,
    marginBottom: 0,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  subtitleMini: {
    fontSize: typography.fontSize.xs,
  },
  expandButton: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary[500],
    marginLeft: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    gap: spacing[3],
    backgroundColor: colors.surface.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 3,
    borderRadius: borderRadius.sm,
    marginRight: spacing[2],
  },
  legendText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    maxWidth: 100,
  },
  chartScrollContent: {
    paddingVertical: spacing[2],
  },
  selectedPointInfo: {
    padding: spacing[3],
    backgroundColor: colors.surface.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  selectedPointSeries: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  selectedPointValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  selectedPointTime: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.surface.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    gap: spacing[3],
  },
  paginationButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationButtonDisabled: {
    backgroundColor: colors.border.light,
  },
  paginationButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.inverse,
  },
  paginationButtonTextDisabled: {
    color: colors.text.tertiary,
  },
  paginationText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    minWidth: 100,
    textAlign: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[1],
    gap: spacing[1],
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  liveDotPaused: {
    backgroundColor: '#F59E0B',
  },
  liveText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: '#EF4444',
    letterSpacing: 0.5,
  },
  liveTextPaused: {
    color: '#F59E0B',
  },
  streamingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.surface.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary[500],
  },
  controlButtonIcon: {
    fontSize: typography.fontSize.base,
  },
  controlButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
  streamingStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  streamingStatsText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  streamingStatsSeparator: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
});

export default TimeSeriesChart;
