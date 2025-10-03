import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
  ScrollView,
} from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText } from 'react-native-svg';
import type { TimeSeriesChartProps } from './TimeSeriesChart.types';
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
}) => {
  const screenWidth = Dimensions.get('window').width;
  const isMini = mode === 'mini';
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  // Assign colors to series
  const coloredSeries = useMemo(() => assignSeriesColors(series), [series]);

  // Apply pagination
  const paginatedSeries = useMemo(
    () => getPaginatedData(coloredSeries, pageSize, currentPage),
    [coloredSeries, pageSize, currentPage]
  );

  // Calculate dimensions
  const dimensions = useMemo(
    () => getChartDimensions(mode, screenWidth - 32, customHeight, showLegend && !isMini),
    [mode, screenWidth, customHeight, showLegend, isMini]
  );

  // Calculate scales
  const yScale = useMemo(
    () => calculateYScale(paginatedSeries, minY, maxY, autoScale),
    [paginatedSeries, minY, maxY, autoScale]
  );

  const xScale = useMemo(() => calculateXScale(paginatedSeries), [paginatedSeries]);

  // Convert to screen coordinates
  const chartPoints = useMemo(
    () => dataToScreenCoordinates(paginatedSeries, dimensions, yScale, xScale),
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

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {title && <Text style={[styles.title, isMini && styles.titleMini]}>{title}</Text>}
        {subtitle && <Text style={[styles.subtitle, isMini && styles.subtitleMini]}>{subtitle}</Text>}
      </View>
      {isMini && onExpandPress && (
        <TouchableOpacity
          style={styles.expandButton}
          onPress={onExpandPress}
          accessibilityLabel="Expand chart"
          accessibilityRole="button"
        >
          <Text style={styles.expandButtonText}>⛶</Text>
        </TouchableOpacity>
      )}
    </View>
  );

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

  const renderChart = () => (
    <Pressable onPress={handleChartPress}>
      <Svg width={dimensions.width} height={dimensions.height}>
        {/* Grid lines */}
        {showGrid && (
          <>
            {/* Horizontal grid lines (Y-axis) */}
            {yScale.ticks.map((tick, index) => {
              const y =
                dimensions.paddingTop +
                dimensions.chartHeight -
                ((tick - yScale.min) / (yScale.max - yScale.min)) * dimensions.chartHeight;

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
            const y =
              dimensions.paddingTop +
              dimensions.chartHeight -
              ((tick - yScale.min) / (yScale.max - yScale.min)) * dimensions.chartHeight;

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
    <View style={[styles.container, isMini && styles.containerMini]}>
      {renderHeader()}
      {renderLegend()}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chartScrollContent}
      >
        {renderChart()}
      </ScrollView>

      {renderSelectedPointInfo()}
      {renderPagination()}
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
    padding: spacing[2],
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary[500],
    marginLeft: spacing[2],
  },
  expandButtonText: {
    fontSize: typography.fontSize.lg,
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
});

export default TimeSeriesChart;
