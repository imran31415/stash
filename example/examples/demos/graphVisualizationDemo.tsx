import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GraphVisualization, type GraphData } from '../../../src/components/Chat/InteractiveComponents';
import { DemoConfig } from './types';

const graphVisualizationDemo: DemoConfig<GraphData> = {
  id: 'graph',
  title: 'Graph Visualization',
  description: 'Network graph with nodes and relationships for visualizing connected data',

  initialCode: `{
  "nodes": [
    {
      "id": "user1",
      "labels": ["User", "Admin"],
      "properties": {
        "name": "Alice Johnson",
        "email": "alice@example.com",
        "role": "Administrator"
      },
      "color": "#3B82F6"
    },
    {
      "id": "user2",
      "labels": ["User"],
      "properties": {
        "name": "Bob Smith",
        "email": "bob@example.com",
        "role": "Developer"
      },
      "color": "#10B981"
    },
    {
      "id": "user3",
      "labels": ["User"],
      "properties": {
        "name": "Carol Wang",
        "email": "carol@example.com",
        "role": "Designer"
      },
      "color": "#F59E0B"
    },
    {
      "id": "project1",
      "labels": ["Project"],
      "properties": {
        "name": "Web Redesign",
        "status": "active",
        "budget": 50000
      },
      "color": "#8B5CF6"
    },
    {
      "id": "project2",
      "labels": ["Project"],
      "properties": {
        "name": "Mobile App",
        "status": "planning",
        "budget": 75000
      },
      "color": "#EC4899"
    }
  ],
  "edges": [
    {
      "id": "e1",
      "type": "MANAGES",
      "source": "user1",
      "target": "project1",
      "properties": {
        "since": "2024-01-15"
      }
    },
    {
      "id": "e2",
      "type": "WORKS_ON",
      "source": "user2",
      "target": "project1",
      "properties": {
        "role": "Lead Developer"
      }
    },
    {
      "id": "e3",
      "type": "WORKS_ON",
      "source": "user3",
      "target": "project1",
      "properties": {
        "role": "UI/UX Designer"
      }
    },
    {
      "id": "e4",
      "type": "MANAGES",
      "source": "user1",
      "target": "project2"
    },
    {
      "id": "e5",
      "type": "COLLABORATES_WITH",
      "source": "user2",
      "target": "user3"
    }
  ]
}`,

  implementationCode: `import { GraphVisualization, type GraphData } from 'stash';

// Define your graph data
const data: GraphData = {
  nodes: [
    {
      id: 'user1',
      labels: ['User', 'Admin'],
      properties: {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'Administrator'
      },
      color: '#3B82F6'
    },
    {
      id: 'user2',
      labels: ['User'],
      properties: {
        name: 'Bob Smith',
        email: 'bob@example.com',
        role: 'Developer'
      },
      color: '#10B981'
    },
    {
      id: 'project1',
      labels: ['Project'],
      properties: {
        name: 'Web Redesign',
        status: 'active',
        budget: 50000
      },
      color: '#8B5CF6'
    }
    // ... more nodes
  ],
  edges: [
    {
      id: 'e1',
      type: 'MANAGES',
      source: 'user1',
      target: 'project1',
      properties: {
        since: '2024-01-15'
      }
    },
    {
      id: 'e2',
      type: 'WORKS_ON',
      source: 'user2',
      target: 'project1',
      properties: {
        role: 'Lead Developer'
      }
    }
    // ... more edges
  ]
};

// Render the GraphVisualization component
<GraphVisualization
  data={data}
  mode="full"
  height={400}
  layout="force"
  showLabels={true}
  showLegend={true}
/>`,

  parseData: (code: string): GraphData | null => {
    try {
      const parsed = JSON.parse(code);

      if (!parsed || typeof parsed !== 'object') {
        console.error('GraphVisualizationDemo: Data must be an object');
        return null;
      }

      if (!Array.isArray(parsed.nodes)) {
        console.error('GraphVisualizationDemo: Data must have nodes array');
        return null;
      }

      if (!Array.isArray(parsed.edges)) {
        console.error('GraphVisualizationDemo: Data must have edges array');
        return null;
      }

      return {
        nodes: parsed.nodes.map((node: any) => ({
          id: String(node.id),
          labels: Array.isArray(node.labels) ? node.labels.map(String) : [],
          properties: node.properties || {},
          color: node.color ? String(node.color) : undefined,
          size: node.size ? Number(node.size) : undefined,
          icon: node.icon ? String(node.icon) : undefined,
        })),
        edges: parsed.edges.map((edge: any) => ({
          id: String(edge.id),
          type: String(edge.type || 'RELATED'),
          source: String(edge.source),
          target: String(edge.target),
          properties: edge.properties || {},
          color: edge.color ? String(edge.color) : undefined,
          width: edge.width ? Number(edge.width) : undefined,
          label: edge.label ? String(edge.label) : undefined,
          directed: edge.directed !== undefined ? Boolean(edge.directed) : undefined,
        })),
        metadata: parsed.metadata || undefined,
      };
    } catch (e) {
      console.error('GraphVisualizationDemo parse error:', e);
      return null;
    }
  },

  renderPreview: (data: GraphData) => {
    if (!data || !data.nodes || data.nodes.length === 0) {
      return (
        <View style={styles.errorView}>
          <Text style={styles.errorText}>Please provide nodes in the graph data</Text>
        </View>
      );
    }

    return (
      <GraphVisualization
        data={data}
        mode="full"
        height={400}
        layout="force"
        showLabels={true}
        showLegend={true}
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

export default graphVisualizationDemo;
