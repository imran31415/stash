import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Pressable,
  LayoutChangeEvent,
} from 'react-native';
import type { DashboardProps, DashboardItemConfig, DashboardGridSize } from './Dashboard.types';
import { TimeSeriesChart } from './TimeSeriesChart';
import { GanttChart } from './GanttChart';
import { GraphVisualization } from './GraphVisualization';
import { TaskList } from './TaskList';
import { ResourceList } from './ResourceList';
import { CodeBlock } from './CodeBlock';
import { Media } from './Media';
import { Heatmap } from './Heatmap';
import { Workflow } from './Workflow';
import { TreeView } from './TreeView';
import { KanbanBoard } from './KanbanBoard';
import { VideoStream } from './VideoStream';
import { LiveCameraStream } from './LiveCameraStream';
import { DataTable } from './DataTable';
import { FlameGraph } from './FlameGraph';
import { ComparisonTable } from './ComparisonTable';
import { SankeyDiagram } from './SankeyDiagram';
import { NetworkTopology } from './NetworkTopology';
import { FunnelChart } from './FunnelChart';
import { CalendarTimeline } from './CalendarTimeline';
import { FormBuilder } from './FormBuilder';
import {
  borderRadius,
  spacing,
  typography,
  useResponsiveMode,
} from './shared';

const SCREEN_WIDTH = Dimensions.get('window').width;

const colors = {
  surface: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
  },
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    tertiary: '#94A3B8',
  },
  border: {
    default: '#E2E8F0',
    light: '#F1F5F9',
  },
  primary: {
    500: '#3B82F6',
  },
};

// Helper to get grid dimensions from grid size
const getGridDimensions = (gridSize: DashboardGridSize, customGrid?: { rows: number; cols: number }) => {
  if (gridSize === 'custom' && customGrid) {
    return customGrid;
  }

  const mapping: Record<string, { rows: number; cols: number }> = {
    '1x1': { rows: 1, cols: 1 },
    '1x2': { rows: 1, cols: 2 },
    '2x1': { rows: 2, cols: 1 },
    '2x2': { rows: 2, cols: 2 },
    '3x3': { rows: 3, cols: 3 },
    '4x4': { rows: 4, cols: 4 },
  };

  return mapping[gridSize] || { rows: 2, cols: 2 };
};

// Helper to auto-position items that don't have explicit gridPosition
const autoPositionItems = (
  items: DashboardItemConfig[],
  gridDimensions: { rows: number; cols: number }
): DashboardItemConfig[] => {
  const grid: boolean[][] = Array(gridDimensions.rows)
    .fill(null)
    .map(() => Array(gridDimensions.cols).fill(false));

  return items.map((item) => {
    // If item already has gridPosition, use it and mark cells as occupied
    if (item.gridPosition) {
      const { row, col, rowSpan = 1, colSpan = 1 } = item.gridPosition;
      for (let r = row; r < Math.min(row + rowSpan, gridDimensions.rows); r++) {
        for (let c = col; c < Math.min(col + colSpan, gridDimensions.cols); c++) {
          grid[r][c] = true;
        }
      }
      return item;
    }

    // Auto-position: find next available cell
    for (let r = 0; r < gridDimensions.rows; r++) {
      for (let c = 0; c < gridDimensions.cols; c++) {
        if (!grid[r][c]) {
          grid[r][c] = true;
          return {
            ...item,
            gridPosition: { row: r, col: c, rowSpan: 1, colSpan: 1 },
          };
        }
      }
    }

    // No space found, place at 0,0 (will overlap)
    return {
      ...item,
      gridPosition: { row: 0, col: 0, rowSpan: 1, colSpan: 1 },
    };
  });
};

// Helper to calculate grid item dimensions
const calculateGridItemDimensions = (
  gridDimensions: { rows: number; cols: number },
  containerWidth: number,
  containerHeight: number,
  spacing: number,
  padding: number,
  rowSpan = 1,
  colSpan = 1
) => {
  // Account for padding on both sides
  const availableWidth = containerWidth - (padding * 2);
  const availableHeight = containerHeight - (padding * 2);

  // Calculate spacing between items (n-1 gaps for n items)
  const totalHorizontalSpacing = spacing * (gridDimensions.cols - 1);
  const totalVerticalSpacing = spacing * (gridDimensions.rows - 1);

  const cellWidth = (availableWidth - totalHorizontalSpacing) / gridDimensions.cols;
  const cellHeight = (availableHeight - totalVerticalSpacing) / gridDimensions.rows;

  const width = cellWidth * colSpan + spacing * (colSpan - 1);
  const height = cellHeight * rowSpan + spacing * (rowSpan - 1);

  return { width, height };
};

export const Dashboard: React.FC<DashboardProps> = ({
  config,
  mode = 'full',
  onItemPress,
  onItemLongPress,
  onExpandPress,
  height: customHeight,
  width: customWidth,
  showItemActions = true,
  scrollable = true,
  showHeader = true,
}) => {
  const isMini = mode === 'mini' || mode === 'preview';
  const isPreview = mode === 'preview';

  // Track actual container width via onLayout
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);

  // Calculate dimensions
  // In mini mode, use full available width (up to a max width for very large screens)
  const defaultMiniWidth = Math.min(measuredWidth || SCREEN_WIDTH - 32, 800);
  const containerWidth = customWidth || measuredWidth || (isMini ? defaultMiniWidth : SCREEN_WIDTH - 32);
  const containerHeight = customHeight || (isMini ? 400 : 600);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && !customWidth) {
      setMeasuredWidth(width);
    }
  };

  const gridDimensions = useMemo(
    () => getGridDimensions(config.gridSize, config.customGrid),
    [config.gridSize, config.customGrid]
  );

  // Auto-position items that don't have explicit gridPosition
  const positionedItems = useMemo(
    () => autoPositionItems(config.items, gridDimensions),
    [config.items, gridDimensions]
  );

  const gridSpacing = config.spacing ?? spacing.md;
  const gridPadding = config.padding ?? spacing.md;

  // Account for header height - calculated from actual styles
  // Header: paddingVertical (spacing.md * 2) + title height + subtitle (if present) + border
  // Mini: 24px (padding) + 12px (title) + 4px (subtitle margin if present) + 11px (subtitle) + 1px (border) ≈ 52px
  // Full: 24px (padding) + 14px (title) + 4px (subtitle margin if present) + 11px (subtitle) + 1px (border) ≈ 54px
  // Description: 16px (padding) + 20px (line height) + 1px (border) = 37px
  const baseHeaderHeight = isMini ? 52 : 54;
  const descriptionHeight = (!isMini && config.description) ? 37 : 0;
  const headerHeight = showHeader ? (baseHeaderHeight + descriptionHeight) : 0;
  const availableGridHeight = containerHeight - headerHeight;

  // Render individual dashboard item
  const renderDashboardItem = (item: DashboardItemConfig) => {
    // gridPosition is guaranteed by autoPositionItems
    const { row, col, rowSpan = 1, colSpan = 1 } = item.gridPosition!;

    const itemDimensions = calculateGridItemDimensions(
      gridDimensions,
      containerWidth,
      availableGridHeight,
      gridSpacing,
      gridPadding,
      rowSpan,
      colSpan
    );

    const itemMode = isMini ? 'mini' : 'full';

    let content: React.ReactNode = null;

    switch (item.type) {
      case 'time-series':
      case 'time-series-chart':
        // Force re-render when series data changes by including data length in key
        const seriesDataLength = (item.data as any).series?.[0]?.data?.length || 0;
        content = (
          <TimeSeriesChart
            key={`${item.id}-${seriesDataLength}`}
            {...(item.data as any)}
            mode={itemMode}
            height={itemDimensions.height}
            width={itemDimensions.width}
            onExpandPress={undefined} // Disable individual expand in dashboard
          />
        );
        break;

      case 'gantt-chart':
        content = (
          <GanttChart
            {...(item.data as any)}
            mode={itemMode}
            height={itemDimensions.height}
            width={itemDimensions.width}
            onExpandPress={undefined}
          />
        );
        break;

      case 'graph-visualization':
        content = (
          <GraphVisualization
            data={item.data as any}
            mode={itemMode}
            height={itemDimensions.height}
            width={itemDimensions.width}
            onExpandPress={undefined}
          />
        );
        break;

      case 'task-list':
        content = (
          <TaskList
            {...(item.data as any)}
            mode={itemMode}
            showExpandButton={false}
          />
        );
        break;

      case 'resource-list':
        content = (
          <ResourceList
            {...(item.data as any)}
            mode={itemMode}
          />
        );
        break;

      case 'code-block':
        content = (
          <CodeBlock
            {...(item.data as any)}
            mode={isPreview ? 'preview' : itemMode === 'mini' ? 'preview' : 'full'}
          />
        );
        break;

      case 'media':
        content = (
          <Media
            {...(item.data as any)}
            mode={itemMode}
          />
        );
        break;

      case 'heatmap':
        // Force re-render when data changes by including data length in key
        const heatmapDataLength = (item.data as any).data?.length || 0;
        content = (
          <Heatmap
            key={`${item.id}-${heatmapDataLength}`}
            {...(item.data as any)}
            mode={itemMode}
            height={itemDimensions.height}
            width={itemDimensions.width}
            onExpandPress={undefined}
          />
        );
        break;

      case 'workflow':
        content = (
          <Workflow
            data={item.data as any}
            mode={itemMode}
            height={itemDimensions.height}
            width={itemDimensions.width}
            onExpandPress={undefined}
          />
        );
        break;

      case 'tree-view':
        content = (
          <TreeView
            data={item.data as any}
            mode={itemMode}
            height={itemDimensions.height}
            width={itemDimensions.width}
            onExpandPress={undefined}
          />
        );
        break;

      case 'kanban-board':
        content = (
          <KanbanBoard
            data={item.data as any}
            mode={itemMode}
            height={itemDimensions.height}
            width={itemDimensions.width}
            onExpandPress={undefined}
          />
        );
        break;

      case 'video':
      case 'video-stream':
        content = (
          <VideoStream
            {...(item.data as any)}
            mode={itemMode}
            height={itemDimensions.height}
            width={itemDimensions.width}
            onExpandPress={undefined}
          />
        );
        break;

      case 'live-camera-stream':
        content = (
          <LiveCameraStream
            {...(item.data as any)}
            mode={itemMode}
            maxHeight={itemDimensions.height}
            maxWidth={itemDimensions.width}
          />
        );
        break;

      case 'stats':
        // Render stats grid
        const statsData = item.data as any;
        content = (
          <View style={styles.statsContainer}>
            {item.title && <Text style={styles.widgetTitle}>{item.title}</Text>}
            <View style={styles.statsGrid}>
              {statsData?.stats?.map((stat: any, index: number) => (
                <View key={index} style={styles.statItem}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  {stat.trend && (
                    <Text style={[styles.statTrend, { color: stat.trend === 'up' ? '#34C759' : stat.trend === 'down' ? '#FF3B30' : '#8E8E93' }]}>
                      {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→'} {stat.trendValue || ''}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        );
        break;

      case 'list':
        // Render simple list
        const listData = item.data as any;
        content = (
          <View style={styles.listContainer}>
            {item.title && <Text style={styles.widgetTitle}>{item.title}</Text>}
            <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
              {listData?.items?.map((listItem: any, index: number) => (
                <View key={listItem.id || index} style={styles.listItem}>
                  {listItem.icon && <Text style={styles.listItemIcon}>{listItem.icon}</Text>}
                  <Text style={styles.listItemLabel}>{listItem.label}</Text>
                  {listItem.value && <Text style={styles.listItemValue}>{listItem.value}</Text>}
                </View>
              ))}
            </ScrollView>
          </View>
        );
        break;

      case 'chart':
        // Render simple chart placeholder or pie/bar chart
        const chartData = item.data as any;
        // Support both 'segments' and 'series' arrays, with 'label' or 'name' property
        const chartItems = chartData?.segments || chartData?.series || [];
        const maxValue = chartItems.length > 0 ? Math.max(...chartItems.map((s: any) => s.value || 0)) : 100;

        content = (
          <View style={styles.chartContainer}>
            {item.title && <Text style={styles.widgetTitle}>{item.title}</Text>}
            <View style={styles.chartContent}>
              {chartData?.chartType === 'pie' && chartItems.length > 0 ? (
                <View style={styles.pieChart}>
                  {chartItems.map((segment: any, index: number) => (
                    <View key={index} style={styles.pieSegmentRow}>
                      <View style={[styles.pieSegmentColor, { backgroundColor: segment.color }]} />
                      <Text style={styles.pieSegmentLabel}>{segment.label || segment.name}</Text>
                      <Text style={styles.pieSegmentValue}>{segment.value}</Text>
                    </View>
                  ))}
                </View>
              ) : chartData?.chartType === 'bar' && chartItems.length > 0 ? (
                <View style={styles.barChart}>
                  {chartItems.map((bar: any, index: number) => (
                    <View key={index} style={styles.barRow}>
                      <Text style={styles.barLabel} numberOfLines={1}>{bar.label || bar.name}</Text>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              backgroundColor: bar.color || '#3B82F6',
                              width: `${(bar.value / maxValue) * 100}%`,
                            }
                          ]}
                        />
                      </View>
                      <Text style={styles.barValue}>{bar.value}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.chartPlaceholder}>📊 {chartData?.chartType || 'Chart'}</Text>
              )}
            </View>
          </View>
        );
        break;

      case 'timeline':
        // Render simple timeline
        const timelineData = item.data as any;
        content = (
          <View style={styles.timelineContainer}>
            {item.title && <Text style={styles.widgetTitle}>{item.title}</Text>}
            <ScrollView style={styles.timelineScroll} showsVerticalScrollIndicator={false}>
              {timelineData?.events?.map((event: any, index: number) => (
                <View key={event.id || index} style={styles.timelineItem}>
                  <View style={[styles.timelineDot, { backgroundColor: event.color || '#3B82F6' }]} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>{event.title}</Text>
                    {(event.time || event.description) && (
                      <Text style={styles.timelineTime}>{event.time || event.description}</Text>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        );
        break;

      case 'actions':
        // Render action buttons
        const actionsData = item.data as any;
        content = (
          <View style={styles.actionsContainer}>
            {item.title && <Text style={styles.widgetTitle}>{item.title}</Text>}
            <View style={styles.actionsGrid}>
              {actionsData?.actions?.map((action: any, index: number) => (
                <TouchableOpacity
                  key={action.id || index}
                  style={[styles.actionButton, { backgroundColor: action.color || '#3B82F6' }]}
                  onPress={() => onItemPress?.(item)}
                >
                  {action.icon && <Text style={styles.actionIcon}>{action.icon}</Text>}
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
        break;

      case 'data-table':
        content = (
          <DataTable
            {...(item.data as any)}
            mode={itemMode}
          />
        );
        break;

      case 'flame-graph':
        content = (
          <FlameGraph
            data={item.data as any}
            mode={isMini ? 'mini' : 'detail'}
            height={itemDimensions.height}
            onExpandPress={undefined}
          />
        );
        break;

      case 'comparison-table':
        content = (
          <ComparisonTable
            data={item.data as any}
            mode={itemMode}
            onExpandPress={undefined}
          />
        );
        break;

      case 'sankey-diagram':
        content = (
          <SankeyDiagram
            data={item.data as any}
            mode={itemMode}
            height={itemDimensions.height}
            width={itemDimensions.width}
            onExpandPress={undefined}
          />
        );
        break;

      case 'network-topology':
        content = (
          <NetworkTopology
            data={item.data as any}
            mode={itemMode}
            height={itemDimensions.height}
            width={itemDimensions.width}
            onExpandPress={undefined}
          />
        );
        break;

      case 'funnel-chart':
        content = (
          <FunnelChart
            data={item.data as any}
            mode={itemMode}
            height={itemDimensions.height}
            width={itemDimensions.width}
            onExpandPress={undefined}
          />
        );
        break;

      case 'calendar-timeline':
        content = (
          <CalendarTimeline
            data={item.data as any}
            mode={itemMode}
            height={itemDimensions.height}
            width={itemDimensions.width}
            onExpandPress={undefined}
          />
        );
        break;

      case 'form-builder':
        content = (
          <FormBuilder
            data={item.data as any}
            mode={itemMode}
            onExpandPress={undefined}
          />
        );
        break;

      case 'custom':
        content = item.customRenderer ? item.customRenderer() : null;
        break;

      default:
        content = (
          <View style={styles.unknownItem}>
            <Text style={styles.unknownItemText}>Unknown item type: {item.type}</Text>
          </View>
        );
    }

    // Calculate absolute position for this item
    const left = col * (itemDimensions.width + gridSpacing);
    const top = row * (itemDimensions.height + gridSpacing);

    // Check if this item type has a detail view available
    const hasDetailView = [
      'time-series', 'time-series-chart', 'gantt-chart', 'graph-visualization',
      'task-list', 'code-block', 'media', 'heatmap', 'workflow', 'tree-view',
      'kanban-board', 'data-table', 'comparison-table', 'sankey-diagram',
      'network-topology', 'funnel-chart', 'form-builder', 'video', 'video-stream',
      'stats', 'list', 'chart', 'timeline', 'resource-list', 'calendar-timeline'
    ].includes(item.type);

    return (
      <Pressable
        key={item.id}
        style={[
          styles.dashboardItem,
          {
            position: 'absolute',
            left,
            top,
            width: itemDimensions.width,
            height: itemDimensions.height,
          },
        ]}
        onPress={() => onItemPress?.(item)}
        onLongPress={() => onItemLongPress?.(item)}
      >
        <View style={styles.itemContainer}>
          {content}
          {/* Expand indicator for items with detail views */}
          {hasDetailView && onItemPress && (
            <View style={styles.expandIndicator}>
              <Text style={styles.expandIndicatorText}>⤢</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  // Organize items into grid layout
  const gridLayout = useMemo(() => {
    const grid: (DashboardItemConfig | null | 'occupied')[][] = Array(gridDimensions.rows)
      .fill(null)
      .map(() => Array(gridDimensions.cols).fill(null));

    // Place items in grid (using positionedItems which have guaranteed gridPosition)
    positionedItems.forEach((item) => {
      const { row, col, rowSpan = 1, colSpan = 1 } = item.gridPosition!;

      // Check bounds
      if (row >= gridDimensions.rows || col >= gridDimensions.cols) {
        // Item position out of bounds - skip rendering
        return;
      }

      // Mark all cells occupied by this item
      for (let r = row; r < Math.min(row + rowSpan, gridDimensions.rows); r++) {
        for (let c = col; c < Math.min(col + colSpan, gridDimensions.cols); c++) {
          if (r === row && c === col) {
            grid[r][c] = item;
          } else {
            grid[r][c] = 'occupied';
          }
        }
      }
    });

    return grid;
  }, [positionedItems, gridDimensions]);

  const renderGrid = () => {
    const items: React.ReactNode[] = [];

    gridLayout.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell && cell !== 'occupied') {
          items.push(renderDashboardItem(cell as DashboardItemConfig));
        }
      });
    });

    return items;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={[styles.title, isMini && styles.titleMini]}>{config.title}</Text>
        {config.subtitle && (
          <Text style={[styles.subtitle, isMini && styles.subtitleMini]}>{config.subtitle}</Text>
        )}
      </View>
      {isMini && onExpandPress && (
        <TouchableOpacity style={styles.expandButton} onPress={onExpandPress}>
          <Text style={styles.expandButtonText}>👁️ Expand</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Calculate total grid dimensions for absolute positioning
  const totalGridWidth = containerWidth - (gridPadding * 2);

  // Calculate the actual content height needed for the grid
  // The available height already accounts for header, so we just need the grid area
  const cellHeight = (availableGridHeight - (gridPadding * 2) - (gridSpacing * (gridDimensions.rows - 1))) / gridDimensions.rows;
  const actualContentHeight = (cellHeight * gridDimensions.rows) + (gridSpacing * (gridDimensions.rows - 1)) + (gridPadding * 2);

  const dashboardContent = (
    <View
      style={[
        styles.gridContainer,
        {
          padding: gridPadding,
          backgroundColor: config.backgroundColor || colors.surface.secondary,
          width: containerWidth,
          height: actualContentHeight,
          position: 'relative',
        },
      ]}
    >
      {renderGrid()}
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          height: containerHeight,
          width: customWidth || '100%',
          maxWidth: isMini ? 800 : undefined,
          alignSelf: isMini ? 'flex-start' : 'stretch'
        },
      ]}
      onLayout={handleLayout}
    >
      {showHeader && renderHeader()}
      {showHeader && config.description && !isMini && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{config.description}</Text>
        </View>
      )}
      {scrollable ? (
        <ScrollView
          style={[styles.scrollContainer, { height: availableGridHeight }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={!isMini}
          showsHorizontalScrollIndicator={false}
        >
          {dashboardContent}
        </ScrollView>
      ) : (
        <View style={[styles.nonScrollContainer, { height: availableGridHeight }]}>
          {dashboardContent}
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
    borderWidth: 1,
    borderColor: colors.border.default,
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
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  titleMini: {
    fontSize: typography.fontSize.base,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  subtitleMini: {
    fontSize: typography.fontSize.xs,
  },
  descriptionContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  expandButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary[500],
    marginLeft: spacing.sm,
  },
  expandButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.surface.primary,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    // No flexGrow to prevent extra spacing
  },
  nonScrollContainer: {
    overflow: 'hidden',
  },
  gridContainer: {
    // Using absolute positioning for grid items, so no flex needed
  },
  dashboardItem: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  itemContainer: {
    flex: 1,
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  expandIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandIndicatorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  videoPlaceholder: {
    flex: 1,
    backgroundColor: colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  videoPlaceholderText: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  videoPlaceholderTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  unknownItem: {
    flex: 1,
    backgroundColor: colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  unknownItemText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  // Widget title style (shared across simple widget types)
  widgetTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  // Stats widget styles
  statsContainer: {
    flex: 1,
    backgroundColor: colors.surface.primary,
  },
  statsGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  statItem: {
    flex: 1,
    minWidth: 80,
    backgroundColor: colors.surface.secondary,
    borderRadius: borderRadius.base,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  statTrend: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.xs,
  },
  // List widget styles
  listContainer: {
    flex: 1,
    backgroundColor: colors.surface.primary,
  },
  listScroll: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  listItemIcon: {
    fontSize: 18,
    marginRight: spacing.md,
  },
  listItemLabel: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  listItemValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[500],
  },
  // Chart widget styles
  chartContainer: {
    flex: 1,
    backgroundColor: colors.surface.primary,
  },
  chartContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  pieChart: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  pieSegmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  pieSegmentColor: {
    width: 14,
    height: 14,
    borderRadius: 3,
    marginRight: spacing.md,
  },
  pieSegmentLabel: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  pieSegmentValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  chartPlaceholder: {
    fontSize: 24,
    color: colors.text.tertiary,
  },
  // Bar chart styles
  barChart: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  barLabel: {
    width: 80,
    fontSize: typography.fontSize.xs,
    color: colors.text.primary,
  },
  barTrack: {
    flex: 1,
    height: 16,
    backgroundColor: colors.border.light,
    borderRadius: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 8,
  },
  barValue: {
    width: 36,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    textAlign: 'right',
  },
  // Timeline widget styles
  timelineContainer: {
    flex: 1,
    backgroundColor: colors.surface.primary,
  },
  timelineScroll: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
    marginTop: 3,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  timelineTime: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 4,
  },
  // Actions widget styles
  actionsContainer: {
    flex: 1,
    backgroundColor: colors.surface.primary,
  },
  actionsGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.base,
    minWidth: 90,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  actionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.surface.primary,
  },
});
