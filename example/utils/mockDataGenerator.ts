import { addDays, addWeeks, subDays, addMonths } from 'date-fns';
import type { Task, Resource, GanttTask, TimeSeriesDataPoint, TimeSeriesSeries, GraphData, GraphNode, GraphEdge } from '../../src/components/Chat/InteractiveComponents';

// Sample data pools for realistic generation
const TASK_TITLES = [
  'Implement user authentication',
  'Design landing page',
  'Optimize database queries',
  'Write API documentation',
  'Fix login bug',
  'Add payment integration',
  'Refactor legacy code',
  'Set up CI/CD pipeline',
  'Implement search functionality',
  'Create mobile responsive design',
  'Add analytics tracking',
  'Optimize image loading',
  'Write unit tests',
  'Security audit',
  'Performance optimization',
  'Implement caching',
  'Add email notifications',
  'Create admin dashboard',
  'Database migration',
  'API rate limiting',
  'Implement webhooks',
  'Add two-factor authentication',
  'Optimize bundle size',
  'Accessibility improvements',
  'Implement dark mode',
  'Add internationalization',
  'Create onboarding flow',
  'Implement file upload',
  'Add error tracking',
  'Create style guide',
];

const TASK_DESCRIPTIONS = [
  'Implement comprehensive solution with proper error handling',
  'Design and build with best practices in mind',
  'Optimize for performance and scalability',
  'Ensure security and data protection',
  'Follow coding standards and conventions',
  'Add comprehensive test coverage',
  'Document all changes and updates',
  'Review and refactor existing code',
  'Collaborate with team members',
  'Conduct thorough testing',
];

const ASSIGNEES = [
  'Sarah Chen',
  'John Doe',
  'Mike Wilson',
  'Alex Kim',
  'Emily Rodriguez',
  'David Park',
  'Lisa Anderson',
  'James Taylor',
  'Maria Garcia',
  'Robert Brown',
  'Jennifer Lee',
  'Michael Zhang',
  'Jessica Wang',
  'Daniel Kim',
  'Amy Liu',
];

const STATUSES: Task['status'][] = ['pending', 'in-progress', 'completed', 'blocked', 'cancelled'];
const PRIORITIES: Task['priority'][] = ['low', 'medium', 'high', 'critical'];

const RESOURCE_CATEGORIES = ['Design', 'Engineering', 'Marketing', 'Research', 'Documentation'];
const RESOURCE_ICONS = ['🎨', '💻', '📊', '📝', '📚', '⚙️', '🔧', '📱', '🌐', '🔒'];

const MILESTONE_NAMES = [
  'Design Complete',
  'Code Review',
  'Testing Done',
  'Deployment Ready',
  'QA Approved',
  'Client Review',
  'MVP Complete',
  'Beta Release',
  'Production Ready',
  'Documentation Done',
];

/**
 * Generate a random integer between min and max (inclusive)
 */
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Pick a random item from an array
 */
const randomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Generate a large number of realistic tasks
 */
export const generateMockTasks = (count: number = 100): Task[] => {
  const tasks: Task[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const startDate = addDays(now, randomInt(-30, 30));
    const duration = randomInt(1, 21); // 1-21 days
    const endDate = addDays(startDate, duration);

    const status = randomItem(STATUSES);
    const priority = randomItem(PRIORITIES);

    // Progress based on status
    let progress = 0;
    if (status === 'completed') progress = 100;
    else if (status === 'in-progress') progress = randomInt(10, 90);
    else if (status === 'pending') progress = 0;
    else if (status === 'blocked') progress = randomInt(5, 50);
    else if (status === 'cancelled') progress = randomInt(0, 40);

    const task: Task = {
      id: `task-${i + 1}`,
      title: `${randomItem(TASK_TITLES)} #${i + 1}`,
      description: randomItem(TASK_DESCRIPTIONS),
      startDate,
      endDate,
      progress,
      status,
      priority,
      assignee: randomItem(ASSIGNEES),
    };

    // Add milestones to some tasks (30% chance)
    if (Math.random() < 0.3) {
      const milestoneCount = randomInt(1, 3);
      task.milestones = [];
      for (let m = 0; m < milestoneCount; m++) {
        const milestoneDate = addDays(startDate, Math.floor(duration * (m + 1) / (milestoneCount + 1)));
        task.milestones.push({
          id: `milestone-${i}-${m}`,
          title: randomItem(MILESTONE_NAMES),
          date: milestoneDate,
          completed: milestoneDate < now && status === 'completed',
        });
      }
    }

    // Add dependencies to some tasks (20% chance)
    if (Math.random() < 0.2 && i > 0) {
      const depCount = randomInt(1, Math.min(3, i));
      task.dependencies = [];
      for (let d = 0; d < depCount; d++) {
        task.dependencies.push(`task-${randomInt(1, i)}`);
      }
    }

    tasks.push(task);
  }

  return tasks;
};

/**
 * Generate a large number of realistic resources
 */
export const generateMockResources = (count: number = 100): Resource[] => {
  const resources: Resource[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const category = randomItem(RESOURCE_CATEGORIES);
    const updatedAt = subDays(now, randomInt(0, 60));

    resources.push({
      id: `resource-${i + 1}`,
      title: `${category} Document #${i + 1}`,
      description: `${randomItem(TASK_DESCRIPTIONS)} for ${category.toLowerCase()} team`,
      category,
      status: Math.random() < 0.8 ? 'Active' : 'Complete',
      priority: randomItem(PRIORITIES),
      icon: randomItem(RESOURCE_ICONS),
      tags: Array.from({ length: randomInt(2, 5) }, () =>
        randomItem(['v2', 'urgent', 'review', 'approved', 'draft', 'final'])
      ),
      updatedAt,
      metadata: {
        author: randomItem(ASSIGNEES),
        department: category,
        version: `v${randomInt(1, 5)}.${randomInt(0, 9)}`,
        fileSize: `${randomInt(1, 50)} MB`,
      },
    });
  }

  return resources;
};

/**
 * Generate Gantt tasks (similar to regular tasks but compatible with Gantt chart)
 */
export const generateMockGanttTasks = (count: number = 50): GanttTask[] => {
  const tasks = generateMockTasks(count);
  return tasks as GanttTask[];
};

/**
 * Generate time series data with many data points
 */
export const generateMockTimeSeriesData = (
  seriesCount: number = 3,
  pointsPerSeries: number = 1000,
  daysBack: number = 30
): TimeSeriesSeries[] => {
  const seriesNames = ['Revenue', 'Expenses', 'Profit', 'Page Views', 'Users', 'Conversions', 'Sessions', 'Bounce Rate'];
  const seriesColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  const series: TimeSeriesSeries[] = [];
  const now = new Date();
  const startDate = subDays(now, daysBack);

  for (let s = 0; s < seriesCount; s++) {
    const baseValue = randomInt(1000, 10000);
    const variance = baseValue * 0.3;
    const trend = randomInt(-5, 5); // Slight upward or downward trend

    const data: TimeSeriesDataPoint[] = [];
    const intervalMs = (daysBack * 24 * 60 * 60 * 1000) / pointsPerSeries;

    for (let i = 0; i < pointsPerSeries; i++) {
      const timestamp = new Date(startDate.getTime() + i * intervalMs);

      // Generate value with trend, variance, and some cyclical pattern
      const cyclicalValue = Math.sin(i / (pointsPerSeries / 10)) * (variance * 0.3);
      const randomVariance = (Math.random() - 0.5) * variance;
      const trendValue = (trend * i) / pointsPerSeries;

      const value = Math.max(0, baseValue + cyclicalValue + randomVariance + trendValue);

      data.push({
        timestamp,
        value,
        label: `Point ${i + 1}`,
      });
    }

    series.push({
      id: `series-${s + 1}`,
      name: seriesNames[s % seriesNames.length],
      data,
      color: seriesColors[s % seriesColors.length],
    });
  }

  return series;
};

/**
 * Generate statistics for display
 */
export const generateDatasetStats = (count: number) => ({
  totalItems: count,
  estimatedMemory: `~${Math.round((count * 0.5) / 1024)} MB`,
  itemsPerPage: Math.min(50, count),
  recommendedPageSize: count > 100 ? 25 : 50,
});

/**
 * Get performance recommendations based on dataset size
 */
export const getPerformanceRecommendations = (count: number): string[] => {
  const recommendations: string[] = [];

  if (count > 100) {
    recommendations.push('Enable pagination for better performance');
  }

  if (count > 500) {
    recommendations.push('Use search and filters to narrow down results');
    recommendations.push('Consider implementing virtual scrolling');
  }

  if (count > 1000) {
    recommendations.push('Highly recommend server-side pagination');
    recommendations.push('Consider lazy loading data on demand');
  }

  return recommendations;
};

/**
 * Generate a large graph with many nodes and edges
 * Creates a realistic organizational structure with different node types
 */
export const generateLargeGraph = (nodeCount: number = 1000): GraphData => {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Node type configuration
  const nodeTypes = [
    { label: 'Person', color: '#3B82F6', weight: 0.5 },
    { label: 'Team', color: '#10B981', weight: 0.15 },
    { label: 'Project', color: '#EF4444', weight: 0.2 },
    { label: 'Department', color: '#8B5CF6', weight: 0.1 },
    { label: 'Resource', color: '#F59E0B', weight: 0.05 },
  ];

  const firstNames = ['Alice', 'Bob', 'Carol', 'David', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const roles = ['Engineer', 'Designer', 'Manager', 'Analyst', 'Developer', 'Architect', 'Lead', 'Director', 'Coordinator', 'Specialist'];
  const departments = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
  const projectPrefixes = ['Project', 'Initiative', 'Campaign', 'Program', 'System'];
  const projectSuffixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa'];

  // Generate nodes
  for (let i = 0; i < nodeCount; i++) {
    // Determine node type based on weights
    let random = Math.random();
    let cumulativeWeight = 0;
    let selectedType = nodeTypes[0];

    for (const type of nodeTypes) {
      cumulativeWeight += type.weight;
      if (random <= cumulativeWeight) {
        selectedType = type;
        break;
      }
    }

    let properties: Record<string, any> = {};
    let labels = [selectedType.label];

    // Generate properties based on node type
    switch (selectedType.label) {
      case 'Person':
        labels.push('Employee');
        properties = {
          name: `${firstNames[i % firstNames.length]} ${lastNames[Math.floor(i / 10) % lastNames.length]}`,
          role: roles[i % roles.length],
          department: departments[i % departments.length],
          employeeId: `EMP${String(i).padStart(5, '0')}`,
          email: `employee${i}@company.com`,
        };
        break;
      case 'Team':
        properties = {
          name: `${departments[i % departments.length]} ${roles[i % roles.length]} Team`,
          size: Math.floor(Math.random() * 20) + 5,
          department: departments[i % departments.length],
        };
        break;
      case 'Project':
        properties = {
          name: `${projectPrefixes[i % projectPrefixes.length]} ${projectSuffixes[i % projectSuffixes.length]}`,
          status: ['Active', 'Planning', 'Completed', 'On Hold'][Math.floor(Math.random() * 4)],
          priority: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)],
          budget: Math.floor(Math.random() * 1000000) + 100000,
        };
        break;
      case 'Department':
        properties = {
          name: departments[i % departments.length],
          headcount: Math.floor(Math.random() * 100) + 10,
          budget: Math.floor(Math.random() * 10000000) + 1000000,
        };
        break;
      case 'Resource':
        properties = {
          name: `Resource ${i}`,
          type: ['Document', 'Tool', 'Asset', 'System'][Math.floor(Math.random() * 4)],
          status: ['Available', 'In Use', 'Maintenance'][Math.floor(Math.random() * 3)],
        };
        break;
    }

    nodes.push({
      id: String(i + 1),
      labels,
      properties,
      color: selectedType.color,
    });
  }

  // Generate edges (create realistic relationships)
  const edgeTypes = [
    'REPORTS_TO',
    'WORKS_ON',
    'BELONGS_TO',
    'MANAGES',
    'COLLABORATES_WITH',
    'USES',
    'DEPENDS_ON',
    'ASSIGNED_TO',
  ];

  // Create hierarchical relationships
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    // Each node gets 1-5 connections
    const connectionCount = Math.floor(Math.random() * 5) + 1;

    for (let c = 0; c < connectionCount; c++) {
      // Connect to nearby nodes (creates clusters)
      const targetIndex = Math.min(
        nodes.length - 1,
        Math.max(0, i + Math.floor(Math.random() * 50) - 25)
      );

      if (targetIndex !== i) {
        const targetNode = nodes[targetIndex];
        const edgeType = edgeTypes[Math.floor(Math.random() * edgeTypes.length)];

        // Avoid duplicate edges
        const edgeId = `e${i}-${targetIndex}`;
        const reverseEdgeId = `e${targetIndex}-${i}`;
        const existingEdge = edges.find(e => e.id === edgeId || e.id === reverseEdgeId);

        if (!existingEdge) {
          edges.push({
            id: edgeId,
            type: edgeType,
            source: node.id,
            target: targetNode.id,
            directed: edgeType !== 'COLLABORATES_WITH',
            properties: {
              since: addDays(new Date(), -Math.floor(Math.random() * 365)),
            },
          });
        }
      }
    }
  }

  // Ensure some hub nodes (highly connected)
  const hubCount = Math.floor(nodeCount * 0.05); // 5% of nodes are hubs
  for (let h = 0; h < hubCount; h++) {
    const hubIndex = Math.floor(Math.random() * nodes.length);
    const hubNode = nodes[hubIndex];

    // Connect hub to 10-30 random nodes
    const hubConnections = Math.floor(Math.random() * 20) + 10;
    for (let c = 0; c < hubConnections; c++) {
      const targetIndex = Math.floor(Math.random() * nodes.length);
      if (targetIndex !== hubIndex) {
        const edgeId = `hub-${hubIndex}-${targetIndex}`;
        const existingEdge = edges.find(e => e.id === edgeId);

        if (!existingEdge) {
          edges.push({
            id: edgeId,
            type: 'MANAGES',
            source: hubNode.id,
            target: nodes[targetIndex].id,
            directed: true,
          });
        }
      }
    }
  }

  return {
    nodes,
    edges,
    metadata: {
      name: 'Large Organizational Network',
      description: `Generated graph with ${nodeCount} nodes and ${edges.length} edges`,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      generated: new Date().toISOString(),
    },
  };
};
