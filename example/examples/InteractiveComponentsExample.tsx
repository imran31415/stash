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
  DataTable,
  DataTableDetailView,
  Heatmap,
  HeatmapDetailView,
  Workflow,
  WorkflowDetailView,
  FlameGraph,
  type Task,
  type Resource,
  type GanttTask,
  type TimeSeriesSeries,
  type TimeSeriesDataPoint,
  type GraphData,
  type GraphNode,
  type GraphEdge,
  type SupportedLanguage,
  type ColumnDefinition,
  type RowData,
  type HeatmapDataPoint,
  type WorkflowData,
  type WorkflowNode,
  type WorkflowEdge,
  type FlameGraphData,
  type FlameGraphNode,
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
  const [dataTableDetailVisible, setDataTableDetailVisible] = useState(false);
  const [heatmapDetailVisible, setHeatmapDetailVisible] = useState(false);
  const [workflowDetailVisible, setWorkflowDetailVisible] = useState(false);
  const [flameGraphDetailVisible, setFlameGraphDetailVisible] = useState(false);
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

  // DataTable mock data
  const tableColumns: ColumnDefinition[] = [
    { id: 'id', header: 'ID', width: 60, priority: 1 },
    { id: 'name', header: 'Name', width: 150, priority: 1 },
    { id: 'email', header: 'Email', width: 200, priority: 2 },
    { id: 'role', header: 'Role', width: 120, priority: 2 },
    { id: 'status', header: 'Status', width: 100, priority: 1 },
    { id: 'joinDate', header: 'Join Date', width: 120, priority: 3 },
  ];

  const tableData: RowData[] = Array.from({ length: 50 }, (_, i) => ({
    id: `${i + 1}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: ['Admin', 'Developer', 'Designer', 'Manager'][i % 4],
    status: ['Active', 'Inactive', 'Pending'][i % 3],
    joinDate: addDays(new Date(), -i * 5).toLocaleDateString(),
  }));

  // Heatmap mock data - Server Performance Matrix
  const generateHeatmapData = (): HeatmapDataPoint[] => {
    const servers = ['Server-1', 'Server-2', 'Server-3', 'Server-4', 'Server-5', 'Server-6'];
    const metrics = ['CPU', 'Memory', 'Disk I/O', 'Network', 'Latency', 'Throughput'];
    const data: HeatmapDataPoint[] = [];

    servers.forEach((server) => {
      metrics.forEach((metric) => {
        // Generate random values with some pattern
        const baseValue = Math.random() * 100;
        const value = metric === 'CPU' || metric === 'Memory' ?
          baseValue :
          metric === 'Latency' ? baseValue * 5 : baseValue * 10;

        data.push({
          x: server,
          y: metric,
          value: Math.round(value * 100) / 100,
          label: `${server} - ${metric}`,
          metadata: {
            timestamp: new Date().toISOString(),
            status: value > 70 ? 'warning' : value > 90 ? 'critical' : 'normal',
          },
        });
      });
    });

    return data;
  };

  const sampleHeatmapData = useMemo(() => generateHeatmapData(), []);

  // Workflow mock data - CI/CD Pipeline
  const generateWorkflowData = (): WorkflowData => {
    const nodes: WorkflowNode[] = [
      {
        id: 'start',
        type: 'start',
        label: 'Start',
        status: 'success',
        metadata: {
          startTime: subDays(new Date(), 1),
          endTime: subDays(new Date(), 1),
          duration: 100,
        },
      },
      {
        id: 'checkout',
        type: 'task',
        label: 'Checkout Code',
        description: 'Clone repository from GitHub',
        status: 'success',
        metadata: {
          startTime: subDays(new Date(), 1),
          endTime: subDays(new Date(), 1),
          duration: 5000,
        },
      },
      {
        id: 'install',
        type: 'task',
        label: 'Install Dependencies',
        description: 'npm install',
        status: 'success',
        metadata: {
          startTime: subDays(new Date(), 1),
          endTime: subDays(new Date(), 1),
          duration: 45000,
        },
      },
      {
        id: 'lint',
        type: 'task',
        label: 'Run Linter',
        description: 'ESLint code quality check',
        status: 'success',
        metadata: {
          startTime: subDays(new Date(), 1),
          endTime: subDays(new Date(), 1),
          duration: 8000,
        },
      },
      {
        id: 'test',
        type: 'task',
        label: 'Run Tests',
        description: 'Jest unit and integration tests',
        status: 'success',
        metadata: {
          startTime: subDays(new Date(), 1),
          endTime: subDays(new Date(), 1),
          duration: 35000,
          retries: 1,
        },
      },
      {
        id: 'build',
        type: 'task',
        label: 'Build Application',
        description: 'Production build',
        status: 'running',
        metadata: {
          startTime: new Date(),
        },
      },
      {
        id: 'security',
        type: 'task',
        label: 'Security Scan',
        description: 'Run security vulnerability check',
        status: 'waiting',
      },
      {
        id: 'deploy-staging',
        type: 'api',
        label: 'Deploy to Staging',
        description: 'Deploy to staging environment',
        status: 'idle',
      },
      {
        id: 'integration-tests',
        type: 'task',
        label: 'Integration Tests',
        description: 'E2E tests on staging',
        status: 'idle',
      },
      {
        id: 'approval',
        type: 'manual',
        label: 'Manual Approval',
        description: 'Approve production deployment',
        status: 'idle',
      },
      {
        id: 'deploy-prod',
        type: 'api',
        label: 'Deploy to Production',
        description: 'Deploy to production environment',
        status: 'idle',
      },
      {
        id: 'notify',
        type: 'notification',
        label: 'Send Notification',
        description: 'Notify team of deployment',
        status: 'idle',
      },
      {
        id: 'end',
        type: 'end',
        label: 'Complete',
        status: 'idle',
      },
    ];

    const edges: WorkflowEdge[] = [
      { id: 'e1', source: 'start', target: 'checkout', conditionType: 'always' },
      { id: 'e2', source: 'checkout', target: 'install', conditionType: 'success' },
      { id: 'e3', source: 'install', target: 'lint', conditionType: 'success' },
      { id: 'e4', source: 'install', target: 'test', conditionType: 'success' },
      { id: 'e5', source: 'lint', target: 'build', conditionType: 'success' },
      { id: 'e6', source: 'test', target: 'build', conditionType: 'success' },
      { id: 'e7', source: 'build', target: 'security', conditionType: 'success' },
      { id: 'e8', source: 'security', target: 'deploy-staging', conditionType: 'success' },
      { id: 'e9', source: 'deploy-staging', target: 'integration-tests', conditionType: 'success' },
      { id: 'e10', source: 'integration-tests', target: 'approval', conditionType: 'success' },
      { id: 'e11', source: 'approval', target: 'deploy-prod', conditionType: 'success' },
      { id: 'e12', source: 'deploy-prod', target: 'notify', conditionType: 'success' },
      { id: 'e13', source: 'notify', target: 'end', conditionType: 'always' },
      {
        id: 'e14',
        source: 'security',
        target: 'notify',
        conditionType: 'failure',
        label: 'on failure',
        style: 'dashed',
      },
    ];

    return {
      id: 'cicd-pipeline',
      name: 'CI/CD Pipeline',
      description: 'Automated build, test, and deployment workflow',
      nodes,
      edges,
      metadata: {
        created: subDays(new Date(), 30),
        modified: new Date(),
        version: '2.1.0',
        author: 'DevOps Team',
        tags: ['ci/cd', 'automation', 'deployment'],
        executionCount: 487,
        averageDuration: 420000,
        successRate: 0.94,
      },
    };
  };

  const sampleWorkflowData = useMemo(() => generateWorkflowData(), []);

  // FlameGraph mock data - CPU Profiling
  const generateFlameGraphData = (): FlameGraphData => {
    const root: FlameGraphNode = {
      id: 'main',
      name: 'main()',
      value: 10000,
      metadata: {
        file: 'src/main.ts',
        line: 1,
        samples: 10000,
        selfTime: 100,
        totalTime: 10000,
        percentage: 100,
      },
      children: [
        {
          id: 'app-init',
          name: 'initializeApp()',
          value: 2500,
          metadata: {
            file: 'src/app.ts',
            line: 45,
            samples: 2500,
            selfTime: 200,
            totalTime: 2500,
            percentage: 25,
          },
          children: [
            {
              id: 'config-load',
              name: 'loadConfig()',
              value: 800,
              metadata: {
                file: 'src/config.ts',
                line: 12,
                samples: 800,
                selfTime: 500,
                totalTime: 800,
              },
              children: [
                {
                  id: 'fs-read',
                  name: 'fs.readFileSync()',
                  value: 300,
                  metadata: { file: 'node:fs', samples: 300, selfTime: 300, totalTime: 300 },
                },
              ],
            },
            {
              id: 'db-connect',
              name: 'connectDatabase()',
              value: 1200,
              metadata: {
                file: 'src/database.ts',
                line: 88,
                samples: 1200,
                selfTime: 300,
                totalTime: 1200,
              },
              children: [
                {
                  id: 'pool-create',
                  name: 'createConnectionPool()',
                  value: 900,
                  metadata: { file: 'pg', line: 234, samples: 900, selfTime: 900, totalTime: 900 },
                },
              ],
            },
            {
              id: 'middleware',
              name: 'setupMiddleware()',
              value: 500,
              metadata: {
                file: 'src/middleware.ts',
                line: 23,
                samples: 500,
                selfTime: 500,
                totalTime: 500,
              },
            },
          ],
        },
        {
          id: 'request-handler',
          name: 'handleRequest()',
          value: 6500,
          metadata: {
            file: 'src/server.ts',
            line: 156,
            samples: 6500,
            selfTime: 400,
            totalTime: 6500,
            percentage: 65,
          },
          children: [
            {
              id: 'route-match',
              name: 'matchRoute()',
              value: 800,
              metadata: { file: 'src/router.ts', line: 67, samples: 800, selfTime: 800, totalTime: 800 },
            },
            {
              id: 'auth-check',
              name: 'authenticateUser()',
              value: 1200,
              metadata: {
                file: 'src/auth.ts',
                line: 45,
                samples: 1200,
                selfTime: 200,
                totalTime: 1200,
              },
              children: [
                {
                  id: 'jwt-verify',
                  name: 'jwt.verify()',
                  value: 600,
                  metadata: { file: 'jsonwebtoken', samples: 600, selfTime: 600, totalTime: 600 },
                },
                {
                  id: 'db-query-user',
                  name: 'getUserById()',
                  value: 400,
                  metadata: { file: 'src/models/user.ts', samples: 400, selfTime: 100, totalTime: 400 },
                  children: [
                    {
                      id: 'sql-exec',
                      name: 'pool.query()',
                      value: 300,
                      metadata: { file: 'pg', samples: 300, selfTime: 300, totalTime: 300 },
                    },
                  ],
                },
              ],
            },
            {
              id: 'controller',
              name: 'controller.execute()',
              value: 3500,
              metadata: {
                file: 'src/controllers/api.ts',
                line: 234,
                samples: 3500,
                selfTime: 300,
                totalTime: 3500,
              },
              children: [
                {
                  id: 'validate',
                  name: 'validateInput()',
                  value: 600,
                  metadata: { file: 'src/validation.ts', samples: 600, selfTime: 600, totalTime: 600 },
                },
                {
                  id: 'business-logic',
                  name: 'processBusinessLogic()',
                  value: 2600,
                  metadata: {
                    file: 'src/services/business.ts',
                    line: 89,
                    samples: 2600,
                    selfTime: 500,
                    totalTime: 2600,
                  },
                  children: [
                    {
                      id: 'db-queries',
                      name: 'fetchRelatedData()',
                      value: 1200,
                      metadata: {
                        file: 'src/services/data.ts',
                        samples: 1200,
                        selfTime: 200,
                        totalTime: 1200,
                      },
                      children: [
                        {
                          id: 'query-1',
                          name: 'pool.query() [1]',
                          value: 400,
                          metadata: { samples: 400, selfTime: 400, totalTime: 400 },
                        },
                        {
                          id: 'query-2',
                          name: 'pool.query() [2]',
                          value: 600,
                          metadata: { samples: 600, selfTime: 600, totalTime: 600 },
                        },
                      ],
                    },
                    {
                      id: 'compute',
                      name: 'calculateMetrics()',
                      value: 900,
                      metadata: {
                        file: 'src/analytics.ts',
                        line: 156,
                        samples: 900,
                        selfTime: 900,
                        totalTime: 900,
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: 'response',
              name: 'formatResponse()',
              value: 1000,
              metadata: {
                file: 'src/response.ts',
                line: 34,
                samples: 1000,
                selfTime: 400,
                totalTime: 1000,
              },
              children: [
                {
                  id: 'json-stringify',
                  name: 'JSON.stringify()',
                  value: 600,
                  metadata: { file: 'native', samples: 600, selfTime: 600, totalTime: 600 },
                },
              ],
            },
          ],
        },
        {
          id: 'cleanup',
          name: 'cleanup()',
          value: 1000,
          metadata: {
            file: 'src/server.ts',
            line: 289,
            samples: 1000,
            selfTime: 600,
            totalTime: 1000,
            percentage: 10,
          },
          children: [
            {
              id: 'close-connections',
              name: 'closeConnections()',
              value: 400,
              metadata: { file: 'src/database.ts', samples: 400, selfTime: 400, totalTime: 400 },
            },
          ],
        },
      ],
    };

    return {
      root,
      total: 10000,
      unit: 'samples',
      metadata: {
        type: 'cpu',
        duration: 10000,
        timestamp: new Date(),
        application: 'API Server',
      },
    };
  };

  const sampleFlameGraphData = useMemo(() => generateFlameGraphData(), []);

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
        <Text style={styles.sectionTitle}>DataTable Component</Text>
        <Text style={styles.sectionDescription}>
          Responsive data table with sorting, filtering, pagination, and selection. Adapts to screen size.
        </Text>
        <DataTable
          columns={tableColumns}
          data={tableData}
          title="User Directory"
          subtitle="50 users"
          mode="preview"
          sortable={true}
          filterable={true}
          paginated={true}
          defaultPageSize={10}
          onRowPress={(row) => console.log('Row pressed:', row)}
          onExpandPress={() => setDataTableDetailVisible(true)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Heatmap Component (Mini)</Text>
        <Text style={styles.sectionDescription}>
          Compact heatmap visualization for server performance metrics (tap to expand)
        </Text>
        <Heatmap
          data={sampleHeatmapData}
          mode="mini"
          title="Server Performance Matrix"
          subtitle="Real-time monitoring"
          colorScale="blue"
          showLegend={false}
          showGrid={true}
          xAxisLabel="Servers"
          yAxisLabel="Metrics"
          onCellPress={(cell) => console.log('Cell pressed:', cell.x, cell.y, cell.value)}
          onExpandPress={() => setHeatmapDetailVisible(true)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Heatmap Component (Full)</Text>
        <Text style={styles.sectionDescription}>
          Full-featured heatmap with color legend and interactive cell selection
        </Text>
        <Heatmap
          data={sampleHeatmapData}
          mode="full"
          title="Performance Heatmap"
          subtitle="6 servers × 6 metrics"
          colorScale="red"
          showLegend={true}
          showGrid={true}
          showXAxis={true}
          showYAxis={true}
          xAxisLabel="Servers"
          yAxisLabel="Performance Metrics"
          onCellPress={(cell) => console.log('Cell pressed:', cell.x, cell.y, cell.value)}
          valueFormatter={(value) => `${value.toFixed(1)}%`}
          height={350}
        />
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.detailViewButton}
          onPress={() => setHeatmapDetailVisible(true)}
        >
          <Text style={styles.detailViewButtonText}>
            🔥 Open Heatmap Detail View
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Workflow Component (Mini)</Text>
        <Text style={styles.sectionDescription}>
          DAG workflow visualization for CI/CD pipelines (tap to expand)
        </Text>
        <Workflow
          data={sampleWorkflowData}
          mode="mini"
          orientation="horizontal"
          showLabels={true}
          showStatus={true}
          highlightCriticalPath={true}
          onNodePress={(node) => console.log('Node pressed:', node.label)}
          onExpandPress={() => setWorkflowDetailVisible(true)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Workflow Component (Full)</Text>
        <Text style={styles.sectionDescription}>
          Full-featured workflow with status indicators and execution metadata
        </Text>
        <Workflow
          data={sampleWorkflowData}
          mode="full"
          orientation="horizontal"
          showLabels={true}
          showEdgeLabels={true}
          showStatus={true}
          showMetadata={true}
          highlightCriticalPath={true}
          onNodePress={(node) => console.log('Full - Node pressed:', node.label)}
          onEdgePress={(edge) => console.log('Edge pressed:', edge.id)}
        />
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.detailViewButton}
          onPress={() => setWorkflowDetailVisible(true)}
        >
          <Text style={styles.detailViewButtonText}>
            🔄 Open Workflow Detail View
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FlameGraph Component (Mini)</Text>
        <Text style={styles.sectionDescription}>
          CPU profiling visualization showing call stack hierarchy (tap to expand)
        </Text>
        <FlameGraph
          data={sampleFlameGraphData}
          mode="mini"
          colorScheme="hot"
          showSearch={false}
          onNodeClick={(node) => console.log('Node clicked:', node.name)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FlameGraph Component (Preview)</Text>
        <Text style={styles.sectionDescription}>
          Interactive flame graph with search and zoom capabilities
        </Text>
        <FlameGraph
          data={sampleFlameGraphData}
          title="API Server CPU Profile"
          subtitle={`${sampleFlameGraphData.total} total ${sampleFlameGraphData.unit} • Click nodes to inspect`}
          mode="preview"
          colorScheme="hot"
          showSearch={true}
          showTooltips={true}
          minPercentage={1}
          onNodeClick={(node) => console.log('Node clicked:', node.name, node.metadata)}
          height={350}
        />
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.detailViewButton}
          onPress={() => setFlameGraphDetailVisible(true)}
        >
          <Text style={styles.detailViewButtonText}>
            🔥 Open FlameGraph Detail View
          </Text>
        </TouchableOpacity>
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

      {/* DataTable Detail View Modal */}
      <DataTableDetailView
        visible={dataTableDetailVisible}
        columns={tableColumns}
        data={tableData}
        title="User Directory - Full View"
        subtitle="All users with advanced filtering and sorting"
        sortable={true}
        filterable={true}
        paginated={true}
        onClose={() => setDataTableDetailVisible(false)}
        onRowPress={(row) => console.log('Row pressed in detail:', row)}
      />

      {/* Heatmap Detail View Modal */}
      <HeatmapDetailView
        visible={heatmapDetailVisible}
        data={sampleHeatmapData}
        title="Server Performance Heatmap"
        subtitle="Real-time infrastructure monitoring"
        colorScale="red"
        xAxisLabel="Servers"
        yAxisLabel="Performance Metrics"
        onClose={() => setHeatmapDetailVisible(false)}
        onCellPress={(cell) => console.log('Detail - Cell pressed:', cell.x, cell.y, cell.value)}
        valueFormatter={(value) => `${value.toFixed(1)}%`}
      />

      {/* Workflow Detail View Modal */}
      <WorkflowDetailView
        visible={workflowDetailVisible}
        data={sampleWorkflowData}
        title={sampleWorkflowData.name}
        subtitle={sampleWorkflowData.description}
        orientation="horizontal"
        showLabels={true}
        showEdgeLabels={true}
        showStatus={true}
        showMetadata={true}
        highlightCriticalPath={true}
        searchable={true}
        onClose={() => setWorkflowDetailVisible(false)}
        onNodePress={(node) => console.log('Detail - Node pressed:', node.label)}
        onEdgePress={(edge) => console.log('Detail - Edge pressed:', edge.id)}
      />
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
