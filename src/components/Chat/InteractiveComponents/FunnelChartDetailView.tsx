import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useThemeColors } from '../../../theme';
import type { FunnelChartDetailViewProps, FunnelStage } from './FunnelChart.types';
import { FunnelChart } from './FunnelChart';
import { calculateFunnelStats, calculateStageMetrics, formatNumber, formatPercentage } from './FunnelChart.utils';

export const FunnelChartDetailView: React.FC<FunnelChartDetailViewProps> = ({
  data,
  visible,
  onClose,
  onStagePress,
}) => {
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState<'funnel' | 'stages' | 'stats'>('funnel');
  const [selectedStage, setSelectedStage] = useState<{ stage: FunnelStage; index: number } | null>(null);

  const stats = useMemo(() => calculateFunnelStats(data), [data]);
  const stages = useMemo(() => calculateStageMetrics(data.stages), [data.stages]);

  const handleStagePress = useCallback(
    (stage: FunnelStage, index: number) => {
      setSelectedStage({ stage, index });
      onStagePress?.(stage, index);
    },
    [onStagePress]
  );

  const renderStageDetails = () => {
    if (!selectedStage) return null;
    const { stage, index } = selectedStage;

    return (
      <View style={[styles.stageDetailsPanel, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <View style={styles.stageDetailsHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.stageDetailsTitle, { color: colors.text }]}>{stage.label}</Text>
            <Text style={[styles.stageDetailsStage, { color: colors.textSecondary }]}>
              Stage {index + 1} of {stages.length}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setSelectedStage(null)} style={styles.closeDetailsButton}>
            <Text style={[styles.closeDetailsText, { color: colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.stageDetailsContent} showsVerticalScrollIndicator={false}>
          <View style={styles.detailsSection}>
            <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>
              Value
            </Text>
            <Text style={[styles.detailsSectionText, { color: colors.text, fontSize: 24, fontWeight: '700' }]}>
              {formatNumber(stage.value)}
            </Text>
          </View>

          <View style={styles.detailsSection}>
            <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>
              Percentage of Total
            </Text>
            <Text style={[styles.detailsSectionText, { color: colors.text }]}>
              {formatPercentage(stage.metadata?.percentage || 0)}
            </Text>
          </View>

          {index > 0 && (
            <>
              <View style={styles.detailsSection}>
                <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>
                  Drop from Previous Stage
                </Text>
                <Text style={[styles.detailsSectionText, { color: '#EF4444' }]}>
                  {formatNumber(stage.metadata?.dropoff || 0)} ({formatPercentage(stage.metadata?.dropoffRate || 0)})
                </Text>
              </View>
            </>
          )}

          {index < stages.length - 1 && (
            <View style={styles.detailsSection}>
              <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>
                Conversion to Next Stage
              </Text>
              <Text style={[styles.detailsSectionText, { color: colors.text }]}>
                {formatNumber(stages[index + 1].value)} ({formatPercentage((stages[index + 1].value / stage.value) * 100)})
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  const renderFunnelTab = () => (
    <View style={{ flex: 1 }}>
      <FunnelChart
        data={data}
        mode="full"
        showValues={true}
        showPercentages={true}
        showDropoff={true}
        onStagePress={handleStagePress}
      />
      {selectedStage && renderStageDetails()}
    </View>
  );

  const renderStagesTab = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.stagesListContent}>
      {stages.map((stage, index) => (
        <TouchableOpacity
          key={stage.id}
          style={[
            styles.stageListItem,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => handleStagePress(stage, index)}
        >
          <View style={styles.stageListHeader}>
            <View style={[styles.stageNumber, { backgroundColor: stage.color || colors.primary }]}>
              <Text style={styles.stageNumberText}>{index + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.stageListTitle, { color: colors.text }]}>{stage.label}</Text>
              <Text style={[styles.stageListValue, { color: colors.textSecondary }]}>
                {formatNumber(stage.value)} ({formatPercentage(stage.metadata?.percentage || 0)})
              </Text>
            </View>
          </View>
          {index > 0 && (
            <View style={styles.stageListMeta}>
              <Text style={[styles.stageListMetaText, { color: '#EF4444' }]}>
                Drop: {formatNumber(stage.metadata?.dropoff || 0)} ({formatPercentage(stage.metadata?.dropoffRate || 0)})
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderStatsTab = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.statsContent}>
      <View style={[styles.statsSection, { backgroundColor: colors.surface }]}>
        <Text style={[styles.statsSectionTitle, { color: colors.text }]}>Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={[styles.statCardValue, { color: colors.text }]}>{stats.totalStages}</Text>
            <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>Total Stages</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statCardValue, { color: colors.text }]}>{formatNumber(stats.totalEntries)}</Text>
            <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>Entries</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statCardValue, { color: '#10B981' }]}>{formatNumber(stats.totalConversions)}</Text>
            <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>Conversions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statCardValue, { color: colors.primary }]}>{formatPercentage(stats.overallConversionRate)}</Text>
            <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>Conversion Rate</Text>
          </View>
        </View>
      </View>

      <View style={[styles.statsSection, { backgroundColor: colors.surface }]}>
        <Text style={[styles.statsSectionTitle, { color: colors.text }]}>Dropoff Analysis</Text>
        <View style={styles.detailsSection}>
          <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>
            Average Dropoff Rate
          </Text>
          <Text style={[styles.detailsSectionText, { color: '#EF4444', fontSize: 20, fontWeight: '700' }]}>
            {formatPercentage(stats.averageDropoffRate)}
          </Text>
        </View>
        {stats.biggestDropStage && (
          <View style={styles.detailsSection}>
            <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>
              Biggest Drop Stage
            </Text>
            <Text style={[styles.detailsSectionText, { color: colors.text }]}>
              {stats.biggestDropStage.label}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{data.title}</Text>
            {data.description && (
              <Text style={[styles.headerDescription, { color: colors.textSecondary }]}>
                {data.description}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.tabs, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'funnel' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('funnel')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'funnel' ? colors.primary : colors.textSecondary }]}>
              📊 Funnel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'stages' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('stages')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'stages' ? colors.primary : colors.textSecondary }]}>
              📝 Stages
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'stats' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('stats')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'stats' ? colors.primary : colors.textSecondary }]}>
              📈 Stats
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'funnel' && renderFunnelTab()}
        {activeTab === 'stages' && renderStagesTab()}
        {activeTab === 'stats' && renderStatsTab()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerDescription: {
    fontSize: 14,
  },
  closeButton: {
    padding: 8,
    marginLeft: 12,
  },
  closeButtonText: {
    fontSize: 24,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  stageDetailsPanel: {
    borderTopWidth: 1,
    maxHeight: '50%',
  },
  stageDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
  },
  stageDetailsTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  stageDetailsStage: {
    fontSize: 13,
    marginTop: 2,
  },
  closeDetailsButton: {
    padding: 4,
  },
  closeDetailsText: {
    fontSize: 20,
  },
  stageDetailsContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailsSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  detailsSectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  stagesListContent: {
    padding: 16,
    gap: 12,
  },
  stageListItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  stageListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  stageNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stageListTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  stageListValue: {
    fontSize: 13,
    marginTop: 2,
  },
  stageListMeta: {
    marginLeft: 44,
  },
  stageListMetaText: {
    fontSize: 12,
  },
  statsContent: {
    padding: 16,
    gap: 16,
  },
  statsSection: {
    padding: 16,
    borderRadius: 12,
  },
  statsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
    padding: 16,
  },
  statCardValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});
