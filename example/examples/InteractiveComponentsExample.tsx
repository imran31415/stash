import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  TaskList,
  TaskListDetailView,
  ResourceList,
  GanttChart,
  TimeSeriesChart,
  TimeSeriesChartDetailView,
  GraphVisualization,
  GraphVisualizationDetailView,
  CodeBlock,
  CodeBlockDetailView,
  LoadingState,
  type Task,
  type Resource,
  type GanttTask,
  type TimeSeriesSeries,
  type TimeSeriesDataPoint,
  type GraphData,
  type GraphNode,
  type GraphEdge,
  type SupportedLanguage,
} from '../../src/components/Chat/InteractiveComponents';
import { addDays, addWeeks, addHours, subDays } from 'date-fns';
import {
  generateMockTasks,
  generateMockResources,
  generateMockGanttTasks,
  generateMockTimeSeriesData,
  generateLargeGraph,
} from '../utils/mockDataGenerator';

const InteractiveComponentsExample: React.FC = () => {
  const [detailViewVisible, setDetailViewVisible] = useState(false);
  const [taskListDetailVisible, setTaskListDetailVisible] = useState(false);
  const [graphDetailVisible, setGraphDetailVisible] = useState(false);
  const [codeBlockDetailVisible, setCodeBlockDetailVisible] = useState(false);
  const [currentCodeBlock, setCurrentCodeBlock] = useState<{
    code: string;
    language: SupportedLanguage;
    fileName?: string;
    title?: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showLoadingDemo, setShowLoadingDemo] = useState(false);

  // Generate large datasets (memoized for performance)
  const largeTasks = useMemo(() => generateMockTasks(500), []);
  const largeResources = useMemo(() => generateMockResources(300), []);
  const largeGanttTasks = useMemo(() => generateMockGanttTasks(100), []);
  const largeTimeSeriesData = useMemo(() => generateMockTimeSeriesData(3, 2000, 60), []);
  const largeGraphData = useMemo(() => generateLargeGraph(1000), []);

  // Sample task data (kept for reference but using large dataset in examples)
  const sampleTasks: Task[] = [
    {
      id: '1',
      title: 'Design new landing page',
      description: 'Create wireframes and mockups for the new landing page',
      startDate: new Date(),
      endDate: addDays(new Date(), 5),
      progress: 75,
      status: 'in-progress',
      priority: 'high',
      assignee: 'Sarah Chen',
    },
    {
      id: '2',
      title: 'Implement authentication',
      description: 'Add OAuth and JWT authentication',
      startDate: addDays(new Date(), 1),
      endDate: addDays(new Date(), 7),
      progress: 30,
      status: 'in-progress',
      priority: 'critical',
      assignee: 'John Doe',
    },
    {
      id: '3',
      title: 'Write API documentation',
      description: 'Document all API endpoints',
      startDate: addDays(new Date(), 3),
      endDate: addDays(new Date(), 10),
      progress: 0,
      status: 'pending',
      priority: 'medium',
      assignee: 'Alex Kim',
    },
  ];

  // Sample resource data
  const sampleResources: Resource[] = [
    {
      id: '1',
      title: 'Q4 Financial Report',
      description: 'Comprehensive financial analysis for Q4 2024',
      category: 'Finance',
      status: 'Active',
      priority: 'high',
      icon: '📊',
      tags: ['finance', 'quarterly', 'report'],
      updatedAt: new Date(),
      metadata: {
        author: 'Finance Team',
        department: 'Finance',
      },
    },
    {
      id: '2',
      title: 'Marketing Strategy Document',
      description: 'Marketing plan for 2025 product launch',
      category: 'Marketing',
      status: 'Draft',
      priority: 'medium',
      icon: '📱',
      tags: ['marketing', 'strategy', '2025'],
      updatedAt: addDays(new Date(), -2),
      metadata: {
        author: 'Marketing Team',
        department: 'Marketing',
      },
    },
    {
      id: '3',
      title: 'Engineering Roadmap',
      description: 'Technical roadmap for next 6 months',
      category: 'Engineering',
      status: 'Active',
      priority: 'critical',
      icon: '🚀',
      tags: ['engineering', 'roadmap', 'planning'],
      updatedAt: addDays(new Date(), -1),
      metadata: {
        author: 'Engineering Team',
        department: 'Engineering',
      },
    },
    {
      id: '4',
      title: 'Customer Success Metrics',
      description: 'KPIs and success metrics dashboard',
      category: 'Customer Success',
      status: 'Active',
      priority: 'medium',
      icon: '📈',
      tags: ['metrics', 'kpi', 'customer'],
      updatedAt: new Date(),
      color: '#10B981',
    },
  ];

  // Sample Gantt chart data
  const sampleGanttTasks: GanttTask[] = [
    {
      id: '1',
      title: 'Project Planning',
      description: 'Initial project setup and planning',
      startDate: new Date(),
      endDate: addDays(new Date(), 5),
      progress: 100,
      status: 'completed',
      priority: 'high',
      assignee: 'Sarah Chen',
      milestones: [
        {
          id: 'm1',
          title: 'Kickoff',
          date: new Date(),
          completed: true,
        },
      ],
    },
    {
      id: '2',
      title: 'Design Phase',
      description: 'UI/UX design and prototyping',
      startDate: addDays(new Date(), 3),
      endDate: addDays(new Date(), 12),
      progress: 60,
      status: 'in-progress',
      priority: 'high',
      assignee: 'John Doe',
    },
    {
      id: '3',
      title: 'Development',
      description: 'Core feature development',
      startDate: addDays(new Date(), 10),
      endDate: addWeeks(new Date(), 4),
      progress: 20,
      status: 'in-progress',
      priority: 'critical',
      assignee: 'Alex Kim',
      milestones: [
        {
          id: 'm2',
          title: 'Alpha Release',
          date: addWeeks(new Date(), 2),
          completed: false,
        },
        {
          id: 'm3',
          title: 'Beta Release',
          date: addWeeks(new Date(), 3),
          completed: false,
        },
      ],
    },
    {
      id: '4',
      title: 'Testing & QA',
      description: 'Quality assurance and bug fixes',
      startDate: addWeeks(new Date(), 3),
      endDate: addWeeks(new Date(), 5),
      progress: 0,
      status: 'pending',
      priority: 'high',
      assignee: 'Sarah Chen',
    },
    {
      id: '5',
      title: 'Deployment',
      description: 'Production deployment and monitoring',
      startDate: addWeeks(new Date(), 5),
      endDate: addWeeks(new Date(), 6),
      progress: 0,
      status: 'pending',
      priority: 'critical',
      assignee: 'John Doe',
    },
  ];

  // Sample time series data
  const generateTimeSeriesData = (
    startDate: Date,
    points: number,
    baseValue: number,
    variance: number
  ): TimeSeriesDataPoint[] => {
    const data: TimeSeriesDataPoint[] = [];
    for (let i = 0; i < points; i++) {
      data.push({
        timestamp: addHours(startDate, i * 2),
        value: baseValue + Math.random() * variance - variance / 2,
        label: `Point ${i + 1}`,
      });
    }
    return data;
  };

  const sampleTimeSeriesData: TimeSeriesSeries[] = [
    {
      id: 'revenue',
      name: 'Revenue',
      data: generateTimeSeriesData(subDays(new Date(), 7), 50, 10000, 3000),
      color: '#3B82F6',
    },
    {
      id: 'expenses',
      name: 'Expenses',
      data: generateTimeSeriesData(subDays(new Date(), 7), 50, 7000, 2000),
      color: '#EF4444',
    },
    {
      id: 'profit',
      name: 'Profit',
      data: generateTimeSeriesData(subDays(new Date(), 7), 50, 3000, 1500),
      color: '#10B981',
    },
  ];

  // Sample graph data (Neo4j-like structure)
  const sampleGraphData: GraphData = {
    nodes: [
      {
        id: '1',
        labels: ['Person', 'Employee'],
        properties: { name: 'Alice Johnson', role: 'CEO', department: 'Executive' },
        color: '#3B82F6',
      },
      {
        id: '2',
        labels: ['Person', 'Employee'],
        properties: { name: 'Bob Smith', role: 'CTO', department: 'Technology' },
        color: '#10B981',
      },
      {
        id: '3',
        labels: ['Person', 'Employee'],
        properties: { name: 'Carol Davis', role: 'CFO', department: 'Finance' },
        color: '#F59E0B',
      },
      {
        id: '4',
        labels: ['Person', 'Employee'],
        properties: { name: 'David Lee', role: 'VP Engineering', department: 'Technology' },
        color: '#10B981',
      },
      {
        id: '5',
        labels: ['Person', 'Employee'],
        properties: { name: 'Emma Wilson', role: 'VP Product', department: 'Product' },
        color: '#8B5CF6',
      },
      {
        id: '6',
        labels: ['Project'],
        properties: { name: 'Mobile App Redesign', status: 'In Progress', priority: 'High' },
        color: '#EF4444',
      },
      {
        id: '7',
        labels: ['Project'],
        properties: { name: 'API v2.0', status: 'Planning', priority: 'Critical' },
        color: '#EF4444',
      },
      {
        id: '8',
        labels: ['Department'],
        properties: { name: 'Technology', budget: 5000000, headcount: 45 },
        color: '#06B6D4',
      },
      {
        id: '9',
        labels: ['Department'],
        properties: { name: 'Product', budget: 2000000, headcount: 20 },
        color: '#EC4899',
      },
    ],
    edges: [
      {
        id: 'e1',
        type: 'REPORTS_TO',
        source: '2',
        target: '1',
        directed: true,
      },
      {
        id: 'e2',
        type: 'REPORTS_TO',
        source: '3',
        target: '1',
        directed: true,
      },
      {
        id: 'e3',
        type: 'REPORTS_TO',
        source: '4',
        target: '2',
        directed: true,
      },
      {
        id: 'e4',
        type: 'REPORTS_TO',
        source: '5',
        target: '1',
        directed: true,
      },
      {
        id: 'e5',
        type: 'WORKS_ON',
        source: '4',
        target: '6',
        directed: false,
      },
      {
        id: 'e6',
        type: 'WORKS_ON',
        source: '5',
        target: '6',
        directed: false,
      },
      {
        id: 'e7',
        type: 'WORKS_ON',
        source: '2',
        target: '7',
        directed: false,
      },
      {
        id: 'e8',
        type: 'BELONGS_TO',
        source: '2',
        target: '8',
        directed: true,
      },
      {
        id: 'e9',
        type: 'BELONGS_TO',
        source: '4',
        target: '8',
        directed: true,
      },
      {
        id: 'e10',
        type: 'BELONGS_TO',
        source: '5',
        target: '9',
        directed: true,
      },
      {
        id: 'e11',
        type: 'COLLABORATES_WITH',
        source: '4',
        target: '5',
        directed: false,
      },
    ],
    metadata: {
      name: 'Company Organization Graph',
      description: 'Organizational structure and project relationships',
      nodeCount: 9,
      edgeCount: 11,
    },
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TaskList Component (500 Tasks)</Text>
        <Text style={styles.sectionDescription}>
          Demonstrating performance with large dataset. Search, filter, and pagination.
        </Text>
        <TaskList
          title="Large Task List"
          subtitle={`${largeTasks.length} tasks • Performance optimized`}
          tasks={largeTasks.slice(0, 10)}
          showExpandButton={true}
          onTaskPress={(task) => console.log('Task pressed:', task.title)}
          onExpandPress={() => setTaskListDetailVisible(true)}
        />
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.detailViewButton}
          onPress={() => setTaskListDetailVisible(true)}
        >
          <Text style={styles.detailViewButtonText}>
            View All {largeTasks.length} Tasks
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ResourceList Component</Text>
        <Text style={styles.sectionDescription}>
          Adaptive resource list with intelligent item limiting
        </Text>
        <ResourceList
          title="Company Resources"
          subtitle="Documents and reports"
          resources={sampleResources}
          adaptiveHeight={true}
          showCategory={true}
          showStatus={true}
          onResourcePress={(resource) => console.log('Resource pressed:', resource.title)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GanttChart Component (Mini - 100 Tasks)</Text>
        <Text style={styles.sectionDescription}>
          Compact Gantt chart optimized for large datasets
        </Text>
        <GanttChart
          tasks={largeGanttTasks.slice(0, 15)}
          mode="mini"
          title="Project Timeline"
          subtitle={`${largeGanttTasks.length} total tasks`}
          onTaskPress={(task) => console.log('Gantt task pressed:', task.title)}
          showProgress={true}
          showToday={true}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GanttChart Component (Full - 100 Tasks)</Text>
        <Text style={styles.sectionDescription}>
          Full-featured Gantt chart with pagination for large datasets
        </Text>
        <GanttChart
          tasks={largeGanttTasks}
          mode="full"
          title="Development Roadmap"
          subtitle={`${largeGanttTasks.length} tasks with pagination`}
          onTaskPress={(task) => console.log('Gantt task pressed:', task.title)}
          onMilestonePress={(milestone, task) =>
            console.log('Milestone pressed:', milestone.title, 'on task:', task.title)
          }
          showProgress={true}
          showMilestones={true}
          showToday={true}
          timeScale="day"
          enablePagination={true}
          itemsPerPage={10}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TimeSeriesChart Component (Mini)</Text>
        <Text style={styles.sectionDescription}>
          Compact time series chart for chat messages (tap to expand)
        </Text>
        <TimeSeriesChart
          series={sampleTimeSeriesData}
          mode="mini"
          title="Financial Metrics"
          onExpandPress={() => setDetailViewVisible(true)}
          showLegend={false}
          showGrid={true}
          onDataPointPress={(dataPoint, series) =>
            console.log('Data point pressed:', dataPoint.value, 'from series:', series.name)
          }
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TimeSeriesChart Component (Full)</Text>
        <Text style={styles.sectionDescription}>
          Full-featured time series chart with legend and statistics
        </Text>
        <TimeSeriesChart
          series={sampleTimeSeriesData}
          mode="full"
          title="Financial Trends"
          subtitle="Last 7 days performance"
          showLegend={true}
          showGrid={true}
          showXAxis={true}
          showYAxis={true}
          xAxisLabel="Time"
          yAxisLabel="Amount ($)"
          pageSize={25}
          currentPage={currentPage}
          totalDataPoints={150}
          onPageChange={setCurrentPage}
          onDataPointPress={(dataPoint, series) =>
            console.log('Data point pressed:', dataPoint.value, 'from series:', series.name)
          }
          height={400}
        />
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.detailViewButton}
          onPress={() => setDetailViewVisible(true)}
        >
          <Text style={styles.detailViewButtonText}>
            Open Time Series Detail View
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GraphVisualization Component (Mini - 1000 Nodes)</Text>
        <Text style={styles.sectionDescription}>
          Large-scale graph with {largeGraphData.nodes.length} nodes. Click nodes to focus and explore.
        </Text>
        <GraphVisualization
          data={largeGraphData}
          mode="mini"
          title="Large Organizational Network"
          subtitle={`${largeGraphData.nodes.length} nodes • ${largeGraphData.edges.length} relationships`}
          showLabels={false}
          enablePhysics={true}
          maxVisibleNodes={100}
          maxVisibleEdges={150}
          onNodePress={(node) => console.log('Node pressed:', node.properties.name || node.id)}
          onEdgePress={(edge) => console.log('Edge pressed:', edge.type)}
          onExpandPress={() => setGraphDetailVisible(true)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GraphVisualization Component (Full - 1000 Nodes)</Text>
        <Text style={styles.sectionDescription}>
          Click any node to focus and see relationships. Search & filter to navigate large datasets.
        </Text>
        <GraphVisualization
          data={largeGraphData}
          mode="full"
          title="Large Knowledge Graph"
          subtitle={`${largeGraphData.nodes.length} nodes • Performance optimized`}
          showLabels={false}
          showEdgeLabels={false}
          enablePhysics={true}
          maxVisibleNodes={150}
          maxVisibleEdges={200}
          height={350}
          onNodePress={(node) => console.log('Node pressed:', node.properties.name || node.id)}
          onEdgePress={(edge) => console.log('Edge pressed:', edge.type)}
        />
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.detailViewButton}
          onPress={() => setGraphDetailVisible(true)}
        >
          <Text style={styles.detailViewButtonText}>
            🔍 Open Graph Detail View
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CodeBlock Component</Text>
        <Text style={styles.sectionDescription}>
          Syntax-highlighted code blocks with line numbers, copy functionality, and pagination for large files.
          Supports 20+ languages and works on all platforms.
        </Text>

        {/* Mini mode - TypeScript */}
        <View style={styles.codeBlockDemo}>
          <Text style={styles.demoSubtitle}>Mini Mode (TypeScript)</Text>
          <CodeBlock
            code={`const greet = (name: string): void => {
  console.log(\`Hello, \${name}!\`);
};

greet('World');`}
            language="typescript"
            fileName="greet.ts"
            mode="mini"
            maxLines={5}
          />
        </View>

        {/* Preview mode - JavaScript */}
        <View style={styles.codeBlockDemo}>
          <Text style={styles.demoSubtitle}>Preview Mode (JavaScript)</Text>
          <CodeBlock
            code={`import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <View>
      <Text>Count: {count}</Text>
      <Button title="+" onPress={() => setCount(count + 1)} />
      <Button title="-" onPress={() => setCount(count - 1)} />
    </View>
  );
}`}
            language="javascript"
            fileName="Counter.jsx"
            mode="preview"
            showLineNumbers={true}
          />
        </View>

        {/* Python with expand */}
        <View style={styles.codeBlockDemo}>
          <Text style={styles.demoSubtitle}>Python Example with Full View</Text>
          <CodeBlock
            code={`def fibonacci(n):
    """Generate Fibonacci sequence up to n terms."""
    fib_sequence = []
    a, b = 0, 1
    
    for _ in range(n):
        fib_sequence.append(a)
        a, b = b, a + b
    
    return fib_sequence

# Example usage
if __name__ == "__main__":
    n = 10
    result = fibonacci(n)
    print(f"Fibonacci sequence ({n} terms): {result}")
    
    # Calculate sum
    total = sum(result)
    print(f"Sum of sequence: {total}")`}
            language="python"
            fileName="fibonacci.py"
            mode="preview"
            onViewFullFile={() => {
              setCurrentCodeBlock({
                code: `def fibonacci(n):
    """Generate Fibonacci sequence up to n terms."""
    fib_sequence = []
    a, b = 0, 1
    
    for _ in range(n):
        fib_sequence.append(a)
        a, b = b, a + b
    
    return fib_sequence

def is_prime(num):
    """Check if a number is prime."""
    if num < 2:
        return False
    for i in range(2, int(num ** 0.5) + 1):
        if num % i == 0:
            return False
    return True

def prime_fibonacci(n):
    """Get prime numbers from Fibonacci sequence."""
    fib_seq = fibonacci(n)
    return [num for num in fib_seq if is_prime(num)]

# Example usage
if __name__ == "__main__":
    n = 10
    result = fibonacci(n)
    print(f"Fibonacci sequence ({n} terms): {result}")
    
    # Calculate sum
    total = sum(result)
    print(f"Sum of sequence: {total}")
    
    # Find primes
    primes = prime_fibonacci(n)
    print(f"Prime numbers in sequence: {primes}")
    
    # Statistics
    print(f"Average: {total / n}")
    print(f"Max: {max(result)}")
    print(f"Min: {min(result)}")`,
                language: 'python',
                fileName: 'fibonacci.py',
                title: 'Fibonacci Generator (Extended)',
              });
              setCodeBlockDetailVisible(true);
            }}
          />
        </View>

        {/* JSON */}
        <View style={styles.codeBlockDemo}>
          <Text style={styles.demoSubtitle}>JSON Configuration</Text>
          <CodeBlock
            code={`{
  "name": "stash",
  "version": "0.1.0",
  "description": "A React Native component library",
  "main": "dist/index.js",
  "dependencies": {
    "react": "^18.0.0",
    "react-native": "^0.70.0"
  }
}`}
            language="json"
            fileName="package.json"
            mode="preview"
          />
        </View>

        {/* Markdown */}
        <View style={styles.codeBlockDemo}>
          <Text style={styles.demoSubtitle}>Markdown Content</Text>
          <CodeBlock
            code={`# Getting Started

## Installation

\`\`\`bash
yarn add stash
\`\`\`

## Quick Start

1. Import the components
2. Add to your app
3. Customize the theme

### Features

- 📱 Cross-platform support
- 🎨 Customizable themes
- ⚡ High performance
- 📦 Tree-shakeable`}
            language="markdown"
            fileName="README.md"
            mode="preview"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LoadingState Component</Text>
        <Text style={styles.sectionDescription}>
          Beautiful loading indicators with smooth animations. Supports inline and overlay modes.
        </Text>

        {/* Small size demo */}
        <View style={styles.loadingDemoCard}>
          <Text style={styles.loadingDemoTitle}>Small Size</Text>
          <LoadingState message="Loading data..." size="small" height={150} />
        </View>

        {/* Medium size demo */}
        <View style={styles.loadingDemoCard}>
          <Text style={styles.loadingDemoTitle}>Medium Size</Text>
          <LoadingState message="Processing..." size="medium" height={200} />
        </View>

        {/* Large size demo */}
        <View style={styles.loadingDemoCard}>
          <Text style={styles.loadingDemoTitle}>Large Size</Text>
          <LoadingState message="Computing layout for 1000 nodes..." size="large" height={250} />
        </View>

        {/* Overlay mode demo */}
        <View style={styles.loadingDemoCard}>
          <Text style={styles.loadingDemoTitle}>Overlay Mode Demo</Text>
          <TouchableOpacity
            style={styles.detailViewButton}
            onPress={() => {
              setShowLoadingDemo(true);
              setTimeout(() => setShowLoadingDemo(false), 3000);
            }}
          >
            <Text style={styles.detailViewButtonText}>
              Show Loading Overlay (3s)
            </Text>
          </TouchableOpacity>

          {showLoadingDemo && (
            <View style={styles.overlayDemoContainer}>
              <View style={styles.overlayDemoContent}>
                <Text style={styles.overlayDemoText}>Content behind the overlay</Text>
                <Text style={styles.overlayDemoSubtext}>
                  This demonstrates how the loading state appears as an overlay
                </Text>
              </View>
              <LoadingState
                message="Loading in progress..."
                size="large"
                overlay
                backgroundColor="rgba(255, 255, 255, 0.95)"
              />
            </View>
          )}
        </View>
      </View>

      <View style={styles.bottomPadding} />

      {/* Task List Detail View Modal */}
      <TaskListDetailView
        visible={taskListDetailVisible}
        tasks={largeTasks}
        title="All Tasks"
        subtitle={`${largeTasks.length} tasks • Search, filter, and pagination enabled`}
        onClose={() => setTaskListDetailVisible(false)}
        onTaskPress={(task) => console.log('Task pressed in detail view:', task.title)}
        pageSize={25}
      />

      {/* Time Series Detail View Modal */}
      <TimeSeriesChartDetailView
        visible={detailViewVisible}
        series={sampleTimeSeriesData}
        title="Financial Metrics Detail"
        subtitle="Complete data analysis"
        onClose={() => setDetailViewVisible(false)}
        pageSize={25}
        totalDataPoints={150}
        xAxisLabel="Time"
        yAxisLabel="Amount ($)"
        onDataPointPress={(dataPoint, series) =>
          console.log('Detail view - Data point pressed:', dataPoint.value, 'from:', series.name)
        }
      />

      {/* Graph Visualization Detail View Modal */}
      <GraphVisualizationDetailView
        visible={graphDetailVisible}
        data={largeGraphData}
        title="Large Organizational Network"
        subtitle={`${largeGraphData.nodes.length} nodes • ${largeGraphData.edges.length} relationships`}
        onClose={() => setGraphDetailVisible(false)}
        onNodePress={(node) => console.log('Detail - Node pressed:', node.properties.name)}
        onEdgePress={(edge) => console.log('Detail - Edge pressed:', edge.type)}
        showLabels={true}
        showEdgeLabels={true}
        enablePhysics={true}
        searchable={true}
        maxVisibleNodes={150}
      />

      {/* Code Block Detail View Modal */}
      {currentCodeBlock && (
        <CodeBlockDetailView
          visible={codeBlockDetailVisible}
          code={currentCodeBlock.code}
          language={currentCodeBlock.language}
          fileName={currentCodeBlock.fileName}
          title={currentCodeBlock.title}
          onClose={() => {
            setCodeBlockDetailVisible(false);
            setCurrentCodeBlock(null);
          }}
          onCopy={() => console.log('Code copied from detail view')}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  bottomPadding: {
    height: 40,
  },
  detailViewButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  detailViewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingDemoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  loadingDemoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  overlayDemoContainer: {
    position: 'relative',
    height: 250,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  overlayDemoContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: 32,
  },
  overlayDemoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  overlayDemoSubtext: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  codeBlockDemo: {
    marginBottom: 20,
  },
  demoSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
});

export default InteractiveComponentsExample;
