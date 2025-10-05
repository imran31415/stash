import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dashboard, type DashboardConfig } from '../../../src/components/Chat/InteractiveComponents';
import { DemoConfig } from './types';

const dashboardDemo: DemoConfig<DashboardConfig> = {
  id: 'dashboard',
  title: 'Dashboard',
  description: 'Complex dashboard with live data, videos, flame graphs, and workflows',

  initialCode: `{
  "id": "complex-dashboard",
  "title": "System Monitoring Dashboard",
  "subtitle": "Real-time performance and workflow tracking",
  "description": "A comprehensive dashboard showing system metrics, video feeds, performance analysis, and workflow status",
  "gridSize": "custom",
  "customGrid": {
    "rows": 4,
    "cols": 3
  },
  "spacing": 12,
  "padding": 16,
  "items": [
    {
      "id": "cpu-metrics",
      "type": "time-series-chart",
      "gridPosition": {
        "row": 0,
        "col": 0,
        "rowSpan": 1,
        "colSpan": 2
      },
      "data": {
        "title": "CPU Usage",
        "subtitle": "Last 24 hours",
        "series": [
          {
            "id": "cpu",
            "name": "CPU %",
            "data": [
              { "timestamp": "2025-01-01T00:00:00.000Z", "value": 45 },
              { "timestamp": "2025-01-01T04:00:00.000Z", "value": 62 },
              { "timestamp": "2025-01-01T08:00:00.000Z", "value": 78 },
              { "timestamp": "2025-01-01T12:00:00.000Z", "value": 85 },
              { "timestamp": "2025-01-01T16:00:00.000Z", "value": 72 },
              { "timestamp": "2025-01-01T20:00:00.000Z", "value": 58 }
            ],
            "color": "#3B82F6",
            "unit": "%"
          }
        ],
        "mode": "mini",
        "showLegend": true,
        "showGrid": true,
        "height": 250
      }
    },
    {
      "id": "video-feed",
      "type": "video",
      "gridPosition": {
        "row": 0,
        "col": 2,
        "rowSpan": 1,
        "colSpan": 1
      },
      "data": {
        "uri": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "title": "Security Camera 1",
        "mode": "mini",
        "autoPlay": false,
        "showControls": true,
        "height": 250
      }
    },
    {
      "id": "memory-metrics",
      "type": "time-series-chart",
      "gridPosition": {
        "row": 1,
        "col": 0,
        "rowSpan": 1,
        "colSpan": 2
      },
      "data": {
        "title": "Memory Usage",
        "subtitle": "RAM and Swap",
        "series": [
          {
            "id": "ram",
            "name": "RAM",
            "data": [
              { "timestamp": "2025-01-01T00:00:00.000Z", "value": 4.2 },
              { "timestamp": "2025-01-01T04:00:00.000Z", "value": 5.8 },
              { "timestamp": "2025-01-01T08:00:00.000Z", "value": 6.5 },
              { "timestamp": "2025-01-01T12:00:00.000Z", "value": 7.2 },
              { "timestamp": "2025-01-01T16:00:00.000Z", "value": 6.8 },
              { "timestamp": "2025-01-01T20:00:00.000Z", "value": 5.5 }
            ],
            "color": "#10B981",
            "unit": "GB"
          }
        ],
        "mode": "mini",
        "showLegend": true,
        "showGrid": true,
        "height": 250
      }
    },
    {
      "id": "tasks",
      "type": "task-list",
      "gridPosition": {
        "row": 1,
        "col": 2,
        "rowSpan": 1,
        "colSpan": 1
      },
      "data": {
        "title": "Active Tasks",
        "tasks": [
          {
            "id": "1",
            "title": "Deploy v2.0",
            "status": "in-progress",
            "priority": "high",
            "assignee": "Alice"
          },
          {
            "id": "2",
            "title": "Fix memory leak",
            "status": "in-progress",
            "priority": "critical",
            "assignee": "Bob"
          },
          {
            "id": "3",
            "title": "Update docs",
            "status": "pending",
            "priority": "medium",
            "assignee": "Carol"
          }
        ],
        "mode": "mini",
        "height": 250
      }
    },
    {
      "id": "api-flamegraph",
      "type": "custom",
      "gridPosition": {
        "row": 2,
        "col": 0,
        "rowSpan": 1,
        "colSpan": 1
      },
      "data": {
        "title": "API Performance",
        "description": "Flame graph showing API call stack",
        "componentType": "flame-graph",
        "height": 300
      }
    },
    {
      "id": "db-flamegraph",
      "type": "custom",
      "gridPosition": {
        "row": 2,
        "col": 1,
        "rowSpan": 1,
        "colSpan": 1
      },
      "data": {
        "title": "Database Queries",
        "description": "Query execution breakdown",
        "componentType": "flame-graph",
        "height": 300
      }
    },
    {
      "id": "service-graph",
      "type": "graph-visualization",
      "gridPosition": {
        "row": 2,
        "col": 2,
        "rowSpan": 1,
        "colSpan": 1
      },
      "data": {
        "title": "Service Mesh",
        "nodes": [
          { "id": "api", "label": "API Gateway", "type": "service", "status": "healthy" },
          { "id": "auth", "label": "Auth Service", "type": "service", "status": "healthy" },
          { "id": "db", "label": "Database", "type": "database", "status": "warning" }
        ],
        "edges": [
          { "id": "e1", "source": "api", "target": "auth", "label": "authenticate" },
          { "id": "e2", "source": "auth", "target": "db", "label": "query" }
        ],
        "mode": "mini",
        "layout": "force",
        "height": 300
      }
    },
    {
      "id": "deployment-workflow",
      "type": "workflow",
      "gridPosition": {
        "row": 3,
        "col": 0,
        "rowSpan": 1,
        "colSpan": 3
      },
      "data": {
        "id": "deploy-pipeline",
        "name": "Deployment Pipeline",
        "nodes": [
          { "id": "build", "type": "task", "label": "Build", "status": "success" },
          { "id": "test", "type": "task", "label": "Test", "status": "success" },
          { "id": "staging", "type": "task", "label": "Deploy to Staging", "status": "running" },
          { "id": "approve", "type": "condition", "label": "Manual Approval", "status": "waiting" },
          { "id": "prod", "type": "task", "label": "Deploy to Production", "status": "idle" }
        ],
        "edges": [
          { "id": "e1", "source": "build", "target": "test", "conditionType": "success" },
          { "id": "e2", "source": "test", "target": "staging", "conditionType": "success" },
          { "id": "e3", "source": "staging", "target": "approve", "conditionType": "success" },
          { "id": "e4", "source": "approve", "target": "prod", "conditionType": "success" }
        ],
        "mode": "mini",
        "orientation": "horizontal",
        "showLabels": true,
        "showStatus": true,
        "height": 300
      }
    }
  ]
}`,

  implementationCode: `import { Dashboard, type DashboardConfig } from 'stash';

// Define your dashboard configuration
const config: DashboardConfig = {
  id: 'complex-dashboard',
  title: 'System Monitoring Dashboard',
  subtitle: 'Real-time performance and workflow tracking',
  gridSize: 'custom',
  customGrid: {
    rows: 4,
    cols: 3
  },
  spacing: 12,
  padding: 16,
  items: [
    // Top row: CPU metrics (2 cols) + Video feed (1 col)
    {
      id: 'cpu-metrics',
      type: 'time-series-chart',
      gridPosition: { row: 0, col: 0, rowSpan: 1, colSpan: 2 },
      data: {
        title: 'CPU Usage',
        series: [/* ... */],
        mode: 'mini',
        height: 250
      }
    },
    {
      id: 'video-feed',
      type: 'video',
      gridPosition: { row: 0, col: 2, rowSpan: 1, colSpan: 1 },
      data: {
        uri: 'https://example.com/video.mp4',
        title: 'Security Camera 1',
        mode: 'mini',
        height: 250
      }
    },

    // Second row: Memory metrics (2 cols) + Tasks (1 col)
    {
      id: 'memory-metrics',
      type: 'time-series-chart',
      gridPosition: { row: 1, col: 0, rowSpan: 1, colSpan: 2 },
      data: {
        title: 'Memory Usage',
        series: [/* ... */],
        mode: 'mini',
        height: 250
      }
    },
    {
      id: 'tasks',
      type: 'task-list',
      gridPosition: { row: 1, col: 2, rowSpan: 1, colSpan: 1 },
      data: {
        title: 'Active Tasks',
        tasks: [/* ... */],
        mode: 'mini',
        height: 250
      }
    },

    // Third row: Flame graphs (2 items) + Service graph (1 item)
    {
      id: 'api-flamegraph',
      type: 'custom',
      gridPosition: { row: 2, col: 0, rowSpan: 1, colSpan: 1 },
      data: { /* flame graph data */ }
    },
    {
      id: 'db-flamegraph',
      type: 'custom',
      gridPosition: { row: 2, col: 1, rowSpan: 1, colSpan: 1 },
      data: { /* flame graph data */ }
    },
    {
      id: 'service-graph',
      type: 'graph-visualization',
      gridPosition: { row: 2, col: 2, rowSpan: 1, colSpan: 1 },
      data: {
        title: 'Service Mesh',
        nodes: [/* ... */],
        edges: [/* ... */],
        mode: 'mini',
        height: 300
      }
    },

    // Bottom row: Workflow spanning full width (3 cols)
    {
      id: 'deployment-workflow',
      type: 'workflow',
      gridPosition: { row: 3, col: 0, rowSpan: 1, colSpan: 3 },
      data: {
        name: 'Deployment Pipeline',
        nodes: [/* ... */],
        edges: [/* ... */],
        mode: 'mini',
        height: 300
      }
    }
  ]
};

// Render the Dashboard component
<Dashboard
  config={config}
  mode="full"
  showHeader={true}
  scrollable={true}
  height={1400}
/>`,

  parseData: (code: string): DashboardConfig | null => {
    try {
      const parsed = JSON.parse(code);

      if (!parsed || typeof parsed !== 'object') {
        console.error('DashboardDemo: Data must be an object');
        return null;
      }

      if (!parsed.id || !parsed.title || !parsed.gridSize || !Array.isArray(parsed.items)) {
        console.error('DashboardDemo: Missing required fields (id, title, gridSize, items)');
        return null;
      }

      return {
        id: String(parsed.id),
        title: String(parsed.title),
        subtitle: parsed.subtitle ? String(parsed.subtitle) : undefined,
        description: parsed.description ? String(parsed.description) : undefined,
        gridSize: parsed.gridSize as any,
        customGrid: parsed.customGrid ? {
          rows: Number(parsed.customGrid.rows) || 2,
          cols: Number(parsed.customGrid.cols) || 2,
        } : undefined,
        items: parsed.items.map((item: any) => ({
          id: String(item.id),
          type: item.type as any,
          gridPosition: {
            row: Number(item.gridPosition.row) || 0,
            col: Number(item.gridPosition.col) || 0,
            rowSpan: item.gridPosition.rowSpan ? Number(item.gridPosition.rowSpan) : 1,
            colSpan: item.gridPosition.colSpan ? Number(item.gridPosition.colSpan) : 1,
          },
          data: item.data,
        })),
        backgroundColor: parsed.backgroundColor ? String(parsed.backgroundColor) : undefined,
        spacing: parsed.spacing ? Number(parsed.spacing) : undefined,
        padding: parsed.padding ? Number(parsed.padding) : undefined,
      };
    } catch (e) {
      console.error('DashboardDemo parse error:', e);
      return null;
    }
  },

  renderPreview: (config: DashboardConfig) => {
    if (!config || !config.items || config.items.length === 0) {
      return (
        <View style={styles.errorView}>
          <Text style={styles.errorText}>Please provide a valid dashboard configuration with items</Text>
        </View>
      );
    }

    return (
      <Dashboard
        config={config}
        mode="full"
        showHeader={true}
        scrollable={true}
        height={1400}
      />
    );
  },
};

const styles = StyleSheet.create({
  errorView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    margin: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default dashboardDemo;
