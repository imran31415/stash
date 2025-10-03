import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  Dashboard,
  DashboardDetailView,
  DashboardPreview,
  type DashboardConfig,
  type DashboardItemConfig,
} from '../../src/components/Chat/InteractiveComponents';
import { addDays, addHours } from 'date-fns';

const DashboardExample: React.FC = () => {
  const [detailViewVisible, setDetailViewVisible] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState<DashboardConfig | null>(null);

  // Example: Website Metrics Dashboard
  const websiteMetricsDashboard: DashboardConfig = {
    id: 'website-metrics',
    title: 'Website Metrics Dashboard',
    subtitle: 'Real-time website analytics and performance',
    description: 'Comprehensive view of website traffic, user engagement, and performance metrics',
    gridSize: '2x2',
    spacing: 12,
    items: [
      {
        id: 'traffic-chart',
        type: 'time-series-chart',
        gridPosition: { row: 0, col: 0, colSpan: 2 },
        data: {
          series: [
            {
              id: 'visitors',
              name: 'Visitors',
              data: Array.from({ length: 24 }, (_, i) => ({
                timestamp: addHours(new Date(), -24 + i),
                value: Math.floor(Math.random() * 500) + 200,
              })),
            },
            {
              id: 'pageviews',
              name: 'Page Views',
              data: Array.from({ length: 24 }, (_, i) => ({
                timestamp: addHours(new Date(), -24 + i),
                value: Math.floor(Math.random() * 800) + 400,
              })),
            },
          ],
          title: 'Traffic Overview (Last 24 Hours)',
          showLegend: true,
          showGrid: true,
        },
      },
      {
        id: 'conversion-rate',
        type: 'time-series-chart',
        gridPosition: { row: 1, col: 0 },
        data: {
          series: [
            {
              id: 'conversion',
              name: 'Conversion Rate',
              data: Array.from({ length: 24 }, (_, i) => ({
                timestamp: addHours(new Date(), -24 + i),
                value: Math.random() * 5 + 2,
              })),
            },
          ],
          title: 'Conversion Rate (%)',
          showLegend: false,
          showGrid: true,
        },
      },
      {
        id: 'bounce-rate',
        type: 'time-series-chart',
        gridPosition: { row: 1, col: 1 },
        data: {
          series: [
            {
              id: 'bounce',
              name: 'Bounce Rate',
              data: Array.from({ length: 24 }, (_, i) => ({
                timestamp: addHours(new Date(), -24 + i),
                value: Math.random() * 30 + 40,
              })),
            },
          ],
          title: 'Bounce Rate (%)',
          showLegend: false,
          showGrid: true,
        },
      },
    ],
  };

  // Example: Project Management Dashboard
  const projectDashboard: DashboardConfig = {
    id: 'project-mgmt',
    title: 'Project Management Dashboard',
    subtitle: 'Team tasks and project timeline',
    description: 'Overview of current sprint tasks and project schedule',
    gridSize: '2x2',
    spacing: 12,
    items: [
      {
        id: 'task-list',
        type: 'task-list',
        gridPosition: { row: 0, col: 0 },
        data: {
          title: 'Current Sprint Tasks',
          tasks: [
            {
              id: '1',
              title: 'Implement user authentication',
              description: 'Add OAuth and JWT support',
              startDate: new Date(),
              endDate: addDays(new Date(), 5),
              progress: 60,
              status: 'in-progress',
              priority: 'high',
              assignee: 'Alice Chen',
            },
            {
              id: '2',
              title: 'Design dashboard UI',
              description: 'Create mockups and wireframes',
              startDate: new Date(),
              endDate: addDays(new Date(), 3),
              progress: 90,
              status: 'in-progress',
              priority: 'medium',
              assignee: 'Bob Smith',
            },
            {
              id: '3',
              title: 'Write API documentation',
              description: 'Document all endpoints',
              startDate: addDays(new Date(), 2),
              endDate: addDays(new Date(), 7),
              progress: 0,
              status: 'pending',
              priority: 'medium',
              assignee: 'Carol Wang',
            },
          ],
          mode: 'mini',
        },
      },
      {
        id: 'gantt-chart',
        type: 'gantt-chart',
        gridPosition: { row: 0, col: 1, rowSpan: 2 },
        data: {
          title: 'Project Timeline',
          tasks: [
            {
              id: '1',
              title: 'Phase 1: Planning',
              startDate: new Date(),
              endDate: addDays(new Date(), 7),
              progress: 100,
              status: 'completed',
              color: '#10B981',
            },
            {
              id: '2',
              title: 'Phase 2: Development',
              startDate: addDays(new Date(), 7),
              endDate: addDays(new Date(), 21),
              progress: 45,
              status: 'in-progress',
              color: '#3B82F6',
            },
            {
              id: '3',
              title: 'Phase 3: Testing',
              startDate: addDays(new Date(), 21),
              endDate: addDays(new Date(), 28),
              progress: 0,
              status: 'pending',
              color: '#F59E0B',
            },
          ],
          mode: 'mini',
          showProgress: true,
        },
      },
      {
        id: 'team-velocity',
        type: 'time-series-chart',
        gridPosition: { row: 1, col: 0 },
        data: {
          series: [
            {
              id: 'velocity',
              name: 'Story Points',
              data: Array.from({ length: 10 }, (_, i) => ({
                timestamp: addDays(new Date(), -10 + i),
                value: Math.floor(Math.random() * 30) + 20,
              })),
            },
          ],
          title: 'Team Velocity',
          showLegend: false,
        },
      },
    ],
  };

  // Example: Sales Dashboard
  const salesDashboard: DashboardConfig = {
    id: 'sales-dashboard',
    title: 'Sales Performance Dashboard',
    subtitle: 'Monthly sales metrics and trends',
    description: 'Track revenue, deals, and sales team performance',
    gridSize: '3x3',
    spacing: 8,
    items: [
      {
        id: 'revenue-chart',
        type: 'time-series-chart',
        gridPosition: { row: 0, col: 0, colSpan: 2 },
        data: {
          series: [
            {
              id: 'revenue',
              name: 'Revenue',
              data: Array.from({ length: 30 }, (_, i) => ({
                timestamp: addDays(new Date(), -30 + i),
                value: Math.floor(Math.random() * 50000) + 30000,
              })),
            },
          ],
          title: 'Monthly Revenue Trend',
          yAxisLabel: 'Revenue ($)',
        },
      },
      {
        id: 'deals-chart',
        type: 'time-series-chart',
        gridPosition: { row: 0, col: 2 },
        data: {
          series: [
            {
              id: 'deals',
              name: 'Deals Closed',
              data: Array.from({ length: 30 }, (_, i) => ({
                timestamp: addDays(new Date(), -30 + i),
                value: Math.floor(Math.random() * 10) + 5,
              })),
            },
          ],
          title: 'Deals Closed',
        },
      },
      {
        id: 'top-products',
        type: 'graph-visualization',
        gridPosition: { row: 1, col: 0, rowSpan: 2, colSpan: 2 },
        data: {
          title: 'Product Sales Network',
          data: {
            nodes: [
              { id: 'product-a', labels: ['Product'], properties: { name: 'Product A' } },
              { id: 'product-b', labels: ['Product'], properties: { name: 'Product B' } },
              { id: 'product-c', labels: ['Product'], properties: { name: 'Product C' } },
              { id: 'region-1', labels: ['Region'], properties: { name: 'North' } },
              { id: 'region-2', labels: ['Region'], properties: { name: 'South' } },
              { id: 'region-3', labels: ['Region'], properties: { name: 'East' } },
            ],
            edges: [
              { id: 'e1', source: 'product-a', target: 'region-1', type: 'sold_in' },
              { id: 'e2', source: 'product-a', target: 'region-2', type: 'sold_in' },
              { id: 'e3', source: 'product-b', target: 'region-2', type: 'sold_in' },
              { id: 'e4', source: 'product-b', target: 'region-3', type: 'sold_in' },
              { id: 'e5', source: 'product-c', target: 'region-1', type: 'sold_in' },
              { id: 'e6', source: 'product-c', target: 'region-3', type: 'sold_in' },
            ],
          },
          mode: 'mini',
        },
      },
      {
        id: 'sales-team',
        type: 'task-list',
        gridPosition: { row: 1, col: 2, rowSpan: 2 },
        data: {
          title: 'Top Performers',
          tasks: [
            {
              id: '1',
              title: 'Sarah Johnson',
              description: '$120K revenue',
              progress: 100,
              status: 'completed',
              priority: 'high',
            },
            {
              id: '2',
              title: 'Mike Davis',
              description: '$95K revenue',
              progress: 79,
              status: 'in-progress',
              priority: 'high',
            },
            {
              id: '3',
              title: 'Emily Chen',
              description: '$87K revenue',
              progress: 73,
              status: 'in-progress',
              priority: 'medium',
            },
          ],
          mode: 'mini',
        },
      },
    ],
  };

  const handleDashboardPress = (dashboard: DashboardConfig) => {
    setSelectedDashboard(dashboard);
    setDetailViewVisible(true);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.pageTitle}>Dashboard Component Examples</Text>
        <Text style={styles.pageSubtitle}>
          Flexible grid-based dashboards with interactive components
        </Text>

        {/* Website Metrics Dashboard - Full View */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Website Metrics Dashboard (2x2 Grid)</Text>
          <Dashboard
            config={websiteMetricsDashboard}
            mode="full"
            height={600}
            onItemPress={(item) => console.log('Item pressed:', item.id)}
          />
        </View>

        {/* Project Management Dashboard - Full View */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Management Dashboard (2x2 Grid)</Text>
          <Dashboard
            config={projectDashboard}
            mode="full"
            height={600}
            onItemPress={(item) => console.log('Item pressed:', item.id)}
          />
        </View>

        {/* Sales Dashboard - Mini View with Expand */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sales Dashboard (Mini Mode)</Text>
          <Dashboard
            config={salesDashboard}
            mode="mini"
            height={300}
            onExpandPress={() => handleDashboardPress(salesDashboard)}
          />
        </View>

        {/* Dashboard Preview - For Chat Integration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dashboard Preview (For Chat)</Text>
          <Text style={styles.sectionDescription}>
            Compact preview showing dashboard overview with tap to expand
          </Text>
          <DashboardPreview
            config={websiteMetricsDashboard}
            maxPreviewItems={4}
            onPress={() => handleDashboardPress(websiteMetricsDashboard)}
          />
        </View>

        <View style={styles.section}>
          <DashboardPreview
            config={projectDashboard}
            maxPreviewItems={3}
            onPress={() => handleDashboardPress(projectDashboard)}
          />
        </View>

        <View style={styles.section}>
          <DashboardPreview
            config={salesDashboard}
            maxPreviewItems={4}
            onPress={() => handleDashboardPress(salesDashboard)}
          />
        </View>

        {/* Usage Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usage in Chat Messages</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>
              {`// Full dashboard in chat
message: {
  interactiveComponent: {
    type: 'dashboard',
    data: {
      config: dashboardConfig,
      mode: 'mini',
    },
  },
}

// Preview with link in chat
message: {
  interactiveComponent: {
    type: 'dashboard-preview',
    data: {
      config: dashboardConfig,
      maxPreviewItems: 4,
    },
  },
}`}
            </Text>
          </View>
        </View>
      </View>

      {/* Detail View Modal */}
      {selectedDashboard && (
        <DashboardDetailView
          visible={detailViewVisible}
          config={selectedDashboard}
          onClose={() => setDetailViewVisible(false)}
          onItemPress={(item) => console.log('Detail item pressed:', item.id)}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  codeBlock: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
  },
  codeText: {
    fontFamily: 'Courier New',
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 20,
  },
});

export default DashboardExample;
