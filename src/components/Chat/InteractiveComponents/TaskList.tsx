import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Task, TaskListProps } from './types';
import { TaskDetailBottomSheet } from './TaskDetailBottomSheet';

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
      return '⟳';
    case 'blocked':
      return '⚠';
    case 'cancelled':
      return '✕';
    default:
      return '○';
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

export const TaskList: React.FC<TaskListProps> = ({
  title = 'Tasks',
  subtitle,
  tasks,
  onTaskPress,
  onTaskSelect,
  onExpandPress,
  showExpandButton = false,
}) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setModalVisible(true);
    onTaskPress?.(task);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedTask(null), 300);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{tasks.length}</Text>
            </View>
          </View>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {showExpandButton && onExpandPress && (
          <TouchableOpacity
            style={styles.expandButton}
            onPress={onExpandPress}
            accessibilityLabel="Expand task list"
            accessibilityRole="button"
          >
            <Text style={styles.expandButtonText}>⛶</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Task List */}
      <ScrollView
        style={styles.list}
        horizontal={false}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {tasks.map((task) => {
          const statusColor = getStatusColor(task.status);
          const priorityColor = getPriorityColor(task.priority);

          return (
            <TouchableOpacity
              key={task.id}
              style={[styles.taskCard, { borderLeftColor: statusColor }]}
              onPress={() => handleTaskPress(task)}
              activeOpacity={0.7}
            >
              <View style={styles.taskHeader}>
                <View style={styles.taskTitleRow}>
                  <Text style={[styles.statusIcon, { color: statusColor }]}>
                    {getStatusIcon(task.status)}
                  </Text>
                  <Text style={styles.taskTitle} numberOfLines={2}>
                    {task.title}
                  </Text>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
                  <Text style={styles.priorityText}>{task.priority}</Text>
                </View>
              </View>

              <View style={styles.taskFooter}>
                <Text style={styles.dateText}>
                  {formatDate(task.startDate)} - {formatDate(task.endDate)}
                </Text>
                {task.assignee && (
                  <Text style={styles.assigneeText}>👤 {task.assignee}</Text>
                )}
              </View>

              {task.progress > 0 && (
                <View style={styles.progressContainer}>
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
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Empty State */}
      {tasks.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No tasks available</Text>
        </View>
      )}

      {/* Detail Modal */}
      <TaskDetailBottomSheet
        visible={modalVisible}
        task={selectedTask}
        onClose={handleCloseModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 8,
    marginVertical: 4,
    maxHeight: 400,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  badge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 16,
  },
  expandButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    marginLeft: 8,
  },
  expandButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  list: {
    maxHeight: 320,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  assigneeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    minWidth: 35,
    textAlign: 'right',
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});
