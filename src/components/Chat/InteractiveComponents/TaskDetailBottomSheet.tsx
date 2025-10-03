import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Pressable,
  Dimensions,
} from 'react-native';
import { useModalNavigation } from '../hooks';
import { Task, TaskDetailModalProps } from './types';

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

const getPriorityLabel = (priority: Task['priority']) => {
  const labels: Record<Task['priority'], string> = {
    critical: 'Critical Priority',
    high: 'High Priority',
    medium: 'Medium Priority',
    low: 'Low Priority',
  };
  return labels[priority];
};

export const TaskDetailBottomSheet: React.FC<TaskDetailModalProps> = ({
  visible,
  task,
  onClose,
  onEdit,
  onDelete,
}) => {
  // Handle cross-platform navigation (back button, escape key, browser navigation)
  useModalNavigation({ visible, onClose });

  if (!task) return null;

  const statusColor = getStatusColor(task.status);
  const priorityColor = getPriorityColor(task.priority);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateDuration = () => {
    const start = new Date(task.startDate);
    const end = new Date(task.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task);
      onClose();
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(task.id);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.backdropOverlay} />
      </Pressable>

      {/* Modal content - slides from bottom */}
      <View style={[styles.modalContainer, { pointerEvents: 'box-none' }]}>
        <Pressable
          style={[
            styles.modalContent,
            {
              maxHeight: Dimensions.get('window').height * 0.85,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
                <Text style={styles.priorityIcon}>!</Text>
                <Text style={styles.priorityText}>{getPriorityLabel(task.priority)}</Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Close modal"
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>{task.title}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>📁</Text>
                <Text style={[styles.metaText, { textTransform: 'capitalize' }]}>
                  {task.status.replace('-', ' ')}
                </Text>
              </View>
              {task.assignee && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaIcon}>👤</Text>
                  <Text style={styles.metaText}>{task.assignee}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Scrollable content */}
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Progress Card */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Progress & Status</Text>
              <View style={styles.progressCard}>
                <View style={styles.progressItem}>
                  <Text style={styles.progressLabel}>Completion</Text>
                  <Text style={[styles.progressValue, { color: statusColor }]}>
                    {task.progress}%
                  </Text>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${task.progress}%`,
                          backgroundColor: statusColor,
                        },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.progressDivider} />
                <View style={styles.progressItem}>
                  <Text style={styles.progressLabel}>Status</Text>
                  <View style={styles.statusBadge}>
                    <Text style={[styles.statusIcon, { color: statusColor }]}>
                      {getStatusIcon(task.status)}
                    </Text>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {task.status.replace('-', ' ')}
                    </Text>
                  </View>
                </View>
                <View style={styles.progressDivider} />
                <View style={styles.progressItem}>
                  <Text style={styles.progressLabel}>Duration</Text>
                  <Text style={styles.progressValue}>{calculateDuration()}</Text>
                  <Text style={styles.progressUnit}>days</Text>
                </View>
              </View>
            </View>

            {/* Description */}
            {task.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{task.description}</Text>
              </View>
            )}

            {/* Timeline */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Timeline</Text>
              <View style={styles.timelineContainer}>
                <View style={styles.timelineItem}>
                  <Text style={styles.timelineLabel}>Start Date</Text>
                  <Text style={styles.timelineValue}>{formatDate(task.startDate)}</Text>
                </View>
                <View style={styles.timelineArrow}>
                  <Text style={styles.timelineArrowText}>→</Text>
                </View>
                <View style={styles.timelineItem}>
                  <Text style={styles.timelineLabel}>End Date</Text>
                  <Text style={styles.timelineValue}>{formatDate(task.endDate)}</Text>
                </View>
              </View>
            </View>

            {/* Milestones */}
            {task.milestones && task.milestones.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Milestones</Text>
                <View style={styles.milestonesContainer}>
                  {task.milestones.map((milestone) => (
                    <View key={milestone.id} style={styles.milestoneItem}>
                      <View style={[
                        styles.milestoneCheckbox,
                        milestone.completed && styles.milestoneCheckboxCompleted
                      ]}>
                        {milestone.completed && (
                          <Text style={styles.milestoneCheckmark}>✓</Text>
                        )}
                      </View>
                      <View style={styles.milestoneContent}>
                        <Text style={[
                          styles.milestoneTitle,
                          milestone.completed && styles.milestoneTitleCompleted
                        ]}>
                          {milestone.title}
                        </Text>
                        <Text style={styles.milestoneDate}>
                          {new Date(milestone.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Dependencies */}
            {task.dependencies && task.dependencies.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dependencies</Text>
                <View style={styles.dependenciesContainer}>
                  {task.dependencies.map((depId, index) => (
                    <View key={index} style={styles.dependencyChip}>
                      <Text style={styles.dependencyText}>Task #{depId}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.footer}>
            {onEdit ? (
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleEdit}
                accessibilityRole="button"
                accessibilityLabel="Edit task"
              >
                <Text style={styles.primaryButtonIcon}>✏️</Text>
                <Text style={styles.primaryButtonText}>Edit Task</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close modal"
              >
                <Text style={styles.primaryButtonIcon}>✓</Text>
                <Text style={styles.primaryButtonText}>Close</Text>
              </TouchableOpacity>
            )}

            {(onEdit || onDelete) && (
              <View style={styles.secondaryButtons}>
                {onEdit && (
                  <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={onClose}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel"
                  >
                    <Text style={styles.secondaryButtonIcon}>✕</Text>
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                  </TouchableOpacity>
                )}

                {onDelete && (
                  <TouchableOpacity
                    style={[styles.button, styles.secondaryButton, styles.deleteButton]}
                    onPress={handleDelete}
                    accessibilityRole="button"
                    accessibilityLabel="Delete task"
                  >
                    <Text style={styles.deleteButtonIcon}>🗑️</Text>
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </Pressable>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },

  backdropOverlay: {
    flex: 1,
  },

  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  priorityIcon: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },

  closeText: {
    fontSize: 18,
    color: '#6B7280',
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 28,
  },

  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  metaIcon: {
    fontSize: 14,
  },

  metaText: {
    fontSize: 13,
    color: '#6B7280',
  },

  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },

  section: {
    marginTop: 20,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  progressCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },

  progressItem: {
    flex: 1,
    alignItems: 'center',
  },

  progressDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },

  progressLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 6,
  },

  progressValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },

  progressUnit: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },

  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },

  statusIcon: {
    fontSize: 16,
  },

  statusText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  description: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },

  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },

  timelineItem: {
    flex: 1,
  },

  timelineLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 4,
  },

  timelineValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },

  timelineArrow: {
    paddingHorizontal: 12,
  },

  timelineArrowText: {
    fontSize: 20,
    color: '#D1D5DB',
  },

  milestonesContainer: {
    gap: 12,
  },

  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  milestoneCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  milestoneCheckboxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },

  milestoneCheckmark: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  milestoneContent: {
    flex: 1,
  },

  milestoneTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },

  milestoneTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },

  milestoneDate: {
    fontSize: 13,
    color: '#6B7280',
  },

  dependenciesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  dependencyChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },

  dependencyText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1E40AF',
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 10,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },

  primaryButton: {
    backgroundColor: '#3B82F6',
    ...Platform.select({
      ios: {
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  primaryButtonIcon: {
    fontSize: 16,
  },

  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  secondaryButtons: {
    flexDirection: 'row',
    gap: 10,
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },

  secondaryButtonIcon: {
    fontSize: 14,
  },

  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },

  deleteButtonIcon: {
    fontSize: 14,
  },

  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
});
