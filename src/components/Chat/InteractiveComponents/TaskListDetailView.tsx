import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  Dimensions,
  Platform,
  TextInput,
  Switch,
} from 'react-native';
import { useModalNavigation } from '../hooks';
import type { Task } from './types';
import { GanttChart } from './GanttChart';

interface TaskListDetailViewProps {
  visible: boolean;
  tasks: Task[];
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onTaskPress?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  pageSize?: number;
}

type FilterStatus = 'all' | Task['status'];
type FilterPriority = 'all' | Task['priority'];

export const TaskListDetailView: React.FC<TaskListDetailViewProps> = ({
  visible,
  tasks,
  title = 'Task List',
  subtitle,
  onClose,
  onTaskPress,
  onTaskEdit,
  pageSize: defaultPageSize = 10,
}) => {
  const { width: windowWidth } = Dimensions.get('window');
  const isNarrowScreen = windowWidth < 768;

  // State
  const [viewMode, setViewMode] = useState<'list' | 'gantt'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [isPaginationEnabled, setIsPaginationEnabled] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Handle cross-platform navigation
  useModalNavigation({ visible, onClose });

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.assignee?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter((task) => task.status === filterStatus);
    }

    // Apply priority filter
    if (filterPriority !== 'all') {
      result = result.filter((task) => task.priority === filterPriority);
    }

    return result;
  }, [tasks, searchQuery, filterStatus, filterPriority]);

  // Paginated tasks
  const paginatedTasks = useMemo(() => {
    if (!isPaginationEnabled) return filteredTasks;

    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredTasks.slice(startIndex, endIndex);
  }, [filteredTasks, isPaginationEnabled, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredTasks.length / pageSize);

  // Statistics
  const statistics = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter((t) => t.status === 'completed').length;
    const inProgress = filteredTasks.filter((t) => t.status === 'in-progress').length;
    const pending = filteredTasks.filter((t) => t.status === 'pending').length;
    const blocked = filteredTasks.filter((t) => t.status === 'blocked').length;
    const avgProgress =
      total > 0 ? filteredTasks.reduce((sum, t) => sum + t.progress, 0) / total : 0;

    return { total, completed, inProgress, pending, blocked, avgProgress };
  }, [filteredTasks]);

  // Helper functions
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'in-progress':
        return '#3B82F6';
      case 'blocked':
        return '#EF4444';
      case 'cancelled':
        return '#6B7280';
      default:
        return '#F59E0B';
    }
  };

  const getStatusBackground = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return '#D1FAE5';
      case 'in-progress':
        return '#DBEAFE';
      case 'blocked':
        return '#FEE2E2';
      case 'cancelled':
        return '#F3F4F6';
      default:
        return '#FEF3C7';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'critical':
        return '#DC2626';
      case 'high':
        return '#F59E0B';
      case 'medium':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'in-progress':
        return '⟳';
      case 'blocked':
        return '⚠';
      case 'cancelled':
        return '✕';
      default:
        return '○';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleTogglePagination = (value: boolean) => {
    setIsPaginationEnabled(value);
    setCurrentPage(0);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterPriority('all');
    setCurrentPage(0);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onClose}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <Text style={styles.backButtonText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{title}</Text>
            {subtitle && (
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>

          <View style={styles.headerRight}>
            <View style={styles.viewToggle}>
              <TouchableOpacity
                style={[styles.viewToggleButton, viewMode === 'list' && styles.viewToggleButtonActive]}
                onPress={() => setViewMode('list')}
              >
                <Text style={[styles.viewToggleText, viewMode === 'list' && styles.viewToggleTextActive]}>
                  ☰
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewToggleButton, viewMode === 'gantt' && styles.viewToggleButtonActive]}
                onPress={() => setViewMode('gantt')}
              >
                <Text style={[styles.viewToggleText, viewMode === 'gantt' && styles.viewToggleTextActive]}>
                  ▦
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.headerCount}>
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
            </Text>
          </View>
        </View>

        {/* Search and Filters */}
        <View style={styles.filtersContainer}>
          {/* Search */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search tasks..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <View style={styles.filterPills}>
              {/* Status Filters */}
              <TouchableOpacity
                style={[styles.filterPill, filterStatus === 'all' && styles.filterPillActive]}
                onPress={() => setFilterStatus('all')}
              >
                <Text style={[styles.filterPillText, filterStatus === 'all' && styles.filterPillTextActive]}>
                  All Status
                </Text>
              </TouchableOpacity>

              {(['pending', 'in-progress', 'completed', 'blocked'] as const).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[styles.filterPill, filterStatus === status && styles.filterPillActive]}
                  onPress={() => setFilterStatus(status)}
                >
                  <Text style={[styles.filterPillText, filterStatus === status && styles.filterPillTextActive]}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Priority Filters */}
              <View style={styles.filterDivider} />

              {(['all', 'critical', 'high', 'medium', 'low'] as const).map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.filterPill,
                    filterPriority === priority && styles.filterPillActive,
                  ]}
                  onPress={() => setFilterPriority(priority as FilterPriority)}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      filterPriority === priority && styles.filterPillTextActive,
                    ]}
                  >
                    {priority === 'all' ? 'All Priority' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Clear Filters */}
              {(searchQuery || filterStatus !== 'all' || filterPriority !== 'all') && (
                <>
                  <View style={styles.filterDivider} />
                  <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
                    <Text style={styles.clearFiltersText}>Clear All</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>

          {/* Pagination Toggle - Only show in list view */}
          {viewMode === 'list' && (
            <View style={styles.paginationToggle}>
              <Text style={styles.paginationToggleLabel}>Enable Pagination</Text>
              <Switch
                value={isPaginationEnabled}
                onValueChange={handleTogglePagination}
                trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
                thumbColor={isPaginationEnabled ? '#3B82F6' : '#F3F4F6'}
              />
              {isPaginationEnabled && (
                <Text style={styles.paginationToggleInfo}>
                  {pageSize} per page
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Content */}
        {viewMode === 'gantt' ? (
          <View style={styles.ganttContainer}>
            <GanttChart
              tasks={filteredTasks}
              mode="full"
              onTaskPress={onTaskPress}
              showProgress={true}
              showToday={true}
              showMilestones={true}
              height={windowWidth < 768 ? 400 : 600}
            />
          </View>
        ) : (
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={true}
          >
            {/* Statistics */}
            <View style={styles.statisticsSection}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statisticsGrid}>
              <View style={styles.statisticsCard}>
                <Text style={styles.statisticsValue}>{statistics.total}</Text>
                <Text style={styles.statisticsLabel}>Total</Text>
              </View>

              <View style={styles.statisticsCard}>
                <Text style={[styles.statisticsValue, { color: '#10B981' }]}>
                  {statistics.completed}
                </Text>
                <Text style={styles.statisticsLabel}>Completed</Text>
              </View>

              <View style={styles.statisticsCard}>
                <Text style={[styles.statisticsValue, { color: '#3B82F6' }]}>
                  {statistics.inProgress}
                </Text>
                <Text style={styles.statisticsLabel}>In Progress</Text>
              </View>

              <View style={styles.statisticsCard}>
                <Text style={[styles.statisticsValue, { color: '#F59E0B' }]}>
                  {statistics.pending}
                </Text>
                <Text style={styles.statisticsLabel}>Pending</Text>
              </View>

              <View style={styles.statisticsCard}>
                <Text style={[styles.statisticsValue, { color: '#EF4444' }]}>
                  {statistics.blocked}
                </Text>
                <Text style={styles.statisticsLabel}>Blocked</Text>
              </View>

              <View style={styles.statisticsCard}>
                <Text style={[styles.statisticsValue, { color: '#8B5CF6' }]}>
                  {Math.round(statistics.avgProgress)}%
                </Text>
                <Text style={styles.statisticsLabel}>Avg Progress</Text>
              </View>
            </View>
          </View>

          {/* Task List */}
          <View style={styles.taskListSection}>
            <View style={styles.taskListHeader}>
              <Text style={styles.sectionTitle}>Tasks</Text>
              {isPaginationEnabled && totalPages > 1 && (
                <View style={styles.pagination}>
                  <TouchableOpacity
                    style={[
                      styles.paginationButton,
                      currentPage === 0 && styles.paginationButtonDisabled,
                    ]}
                    onPress={handlePreviousPage}
                    disabled={currentPage === 0}
                  >
                    <Text
                      style={[
                        styles.paginationButtonText,
                        currentPage === 0 && styles.paginationButtonTextDisabled,
                      ]}
                    >
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
              )}
            </View>

            {paginatedTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📋</Text>
                <Text style={styles.emptyStateText}>
                  {filteredTasks.length === 0 && tasks.length > 0
                    ? 'No tasks match your filters'
                    : 'No tasks available'}
                </Text>
                {filteredTasks.length === 0 && tasks.length > 0 && (
                  <TouchableOpacity style={styles.clearFiltersButtonLarge} onPress={clearFilters}>
                    <Text style={styles.clearFiltersTextLarge}>Clear Filters</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              paginatedTasks.map((task) => {
                const statusColor = getStatusColor(task.status);
                const statusBg = getStatusBackground(task.status);
                const priorityColor = getPriorityColor(task.priority);

                return (
                  <TouchableOpacity
                    key={task.id}
                    style={styles.taskCard}
                    onPress={() => onTaskPress?.(task)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.taskCardHeader}>
                      <View style={styles.taskCardTop}>
                        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                          <Text style={[styles.statusIcon, { color: statusColor }]}>
                            {getStatusIcon(task.status)}
                          </Text>
                        </View>

                        <View style={styles.taskCardContent}>
                          <Text style={styles.taskCardTitle} numberOfLines={2}>
                            {task.title}
                          </Text>
                          {task.description && (
                            <Text style={styles.taskCardDescription} numberOfLines={2}>
                              {task.description}
                            </Text>
                          )}
                        </View>

                        <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
                          <Text style={styles.priorityText}>
                            {task.priority.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    {task.progress > 0 && (
                      <View style={styles.progressSection}>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${task.progress}%`,
                                backgroundColor: statusColor,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>{task.progress}%</Text>
                      </View>
                    )}

                    {/* Dates */}
                    <View style={styles.taskCardDates}>
                      <Text style={styles.taskCardDate}>
                        📅 {formatDate(task.startDate)} - {formatDate(task.endDate)}
                      </Text>
                      {task.assignee && (
                        <Text style={styles.taskCardAssignee}>👤 {task.assignee}</Text>
                      )}
                    </View>

                    {/* Milestones */}
                    {task.milestones && task.milestones.length > 0 && (
                      <View style={styles.milestonesSection}>
                        {task.milestones.map((milestone) => (
                          <View key={milestone.id} style={styles.milestoneChip}>
                            <Text style={styles.milestoneChipText}>
                              {milestone.completed ? '✓' : '◇'} {milestone.title}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </View>

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },

  backButtonText: {
    fontSize: 20,
    color: '#6B7280',
  },

  headerContent: {
    flex: 1,
    marginHorizontal: 12,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },

  headerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },

  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    padding: 2,
  },

  viewToggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },

  viewToggleButtonActive: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },

  viewToggleText: {
    fontSize: 16,
    color: '#9CA3AF',
  },

  viewToggleTextActive: {
    color: '#3B82F6',
  },

  headerCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },

  filtersContainer: {
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#111827',
  },

  clearButton: {
    padding: 4,
  },

  clearButtonText: {
    fontSize: 16,
    color: '#9CA3AF',
  },

  filterScroll: {
    marginBottom: 12,
  },

  filterPills: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },

  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  filterPillActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },

  filterPillText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },

  filterPillTextActive: {
    color: '#FFFFFF',
  },

  filterDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },

  clearFiltersButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },

  clearFiltersText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },

  paginationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },

  paginationToggleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },

  paginationToggleInfo: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  content: {
    flex: 1,
  },

  contentContainer: {
    flexGrow: 1,
  },

  statisticsSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },

  statisticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  statisticsCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  statisticsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },

  statisticsLabel: {
    fontSize: 12,
    color: '#6B7280',
  },

  taskListSection: {
    padding: 16,
    backgroundColor: '#F9FAFB',
  },

  taskListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  paginationButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  paginationButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },

  paginationButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  paginationButtonTextDisabled: {
    color: '#9CA3AF',
  },

  paginationText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },

  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  taskCardHeader: {
    marginBottom: 12,
  },

  taskCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  statusBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  statusIcon: {
    fontSize: 18,
    fontWeight: '700',
  },

  taskCardContent: {
    flex: 1,
  },

  taskCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },

  taskCardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },

  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    minWidth: 40,
    textAlign: 'right',
  },

  taskCardDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  taskCardDate: {
    fontSize: 12,
    color: '#6B7280',
  },

  taskCardAssignee: {
    fontSize: 12,
    color: '#6B7280',
  },

  milestonesSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },

  milestoneChip: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },

  milestoneChipText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '500',
  },

  emptyState: {
    paddingVertical: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },

  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },

  clearFiltersButtonLarge: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },

  clearFiltersTextLarge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  bottomSpacer: {
    height: 32,
  },

  ganttContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
