import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { Resource, ResourceListProps } from './types';
import { ResourceDetailModal } from './ResourceDetailModal';

const getStatusColor = (status?: string) => {
  if (!status) return '#6B7280';

  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes('complete') || lowerStatus.includes('done') || lowerStatus.includes('active')) {
    return '#10B981';
  } else if (lowerStatus.includes('progress') || lowerStatus.includes('pending')) {
    return '#3B82F6';
  } else if (lowerStatus.includes('block') || lowerStatus.includes('error') || lowerStatus.includes('failed')) {
    return '#EF4444';
  } else if (lowerStatus.includes('cancel') || lowerStatus.includes('inactive')) {
    return '#6B7280';
  }
  return '#F59E0B';
};

const getPriorityColor = (priority?: Resource['priority']) => {
  switch (priority) {
    case 'critical':
      return '#DC2626';
    case 'high':
      return '#F59E0B';
    case 'medium':
      return '#3B82F6';
    case 'low':
      return '#6B7280';
    default:
      return '#9CA3AF';
  }
};

const calculateOptimalItemCount = (adaptiveHeight?: boolean): number => {
  if (!adaptiveHeight) return 5; // Default

  const { height } = Dimensions.get('window');
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

  if (isMobile) {
    // iPhone 14: 852, iPhone 14 Pro Max: 932
    // Assuming chat message takes ~40% of available space
    // Each item is ~80px, header ~50px
    const availableHeight = height * 0.4;
    const itemHeight = 80;
    const headerHeight = 50;
    const maxItems = Math.floor((availableHeight - headerHeight) / itemHeight);
    return Math.max(3, Math.min(maxItems, 6)); // Between 3 and 6 items
  } else {
    // Web can show more items
    return 8;
  }
};

export const ResourceList: React.FC<ResourceListProps> = ({
  title = 'Resources',
  subtitle,
  resources,
  maxItems,
  adaptiveHeight = true,
  onResourcePress,
  onResourceSelect,
  showCategory = true,
  showStatus = true,
  showMetadata = false,
}) => {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const optimalItemCount = useMemo(
    () => maxItems || calculateOptimalItemCount(adaptiveHeight),
    [maxItems, adaptiveHeight]
  );

  const displayedResources = showAll ? resources : resources.slice(0, optimalItemCount);
  const hasMore = resources.length > optimalItemCount;

  const handleResourcePress = (resource: Resource) => {
    setSelectedResource(resource);
    setModalVisible(true);
    onResourcePress?.(resource);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedResource(null), 300);
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const renderMetadata = (metadata?: Record<string, any>) => {
    if (!showMetadata || !metadata) return null;

    const keys = Object.keys(metadata).slice(0, 2); // Show first 2 metadata items
    return (
      <View style={styles.metadataContainer}>
        {keys.map((key) => (
          <View key={key} style={styles.metadataItem}>
            <Text style={styles.metadataKey}>{key}:</Text>
            <Text style={styles.metadataValue} numberOfLines={1}>
              {String(metadata[key])}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{resources.length}</Text>
          </View>
        </View>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {/* Resource List */}
      <ScrollView
        style={styles.list}
        horizontal={false}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {displayedResources.map((resource) => {
          const statusColor = resource.color || getStatusColor(resource.status);
          const priorityColor = getPriorityColor(resource.priority);

          return (
            <TouchableOpacity
              key={resource.id}
              style={[styles.resourceCard, { borderLeftColor: statusColor }]}
              onPress={() => handleResourcePress(resource)}
              activeOpacity={0.7}
            >
              <View style={styles.resourceHeader}>
                <View style={styles.resourceTitleRow}>
                  {resource.icon && (
                    <Text style={styles.resourceIcon}>{resource.icon}</Text>
                  )}
                  <Text style={styles.resourceTitle} numberOfLines={2}>
                    {resource.title}
                  </Text>
                </View>
                {resource.priority && (
                  <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
                    <Text style={styles.priorityText}>{resource.priority}</Text>
                  </View>
                )}
              </View>

              {resource.description && (
                <Text style={styles.descriptionText} numberOfLines={2}>
                  {resource.description}
                </Text>
              )}

              <View style={styles.resourceFooter}>
                {showCategory && resource.category && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{resource.category}</Text>
                  </View>
                )}
                {showStatus && resource.status && (
                  <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                    <Text style={styles.statusText}>{resource.status}</Text>
                  </View>
                )}
                {resource.updatedAt && (
                  <Text style={styles.dateText}>{formatDate(resource.updatedAt)}</Text>
                )}
              </View>

              {resource.tags && resource.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {resource.tags.slice(0, 3).map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                  {resource.tags.length > 3 && (
                    <Text style={styles.moreTagsText}>+{resource.tags.length - 3}</Text>
                  )}
                </View>
              )}

              {renderMetadata(resource.metadata)}
            </TouchableOpacity>
          );
        })}

        {/* Show More/Less Button */}
        {hasMore && (
          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={() => setShowAll(!showAll)}
            activeOpacity={0.7}
          >
            <Text style={styles.showMoreText}>
              {showAll ? '▲ Show Less' : `▼ Show ${resources.length - optimalItemCount} More`}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Empty State */}
      {resources.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No resources available</Text>
        </View>
      )}

      {/* Detail Modal */}
      <ResourceDetailModal
        visible={modalVisible}
        resource={selectedResource}
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
    maxHeight: 500,
  },
  header: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  headerContent: {
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
  list: {
    maxHeight: 420,
  },
  resourceCard: {
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
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  resourceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  resourceIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  descriptionText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 18,
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
  resourceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  categoryBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4338CA',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dateText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#4B5563',
  },
  moreTagsText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  metadataContainer: {
    marginTop: 6,
    gap: 4,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataKey: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 4,
  },
  metadataValue: {
    fontSize: 11,
    color: '#111827',
    flex: 1,
  },
  showMoreButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  showMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
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
