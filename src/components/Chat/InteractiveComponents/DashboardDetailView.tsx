import React, { useState } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import type { DashboardDetailViewProps, DashboardItemConfig } from './Dashboard.types';
import { Dashboard } from './Dashboard';
import { TimeSeriesChartDetailView } from './TimeSeriesChartDetailView';
import { GanttChartDetailView } from './GanttChartDetailView';
import { GraphVisualizationDetailView } from './GraphVisualizationDetailView';
import { CodeBlockDetailView } from './CodeBlockDetailView';
import { MediaDetailView } from './MediaDetailView';
import { TaskListDetailView } from './TaskListDetailView';

export const DashboardDetailView: React.FC<DashboardDetailViewProps> = ({
  visible,
  config,
  onClose,
  onItemPress,
}) => {
  const [expandedItem, setExpandedItem] = useState<DashboardItemConfig | null>(null);

  const handleItemPress = (item: DashboardItemConfig) => {
    setExpandedItem(item);
    onItemPress?.(item);
  };

  const handleCloseExpanded = () => {
    setExpandedItem(null);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{config.title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.dashboardWrapper}>
          <Dashboard
            config={config}
            mode="full"
            onItemPress={handleItemPress}
            scrollable={true}
            showHeader={false}
          />
        </View>

        {/* Individual item detail views */}
        {expandedItem?.type === 'time-series-chart' && (
          <TimeSeriesChartDetailView
            visible={!!expandedItem}
            series={expandedItem.data.series}
            title={expandedItem.data.title}
            subtitle={expandedItem.data.subtitle}
            pageSize={expandedItem.data.pageSize}
            totalDataPoints={expandedItem.data.totalDataPoints}
            xAxisLabel={expandedItem.data.xAxisLabel}
            yAxisLabel={expandedItem.data.yAxisLabel}
            onClose={handleCloseExpanded}
          />
        )}

        {expandedItem?.type === 'gantt-chart' && (
          <GanttChartDetailView
            visible={!!expandedItem}
            tasks={expandedItem.data.allTasks || expandedItem.data.tasks}
            title={expandedItem.data.title}
            subtitle={expandedItem.data.subtitle}
            onClose={handleCloseExpanded}
          />
        )}

        {expandedItem?.type === 'graph-visualization' && (
          <GraphVisualizationDetailView
            visible={!!expandedItem}
            data={expandedItem.data.data}
            title={expandedItem.data.title}
            subtitle={expandedItem.data.subtitle}
            onClose={handleCloseExpanded}
          />
        )}

        {expandedItem?.type === 'code-block' && (
          <CodeBlockDetailView
            visible={!!expandedItem}
            code={expandedItem.data.code}
            language={expandedItem.data.language}
            fileName={expandedItem.data.fileName}
            title={expandedItem.data.title}
            onClose={handleCloseExpanded}
          />
        )}

        {expandedItem?.type === 'media' && (
          <MediaDetailView
            visible={!!expandedItem}
            media={expandedItem.data.media}
            onClose={handleCloseExpanded}
          />
        )}

        {expandedItem?.type === 'task-list' && (
          <TaskListDetailView
            visible={!!expandedItem}
            tasks={expandedItem.data.allTasks || expandedItem.data.tasks}
            title={expandedItem.data.title}
            subtitle={expandedItem.data.subtitle}
            onClose={handleCloseExpanded}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  dashboardWrapper: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#64748B',
    fontWeight: '600',
  },
});
