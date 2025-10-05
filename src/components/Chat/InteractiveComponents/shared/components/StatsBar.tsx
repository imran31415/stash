import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../../../../theme';
import { spacing, typography } from '../tokens';
import type { StatItem } from '../types';

export interface StatsBarProps {
  stats: StatItem[];
  variant?: 'default' | 'compact';
  backgroundColor?: string;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  stats,
  variant = 'default',
  backgroundColor,
}) => {
  const colors = useThemeColors();
  const isCompact = variant === 'compact';

  return (
    <View
      style={[
        styles.statsBar,
        {
          backgroundColor: backgroundColor || colors.background,
          borderBottomColor: colors.border,
        },
        isCompact && styles.statsBarCompact,
      ]}
    >
      {stats.map((stat, index) => (
        <View key={index} style={[styles.statItem, isCompact && styles.statItemCompact]}>
          {stat.icon && <Text style={styles.statIcon}>{stat.icon}</Text>}
          <Text
            style={[
              styles.statValue,
              { color: stat.color || colors.text },
              isCompact && styles.statValueCompact,
            ]}
          >
            {stat.value}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }, isCompact && styles.statLabelCompact]}>
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  statsBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.lg,
  },
  statsBarCompact: {
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  statItemCompact: {
    minWidth: 50,
  },
  statIcon: {
    fontSize: typography.fontSize.lg,
    marginBottom: 2,
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  statValueCompact: {
    fontSize: typography.fontSize.lg,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
    textAlign: 'center',
  },
  statLabelCompact: {
    fontSize: typography.fontSize.xs,
  },
});
