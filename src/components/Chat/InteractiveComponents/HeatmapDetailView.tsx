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
import { Heatmap } from './Heatmap';
import { useModalNavigation } from '../hooks';
import type { HeatmapDataPoint } from './Heatmap.types';
import { formatValueLabel } from './Heatmap.utils';

interface HeatmapDetailViewProps {
  visible: boolean;
  data: HeatmapDataPoint[];
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onCellPress?: (dataPoint: HeatmapDataPoint) => void;
  pageSize?: number;
  totalRows?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  valueFormatter?: (value: number) => string;
  xLabelFormatter?: (value: number | string) => string;
  yLabelFormatter?: (value: number | string) => string;
  colorScale?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'custom';
  customColorScale?: string[];
}

export const HeatmapDetailView: React.FC<HeatmapDetailViewProps> = ({
  visible,
  data,
  title = 'Heatmap',
  subtitle,
  onClose,
  onCellPress,
  pageSize,
  totalRows,
  xAxisLabel,
  yAxisLabel,
  valueFormatter,
  xLabelFormatter,
  yLabelFormatter,
  colorScale = 'blue',
  customColorScale,
}) => {
  const { width: windowWidth } = Dimensions.get('window');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedDataPoint, setSelectedDataPoint] = useState<HeatmapDataPoint | null>(null);

  // Determine if screen is narrow (mobile)
  const isNarrowScreen = windowWidth < 768;

  // Handle cross-platform navigation (back button, escape key, browser navigation)
  useModalNavigation({ visible, onClose });

  const handleCellPress = (dataPoint: HeatmapDataPoint) => {
    setSelectedDataPoint(dataPoint);
    onCellPress?.(dataPoint);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatValue = (value: number): string => {
    return valueFormatter ? valueFormatter(value) : formatValueLabel(value);
  };

  const calculateStatistics = () => {
    if (data.length === 0) {
      return { min: 0, max: 0, avg: 0, count: 0 };
    }

    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const count = values.length;

    return { min, max, avg, count };
  };

  const stats = calculateStatistics();

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
          {/* Full Heatmap */}
          <View style={[styles.heatmapContainer, isNarrowScreen && styles.heatmapContainerNarrow]}>
            <Heatmap
              data={data}
              mode="full"
              showLegend
              showGrid
              showXAxis
              showYAxis
              xAxisLabel={xAxisLabel}
              yAxisLabel={yAxisLabel}
              onCellPress={handleCellPress}
              pageSize={pageSize}
              currentPage={currentPage}
              totalRows={totalRows}
              onPageChange={handlePageChange}
              valueFormatter={valueFormatter}
              xLabelFormatter={xLabelFormatter}
              yLabelFormatter={yLabelFormatter}
              colorScale={colorScale}
              customColorScale={customColorScale}
              height={isNarrowScreen ? 300 : 500}
            />
          </View>

          {/* Selected Cell Details */}
          {selectedDataPoint && (
            <View style={styles.selectedDataSection}>
              <Text style={styles.sectionTitle}>Selected Cell</Text>
              <View style={styles.selectedDataCard}>
                <View style={styles.selectedDataRow}>
                  <Text style={styles.selectedDataLabel}>X:</Text>
                  <Text style={styles.selectedDataValue}>
                    {xLabelFormatter ? xLabelFormatter(selectedDataPoint.x) : String(selectedDataPoint.x)}
                  </Text>
                </View>

                <View style={styles.selectedDataRow}>
                  <Text style={styles.selectedDataLabel}>Y:</Text>
                  <Text style={styles.selectedDataValue}>
                    {yLabelFormatter ? yLabelFormatter(selectedDataPoint.y) : String(selectedDataPoint.y)}
                  </Text>
                </View>

                <View style={styles.selectedDataRow}>
                  <Text style={styles.selectedDataLabel}>Value:</Text>
                  <Text style={styles.selectedDataValue}>{formatValue(selectedDataPoint.value)}</Text>
                </View>

                {selectedDataPoint.label && (
                  <View style={styles.selectedDataRow}>
                    <Text style={styles.selectedDataLabel}>Label:</Text>
                    <Text style={styles.selectedDataValue}>{selectedDataPoint.label}</Text>
                  </View>
                )}

                {selectedDataPoint.metadata && Object.keys(selectedDataPoint.metadata).length > 0 && (
                  <View style={styles.metadataSection}>
                    <Text style={styles.selectedDataLabel}>Metadata:</Text>
                    {Object.entries(selectedDataPoint.metadata).map(([key, value]) => (
                      <View key={key} style={styles.metadataRow}>
                        <Text style={styles.metadataKey}>{key}:</Text>
                        <Text style={styles.metadataValue}>{String(value)}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Statistics Section */}
          <View style={styles.statisticsSection}>
            <Text style={styles.sectionTitle}>Statistics</Text>

            <View style={styles.statisticsCard}>
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

  heatmapContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },

  heatmapContainerNarrow: {
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
