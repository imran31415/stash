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
  const containerWidth = customWidth || measuredWidth || (isMini ? 350 : SCREEN_WIDTH - 32);
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

  const gridSpacing = config.spacing ?? spacing.md;
  const gridPadding = config.padding ?? spacing.sm;

  // Account for header height - use actual measured heights
  // Mini header with expand button: ~50px, Full header: ~70px, with description: ~110px
  const headerHeight = showHeader ? (isMini ? 50 : (config.description ? 110 : 70)) : 0;
  const availableGridHeight = containerHeight - headerHeight;

  // Render individual dashboard item
  const renderDashboardItem = (item: DashboardItemConfig) => {
    const { row, col, rowSpan = 1, colSpan = 1 } = item.gridPosition;

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
            {...(item.data as any)}
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
            {...(item.data as any)}
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
            {...(item.data as any)}
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
            {...(item.data as any)}
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
        </View>
      </Pressable>
    );
  };

  // Organize items into grid layout
  const gridLayout = useMemo(() => {
    const grid: (DashboardItemConfig | null | 'occupied')[][] = Array(gridDimensions.rows)
      .fill(null)
      .map(() => Array(gridDimensions.cols).fill(null));

    // Place items in grid
    config.items.forEach((item) => {
      const { row, col, rowSpan = 1, colSpan = 1 } = item.gridPosition;

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
  }, [config.items, gridDimensions]);

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
  const totalGridHeight = availableGridHeight - (gridPadding * 2);

  const dashboardContent = (
    <View
      style={[
        styles.gridContainer,
        {
          padding: gridPadding,
          backgroundColor: config.backgroundColor || colors.surface.secondary,
          width: containerWidth,
          height: availableGridHeight,
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
          width: customWidth || (isMini ? 350 : '100%'),
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
        <View style={{ height: availableGridHeight }}>
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
    flexGrow: 1,
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
});
