import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../../../theme';
import type { FunnelChartProps, FunnelStage } from './FunnelChart.types';
import {
  calculateFunnelStats,
  calculateStageMetrics,
  getStageColor,
  formatNumber,
  formatPercentage,
} from './FunnelChart.utils';

export const FunnelChart: React.FC<FunnelChartProps> = ({
  data,
  mode = 'mini',
  orientation = 'vertical',
  height = 400,
  width,
  showValues = true,
  showPercentages = true,
  showDropoff = false,
  onStagePress,
  onExpandPress,
}) => {
  const colors = useThemeColors();
  const isMini = mode === 'mini';

  const stats = useMemo(() => calculateFunnelStats(data), [data]);
  const stages = useMemo(() => calculateStageMetrics(data.stages), [data.stages]);

  const renderStage = (stage: FunnelStage, index: number) => {
    const stageColor = getStageColor(stage, index, stages.length);
    const percentage = stage.metadata?.percentage || 0;
    const dropoff = stage.metadata?.dropoff || 0;
    const dropoffRate = stage.metadata?.dropoffRate || 0;
    const maxValue = stages[0]?.value || 1;
    const widthPercentage = (stage.value / maxValue) * 100;

    return (
      <View key={stage.id} style={styles.stageContainer}>
        <TouchableOpacity
          style={[
            styles.stageBar,
            {
              backgroundColor: stageColor,
              width: `${widthPercentage}%`,
            },
          ]}
          onPress={() => onStagePress?.(stage, index)}
          activeOpacity={0.7}
        >
          <View style={styles.stageContent}>
            <Text style={[styles.stageLabel, { color: '#FFFFFF' }]} numberOfLines={1}>
              {stage.label}
            </Text>
            {showValues && (
              <Text style={[styles.stageValue, { color: '#FFFFFF' }]}>
                {formatNumber(stage.value)}
              </Text>
            )}
            {showPercentages && (
              <Text style={[styles.stagePercentage, { color: '#FFFFFF' }]}>
                {formatPercentage(percentage)}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Dropoff indicator */}
        {showDropoff && index > 0 && dropoff > 0 && (
          <View style={[styles.dropoffIndicator, { backgroundColor: colors.surface }]}>
            <Text style={[styles.dropoffText, { color: '#EF4444' }]}>
              ↓ {formatNumber(dropoff)} ({formatPercentage(dropoffRate)})
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { height }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {data.title}
          </Text>
          {data.description && !isMini && (
            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={1}>
              {data.description}
            </Text>
          )}
        </View>
        {isMini && onExpandPress && (
          <TouchableOpacity style={styles.expandButton} onPress={onExpandPress}>
            <Text style={styles.expandIcon}>⤢</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats bar */}
      <View style={[styles.statsBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>{formatNumber(stats.totalEntries)}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Entries</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>{formatNumber(stats.totalConversions)}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Conversions</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {formatPercentage(stats.overallConversionRate)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rate</Text>
        </View>
        {!isMini && (
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>
              {formatPercentage(stats.averageDropoffRate)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg Drop</Text>
          </View>
        )}
      </View>

      {/* Funnel */}
      <ScrollView
        style={styles.funnelContainer}
        contentContainerStyle={styles.funnelContent}
        showsVerticalScrollIndicator={true}
      >
        {stages.map((stage, index) => renderStage(stage, index))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
  },
  expandButton: {
    padding: 8,
    marginLeft: 8,
  },
  expandIcon: {
    fontSize: 20,
  },
  statsBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  funnelContainer: {
    flex: 1,
  },
  funnelContent: {
    padding: 20,
    gap: 12,
    alignItems: 'center',
  },
  stageContainer: {
    width: '100%',
    alignItems: 'center',
  },
  stageBar: {
    minHeight: 60,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stageContent: {
    alignItems: 'center',
    gap: 4,
  },
  stageLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  stageValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  stagePercentage: {
    fontSize: 12,
    fontWeight: '600',
  },
  dropoffIndicator: {
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dropoffText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
