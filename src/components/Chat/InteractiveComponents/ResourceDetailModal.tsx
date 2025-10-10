import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Resource, ResourceDetailModalProps } from './types';

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  visible,
  resource,
  onClose,
  customFields,
}) => {
  if (!resource) return null;

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (value instanceof Date) return formatDate(value);
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const renderMetadataSection = () => {
    if (!resource.metadata || Object.keys(resource.metadata).length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Information</Text>
        {Object.entries(resource.metadata).map(([key, value]) => (
          <View key={key} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{key}:</Text>
            <Text style={styles.detailValue} numberOfLines={3}>
              {formatValue(value)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderCustomFields = () => {
    if (!customFields || customFields.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        {customFields.map((field) => {
          const value = (resource as any)[field.key] || resource.metadata?.[field.key];

          return (
            <View key={field.key} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{field.label}:</Text>
              {field.render ? (
                <View style={styles.customFieldContainer}>{field.render(value)}</View>
              ) : (
                <Text style={styles.detailValue} numberOfLines={3}>
                  {formatValue(value)}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              {resource.icon && <Text style={styles.headerIcon}>{resource.icon}</Text>}
              <Text style={styles.title}>{resource.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Image */}
            {resource.imageUrl && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: resource.imageUrl }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
            )}

            {/* Description */}
            {resource.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.descriptionText}>{resource.description}</Text>
              </View>
            )}

            {/* Core Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Information</Text>

              {resource.category && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Category:</Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{resource.category}</Text>
                  </View>
                </View>
              )}

              {resource.status && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <View style={[styles.statusBadge, resource.color && resource.color.length > 0 ? { backgroundColor: resource.color } : undefined]}>
                    <Text style={styles.statusBadgeText}>{resource.status}</Text>
                  </View>
                </View>
              )}

              {resource.priority && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Priority:</Text>
                  <Text style={[styles.detailValue, styles.priorityText]}>
                    {resource.priority.toUpperCase()}
                  </Text>
                </View>
              )}

              {resource.createdAt && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Created:</Text>
                  <Text style={styles.detailValue}>{formatDate(resource.createdAt)}</Text>
                </View>
              )}

              {resource.updatedAt && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Updated:</Text>
                  <Text style={styles.detailValue}>{formatDate(resource.updatedAt)}</Text>
                </View>
              )}
            </View>

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tags</Text>
                <View style={styles.tagsContainer}>
                  {resource.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Custom Fields */}
            {renderCustomFields()}

            {/* Metadata */}
            {renderMetadataSection()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modal: {
    width: '90%',
    maxWidth: 600,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  closeText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  imageContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    width: 100,
  },
  detailValue: {
    fontSize: 13,
    color: '#111827',
    flex: 1,
  },
  priorityText: {
    fontWeight: '700',
    color: '#DC2626',
  },
  customFieldContainer: {
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4338CA',
  },
  statusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
});
