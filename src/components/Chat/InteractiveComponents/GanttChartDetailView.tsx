import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Dimensions,
  Platform,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { GanttChart } from './GanttChart';
import { useModalNavigation } from '../hooks';
import type { Task } from './types';

type FilterStatus = 'all' | Task['status'];
type FilterPriority = 'all' | Task['priority'];

interface GanttChartDetailViewProps {
  visible: boolean;
  tasks: Task[];
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onTaskPress?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
}

export const GanttChartDetailView: React.FC<GanttChartDetailViewProps> = ({
  visible,
  tasks,
  title = 'Task Timeline',
  subtitle,
  onClose,
  onTaskPress,
  onTaskEdit,
}) => {
  const { width: windowWidth } = Dimensions.get('window');
  const [viewMode, setViewMode] = useState<'gantt' | 'list'>('gantt');
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');

  // Pagination state for task list
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Determine if screen is narrow (mobile)
  const isNarrowScreen = windowWidth < 768;

  // Handle cross-platform navigation (back button, escape key, browser navigation)
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

  // Paginated tasks for the task list
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTasks.slice(startIndex, endIndex);
  }, [filteredTasks, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredTasks.length / itemsPerPage);
  }, [filteredTasks.length, itemsPerPage]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterPriority]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterPriority('all');
  };

  const handleTaskSelect = (task: Task) => {
    setSelectedTaskId(task.id);
  };

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

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'in-progress':
        return '▶';
      case 'blocked':
        return '⚠';
      case 'cancelled':
        return '✕';
      default:
        return '○';
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
          </View>
        </View>

        {/* Search and Filters - Only show in list view */}
        {viewMode === 'list' && (
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
          </View>
        )}

        {/* Full Gantt Chart and Task List */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={true}
        >
          {viewMode === 'gantt' && (
            <>
              {/* Gantt Chart */}
              <View style={[styles.chartContainer, isNarrowScreen && styles.chartContainerNarrow]}>
                <GanttChart
                  tasks={filteredTasks}
                  mode="full"
                  showProgress
                  showMilestones
                  showToday
                  selectedTaskId={selectedTaskId}
                  onTaskSelect={handleTaskSelect}
                  onTaskPress={onTaskPress}
                  enablePagination
                  itemsPerPage={10}
                />
              </View>
            </>
          )}

          {/* Task List */}
          <View style={[styles.taskListSection, isNarrowScreen && styles.taskListSectionNarrow]}>
            <Text style={styles.sectionTitle}>{viewMode === 'gantt' ? 'Task Details' : 'All Tasks'}</Text>

              {filteredTasks.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    {tasks.length === 0 ? 'No tasks available' : 'No tasks match your filters'}
                  </Text>
                  {tasks.length > 0 && (
                    <TouchableOpacity style={styles.clearFiltersButtonLarge} onPress={clearFilters}>
                      <Text style={styles.clearFiltersTextLarge}>Clear Filters</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                paginatedTasks.map((task) => {
                  const isSelected = task.id === selectedTaskId;
                  const statusColor = getStatusColor(task.status);
                  const statusBg = getStatusBackground(task.status);

                  return (
                    <TouchableOpacity
                      key={task.id}
                      style={[styles.taskItem, isSelected && styles.taskItemSelected]}
                      onPress={() => {
                        handleTaskSelect(task);
                        onTaskPress?.(task);
                      }}
                      accessibilityLabel={`Task: ${task.title}`}
                      accessibilityRole="button"
                    >
                      <View style={styles.taskItemHeader}>
                        <View style={styles.taskItemTop}>
                          <View style={[styles.taskStatusBadge, { backgroundColor: statusBg }]}>
                            <Text style={[styles.taskStatusText, { color: statusColor }]}>
                              {getStatusIcon(task.status)}
                            </Text>
                          </View>

                          <View style={styles.taskItemContent}>
                            <Text style={styles.taskItemTitle} numberOfLines={1}>
                              {task.title}
                            </Text>
                            {task.description && (
                              <Text style={styles.taskItemDescription} numberOfLines={2}>
                                {task.description}
                              </Text>
                            )}
                          </View>

                          <View style={styles.taskItemRight}>
                            <Text style={[styles.taskProgress, { color: statusColor }]}>
                              {task.progress}%
                            </Text>
                            <Text style={styles.chevron}>›</Text>
                          </View>
                        </View>
                      </View>

                      {/* Meta row */}
                      {(task.assignee || task.priority) && (
                        <View style={styles.taskItemMeta}>
                          {task.assignee && (
                            <View style={styles.metaBadge}>
                              <Text style={styles.metaIcon}>👤</Text>
                              <Text style={styles.taskItemMetaText}>{task.assignee}</Text>
                            </View>
                          )}
                          {task.priority && (
                            <View style={styles.metaBadge}>
                              <Text style={styles.metaIcon}>
                                {task.priority === 'critical' || task.priority === 'high' ? '🔴' : '🟡'}
                              </Text>
                              <Text style={styles.taskItemMetaText}>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}

                      {/* Milestones */}
                      {task.milestones && task.milestones.length > 0 && (
                        <View style={styles.taskMilestones}>
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

              {/* Pagination Controls */}
              {filteredTasks.length > 0 && totalPages > 1 && (
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
                      Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredTasks.length)} of {filteredTasks.length} tasks
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
          </View>

          {/* Statistics Dashboard - only show in list view or below gantt */}
          {viewMode === 'list' && (
            <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📊</Text>
                <Text style={styles.infoLabel}>Total Tasks</Text>
              </View>
              <Text style={styles.infoValue}>{filteredTasks.length}</Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>✅</Text>
                <Text style={styles.infoLabel}>Completed</Text>
              </View>
              <Text style={[styles.infoValue, { color: '#10B981' }]}>
                {filteredTasks.filter((t) => t.status === 'completed').length}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>⏳</Text>
                <Text style={styles.infoLabel}>In Progress</Text>
              </View>
              <Text style={[styles.infoValue, { color: '#3B82F6' }]}>
                {filteredTasks.filter((t) => t.status === 'in-progress').length}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>⏸️</Text>
                <Text style={styles.infoLabel}>Pending</Text>
              </View>
              <Text style={[styles.infoValue, { color: '#F59E0B' }]}>
                {filteredTasks.filter((t) => t.status === 'pending').length}
              </Text>
            </View>
            </View>
          )}

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
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

  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },

  menuButtonText: {
    fontSize: 24,
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

  content: {
    flex: 1,
  },

  contentContainer: {
    flexGrow: 1,
  },

  chartContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },

  chartContainerNarrow: {
    height: 300,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },

  taskListSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  taskListSectionNarrow: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },

  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },

  taskItem: {
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

  taskItemSelected: {
    backgroundColor: '#FFFACD',
    borderColor: '#3B82F6',
    borderWidth: 2,
  },

  taskItemHeader: {
    flexDirection: 'column',
  },

  taskItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  taskStatusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  taskStatusText: {
    fontSize: 16,
    fontWeight: '700',
  },

  taskItemContent: {
    flex: 1,
  },

  taskItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },

  taskItemDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  taskItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },

  taskProgress: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
  },

  chevron: {
    fontSize: 24,
    color: '#D1D5DB',
  },

  taskItemMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 8,
  },

  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  metaIcon: {
    fontSize: 12,
    marginRight: 4,
  },

  taskItemMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },

  taskMilestones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },

  milestoneChip: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },

  milestoneChipText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },

  infoSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 12,
  },

  infoCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  infoIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
  },

  infoValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },

  bottomSpacer: {
    height: 32,
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

  clearFiltersButtonLarge: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 16,
  },

  clearFiltersTextLarge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  paginationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    minWidth: 100,
    alignItems: 'center',
  },
  paginationButtonDisabled: {
    backgroundColor: '#E5E5EA',
    opacity: 0.5,
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  paginationButtonTextDisabled: {
    color: '#8E8E93',
  },
  paginationInfo: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  paginationSubtext: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
});
