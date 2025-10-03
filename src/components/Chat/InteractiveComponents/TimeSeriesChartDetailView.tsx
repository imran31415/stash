import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import { TimeSeriesChart } from './TimeSeriesChart';
import { useModalNavigation } from '../hooks';
import type { TimeSeriesSeries, TimeSeriesDataPoint } from './TimeSeriesChart.types';
import { formatValueLabel, formatDateLabel } from './TimeSeriesChart.utils';

interface TimeSeriesChartDetailViewProps {
  visible: boolean;
  series: TimeSeriesSeries[];
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onDataPointPress?: (dataPoint: TimeSeriesDataPoint, series: TimeSeriesSeries) => void;
  pageSize?: number;
  totalDataPoints?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  valueFormatter?: (value: number) => string;
  dateFormatter?: (date: Date) => string;
}

export const TimeSeriesChartDetailView: React.FC<TimeSeriesChartDetailViewProps> = ({
  visible,
  series,
  title = 'Time Series Data',
  subtitle,
  onClose,
  onDataPointPress,
  pageSize,
  totalDataPoints,
  xAxisLabel,
  yAxisLabel,
  valueFormatter,
  dateFormatter,
}) => {
  const { width: windowWidth } = Dimensions.get('window');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedDataPoint, setSelectedDataPoint] = useState<{
    dataPoint: TimeSeriesDataPoint;
    series: TimeSeriesSeries;
  } | null>(null);

  // Determine if screen is narrow (mobile)
  const isNarrowScreen = windowWidth < 768;

  // Handle cross-platform navigation (back button, escape key, browser navigation)
  useModalNavigation({ visible, onClose });

  const handleDataPointPress = (dataPoint: TimeSeriesDataPoint, series: TimeSeriesSeries) => {
    setSelectedDataPoint({ dataPoint, series });
    onDataPointPress?.(dataPoint, series);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatValue = (value: number): string => {
    return valueFormatter ? valueFormatter(value) : formatValueLabel(value);
  };

  const calculateStatistics = (seriesData: TimeSeriesSeries) => {
    if (seriesData.data.length === 0) {
      return { min: 0, max: 0, avg: 0, count: 0 };
    }

    const values = seriesData.data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const count = values.length;

    return { min, max, avg, count };
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

          <View style={styles.menuButtonPlaceholder} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={true}
        >
          {/* Full Chart */}
          <View style={[styles.chartContainer, isNarrowScreen && styles.chartContainerNarrow]}>
            <TimeSeriesChart
              series={series}
              mode="full"
              showLegend
              showGrid
              showXAxis
              showYAxis
              xAxisLabel={xAxisLabel}
              yAxisLabel={yAxisLabel}
              onDataPointPress={handleDataPointPress}
              pageSize={pageSize}
              currentPage={currentPage}
              totalDataPoints={totalDataPoints}
              onPageChange={handlePageChange}
              valueFormatter={valueFormatter}
              dateFormatter={dateFormatter}
              height={isNarrowScreen ? 300 : 500}
            />
          </View>

          {/* Selected Data Point Details */}
          {selectedDataPoint && (
            <View style={styles.selectedDataSection}>
              <Text style={styles.sectionTitle}>Selected Data Point</Text>
              <View style={styles.selectedDataCard}>
                <View style={styles.selectedDataHeader}>
                  <View
                    style={[
                      styles.selectedDataSeriesIndicator,
                      { backgroundColor: selectedDataPoint.series.color },
                    ]}
                  />
                  <Text style={styles.selectedDataSeriesName}>
                    {selectedDataPoint.series.name}
                  </Text>
                </View>

                <View style={styles.selectedDataRow}>
                  <Text style={styles.selectedDataLabel}>Value:</Text>
                  <Text style={styles.selectedDataValue}>
                    {formatValue(selectedDataPoint.dataPoint.value)}
                  </Text>
                </View>

                <View style={styles.selectedDataRow}>
                  <Text style={styles.selectedDataLabel}>Time:</Text>
                  <Text style={styles.selectedDataValue}>
                    {selectedDataPoint.dataPoint.timestamp.toLocaleString()}
                  </Text>
                </View>

                {selectedDataPoint.dataPoint.label && (
                  <View style={styles.selectedDataRow}>
                    <Text style={styles.selectedDataLabel}>Label:</Text>
                    <Text style={styles.selectedDataValue}>
                      {selectedDataPoint.dataPoint.label}
                    </Text>
                  </View>
                )}

                {selectedDataPoint.dataPoint.metadata &&
                  Object.keys(selectedDataPoint.dataPoint.metadata).length > 0 && (
                    <View style={styles.metadataSection}>
                      <Text style={styles.selectedDataLabel}>Metadata:</Text>
                      {Object.entries(selectedDataPoint.dataPoint.metadata).map(
                        ([key, value]) => (
                          <View key={key} style={styles.metadataRow}>
                            <Text style={styles.metadataKey}>{key}:</Text>
                            <Text style={styles.metadataValue}>{String(value)}</Text>
                          </View>
                        )
                      )}
                    </View>
                  )}
              </View>
            </View>
          )}

          {/* Statistics Section */}
          <View style={styles.statisticsSection}>
            <Text style={styles.sectionTitle}>Statistics</Text>

            {series.map(s => {
              const stats = calculateStatistics(s);

              return (
                <View key={s.id} style={styles.statisticsCard}>
                  <View style={styles.statisticsHeader}>
                    <View style={[styles.seriesIndicator, { backgroundColor: s.color }]} />
                    <Text style={styles.statisticsSeriesName}>{s.name}</Text>
                  </View>

                  <View style={styles.statisticsGrid}>
                    <View style={styles.statisticsItem}>
                      <Text style={styles.statisticsLabel}>Count</Text>
                      <Text style={styles.statisticsValue}>{stats.count}</Text>
                    </View>

                    <View style={styles.statisticsItem}>
                      <Text style={styles.statisticsLabel}>Min</Text>
                      <Text style={styles.statisticsValue}>{formatValue(stats.min)}</Text>
                    </View>

                    <View style={styles.statisticsItem}>
                      <Text style={styles.statisticsLabel}>Max</Text>
                      <Text style={styles.statisticsValue}>{formatValue(stats.max)}</Text>
                    </View>

                    <View style={styles.statisticsItem}>
                      <Text style={styles.statisticsLabel}>Average</Text>
                      <Text style={styles.statisticsValue}>{formatValue(stats.avg)}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

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

  menuButtonPlaceholder: {
    width: 40,
    height: 40,
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

  content: {
    flex: 1,
  },

  contentContainer: {
    flexGrow: 1,
  },

  chartContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },

  chartContainerNarrow: {
    marginHorizontal: 8,
  },

  selectedDataSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },

  selectedDataCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  selectedDataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  selectedDataSeriesIndicator: {
    width: 16,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
  },

  selectedDataSeriesName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },

  selectedDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  selectedDataLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  selectedDataValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },

  metadataSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  metadataRow: {
    flexDirection: 'row',
    marginTop: 4,
    marginLeft: 12,
  },

  metadataKey: {
    fontSize: 13,
    color: '#6B7280',
    marginRight: 8,
  },

  metadataValue: {
    fontSize: 13,
    color: '#111827',
    flex: 1,
  },

  statisticsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },

  statisticsCard: {
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

  statisticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  seriesIndicator: {
    width: 16,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
  },

  statisticsSeriesName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },

  statisticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  statisticsItem: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },

  statisticsLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },

  statisticsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  bottomSpacer: {
    height: 32,
  },
});
