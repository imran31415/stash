import React, { useState } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Text, SafeAreaView, ScrollView } from 'react-native';
import type { DashboardDetailViewProps, DashboardItemConfig } from './Dashboard.types';
import { Dashboard } from './Dashboard';
import { TimeSeriesChartDetailView } from './TimeSeriesChartDetailView';
import { GanttChartDetailView } from './GanttChartDetailView';
import { GraphVisualizationDetailView } from './GraphVisualizationDetailView';
import { CodeBlockDetailView } from './CodeBlockDetailView';
import { MediaDetailView } from './MediaDetailView';
import { TaskListDetailView } from './TaskListDetailView';
import { HeatmapDetailView } from './HeatmapDetailView';
import { WorkflowDetailView } from './WorkflowDetailView';
import { TreeViewDetailView } from './TreeViewDetailView';
import { KanbanBoardDetailView } from './KanbanBoardDetailView';
import { DataTableDetailView } from './DataTableDetailView';
import { ComparisonTableDetailView } from './ComparisonTableDetailView';
import { SankeyDiagramDetailView } from './SankeyDiagramDetailView';
import { NetworkTopologyDetailView } from './NetworkTopologyDetailView';
import { FunnelChartDetailView } from './FunnelChartDetailView';
import { FormBuilderDetailView } from './FormBuilderDetailView';
import { VideoStreamDetailView } from './VideoStreamDetailView';

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

        {expandedItem?.type === 'heatmap' && (
          <HeatmapDetailView
            visible={!!expandedItem}
            data={expandedItem.data}
            title={expandedItem.data.title || expandedItem.title}
            onClose={handleCloseExpanded}
          />
        )}

        {expandedItem?.type === 'workflow' && (
          <WorkflowDetailView
            visible={!!expandedItem}
            data={expandedItem.data}
            title={expandedItem.data.title || expandedItem.title}
            onClose={handleCloseExpanded}
          />
        )}

        {expandedItem?.type === 'tree-view' && (
          <TreeViewDetailView
            visible={!!expandedItem}
            data={expandedItem.data}
            title={expandedItem.data.title || expandedItem.title}
            onClose={handleCloseExpanded}
          />
        )}

        {expandedItem?.type === 'kanban-board' && (
          <KanbanBoardDetailView
            visible={!!expandedItem}
            data={expandedItem.data}
            title={expandedItem.data.title || expandedItem.title}
            onClose={handleCloseExpanded}
          />
        )}

        {expandedItem?.type === 'data-table' && (
          <DataTableDetailView
            visible={!!expandedItem}
            columns={expandedItem.data.columns}
            rows={expandedItem.data.rows}
            title={expandedItem.data.title || expandedItem.title}
            onClose={handleCloseExpanded}
          />
        )}

        {expandedItem?.type === 'comparison-table' && (
          <ComparisonTableDetailView
            visible={!!expandedItem}
            data={expandedItem.data}
            title={expandedItem.data.title || expandedItem.title}
            onClose={handleCloseExpanded}
          />
        )}

        {expandedItem?.type === 'sankey-diagram' && (
          <SankeyDiagramDetailView
            visible={!!expandedItem}
            data={expandedItem.data}
            title={expandedItem.data.title || expandedItem.title}
            onClose={handleCloseExpanded}
          />
        )}

        {expandedItem?.type === 'network-topology' && (
          <NetworkTopologyDetailView
            visible={!!expandedItem}
            data={expandedItem.data}
            title={expandedItem.data.title || expandedItem.title}
            onClose={handleCloseExpanded}
          />
        )}

        {expandedItem?.type === 'funnel-chart' && (
          <FunnelChartDetailView
            visible={!!expandedItem}
            data={expandedItem.data}
            title={expandedItem.data.title || expandedItem.title}
            onClose={handleCloseExpanded}
          />
        )}

        {expandedItem?.type === 'form-builder' && (
          <FormBuilderDetailView
            visible={!!expandedItem}
            data={expandedItem.data}
            title={expandedItem.data.title || expandedItem.title}
            onClose={handleCloseExpanded}
          />
        )}

        {(expandedItem?.type === 'video' || expandedItem?.type === 'video-stream') && (
          <VideoStreamDetailView
            visible={!!expandedItem}
            uri={expandedItem.data.uri}
            title={expandedItem.data.title || expandedItem.title}
            onClose={handleCloseExpanded}
          />
        )}

        {/* Generic detail view for simple widget types */}
        {expandedItem && ['stats', 'list', 'chart', 'timeline', 'resource-list', 'calendar-timeline'].includes(expandedItem.type) && (
          <GenericItemDetailView
            visible={!!expandedItem}
            item={expandedItem}
            onClose={handleCloseExpanded}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

// Generic detail view for simple widget types that don't have dedicated detail views
const GenericItemDetailView: React.FC<{
  visible: boolean;
  item: DashboardItemConfig;
  onClose: () => void;
}> = ({ visible, item, onClose }) => {
  const renderContent = () => {
    switch (item.type) {
      case 'stats':
        return (
          <View style={genericStyles.statsGrid}>
            {item.data?.stats?.map((stat: any, index: number) => (
              <View key={index} style={genericStyles.statCard}>
                <Text style={genericStyles.statValue}>{stat.value}</Text>
                <Text style={genericStyles.statLabel}>{stat.label}</Text>
                {stat.trend && (
                  <Text style={[genericStyles.statTrend, { color: stat.trend === 'up' ? '#22C55E' : stat.trend === 'down' ? '#EF4444' : '#6B7280' }]}>
                    {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→'} {stat.trendValue || ''}
                  </Text>
                )}
                {stat.description && (
                  <Text style={genericStyles.statDescription}>{stat.description}</Text>
                )}
              </View>
            ))}
          </View>
        );

      case 'list':
        return (
          <View style={genericStyles.listContainer}>
            {item.data?.items?.map((listItem: any, index: number) => (
              <View key={listItem.id || index} style={genericStyles.listItem}>
                {listItem.icon && <Text style={genericStyles.listIcon}>{listItem.icon}</Text>}
                <View style={genericStyles.listContent}>
                  <Text style={genericStyles.listLabel}>{listItem.label}</Text>
                  {listItem.description && (
                    <Text style={genericStyles.listDescription}>{listItem.description}</Text>
                  )}
                </View>
                {listItem.value && <Text style={genericStyles.listValue}>{listItem.value}</Text>}
              </View>
            ))}
          </View>
        );

      case 'chart':
        const chartItems = item.data?.segments || item.data?.series || [];
        const maxValue = chartItems.length > 0 ? Math.max(...chartItems.map((s: any) => s.value || 0)) : 100;
        return (
          <View style={genericStyles.chartContainer}>
            {chartItems.map((chartItem: any, index: number) => (
              <View key={index} style={genericStyles.chartRow}>
                <View style={[genericStyles.chartColor, { backgroundColor: chartItem.color || '#3B82F6' }]} />
                <Text style={genericStyles.chartLabel}>{chartItem.label || chartItem.name}</Text>
                <View style={genericStyles.chartBarContainer}>
                  <View style={[genericStyles.chartBar, { width: `${(chartItem.value / maxValue) * 100}%`, backgroundColor: chartItem.color || '#3B82F6' }]} />
                </View>
                <Text style={genericStyles.chartValue}>{chartItem.value}</Text>
              </View>
            ))}
          </View>
        );

      case 'timeline':
        return (
          <View style={genericStyles.timelineContainer}>
            {item.data?.events?.map((event: any, index: number) => (
              <View key={event.id || index} style={genericStyles.timelineItem}>
                <View style={genericStyles.timelineLeft}>
                  <View style={[genericStyles.timelineDot, { backgroundColor: event.color || '#3B82F6' }]} />
                  {index < (item.data?.events?.length || 0) - 1 && <View style={genericStyles.timelineLine} />}
                </View>
                <View style={genericStyles.timelineContent}>
                  <Text style={genericStyles.timelineTitle}>{event.title}</Text>
                  {event.time && <Text style={genericStyles.timelineTime}>{event.time}</Text>}
                  {event.description && <Text style={genericStyles.timelineDescription}>{event.description}</Text>}
                </View>
              </View>
            ))}
          </View>
        );

      default:
        return (
          <View style={genericStyles.defaultContent}>
            <Text style={genericStyles.defaultText}>
              {JSON.stringify(item.data, null, 2)}
            </Text>
          </View>
        );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={genericStyles.container}>
        <View style={genericStyles.header}>
          <Text style={genericStyles.headerTitle}>{item.title || item.type}</Text>
          <TouchableOpacity onPress={onClose} style={genericStyles.closeButton}>
            <Text style={genericStyles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={genericStyles.scrollContent} contentContainerStyle={genericStyles.scrollContentContainer}>
          {renderContent()}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const genericStyles = StyleSheet.create({
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
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
  },
  // Stats styles
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  statTrend: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  statDescription: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
  },
  // List styles
  listContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  listIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  listContent: {
    flex: 1,
  },
  listLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1E293B',
  },
  listDescription: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  listValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
  },
  // Chart styles
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  chartColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  chartLabel: {
    width: 100,
    fontSize: 14,
    color: '#1E293B',
  },
  chartBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    overflow: 'hidden',
  },
  chartBar: {
    height: '100%',
    borderRadius: 10,
  },
  chartValue: {
    width: 50,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'right',
  },
  // Timeline styles
  timelineContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#E2E8F0',
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  timelineTime: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  timelineDescription: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  // Default content
  defaultContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  defaultText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#64748B',
  },
});

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
