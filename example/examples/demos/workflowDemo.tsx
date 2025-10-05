import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Workflow, type WorkflowData } from '../../../src/components/Chat/InteractiveComponents';
import { DemoConfig } from './types';

const workflowDemo: DemoConfig<WorkflowData> = {
  id: 'workflow',
  title: 'Workflow DAG',
  description: 'Directed acyclic graph for workflow visualization (Airflow/n8n-style)',

  initialCode: `{
  "id": "data-pipeline",
  "name": "Data Processing Pipeline",
  "description": "ETL workflow for customer data",
  "nodes": [
    {
      "id": "start",
      "type": "start",
      "label": "Start",
      "status": "success"
    },
    {
      "id": "extract",
      "type": "database",
      "label": "Extract Data",
      "description": "Fetch customer records",
      "status": "success",
      "icon": "🗄️"
    },
    {
      "id": "transform",
      "type": "transform",
      "label": "Transform",
      "description": "Clean and normalize data",
      "status": "running",
      "icon": "⚙️"
    },
    {
      "id": "validate",
      "type": "condition",
      "label": "Validate",
      "description": "Check data quality",
      "status": "waiting",
      "icon": "✓"
    },
    {
      "id": "load",
      "type": "database",
      "label": "Load to Warehouse",
      "description": "Insert into data warehouse",
      "status": "idle",
      "icon": "📊"
    },
    {
      "id": "notify",
      "type": "notification",
      "label": "Send Notification",
      "description": "Alert team on completion",
      "status": "idle",
      "icon": "📧"
    },
    {
      "id": "end",
      "type": "end",
      "label": "End",
      "status": "idle"
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "start",
      "target": "extract",
      "conditionType": "always"
    },
    {
      "id": "e2",
      "source": "extract",
      "target": "transform",
      "conditionType": "success"
    },
    {
      "id": "e3",
      "source": "transform",
      "target": "validate",
      "conditionType": "always"
    },
    {
      "id": "e4",
      "source": "validate",
      "target": "load",
      "label": "pass",
      "conditionType": "success"
    },
    {
      "id": "e5",
      "source": "validate",
      "target": "notify",
      "label": "fail",
      "conditionType": "failure",
      "style": "dashed"
    },
    {
      "id": "e6",
      "source": "load",
      "target": "notify",
      "conditionType": "success"
    },
    {
      "id": "e7",
      "source": "notify",
      "target": "end",
      "conditionType": "always"
    }
  ]
}`,

  implementationCode: `import { Workflow, type WorkflowData } from 'stash';

const data: WorkflowData = {
  id: 'data-pipeline',
  name: 'Data Processing Pipeline',
  description: 'ETL workflow for customer data',
  nodes: [
    {
      id: 'start',
      type: 'start',
      label: 'Start',
      status: 'success'
    },
    {
      id: 'extract',
      type: 'database',
      label: 'Extract Data',
      description: 'Fetch customer records',
      status: 'success',
      icon: '🗄️'
    },
    {
      id: 'transform',
      type: 'transform',
      label: 'Transform',
      description: 'Clean and normalize data',
      status: 'running',
      icon: '⚙️'
    }
    // ... more nodes
  ],
  edges: [
    {
      id: 'e1',
      source: 'start',
      target: 'extract',
      conditionType: 'always'
    }
    // ... more edges
  ]
};

<Workflow
  data={data}
  mode="full"
  height={400}
  showLabels={true}
  showStatus={true}
  orientation="horizontal"
/>`,

  parseData: (code: string): WorkflowData | null => {
    try {
      const parsed = JSON.parse(code);

      if (!parsed || typeof parsed !== 'object') {
        console.error('WorkflowDemo: Data must be an object');
        return null;
      }

      return {
        id: String(parsed.id || 'workflow'),
        name: String(parsed.name || 'Workflow'),
        description: parsed.description ? String(parsed.description) : undefined,
        nodes: Array.isArray(parsed.nodes) ? parsed.nodes.map((node: any) => ({
          id: String(node.id),
          type: node.type || 'task',
          label: String(node.label || node.id),
          description: node.description ? String(node.description) : undefined,
          status: node.status || 'idle',
          icon: node.icon ? String(node.icon) : undefined,
          metadata: node.metadata || undefined,
          color: node.color ? String(node.color) : undefined,
          size: node.size ? Number(node.size) : undefined,
        })) : [],
        edges: Array.isArray(parsed.edges) ? parsed.edges.map((edge: any) => ({
          id: String(edge.id),
          source: String(edge.source),
          target: String(edge.target),
          label: edge.label ? String(edge.label) : undefined,
          condition: edge.condition ? String(edge.condition) : undefined,
          conditionType: edge.conditionType || 'always',
          metadata: edge.metadata || undefined,
          color: edge.color ? String(edge.color) : undefined,
          width: edge.width ? Number(edge.width) : undefined,
          style: edge.style || 'solid',
          animated: edge.animated !== undefined ? Boolean(edge.animated) : undefined,
        })) : [],
        metadata: parsed.metadata || undefined,
      };
    } catch (e) {
      console.error('WorkflowDemo parse error:', e);
      return null;
    }
  },

  renderPreview: (data: WorkflowData) => {
    if (!data || !data.nodes || data.nodes.length === 0) {
      return (
        <View style={styles.errorView}>
          <Text style={styles.errorText}>Please provide nodes in the workflow data</Text>
        </View>
      );
    }

    return (
      <Workflow
        data={data}
        mode="full"
        height={400}
        showLabels={true}
        showStatus={true}
        orientation="horizontal"
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

export default workflowDemo;
