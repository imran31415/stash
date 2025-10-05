import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  LayoutChangeEvent,
} from 'react-native';
import Svg, { Rect, Line, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import type { HeatmapProps, HeatmapDataPoint } from './Heatmap.types';
import {
  colors,
  getChartDimensions,
  extractUniqueValues,
  calculateValueRange,
  dataToHeatmapCells,
  formatValueLabel,
  formatAxisLabel,
  getPaginatedData,
  calculateTotalPages,
  findNearestCell,
  getColorScale,
  generateLegendGradient,
} from './Heatmap.utils';
import { streamingCallbackRegistry } from './StreamingCallbackRegistry';
import {
  borderRadius,
  spacing,
  typography,
  shadows,
  useResponsiveMode,
  useLayoutMeasurement,
} from './shared';

export const Heatmap: React.FC<HeatmapProps> = ({
  data,
  mode = 'full',
  title,
  subtitle,
  onExpandPress,
  onCellPress,
  height: customHeight,
  width: customWidth,
  pageSize,
  currentPage = 0,
  totalRows,
  onPageChange,
  showLegend = true,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  xAxisLabel,
  yAxisLabel,
  colorScale = 'blue',
  customColorScale,
  minValue,
  maxValue,
  autoScale = true,
  valueFormatter,
  xLabelFormatter,
  yLabelFormatter,
  enableLiveStreaming = false,
  maxDataPoints = 1000,
  streamingWindowSize = 500,
  onDataUpdate,
  showStreamingControls = true,
  onStreamingToggle,
  streamingPaused = false,
  streamingCallbackId,
}) => {
  const { isMini } = useResponsiveMode(mode);
  const { width: containerWidth, handleLayout } = useLayoutMeasurement(customWidth, customHeight);
  const [selectedCell, setSelectedCell] = useState<any>(null);
  const [internalPaused, setInternalPaused] = useState(false);

  // Use external paused state if provided, otherwise use internal
  const isPaused = streamingPaused !== undefined ? streamingPaused : internalPaused;

  // Live streaming state - use ref for fixed memory management
  const streamingDataRef = useRef<HeatmapDataPoint[]>(data);
  const [streamingData, setStreamingData] = useState<HeatmapDataPoint[]>(data);

  // Keep track of the data buffer with fixed size
  const maintainFixedMemory = useCallback(
    (newData: HeatmapDataPoint[]): HeatmapDataPoint[] => {
      return newData.slice(-maxDataPoints); // Keep only the last N points
    },
    [maxDataPoints]
  );

  // Update streaming data when data prop changes (e.g., WebSocket data arrives)
  useEffect(() => {
    if (enableLiveStreaming && !isPaused) {
      // Apply fixed memory constraint
      const constrainedData = maintainFixedMemory(data);
      streamingDataRef.current = constrainedData;
      setStreamingData(constrainedData);

      // Notify parent of data update
      onDataUpdate?.(constrainedData);
    }
  }, [data, enableLiveStreaming, isPaused, maintainFixedMemory, onDataUpdate]);

  // Handle streaming toggle
  const handleStreamingToggle = useCallback(() => {
    const newPausedState = !isPaused;
    if (streamingPaused === undefined) {
      setInternalPaused(newPausedState);
    }

    // Try callback registry first (for serialized messages), then direct callback
    if (streamingCallbackId) {
      streamingCallbackRegistry.call(streamingCallbackId, !newPausedState);
    } else {
      onStreamingToggle?.(!newPausedState);
    }
  }, [isPaused, streamingPaused, onStreamingToggle, streamingCallbackId]);

  // Use streaming data if enabled, otherwise use original data
  const activeData = enableLiveStreaming ? streamingData : data;

  // Extract unique values
  const { xValues: allXValues, yValues: allYValues } = useMemo(
    () => extractUniqueValues(activeData),
    [activeData]
  );

  // Apply pagination or streaming window
  const { data: paginatedData, yValues } = useMemo(() => {
    if (enableLiveStreaming) {
      // In streaming mode, show the most recent N points
      const recentData = activeData.slice(-streamingWindowSize);
      const { yValues: streamYValues } = extractUniqueValues(recentData);
      return { data: recentData, yValues: streamYValues };
    }
    return getPaginatedData(activeData, allYValues, pageSize, currentPage);
  }, [activeData, allYValues, pageSize, currentPage, enableLiveStreaming, streamingWindowSize]);

  const xValues = useMemo(() => {
    const { xValues: xVals } = extractUniqueValues(paginatedData);
    return xVals;
  }, [paginatedData]);

  // Get color scale
  const activeColorScale = useMemo(
    () => getColorScale(colorScale, customColorScale),
    [colorScale, customColorScale]
  );

  // Calculate dimensions
  const dimensions = useMemo(
    () =>
      containerWidth
        ? getChartDimensions(
            mode,
            containerWidth,
            customHeight,
            showLegend && !isMini,
            xValues.length,
            yValues.length
          )
        : null,
    [mode, containerWidth, customHeight, showLegend, isMini, xValues.length, yValues.length]
  );

  // Calculate value range
  const valueRange = useMemo(
    () => calculateValueRange(paginatedData, minValue, maxValue, autoScale),
    [paginatedData, minValue, maxValue, autoScale]
  );

  // Convert to heatmap cells
  const cells = useMemo(
    () =>
      dimensions
        ? dataToHeatmapCells(paginatedData, dimensions, xValues, yValues, valueRange, activeColorScale)
        : [],
    [paginatedData, dimensions, xValues, yValues, valueRange, activeColorScale]
  );

  // Calculate total pages
  const totalPages = useMemo(() => {
    if (!pageSize || !totalRows) return 1;
    return calculateTotalPages(totalRows, pageSize);
  }, [totalRows, pageSize]);

  const handleChartPress = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const nearestCell = findNearestCell(cells, locationX, locationY);

    if (nearestCell) {
      setSelectedCell(nearestCell);
      onCellPress?.(nearestCell.dataPoint);
    } else {
      setSelectedCell(null);
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

  const formatXLabel = (value: number | string): string => {
    return xLabelFormatter ? xLabelFormatter(value) : formatAxisLabel(value);
  };

  const formatYLabel = (value: number | string): string => {
    return yLabelFormatter ? yLabelFormatter(value) : formatAxisLabel(value);
  };

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
          accessibilityLabel="Expand heatmap"
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
          <Text style={styles.streamingStatsText}>{activeData.length || 0} points</Text>
          <Text style={styles.streamingStatsSeparator}>•</Text>
          <Text style={styles.streamingStatsText}>{streamingWindowSize} displayed</Text>
        </View>
      </View>
    );
  };

  const renderLegend = () => {
    if (!showLegend || isMini || !dimensions) return null;

    const legendStops = generateLegendGradient(activeColorScale, valueRange);
    const legendWidth = Math.min(dimensions.chartWidth, 300);
    const legendHeight = 20;

    return (
      <View style={styles.legend}>
        <Svg width={legendWidth} height={legendHeight + 30}>
          <Defs>
            <LinearGradient id="legendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              {legendStops.map((stop, index) => (
                <Stop key={index} offset={stop.offset} stopColor={stop.color} />
              ))}
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={legendWidth} height={legendHeight} fill="url(#legendGradient)" rx={4} />
          <SvgText x={0} y={legendHeight + 15} fontSize={10} fill={colors.text.secondary}>
            {formatValue(valueRange.min)}
          </SvgText>
          <SvgText
            x={legendWidth / 2}
            y={legendHeight + 15}
            fontSize={10}
            fill={colors.text.secondary}
            textAnchor="middle"
          >
            {formatValue((valueRange.min + valueRange.max) / 2)}
          </SvgText>
          <SvgText
            x={legendWidth}
            y={legendHeight + 15}
            fontSize={10}
            fill={colors.text.secondary}
            textAnchor="end"
          >
            {formatValue(valueRange.max)}
          </SvgText>
        </Svg>
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
              {/* Horizontal grid lines */}
              {yValues.map((_, index) => {
                const y = dimensions.paddingTop + index * dimensions.cellHeight;
                return (
                  <Line
                    key={`h-grid-${index}`}
                    x1={dimensions.paddingLeft}
                    y1={y}
                    x2={dimensions.paddingLeft + dimensions.chartWidth}
                    y2={y}
                    stroke={colors.border.light}
                    strokeWidth={1}
                  />
                );
              })}

              {/* Vertical grid lines */}
              {xValues.map((_, index) => {
                const x = dimensions.paddingLeft + index * dimensions.cellWidth;
                return (
                  <Line
                    key={`v-grid-${index}`}
                    x1={x}
                    y1={dimensions.paddingTop}
                    x2={x}
                    y2={dimensions.paddingTop + dimensions.chartHeight}
                    stroke={colors.border.light}
                    strokeWidth={1}
                  />
                );
              })}
            </>
          )}

          {/* Y-axis labels */}
          {showYAxis &&
            yValues.map((yVal, index) => {
              const y = dimensions.paddingTop + index * dimensions.cellHeight + dimensions.cellHeight / 2;
              return (
                <SvgText
                  key={`y-label-${index}`}
                  x={dimensions.paddingLeft - 8}
                  y={y + 4}
                  fontSize={isMini ? 10 : 12}
                  fill={colors.text.secondary}
                  textAnchor="end"
                >
                  {formatYLabel(yVal)}
                </SvgText>
              );
            })}

          {/* X-axis labels */}
          {showXAxis &&
            xValues.map((xVal, index) => {
              const x = dimensions.paddingLeft + index * dimensions.cellWidth + dimensions.cellWidth / 2;
              return (
                <SvgText
                  key={`x-label-${index}`}
                  x={x}
                  y={dimensions.paddingTop + dimensions.chartHeight + 20}
                  fontSize={isMini ? 10 : 12}
                  fill={colors.text.secondary}
                  textAnchor="middle"
                >
                  {formatXLabel(xVal)}
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

          {/* Heatmap cells */}
          {cells.map((cell, index) => (
            <Rect
              key={`cell-${index}`}
              x={cell.x}
              y={cell.y}
              width={cell.width}
              height={cell.height}
              fill={cell.color}
              stroke={colors.border.light}
              strokeWidth={0.5}
            />
          ))}

          {/* Selected cell highlight */}
          {selectedCell && (
            <Rect
              x={selectedCell.x}
              y={selectedCell.y}
              width={selectedCell.width}
              height={selectedCell.height}
              fill="transparent"
              stroke={colors.primary[500]}
              strokeWidth={3}
            />
          )}
        </Svg>
      </Pressable>
    );
  };

  const renderPagination = () => {
    if (isMini || !pageSize || !totalRows || totalPages <= 1) return null;

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
          style={[styles.paginationButton, currentPage === totalPages - 1 && styles.paginationButtonDisabled]}
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

  const renderSelectedCellInfo = () => {
    if (!selectedCell || isMini) return null;

    return (
      <View style={styles.selectedCellInfo}>
        <Text style={styles.selectedCellLabel}>
          X: {formatXLabel(selectedCell.dataPoint.x)} • Y: {formatYLabel(selectedCell.dataPoint.y)}
        </Text>
        <Text style={styles.selectedCellValue}>{formatValue(selectedCell.dataPoint.value)}</Text>
        {selectedCell.dataPoint.label && (
          <Text style={styles.selectedCellTime}>{selectedCell.dataPoint.label}</Text>
        )}
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
          maxWidth: isMini ? 800 : undefined,
          alignSelf: isMini ? 'flex-start' : 'stretch',
        },
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

          {renderSelectedCellInfo()}
          {renderPagination()}
        </>
      ) : (
        <View
          style={{
            height: customHeight || (isMini ? 200 : 400),
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.text.secondary }}>Loading heatmap...</Text>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
    marginBottom: spacing.xs,
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
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary[500],
    marginLeft: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
  legend: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.surface.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  chartScrollContent: {
    paddingVertical: spacing.sm,
  },
  selectedCellInfo: {
    padding: spacing.md,
    backgroundColor: colors.surface.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  selectedCellLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  selectedCellValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  selectedCellTime: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    gap: spacing.md,
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
    marginTop: spacing.xs,
    gap: spacing.xs,
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
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
    gap: spacing.sm,
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

export default Heatmap;
