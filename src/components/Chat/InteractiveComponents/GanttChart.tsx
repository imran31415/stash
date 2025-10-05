import React, { useMemo, useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Dimensions,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import type { GanttChartProps, GanttTask } from './GanttChart.types';
import {
  colors,
  calculateDateRange,
  generateTimelineCells,
  calculateTaskBars,
  getChartDimensions,
  getTaskColor,
  formatHeaderDate,
  formatDateRange,
  getStatusIcon,
  formatProgress,
  getTaskDuration,
  calculateMilestonePosition,
  sortTasksByStartDate,
} from './GanttChart.utils';

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
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
};

export const GanttChart: React.FC<GanttChartProps> = ({
  tasks,
  startDate: providedStartDate,
  endDate: providedEndDate,
  mode = 'full',
  onTaskPress,
  onTaskLongPress,
  onMilestonePress,
  onExpandPress,
  onTaskSelect,
  selectedTaskId,
  showProgress = true,
  showDependencies = false,
  showMilestones = true,
  showToday = true,
  timeScale = 'day',
  height: customHeight,
  width: customWidth,
  title,
  subtitle,
  enablePagination = false,
  itemsPerPage = 10,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const scrollViewRef = useRef<ScrollView>(null);
  const isMini = mode === 'mini';

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);

  // Sort tasks by start date
  const sortedTasks = useMemo(() => sortTasksByStartDate(tasks), [tasks]);

  // Paginated tasks
  const paginatedTasks = useMemo(() => {
    if (!enablePagination || isMini) {
      return sortedTasks;
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedTasks.slice(startIndex, endIndex);
  }, [sortedTasks, enablePagination, isMini, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    if (!enablePagination || isMini) return 1;
    return Math.ceil(sortedTasks.length / itemsPerPage);
  }, [sortedTasks.length, enablePagination, isMini, itemsPerPage]);

  // Reset to page 1 when tasks change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [tasks]);

  // Calculate date range
  const { startDate, endDate } = useMemo(
    () => calculateDateRange(sortedTasks, providedStartDate, providedEndDate),
    [sortedTasks, providedStartDate, providedEndDate]
  );

  // Generate timeline cells
  const timelineCells = useMemo(
    () => generateTimelineCells(startDate, endDate, timeScale),
    [startDate, endDate, timeScale]
  );

  // Get chart dimensions
  const dimensions = useMemo(
    () => getChartDimensions(mode, customWidth || screenWidth, paginatedTasks.length, customHeight),
    [mode, customWidth, screenWidth, paginatedTasks.length, customHeight]
  );

  // Calculate total width of timeline
  const timelineWidth = timelineCells.length * dimensions.cellWidth;

  // Calculate task bars
  const taskBars = useMemo(
    () => calculateTaskBars(paginatedTasks, startDate, endDate),
    [paginatedTasks, startDate, endDate]
  );

  // Auto-scroll to selected task when selectedTaskId changes
  useEffect(() => {
    if (selectedTaskId && scrollViewRef.current && !isMini) {
      const taskBar = taskBars.find((tb) => tb.task.id === selectedTaskId);
      if (taskBar) {
        const scrollX = (taskBar.left / 100) * timelineWidth;
        const offset = Math.max(0, scrollX - 100);
        scrollViewRef.current.scrollTo({ x: offset, animated: true });
      }
    }
  }, [selectedTaskId, taskBars, timelineWidth, isMini]);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {title && (
          <Text style={[styles.title, isMini && styles.titleMini]}>{title}</Text>
        )}
        {subtitle && (
          <Text style={[styles.subtitle, isMini && styles.subtitleMini]}>{subtitle}</Text>
        )}
        {!title && !subtitle && (
          <Text style={[styles.subtitle, isMini && styles.subtitleMini]}>
            {formatDateRange(startDate, endDate)}
          </Text>
        )}
      </View>
      {mode !== 'full' && onExpandPress && (
        <TouchableOpacity
          style={styles.expandButton}
          onPress={onExpandPress}
          accessibilityLabel="Expand Gantt chart"
          accessibilityRole="button"
        >
          <Text style={styles.expandButtonText}>👁️ Expand</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderTimelineHeader = () => (
    <View
      style={[
        styles.timelineHeader,
        { height: dimensions.headerHeight, minWidth: timelineWidth },
      ]}
    >
      {timelineCells.map((cell, index) => (
        <View
          key={`header-${index}`}
          style={[
            styles.timelineHeaderCell,
            {
              width: dimensions.cellWidth,
              backgroundColor: cell.isToday
                ? colors.accent[50]
                : cell.isWeekend
                ? colors.neutral[50]
                : colors.surface.primary,
            },
            cell.isFirstOfMonth && styles.timelineHeaderCellBorder,
          ]}
        >
          <Text
            style={[
              styles.timelineHeaderText,
              isMini && styles.timelineHeaderTextMini,
              cell.isToday && styles.timelineHeaderTextToday,
            ]}
            numberOfLines={1}
          >
            {formatHeaderDate(cell.date, timeScale)}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderTaskSidebar = (task: GanttTask, index: number) => {
    const taskColor = getTaskColor(task);
    const statusIcon = getStatusIcon(task.status);
    const isSelected = task.id === selectedTaskId;

    const handleSidebarPress = () => {
      onTaskSelect?.(task);
    };

    return (
      <Pressable
        key={`sidebar-${task.id}`}
        style={[
          styles.taskSidebar,
          {
            width: dimensions.sidebarWidth,
            height: dimensions.rowHeight,
          },
          isSelected && styles.taskSidebarSelected,
        ]}
        onPress={handleSidebarPress}
        accessibilityLabel={`Select task: ${task.title}`}
        accessibilityRole="button"
      >
        <View style={styles.taskSidebarContent}>
          <View style={styles.taskSidebarTop}>
            <Text
              style={[styles.taskStatusIcon, { color: taskColor.border }]}
              numberOfLines={1}
            >
              {statusIcon}
            </Text>
            <Text
              style={[styles.taskTitle, isMini && styles.taskTitleMini]}
              numberOfLines={1}
            >
              {task.title}
            </Text>
          </View>
          {!isMini && (
            <Text style={styles.taskDuration} numberOfLines={1}>
              {getTaskDuration(task)}
            </Text>
          )}
        </View>
      </Pressable>
    );
  };

  const renderTaskBar = (taskBar: typeof taskBars[0]) => {
    const { task, left, width } = taskBar;
    const taskColor = getTaskColor(task);
    const isSelected = task.id === selectedTaskId;

    const handlePress = () => {
      onTaskSelect?.(task);
      onTaskPress?.(task);
    };

    const handleLongPress = () => {
      onTaskLongPress?.(task);
    };

    return (
      <Pressable
        key={`task-${task.id}`}
        style={[
          styles.taskBar,
          {
            left: `${left}%`,
            width: `${width}%`,
            height: dimensions.taskBarHeight,
            backgroundColor: taskColor.background,
            borderColor: taskColor.border,
            top: taskBar.row * dimensions.rowHeight + (dimensions.rowHeight - dimensions.taskBarHeight) / 2,
          },
        ]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        accessibilityLabel={`Task: ${task.title}`}
        accessibilityHint={`Status: ${task.status}, Progress: ${task.progress}%`}
        accessibilityRole="button"
      >
        {showProgress && task.progress > 0 && (
          <View
            style={[
              styles.taskProgress,
              {
                width: `${task.progress}%`,
                backgroundColor: taskColor.progress,
              },
            ]}
          />
        )}
        {!isMini && (
          <View style={styles.taskBarContent}>
            <Text style={styles.taskBarText} numberOfLines={1}>
              {task.title}
            </Text>
            {showProgress && (
              <Text style={styles.taskProgressText}>{formatProgress(task.progress)}</Text>
            )}
          </View>
        )}
      </Pressable>
    );
  };

  const renderMilestones = (task: GanttTask, rowIndex: number) => {
    if (!showMilestones || !task.milestones || task.milestones.length === 0) {
      return null;
    }

    return task.milestones.map((milestone) => {
      const position = calculateMilestonePosition(milestone.date, startDate, endDate);

      return (
        <Pressable
          key={`milestone-${milestone.id}`}
          style={[
            styles.milestone,
            {
              left: `${position}%`,
              top: rowIndex * dimensions.rowHeight + dimensions.rowHeight / 2,
            },
            milestone.completed && styles.milestoneCompleted,
          ]}
          onPress={() => onMilestonePress?.(milestone, task)}
          accessibilityLabel={`Milestone: ${milestone.title}`}
          accessibilityRole="button"
        >
          <View
            style={[
              styles.milestoneDiamond,
              milestone.completed && styles.milestoneDiamondCompleted,
            ]}
          />
          {!isMini && (
            <Text style={styles.milestoneText} numberOfLines={1}>
              {milestone.title}
            </Text>
          )}
        </Pressable>
      );
    });
  };

  const renderTodayLine = () => {
    if (!showToday) return null;

    const todayCell = timelineCells.find((cell) => cell.isToday);
    if (!todayCell) return null;

    const todayIndex = timelineCells.indexOf(todayCell);
    const todayPosition = todayIndex * dimensions.cellWidth;

    return (
      <View
        style={[
          styles.todayLine,
          {
            left: todayPosition,
            height: dimensions.rowHeight * sortedTasks.length,
          },
        ]}
      >
        <View style={styles.todayLineMarker} />
      </View>
    );
  };

  const renderTimelineGrid = () => (
    <View
      style={[
        styles.timelineGrid,
        { minWidth: timelineWidth, height: dimensions.rowHeight * paginatedTasks.length },
      ]}
    >
      {timelineCells.map((cell, index) => (
        <View
          key={`grid-${index}`}
          style={[
            styles.gridColumn,
            {
              width: dimensions.cellWidth,
              backgroundColor: cell.isWeekend
                ? colors.neutral[50]
                : colors.surface.primary,
            },
            cell.isFirstOfMonth && styles.gridColumnBorder,
          ]}
        />
      ))}
    </View>
  );

  const renderTaskRows = () => (
    <View style={styles.taskRows}>
      {paginatedTasks.map((task, index) => {
        const isSelected = task.id === selectedTaskId;
        return (
          <View
            key={`row-${task.id}`}
            style={[
              styles.taskRow,
              {
                height: dimensions.rowHeight,
                minWidth: timelineWidth,
              },
              isSelected && styles.taskRowSelected,
            ]}
          />
        );
      })}
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        isMini && styles.containerMini,
        {
          height: dimensions.chartHeight,
          width: customWidth || '100%',
          maxWidth: mode !== 'full' ? 350 : undefined,
          alignSelf: 'stretch'
        }
      ]}
    >
      {renderHeader()}

      <>
          <View style={styles.chartContainer}>
            {/* Fixed task sidebar */}
            <View style={[styles.sidebar, { width: dimensions.sidebarWidth }]}>
              <View style={[styles.sidebarHeader, { height: dimensions.headerHeight }]}>
                <Text style={[styles.sidebarHeaderText, isMini && styles.sidebarHeaderTextMini]}>
                  Tasks
                </Text>
              </View>
              <ScrollView
                style={styles.sidebarScroll}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              >
                {paginatedTasks.map((task, index) => renderTaskSidebar(task, index))}
              </ScrollView>
            </View>

            {/* Scrollable timeline */}
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={!isMini}
              style={styles.timelineScroll}
            >
              <View style={styles.timelineContainer}>
                {renderTimelineHeader()}

                <View style={styles.chartArea}>
                  {renderTimelineGrid()}
                  {renderTaskRows()}
                  {renderTodayLine()}

                  {/* Task bars layer */}
                  <View style={styles.taskBarsContainer}>
                    {taskBars.map((taskBar) => renderTaskBar(taskBar))}
                  </View>

                  {/* Milestones layer */}
                  <View style={styles.milestonesContainer}>
                    {paginatedTasks.map((task, index) => renderMilestones(task, index))}
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>

          {/* Pagination Controls */}
          {enablePagination && !isMini && totalPages > 1 && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                accessibilityLabel="Previous page"
                accessibilityRole="button"
              >
                <Text style={[styles.paginationButtonText, currentPage === 1 && styles.paginationButtonTextDisabled]}>
                  ‹ Previous
                </Text>
              </TouchableOpacity>

              <View style={styles.paginationInfo}>
                <Text style={styles.paginationText}>
                  Page {currentPage} of {totalPages}
                </Text>
                <Text style={styles.paginationSubtext}>
                  Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, sortedTasks.length)} of {sortedTasks.length} tasks
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
                onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                accessibilityLabel="Next page"
                accessibilityRole="button"
              >
                <Text style={[styles.paginationButtonText, currentPage === totalPages && styles.paginationButtonTextDisabled]}>
                  Next ›
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Legend */}
          {!isMini && (
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: colors.accent[100] }]} />
                <Text style={styles.legendText}>In Progress</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: colors.success[100] }]} />
                <Text style={styles.legendText}>Completed</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: colors.error[100] }]} />
                <Text style={styles.legendText}>Blocked</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.legendMilestoneContainer}>
                  <View style={styles.legendMilestoneDiamond} />
                </View>
                <Text style={styles.legendText}>Milestone</Text>
              </View>
            </View>
          )}
        </>
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
    backgroundColor: colors.accent[500],
    marginLeft: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
  chartContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  sidebar: {
    borderRightWidth: 1,
    borderRightColor: colors.border.default,
    backgroundColor: colors.surface.secondary,
  },
  sidebarHeader: {
    justifyContent: 'center',
    paddingHorizontal: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  sidebarHeaderText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  sidebarHeaderTextMini: {
    fontSize: typography.fontSize.xs,
  },
  sidebarScroll: {
    flex: 1,
  },
  taskSidebar: {
    justifyContent: 'center',
    paddingHorizontal: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  taskSidebarSelected: {
    backgroundColor: '#FFFACD',
  },
  taskSidebarContent: {
    flex: 1,
    justifyContent: 'center',
  },
  taskSidebarTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskStatusIcon: {
    fontSize: typography.fontSize.sm,
    marginRight: spacing[2],
  },
  taskTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    flex: 1,
  },
  taskTitleMini: {
    fontSize: typography.fontSize.xs,
  },
  taskDuration: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },
  timelineScroll: {
    flex: 1,
  },
  timelineContainer: {
    // Don't use flex - let it expand based on content width
  },
  timelineHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  timelineHeaderCell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.border.light,
  },
  timelineHeaderCellBorder: {
    borderRightWidth: 2,
    borderRightColor: colors.border.medium,
  },
  timelineHeaderText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  timelineHeaderTextMini: {
    fontSize: 10,
  },
  timelineHeaderTextToday: {
    color: colors.accent[600],
    fontWeight: typography.fontWeight.bold,
  },
  chartArea: {
    position: 'relative',
  },
  timelineGrid: {
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  gridColumn: {
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: colors.border.light,
  },
  gridColumnBorder: {
    borderRightWidth: 2,
    borderRightColor: colors.border.medium,
  },
  taskRows: {
    position: 'relative',
  },
  taskRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  taskRowSelected: {
    backgroundColor: '#FFFACD',
  },
  todayLine: {
    position: 'absolute',
    top: 0,
    width: 2,
    backgroundColor: colors.accent[500],
    zIndex: 5,
  },
  todayLineMarker: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent[500],
    marginLeft: -3,
  },
  taskBarsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  taskBar: {
    position: 'absolute',
    borderRadius: borderRadius.base,
    borderWidth: 2,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    ...shadows.xs,
  },
  taskProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    opacity: 0.3,
    borderRadius: borderRadius.base - 2,
  },
  taskBarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
    zIndex: 1,
  },
  taskBarText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  taskProgressText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.secondary,
    flexShrink: 0,
  },
  milestonesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 15,
  },
  milestone: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    transform: [{ translateX: -6 }, { translateY: -6 }],
  },
  milestoneDiamond: {
    width: 12,
    height: 12,
    backgroundColor: colors.warning[500],
    borderWidth: 2,
    borderColor: colors.warning[700],
    transform: [{ rotate: '45deg' }],
  },
  milestoneCompleted: {
    opacity: 0.6,
  },
  milestoneDiamondCompleted: {
    backgroundColor: colors.success[500],
    borderColor: colors.success[700],
  },
  milestoneText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.primary,
    backgroundColor: colors.surface.glass,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    marginLeft: spacing[2],
    ...shadows.xs,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    backgroundColor: colors.surface.secondary,
    gap: spacing[3],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: borderRadius.sm,
    marginRight: spacing[2],
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  legendMilestoneContainer: {
    width: 16,
    height: 16,
    marginRight: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendMilestoneDiamond: {
    width: 10,
    height: 10,
    backgroundColor: colors.warning[500],
    borderWidth: 2,
    borderColor: colors.warning[700],
    transform: [{ rotate: '45deg' }],
  },
  legendText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    backgroundColor: colors.surface.secondary,
  },
  paginationButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.base,
    backgroundColor: colors.accent[500],
    minWidth: 100,
    alignItems: 'center',
  },
  paginationButtonDisabled: {
    backgroundColor: colors.neutral[100],
    opacity: 0.5,
  },
  paginationButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
  paginationButtonTextDisabled: {
    color: colors.text.tertiary,
  },
  paginationInfo: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: spacing[2],
  },
  paginationText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  paginationSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
});

export default GanttChart;
