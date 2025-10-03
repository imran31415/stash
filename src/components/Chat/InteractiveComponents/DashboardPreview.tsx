import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import type { DashboardPreviewProps, DashboardConfig } from './Dashboard.types';

const SCREEN_WIDTH = Dimensions.get('window').width;

const borderRadius = {
  base: 8,
  md: 12,
};

const spacing = {
  2: 8,
  3: 12,
  4: 16,
};

const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
  },
  fontWeight: {
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

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
  },
  primary: {
    500: '#3B82F6',
  },
};

export const DashboardPreview: React.FC<DashboardPreviewProps> = ({
  config,
  onPress,
  onLongPress,
  maxPreviewItems,
}) => {
  // Show all items in horizontal scroll, no limit
  const previewItems = useMemo(() => {
    return config.items;
  }, [config.items]);

  const cellSize = 120; // Fixed size for consistency

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{config.title}</Text>
          {config.subtitle && (
            <Text style={styles.subtitle}>{config.subtitle}</Text>
          )}
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{config.items.length} items</Text>
        </View>
      </View>

      {/* Horizontally scrollable preview grid */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.previewScrollContent}
        style={styles.previewScroll}
      >
        {previewItems.map((item) => (
          <Pressable
            key={item.id}
            style={[
              styles.previewCell,
              {
                width: cellSize,
                height: cellSize,
              },
            ]}
            onPress={onPress}
            onLongPress={onLongPress}
          >
            <Text style={styles.previewCellIcon}>
              {getItemIcon(item.type)}
            </Text>
            <Text style={styles.previewCellLabel} numberOfLines={2}>
              {getItemLabel(item)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Expand button footer */}
      <TouchableOpacity
        style={styles.expandButton}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.expandButtonText}>👁️ Expand Full Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};

const getItemIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    'time-series-chart': '📈',
    'gantt-chart': '📊',
    'graph-visualization': '🕸️',
    'task-list': '✓',
    'resource-list': '📁',
    'code-block': '💻',
    'media': '🖼️',
    'video': '🎥',
    'custom': '⚙️',
  };
  return iconMap[type] || '📦';
};

const getItemLabel = (item: any): string => {
  if (item.data?.title) return item.data.title;
  if (item.data?.name) return item.data.name;
  return item.type.replace(/-/g, ' ');
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
    maxWidth: SCREEN_WIDTH - 64,
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
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing[2] / 2,
  },
  badge: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2] / 2,
    borderRadius: borderRadius.base,
    marginLeft: spacing[2],
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.surface.primary,
  },
  previewScroll: {
    backgroundColor: colors.surface.secondary,
  },
  previewScrollContent: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  previewCell: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.base,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[2],
    marginRight: spacing[2],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  previewCellIcon: {
    fontSize: 36,
    marginBottom: spacing[2] / 2,
  },
  previewCellLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium,
  },
  expandButton: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
  },
  expandButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.surface.primary,
  },
});
