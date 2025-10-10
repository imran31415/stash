import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../hooks';
import { spacing, typography, borderRadius } from '../tokens';

export interface ComponentHeaderProps {
  title: string;
  description?: string;
  isMini?: boolean;
  onExpandPress?: () => void;
  children?: React.ReactNode;
  showExpandButton?: boolean;
}

export const ComponentHeader: React.FC<ComponentHeaderProps> = ({
  title,
  description,
  isMini = false,
  onExpandPress,
  children,
  showExpandButton = true,
}) => {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: colors.surface, borderBottomColor: colors.border },
      ]}
    >
      <View style={styles.headerContent}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {description && !isMini && (
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={1}>
            {description}
          </Text>
        )}
        {children}
      </View>
      {onExpandPress && showExpandButton && (
        <TouchableOpacity
          style={[styles.expandButton, { backgroundColor: colors.primary }]}
          onPress={onExpandPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Expand to fullscreen"
          accessibilityHint="Double tap to expand to fullscreen"
        >
          <Text style={[styles.expandText, { color: colors.text }]}>
            👁️ {isMini ? 'Expand' : 'Fullscreen'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 2,
  },
  description: {
    fontSize: typography.fontSize.md,
    marginTop: 2,
  },
  expandButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginLeft: spacing.sm,
    borderRadius: borderRadius.base,
  },
  expandIcon: {
    fontSize: typography.fontSize.xxxl,
  },
  expandText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});
