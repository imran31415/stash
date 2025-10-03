import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ChatLayout, Chat, ChatWithPagination } from '../../src/components/Chat';
import type { ChatPreview, Message, GraphData } from '../../src/components/Chat';
import { addDays, addWeeks, addHours, subDays } from 'date-fns';
import {
  generateMockTasks,
  generateMockResources,
  generateMockGanttTasks,
  generateMockTimeSeriesData,
  generateLargeGraph,
} from '../utils/mockDataGenerator';

// Stash Demo - "What is Stash?" conversation
const getStashDemoMessages = (): Message[] => {
  const mockTasks = generateMockTasks(50);
  const mockGanttTasks = generateMockGanttTasks(100);
  const mockTimeSeries = generateMockTimeSeriesData();

  // Create a code knowledge graph showing AI's memory of a codebase
  const codeKnowledgeGraph: GraphData = {
    nodes: [
      // Core Files
      { id: 'app', labels: ['File'], properties: { name: 'App.tsx', type: 'entry', lines: 250 }, color: '#EF4444' },
      { id: 'chat', labels: ['File'], properties: { name: 'Chat.tsx', type: 'component', lines: 420 }, color: '#3B82F6' },
      { id: 'graph', labels: ['File'], properties: { name: 'GraphVisualization.tsx', type: 'component', lines: 680 }, color: '#3B82F6' },
      { id: 'gantt', labels: ['File'], properties: { name: 'GanttChart.tsx', type: 'component', lines: 550 }, color: '#3B82F6' },
      // Functions/Classes
      { id: 'render', labels: ['Function'], properties: { name: 'renderMessages()', complexity: 'medium' }, color: '#10B981', size: 16 },
      { id: 'layout', labels: ['Function'], properties: { name: 'applyForceLayout()', complexity: 'high' }, color: '#10B981', size: 20 },
      { id: 'paginate', labels: ['Function'], properties: { name: 'paginateTasks()', complexity: 'low' }, color: '#10B981', size: 14 },
      { id: 'websocket', labels: ['Class'], properties: { name: 'WebSocketService', pattern: 'singleton' }, color: '#8B5CF6', size: 18 },
      // Dependencies
      { id: 'react', labels: ['Dependency'], properties: { name: 'react', version: '18.2.0' }, color: '#F59E0B' },
      { id: 'rn', labels: ['Dependency'], properties: { name: 'react-native', version: '0.74.0' }, color: '#F59E0B' },
      { id: 'svg', labels: ['Dependency'], properties: { name: 'react-native-svg', version: '15.0.0' }, color: '#F59E0B' },
      // Concepts
      { id: 'state', labels: ['Concept'], properties: { name: 'State Management', approach: 'hooks' }, color: '#EC4899', size: 16 },
      { id: 'perf', labels: ['Concept'], properties: { name: 'Performance', strategy: 'pagination+virtualization' }, color: '#EC4899', size: 18 },
      { id: 'realtime', labels: ['Concept'], properties: { name: 'Real-time Updates', tech: 'websockets' }, color: '#EC4899', size: 16 },
    ],
    edges: [
      { id: 'e1', source: 'app', target: 'chat', type: 'IMPORTS', label: 'imports' },
      { id: 'e2', source: 'chat', target: 'graph', type: 'IMPORTS', label: 'imports' },
      { id: 'e3', source: 'chat', target: 'gantt', type: 'IMPORTS', label: 'imports' },
      { id: 'e4', source: 'chat', target: 'render', type: 'DEFINES', label: 'defines' },
      { id: 'e5', source: 'graph', target: 'layout', type: 'DEFINES', label: 'defines' },
      { id: 'e6', source: 'gantt', target: 'paginate', type: 'DEFINES', label: 'defines' },
      { id: 'e7', source: 'chat', target: 'websocket', type: 'USES', label: 'uses' },
      { id: 'e8', source: 'app', target: 'react', type: 'DEPENDS_ON', label: 'depends on' },
      { id: 'e9', source: 'chat', target: 'react', type: 'DEPENDS_ON', label: 'depends on' },
      { id: 'e10', source: 'chat', target: 'rn', type: 'DEPENDS_ON', label: 'depends on' },
      { id: 'e11', source: 'graph', target: 'svg', type: 'DEPENDS_ON', label: 'depends on' },
      { id: 'e12', source: 'render', target: 'state', type: 'IMPLEMENTS', label: 'implements' },
      { id: 'e13', source: 'layout', target: 'perf', type: 'OPTIMIZES', label: 'optimizes' },
      { id: 'e14', source: 'paginate', target: 'perf', type: 'OPTIMIZES', label: 'optimizes' },
      { id: 'e15', source: 'websocket', target: 'realtime', type: 'ENABLES', label: 'enables' },
      { id: 'e16', source: 'layout', target: 'paginate', type: 'RELATED_TO', label: 'related' },
      { id: 'e17', source: 'state', target: 'realtime', type: 'SUPPORTS', label: 'supports' },
    ],
    metadata: {
      name: 'Stash Codebase Knowledge Graph',
      description: 'AI\'s understanding of the Stash library architecture',
    },
  };

  return [
    {
      id: 'demo-1',
      content: "What is Stash?",
      sender: { id: 'user-demo', name: 'You', avatar: '👤' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: true,
    },
    {
      id: 'demo-2',
      content: "Great question! **Stash** is a React Native component library that solves a major problem in modern app development:\n\n**The Problem:** Modern interfaces aren't truly cross-platform. Building rich, interactive UIs that work seamlessly across web, iOS, and Android is complex and time-consuming. Most solutions require maintaining separate codebases or sacrifice user experience.\n\n**The Solution:** Stash provides battle-tested, high-performance React Native components that work everywhere - from simple task lists to complex data visualizations.\n\nLet me show you what makes Stash special...",
      sender: { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.01),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'demo-3',
      content: "First, let's look at a **Task List** - one of our most popular components. It handles large datasets gracefully and includes built-in pagination.\n\nTry tapping the expand button (⛶) to see the full detail view with filtering, sorting, and search capabilities!",
      sender: { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.02),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'task-list',
        data: {
          tasks: mockTasks,
          title: 'Project Tasks',
          subtitle: `${mockTasks.length} tasks • Tap ⛶ to expand`,
          mode: 'mini',
          showProgress: true,
        },
      },
    },
    {
      id: 'demo-4',
      content: "**Gantt Charts** are perfect for project timelines. This component handles 100+ tasks and includes **smart pagination** - no UI freezing, no matter how much data you have.\n\nNotice the smooth interactions and the pagination controls!",
      sender: { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.03),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'gantt-chart',
        data: {
          tasks: mockGanttTasks,
          title: 'Development Roadmap',
          subtitle: `${mockGanttTasks.length} tasks with pagination`,
          mode: 'mini',
          showProgress: true,
          showMilestones: true,
        },
      },
    },
    {
      id: 'demo-5',
      content: "**Real-time Data Visualization** with Time Series Charts. Perfect for analytics dashboards, IoT data, or financial tracking.\n\nStash components support **WebSocket connections** for live updates - your charts update in real-time as new data arrives!",
      sender: { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.04),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'time-series-chart',
        data: {
          series: mockTimeSeries,
          title: 'Real-time Metrics',
          subtitle: 'Live data updates via WebSocket',
          mode: 'mini',
          showLegend: true,
          enableZoom: true,
        },
      },
    },
    {
      id: 'demo-6',
      content: "Here's something really powerful: **Graph Visualization** for complex relationships.\n\nThis shows how an AI might visualize its understanding of a codebase - files, functions, dependencies, and their relationships. With **1000+ nodes**, traditional libraries would freeze. Stash handles it smoothly with:\n\n• Smart edge limiting (prioritizes important connections)\n• Async layout computation (no UI blocking)\n• Interactive focus mode (click any node!)\n• Full search and filtering\n\nThis same component powers knowledge graphs, social networks, org charts, and more.",
      sender: { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.05),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'graph-visualization',
        data: {
          data: codeKnowledgeGraph,
          title: 'AI Code Knowledge Graph',
          subtitle: 'My understanding of the Stash architecture • Click nodes to explore',
          mode: 'mini',
          showLabels: true,
          showEdgeLabels: true,
          enablePhysics: true,
          maxVisibleNodes: 20,
          maxVisibleEdges: 30,
        },
      },
    },
    {
      id: 'demo-7',
      content: "**Why Stash?**\n\n✅ **True Cross-Platform:** One codebase, works everywhere (iOS, Android, Web)\n\n✅ **Built for Scale:** Handles thousands of items with pagination, virtualization, and smart rendering\n\n✅ **Real-time Ready:** WebSocket support built-in for live updates\n\n✅ **Beautiful by Default:** Polished UI/UX out of the box, customizable to match your brand\n\n✅ **Developer Friendly:** TypeScript-first, comprehensive docs, easy integration\n\n✅ **Performance Obsessed:** Optimized rendering, async computations, no UI freezing\n\nEvery component you saw can be expanded for full-screen detail views with advanced features. Try clicking the ⛶ button on any of them!",
      sender: { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.06),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `# Why Stash?\n\n- ✅ **True Cross-Platform:** One codebase, works everywhere (iOS, Android, Web)\n- ✅ **Built for Scale:** Handles thousands of items with pagination, virtualization, and smart rendering\n- ✅ **Real-time Ready:** WebSocket support built-in for live updates\n- ✅ **Beautiful by Default:** Polished UI/UX out of the box, customizable to match your brand\n- ✅ **Developer Friendly:** TypeScript-first, comprehensive docs, easy integration\n- ✅ **Performance Obsessed:** Optimized rendering, async computations, no UI freezing`,
          language: 'markdown',
          fileName: 'WHY_STASH.md',
          mode: 'preview',
        },
      },
    },
    {
      id: 'demo-8',
      content: "**Getting Started is Easy:**\n\n```bash\nnpm install @stash/react-native\n```\n\nThen import and use any component:\n\n```tsx\nimport { TaskList, GanttChart, GraphVisualization } from '@stash/react-native';\n\n<TaskList tasks={myTasks} mode=\"full\" />\n```\n\nThat's it! You get a production-ready, performant component that works across all platforms.\n\nWant to see more? Check out the 📊 UI tab to explore individual components in depth! 🚀",
      sender: { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.07),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `# Getting Started\n\n## Installation\n\n\`\`\`bash\nnpm install @stash/react-native\n\`\`\`\n\n## Usage\n\n\`\`\`tsx\nimport { TaskList, GanttChart, GraphVisualization } from '@stash/react-native';\n\n<TaskList tasks={myTasks} mode=\"full\" />\n\`\`\``,
          language: 'markdown',
          fileName: 'GETTING_STARTED.md',
          mode: 'preview',
        },
      },
    },
  ];
};

// Stash Philosophy - "Why Chat Needs to Evolve" conversation
const getStashPhilosophyMessages = (): Message[] => {
  // Create a massive 1000-node graph representing AI's complete memory
  const aiMemoryGraph = generateLargeGraph(1000);

  return [
    {
      id: 'phil-1',
      content: "Why does Stash exist? What problem are you solving?",
      sender: { id: 'user-phil', name: 'You', avatar: '👤' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: true,
    },
    {
      id: 'phil-2',
      content: "Modern applications increasingly rely on chat interfaces to deliver complex information to users. However, text-only conversations have significant limitations when presenting structured data, visualizations, or interactive workflows.",
      sender: { id: 'ai-phil', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.01),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'phil-3',
      content: "**Stash empowers developers to build rich, interactive chat experiences** that improve how users interact with data.\n\nInstead of describing a project timeline in text, your application can display an interactive Gantt chart. Instead of listing tasks, you can provide a filterable, searchable task management interface.",
      sender: { id: 'ai-phil', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.02),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'phil-4',
      content: "**Cross-platform React Native components**\n\nStash provides production-ready components that work across Web, iOS, and Android from a single codebase. Each component is optimized for performance and includes built-in interactions like filtering, searching, and zooming.",
      sender: { id: 'ai-phil', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.03),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'phil-5',
      content: "**What's included:**",
      sender: { id: 'ai-phil', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.04),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'phil-6',
      content: "**Task Lists** - Interactive task management with filtering, search, and progress tracking:",
      sender: { id: 'ai-phil', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.05),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'task-list',
        data: {
          tasks: generateMockTasks(25),
          title: 'Interactive Task Management',
          subtitle: '25 tasks • Filter, search, track progress',
          mode: 'mini',
          showProgress: true,
        },
      },
    },
    {
      id: 'phil-8',
      content: "**Gantt Charts** - Project timelines with dependencies, milestones, and team assignments:",
      sender: { id: 'ai-phil', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.06),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'gantt-chart',
        data: {
          tasks: generateMockGanttTasks(80).slice(0, 6),
          allTasks: generateMockGanttTasks(80),
          title: 'Multi-Team Project Timeline',
          subtitle: '80 tasks with dependencies • Interactive view',
          mode: 'mini',
        },
      },
    },
    {
      id: 'phil-9',
      content: "**Time Series Charts** - Analytics and metrics with zoom, pan, and comparison tools:",
      sender: { id: 'ai-phil', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.07),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'time-series-chart',
        data: {
          series: generateMockTimeSeriesData(4, 100, 60),
          title: 'Real-Time Analytics',
          subtitle: '4 metrics • Zoom, pan, compare',
          mode: 'mini',
        },
      },
    },
    {
      id: 'phil-10',
      content: "**Graph Visualizations** - Complex relationships and knowledge graphs with search and navigation:",
      sender: { id: 'ai-phil', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.08),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'graph-visualization',
        data: {
          data: generateLargeGraph(50),
          title: 'Knowledge Graph - 50 Nodes',
          subtitle: '50 nodes • Click to explore',
          mode: 'mini',
        },
      },
    },
    {
      id: 'phil-11',
      content: "Each component scales to handle large datasets (1000+ items) while maintaining smooth performance. Users can click, expand, and interact with data directly within the conversation.",
      sender: { id: 'ai-phil', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.09),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'phil-13',
      content: "Example: A graph with 1,000 nodes remains fully interactive:",
      sender: { id: 'ai-phil', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.1),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'graph-visualization',
        data: {
          data: aiMemoryGraph,
          title: 'Large Knowledge Graph',
          subtitle: '1,000 nodes • Search, filter, and explore',
          mode: 'mini',
          maxVisibleEdges: 150,
        },
      },
    },
    {
      id: 'phil-14',
      content: "**Getting Started**\n\nHere's how to integrate Stash into your application:",
      sender: { id: 'ai-phil', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.11),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'phil-15',
      content: "**Step 1: Installation**",
      sender: { id: 'ai-phil', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.12),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `npm install @stash/react-native`,
          language: 'bash',
          fileName: 'install.sh',
        },
      },
    },
    {
      id: 'phil-15b',
      content: "**Step 2: Define your message types and data**",
      sender: { id: 'ai-phil', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.13),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `import { Message } from '@stash/react-native';

// Define your task data
interface Task {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  dependencies?: string[];
  assignee?: string;
  status?: 'todo' | 'in-progress' | 'completed';
}

// Example project tasks
const projectTasks: Task[] = [
  {
    id: '1',
    name: 'Design Phase',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-15'),
    progress: 100,
    status: 'completed',
    assignee: 'Design Team',
  },
  {
    id: '2',
    name: 'Development',
    startDate: new Date('2024-01-10'),
    endDate: new Date('2024-02-20'),
    progress: 60,
    status: 'in-progress',
    dependencies: ['1'],
    assignee: 'Dev Team',
  },
  {
    id: '3',
    name: 'Testing & QA',
    startDate: new Date('2024-02-15'),
    endDate: new Date('2024-03-01'),
    progress: 30,
    status: 'in-progress',
    dependencies: ['2'],
    assignee: 'QA Team',
  },
];`,
          language: 'tsx',
          fileName: 'types.ts',
        },
      },
    },
    {
      id: 'phil-15c',
      content: "**Step 3: Create messages with interactive components**",
      sender: { id: 'ai-phil', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.14),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `// Build your messages array with interactive components
const messages: Message[] = [
  {
    id: '1',
    type: 'text',
    content: 'Can you show me the Q1 project timeline?',
    sender: { id: 'user-1', name: 'User' },
    timestamp: new Date(),
    isOwn: true,
  },
  {
    id: '2',
    type: 'text',
    content: "Here's your Q1 project timeline with all tasks and dependencies:",
    sender: { id: 'ai-1', name: 'AI Assistant' },
    timestamp: new Date(),
    isOwn: false,
    // Add interactive component
    interactiveComponent: {
      type: 'gantt-chart',
      data: {
        tasks: projectTasks,
        title: 'Q1 2024 Project Timeline',
        subtitle: '3 tasks • Click to explore details',
        mode: 'mini', // Shows preview, click to expand
      },
    },
  },
];`,
          language: 'tsx',
          fileName: 'messages.ts',
        },
      },
    },
    {
      id: 'phil-15d',
      content: "**Step 4: Use the Chat component in your app**",
      sender: { id: 'ai-phil', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.15),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chat, Message } from '@stash/react-native';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'text',
      content: 'Can you show me the Q1 project timeline?',
      sender: { id: 'user-1', name: 'User' },
      timestamp: new Date(),
      isOwn: true,
    },
    {
      id: '2',
      type: 'text',
      content: "Here's your Q1 project timeline:",
      sender: { id: 'ai-1', name: 'AI Assistant' },
      timestamp: new Date(),
      isOwn: false,
      interactiveComponent: {
        type: 'gantt-chart',
        data: {
          tasks: projectTasks,
          title: 'Q1 2024 Project Timeline',
          subtitle: '3 tasks • Interactive view',
          mode: 'mini',
        },
      },
    },
  ]);

  const handleSendMessage = (message: Message) => {
    // Add message to state
    setMessages(prev => [...prev, message]);

    // Send to your backend/AI service
    // Then add AI response with interactive components
  };

  return (
    <View style={styles.container}>
      <Chat
        userId="user-1"
        chatType="ai"
        messages={messages}
        onSendMessage={handleSendMessage}
        placeholder="Ask me anything..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});`,
          language: 'tsx',
          fileName: 'App.tsx',
        },
      },
    },
    {
      id: 'phil-15e',
      content: "**That's it!** Your chat now supports interactive Gantt charts, task lists, time series, and knowledge graphs.\n\nAll components work across Web, iOS, and Android with zero additional configuration.\n\nYour users get a richer, more interactive experience. You get to build it with minimal code.",
      sender: { id: 'ai-phil', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.16),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'phil-16',
      content: "**Advanced: Production WebSocket Integration**\n\nFor production applications, you'll want real-time messaging with WebSockets, proper pagination, and session management. Here's a complete example:",
      sender: { id: 'ai-phil', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.17),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'phil-16a',
      content: "**Step 1: Create a WebSocket client with reconnection logic**",
      sender: { id: 'ai-phil', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.18),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `// websocket.ts - WebSocket client with auto-reconnection
export interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'event' | 'ping' | 'pong';
  tenant_id?: string;
  project_id?: string;
  action?: string;
  data?: any;
}

class WebSocketClient {
  private ws: WebSocket | null = null;
  private messageCallbacks: ((msg: WebSocketMessage) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private currentToken: string | null = null;
  private subscribedChannels: Set<string> = new Set();
  private pingInterval: NodeJS.Timeout | null = null;

  connect(token: string): void {
    this.currentToken = token;
    const wsUrl = \`ws://your-backend.com/ws?token=\${token}\`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;

      // Resubscribe to all channels after reconnect
      this.subscribedChannels.forEach(channelId => {
        this.send({ type: 'subscribe', project_id: channelId });
      });

      // Keep connection alive with pings
      this.pingInterval = setInterval(() => {
        this.send({ type: 'ping' });
      }, 30000);
    };

    this.ws.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      this.messageCallbacks.forEach(cb => cb(message));
    };

    this.ws.onclose = () => {
      this.cleanup();
      // Auto-reconnect with exponential backoff
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => {
          if (this.currentToken) this.connect(this.currentToken);
        }, 1000 * this.reconnectAttempts);
      }
    };
  }

  subscribe(channelId: string): void {
    this.subscribedChannels.add(channelId);
    this.send({ type: 'subscribe', project_id: channelId });
  }

  onMessage(callback: (msg: WebSocketMessage) => void): void {
    this.messageCallbacks.push(callback);
  }

  private send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private cleanup(): void {
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.ws = null;
  }

  disconnect(): void {
    this.ws?.close();
    this.cleanup();
  }
}

export const wsClient = new WebSocketClient();`,
          language: 'tsx',
          fileName: 'websocket.ts',
        },
      },
    },
    {
      id: 'phil-16b',
      content: "**Step 2: Create an API client for HTTP requests**",
      sender: { id: 'ai-phil', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.19),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `// api.ts - HTTP API client
const API_BASE_URL = 'https://your-backend.com';

export interface User {
  id: string;
  email: string;
  display_name: string;
}

export interface Channel {
  id: string;
  name: string;
  created_at: string;
}

export interface BackendMessage {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

class ChatAPI {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = \`Bearer \${this.token}\`;
    }

    const response = await fetch(\`\${API_BASE_URL}\${endpoint}\`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(\`API Error: \${response.status}\`);
    }

    return response.json();
  }

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getChannels(): Promise<Channel[]> {
    return this.request('/channels');
  }

  async getMessages(channelId: string): Promise<BackendMessage[]> {
    return this.request(\`/channels/\${channelId}/messages\`);
  }

  async sendMessage(channelId: string, content: string): Promise<BackendMessage> {
    return this.request(\`/channels/\${channelId}/messages\`, {
      method: 'POST',
      body: JSON.stringify({ content, type: 'text' }),
    });
  }
}

export const api = new ChatAPI();`,
          language: 'tsx',
          fileName: 'api.ts',
        },
      },
    },
    {
      id: 'phil-16c',
      content: "**Step 3: Integrate with ChatLayout for pagination and real-time updates**",
      sender: { id: 'ai-phil', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.2),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `// App.tsx - Full integration with WebSocket, API, and ChatLayout
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { ChatLayout, Chat, ChatPreview, Message } from '@stash/react-native';
import { api, BackendMessage, Channel, User } from './api';
import { wsClient, WebSocketMessage } from './websocket';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannelId, setCurrentChannelId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>({});
  const [isConnected, setIsConnected] = useState(false);

  // Use ref to avoid stale closures in WebSocket callbacks
  const currentUserRef = useRef<User | null>(null);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // Initialize WebSocket and restore session
  useEffect(() => {
    const token = api.getToken();
    if (token) {
      // Restore session
      wsClient.connect(token);
      loadChannels();
    }

    // WebSocket event handlers
    wsClient.onMessage((message: WebSocketMessage) => {
      if (message.type === 'event' && message.action === 'message.sent') {
        const channelId = message.project_id;
        const messageData = message.data;

        if (channelId && messageData) {
          const newMessage: Message = {
            id: messageData.id,
            type: 'text',
            content: messageData.content,
            sender: {
              id: messageData.user_id,
              name: messageData.user_id,
            },
            timestamp: new Date(messageData.created_at),
            status: 'delivered',
            isOwn: messageData.user_id === currentUserRef.current?.id,
          };

          // Add message with deduplication
          setChatMessages((prev) => {
            const existing = prev[channelId] || [];
            if (existing.some(m => m.id === newMessage.id)) {
              return prev; // Skip duplicates
            }
            return {
              ...prev,
              [channelId]: [...existing, newMessage],
            };
          });
        }
      }
    });

    return () => wsClient.disconnect();
  }, []);

  const loadChannels = async () => {
    const channelsList = await api.getChannels();
    setChannels(channelsList);
  };

  const loadMessages = async (channelId: string) => {
    const messages = await api.getMessages(channelId);
    const stashMessages: Message[] = messages.map(msg => ({
      id: msg.id,
      type: 'text',
      content: msg.content,
      sender: { id: msg.user_id, name: msg.user_id },
      timestamp: new Date(msg.created_at),
      status: 'delivered',
      isOwn: msg.user_id === currentUser?.id,
    }));

    setChatMessages((prev) => ({
      ...prev,
      [channelId]: stashMessages,
    }));
  };

  const handleChatSelect = async (chatId: string) => {
    setCurrentChannelId(chatId);

    // Load messages if not cached
    if (!chatMessages[chatId]) {
      await loadMessages(chatId);
    }

    // Subscribe to real-time updates
    wsClient.subscribe(chatId);
  };

  const handleSendMessage = async (newMessage: Message) => {
    if (!currentChannelId) return;

    const sentMessage = await api.sendMessage(
      currentChannelId,
      newMessage.content
    );

    // Add message immediately (WebSocket will deduplicate)
    const stashMessage: Message = {
      id: sentMessage.id,
      type: 'text',
      content: sentMessage.content,
      sender: { id: sentMessage.user_id, name: sentMessage.user_id },
      timestamp: new Date(sentMessage.created_at),
      status: 'sent',
      isOwn: true,
    };

    setChatMessages((prev) => {
      const existing = prev[currentChannelId] || [];
      if (existing.some(m => m.id === stashMessage.id)) {
        return prev;
      }
      return {
        ...prev,
        [currentChannelId]: [...existing, stashMessage],
      };
    });
  };

  // ChatLayout pagination handlers
  const loadInitialChats = async (limit: number) => {
    const chatPreviews: ChatPreview[] = channels.slice(0, limit).map(channel => ({
      id: channel.id,
      title: channel.name,
      type: 'group',
      participants: [],
      lastMessage: {
        content: 'Click to load messages',
        timestamp: new Date(channel.created_at),
        senderId: '',
        senderName: 'System',
      },
      unreadCount: 0,
      updatedAt: new Date(channel.created_at),
      createdAt: new Date(channel.created_at),
    }));

    return {
      chats: chatPreviews,
      totalCount: channels.length,
    };
  };

  const loadOlderChats = async (beforeId: string, limit: number) => {
    const beforeIndex = channels.findIndex(c => c.id === beforeId);
    if (beforeIndex === -1) return [];

    return channels.slice(beforeIndex + 1, beforeIndex + 1 + limit).map(channel => ({
      id: channel.id,
      title: channel.name,
      type: 'group' as const,
      participants: [],
      lastMessage: {
        content: 'Click to load messages',
        timestamp: new Date(channel.created_at),
        senderId: '',
        senderName: 'System',
      },
      unreadCount: 0,
      updatedAt: new Date(channel.created_at),
      createdAt: new Date(channel.created_at),
    }));
  };

  const messages = currentChannelId ? chatMessages[currentChannelId] || [] : [];

  return (
    <View style={styles.container}>
      <ChatLayout
        chatHistoryProps={{
          userId: currentUser?.id || '',
          currentChatId: currentChannelId || undefined,
          windowSize: 50, // Fixed memory window
          loadMoreThreshold: 10, // Load more when 10 items from edge
          onLoadInitial: loadInitialChats,
          onLoadBefore: loadOlderChats,
          onRefresh: loadChannels,
        }}
        onChatSelect={handleChatSelect}
      >
        {currentChannelId && (
          <Chat
            userId={currentUser?.id || ''}
            chatType="group"
            chatId={currentChannelId}
            messages={messages}
            onSendMessage={handleSendMessage}
            enableWebSocket={false} // We handle WebSocket ourselves
            enableHTTP={false}
          />
        )}
      </ChatLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});`,
          language: 'tsx',
          fileName: 'App.tsx',
        },
      },
    },
    {
      id: 'phil-16d',
      content: "**Key features in this implementation:**\n\n- **WebSocket reconnection** - Automatically reconnects with exponential backoff\n- **Message deduplication** - Prevents duplicate messages from WebSocket and HTTP\n- **Fixed memory window** - ChatLayout only keeps 50 chats in memory, loading more on demand\n- **Session persistence** - Restores connection on app reload using localStorage\n- **Optimistic updates** - Shows sent messages immediately before server confirmation\n- **Channel resubscription** - Automatically resubscribes to channels after reconnect\n\nThis pattern handles production requirements like unreliable networks, memory management, and user experience optimization.",
      sender: { id: 'ai-phil', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.21),
      status: 'delivered',
      isOwn: false,
    },
  ];
};

// AI Integrated messages for first chat
const getAIIntegratedMessages = (): Message[] => {
  // Generate large datasets for performance demo
  const largeTasks = generateMockTasks(250);
  const largeGanttTasks = generateMockGanttTasks(150);
  const largeResources = generateMockResources(200);
  const largeGraphData = generateLargeGraph(1000);

  // Generate separate time series for different metrics
  const websiteMetricsData = generateMockTimeSeriesData(4, 1500, 60);
  const businessMetricsData = generateMockTimeSeriesData(3, 1500, 60);

  // Customize website metrics
  const websiteTimeSeries = [
    { ...websiteMetricsData[0], id: 'page-views', name: 'Page Views', color: '#3B82F6' },
    { ...websiteMetricsData[1], id: 'unique-visitors', name: 'Unique Visitors', color: '#10B981' },
    { ...websiteMetricsData[2], id: 'session-duration', name: 'Avg Session (min)', color: '#8B5CF6' },
    { ...websiteMetricsData[3], id: 'bounce-rate', name: 'Bounce Rate %', color: '#EF4444' },
  ];

  // Customize business metrics
  const businessTimeSeries = [
    { ...businessMetricsData[0], id: 'revenue', name: 'Revenue ($)', color: '#10B981' },
    { ...businessMetricsData[1], id: 'conversions', name: 'Conversions', color: '#3B82F6' },
    { ...businessMetricsData[2], id: 'roi', name: 'ROI %', color: '#F59E0B' },
  ];

  return [
  {
    id: '0',
    type: 'system',
    content: 'Welcome to the Project Management Chat! Ask me about timelines, tasks, and resources.',
    sender: { id: 'system', name: 'System' },
    timestamp: new Date(Date.now() - 300000),
    isOwn: false,
  },
  {
    id: '1',
    type: 'text',
    content: 'Hey team! Can we get a timeline for the Q1 website redesign project?',
    sender: {
      id: 'user1',
      name: 'Sarah Chen',
      avatar: undefined,
    },
    timestamp: new Date(Date.now() - 240000),
    status: 'read',
    isOwn: false,
  },
  {
    id: '2',
    type: 'text',
    content: 'Sure! Here\'s the comprehensive project timeline for the Q1 Website Redesign with all 150 tasks across all teams:',
    sender: {
      id: 'ai',
      name: 'AI Assistant',
      avatar: undefined,
    },
    timestamp: new Date(Date.now() - 235000),
    status: 'read',
    isOwn: false,
    interactiveComponent: {
      type: 'gantt-chart',
      data: {
        tasks: largeGanttTasks.slice(0, 6), // Show only 6 in preview
        allTasks: largeGanttTasks, // Store all for detail view
        title: 'Q1 Website Redesign - Complete Timeline',
        subtitle: `${largeGanttTasks.length} tasks • Click to view full Gantt chart`,
        mode: 'mini',
      },
    },
  },
  {
    id: '2a',
    type: 'text',
    content: 'Here\'s a zoomed-in view of the core tasks:',
    sender: {
      id: 'ai',
      name: 'AI Assistant',
      avatar: undefined,
    },
    timestamp: new Date(Date.now() - 234000),
    status: 'read',
    isOwn: false,
    interactiveComponent: {
      type: 'gantt-chart',
      data: {
        tasks: [
          {
            id: '1',
            title: 'Discovery & Research',
            description: 'User research and competitive analysis',
            startDate: new Date(),
            endDate: addDays(new Date(), 7),
            progress: 100,
            status: 'completed',
            priority: 'high',
            assignee: 'Sarah Chen',
            milestones: [
              {
                id: 'm1',
                title: 'Research Complete',
                date: addDays(new Date(), 5),
                completed: true,
              },
            ],
          },
          {
            id: '2',
            title: 'Design Phase',
            description: 'Wireframes, mockups, and design system',
            startDate: addDays(new Date(), 6),
            endDate: addDays(new Date(), 20),
            progress: 65,
            status: 'in-progress',
            priority: 'high',
            assignee: 'Mike Wilson',
            milestones: [
              {
                id: 'm2',
                title: 'Wireframes Approved',
                date: addDays(new Date(), 12),
                completed: true,
              },
              {
                id: 'm3',
                title: 'Design Review',
                date: addDays(new Date(), 18),
                completed: false,
              },
            ],
          },
          {
            id: '3',
            title: 'Frontend Development',
            description: 'React components and responsive layouts',
            startDate: addDays(new Date(), 18),
            endDate: addWeeks(new Date(), 6),
            progress: 30,
            status: 'in-progress',
            priority: 'critical',
            assignee: 'John Doe',
            dependencies: ['2'],
          },
          {
            id: '4',
            title: 'Backend Integration',
            description: 'API integration and CMS setup',
            startDate: addDays(new Date(), 25),
            endDate: addWeeks(new Date(), 7),
            progress: 0,
            status: 'pending',
            priority: 'critical',
            assignee: 'Alex Kim',
            dependencies: ['3'],
          },
          {
            id: '5',
            title: 'Testing & QA',
            description: 'Cross-browser testing and bug fixes',
            startDate: addWeeks(new Date(), 6),
            endDate: addWeeks(new Date(), 8),
            progress: 0,
            status: 'pending',
            priority: 'high',
            assignee: 'Sarah Chen',
            dependencies: ['4'],
          },
          {
            id: '6',
            title: 'Launch & Deployment',
            description: 'Production deployment and monitoring',
            startDate: addWeeks(new Date(), 8),
            endDate: addWeeks(new Date(), 9),
            progress: 0,
            status: 'pending',
            priority: 'critical',
            assignee: 'Mike Wilson',
            dependencies: ['5'],
            milestones: [
              {
                id: 'm4',
                title: 'Go Live',
                date: addWeeks(new Date(), 9),
                completed: false,
              },
            ],
          },
        ],
        title: 'Q1 Website Redesign',
        subtitle: 'Project Timeline',
        mode: 'mini',
      },
    },
  },
  {
    id: '3',
    type: 'text',
    content: 'Thanks! What are the current active tasks I should be aware of?',
    sender: {
      id: 'user2',
      name: 'John Doe',
      avatar: undefined,
    },
    timestamp: new Date(Date.now() - 180000),
    status: 'read',
    isOwn: false,
  },
  {
    id: '4',
    type: 'text',
    content: 'Here are the active tasks for this sprint:',
    sender: {
      id: 'ai',
      name: 'AI Assistant',
      avatar: undefined,
    },
    timestamp: new Date(Date.now() - 175000),
    status: 'read',
    isOwn: false,
    interactiveComponent: {
      type: 'task-list',
      data: {
        title: 'Sprint Tasks',
        subtitle: 'Week of Jan 15-22',
        tasks: [
          {
            id: 't1',
            title: 'Implement responsive navigation',
            description: 'Create mobile-first navigation component with hamburger menu',
            startDate: addDays(new Date(), -2),
            endDate: addDays(new Date(), 2),
            progress: 75,
            status: 'in-progress',
            priority: 'high',
            assignee: 'John Doe',
            milestones: [
              {
                id: 'tm1',
                title: 'Desktop version',
                date: addDays(new Date(), -1),
                completed: true,
              },
              {
                id: 'tm2',
                title: 'Mobile optimization',
                date: addDays(new Date(), 1),
                completed: false,
              },
            ],
          },
          {
            id: 't2',
            title: 'Design hero section',
            description: 'Create eye-catching hero section with animation',
            startDate: new Date(),
            endDate: addDays(new Date(), 3),
            progress: 40,
            status: 'in-progress',
            priority: 'critical',
            assignee: 'Mike Wilson',
          },
          {
            id: 't3',
            title: 'Setup analytics tracking',
            description: 'Configure Google Analytics and custom event tracking',
            startDate: addDays(new Date(), 1),
            endDate: addDays(new Date(), 4),
            progress: 0,
            status: 'pending',
            priority: 'medium',
            assignee: 'Alex Kim',
          },
          {
            id: 't4',
            title: 'Performance optimization',
            description: 'Optimize images, lazy loading, and code splitting',
            startDate: addDays(new Date(), 2),
            endDate: addDays(new Date(), 5),
            progress: 10,
            status: 'in-progress',
            priority: 'high',
            assignee: 'Sarah Chen',
          },
        ],
      },
    },
  },
  {
    id: '5',
    type: 'text',
    content: 'Great! Do we have the design assets and documentation ready?',
    sender: {
      id: 'user3',
      name: 'Mike Wilson',
      avatar: undefined,
    },
    timestamp: new Date(Date.now() - 120000),
    status: 'read',
    isOwn: false,
  },
  {
    id: '6',
    type: 'text',
    content: 'Yes! Here are all 200 available resources across all departments:',
    sender: {
      id: 'ai',
      name: 'AI Assistant',
      avatar: undefined,
    },
    timestamp: new Date(Date.now() - 115000),
    status: 'read',
    isOwn: false,
    interactiveComponent: {
      type: 'resource-list',
      data: {
        title: 'All Company Resources',
        subtitle: `${largeResources.length} resources • Click to filter and search`,
        resources: largeResources.slice(0, 5), // Show only 5 in preview
        allResources: largeResources, // Store all for future expansion
        adaptiveHeight: true,
        showCategory: true,
        showStatus: true,
      },
    },
  },
  {
    id: '6a',
    type: 'text',
    content: 'Here are the key project documents for quick access:',
    sender: {
      id: 'ai',
      name: 'AI Assistant',
      avatar: undefined,
    },
    timestamp: new Date(Date.now() - 114000),
    status: 'read',
    isOwn: false,
    interactiveComponent: {
      type: 'resource-list',
      data: {
        title: 'Key Project Resources',
        subtitle: 'Essential Documents',
        resources: [
          {
            id: 'r1',
            title: 'Design System v2.0',
            description: 'Complete design system with components, colors, and typography',
            category: 'Design',
            status: 'Active',
            priority: 'critical',
            icon: '🎨',
            tags: ['design', 'ui-kit', 'figma'],
            updatedAt: addDays(new Date(), -1),
            metadata: {
              author: 'Mike Wilson',
              department: 'Design',
              fileSize: '45.2 MB',
            },
          },
          {
            id: 'r2',
            title: 'Technical Specifications',
            description: 'API endpoints, data models, and architecture docs',
            category: 'Engineering',
            status: 'Active',
            priority: 'high',
            icon: '📝',
            tags: ['documentation', 'api', 'specs'],
            updatedAt: addDays(new Date(), -3),
            metadata: {
              author: 'Alex Kim',
              department: 'Engineering',
              version: 'v1.2',
            },
          },
          {
            id: 'r3',
            title: 'Brand Guidelines',
            description: 'Logo usage, brand colors, and messaging guidelines',
            category: 'Marketing',
            status: 'Active',
            priority: 'medium',
            icon: '🎯',
            tags: ['brand', 'marketing', 'guidelines'],
            updatedAt: addDays(new Date(), -5),
            metadata: {
              author: 'Marketing Team',
              department: 'Marketing',
            },
          },
          {
            id: 'r4',
            title: 'User Research Report',
            description: 'User interviews, surveys, and usability testing results',
            category: 'Research',
            status: 'Complete',
            priority: 'medium',
            icon: '📊',
            tags: ['research', 'ux', 'data'],
            updatedAt: addDays(new Date(), -10),
            metadata: {
              author: 'Sarah Chen',
              department: 'Product',
              participants: 45,
            },
          },
          {
            id: 'r5',
            title: 'Component Library',
            description: 'Reusable React components and Storybook documentation',
            category: 'Engineering',
            status: 'Active',
            priority: 'high',
            icon: '⚛️',
            tags: ['react', 'components', 'storybook'],
            updatedAt: new Date(),
            metadata: {
              author: 'John Doe',
              department: 'Engineering',
              components: 47,
            },
          },
        ],
        adaptiveHeight: true,
        showCategory: true,
        showStatus: true,
      },
    },
  },
  {
    id: '7',
    type: 'text',
    content: 'Perfect! This is exactly what we need. Thanks for organizing everything!',
    sender: {
      id: 'user4',
      name: 'Alex Kim',
      avatar: undefined,
    },
    timestamp: new Date(Date.now() - 60000),
    status: 'read',
    isOwn: false,
  },
  {
    id: '8',
    type: 'text',
    content: 'Can we see the current website traffic and engagement metrics? I want to compare with our targets.',
    sender: {
      id: 'user1',
      name: 'Sarah Chen',
      avatar: undefined,
    },
    timestamp: new Date(Date.now() - 35000),
    status: 'read',
    isOwn: false,
  },
  {
    id: '9',
    type: 'text',
    content: 'Here\'s the detailed website analytics for the last 60 days (1,500 data points per metric). Click to explore trends:',
    sender: {
      id: 'ai',
      name: 'AI Assistant',
      avatar: undefined,
    },
    timestamp: new Date(Date.now() - 30000),
    status: 'read',
    isOwn: false,
    interactiveComponent: {
      type: 'time-series-chart',
      data: {
        title: 'Website Traffic & Engagement',
        subtitle: `Last 60 days • ${websiteTimeSeries[0].data.length} data points per metric`,
        mode: 'mini',
        series: websiteTimeSeries,
        showLegend: false,
        showGrid: true,
      },
    },
  },
  {
    id: '9a',
    type: 'text',
    content: 'Great! How about the business impact? Show me revenue and conversion data.',
    sender: {
      id: 'user3',
      name: 'Mike Wilson',
      avatar: undefined,
    },
    timestamp: new Date(Date.now() - 25000),
    status: 'read',
    isOwn: false,
  },
  {
    id: '9b',
    type: 'text',
    content: 'Here\'s the business metrics showing revenue impact and conversions over the same period:',
    sender: {
      id: 'ai',
      name: 'AI Assistant',
      avatar: undefined,
    },
    timestamp: new Date(Date.now() - 20000),
    status: 'read',
    isOwn: false,
    interactiveComponent: {
      type: 'time-series-chart',
      data: {
        title: 'Business & Revenue Metrics',
        subtitle: `Last 60 days • ${businessTimeSeries[0].data.length} data points per metric`,
        mode: 'mini',
        series: businessTimeSeries,
        showLegend: false,
        showGrid: true,
      },
    },
  },
  {
    id: '10',
    type: 'text',
    content: 'By the way, can you show me ALL the tasks across the company? I need to do resource planning.',
    sender: {
      id: 'user4',
      name: 'Alex Kim',
      avatar: undefined,
    },
    timestamp: new Date(Date.now() - 15000),
    status: 'read',
    isOwn: false,
  },
  {
    id: '11',
    type: 'text',
    content: 'Here\'s the complete task list across all departments (250 tasks). You can search, filter by status/priority, and toggle pagination:',
    sender: {
      id: 'ai',
      name: 'AI Assistant',
      avatar: undefined,
    },
    timestamp: new Date(Date.now() - 10000),
    status: 'read',
    isOwn: false,
    interactiveComponent: {
      type: 'task-list',
      data: {
        title: 'Company-Wide Task List',
        subtitle: `${largeTasks.length} tasks • Click to view full details with filters`,
        tasks: largeTasks.slice(0, 5), // Show only first 5 in preview
        allTasks: largeTasks, // Store all tasks for detail view
      },
    },
  },
  {
    id: '12',
    type: 'text',
    content: 'Hey AI, can you help me plan the implementation of a new OAuth2 authentication system? I need a detailed breakdown including all phases - development, testing, security reviews, everything.',
    sender: {
      id: 'user2',
      name: 'John Doe',
      avatar: undefined,
    },
    timestamp: new Date(Date.now() - 5000),
    status: 'read',
    isOwn: false,
  },
  {
    id: '13',
    type: 'text',
    content: 'Absolutely! Here\'s a comprehensive implementation plan for the OAuth2 authentication system with all 28 tasks broken down across requirements, design, development, testing, security, documentation, and deployment phases:',
    sender: {
      id: 'ai',
      name: 'AI Assistant',
      avatar: undefined,
    },
    timestamp: new Date(Date.now() - 3000),
    status: 'read',
    isOwn: false,
    interactiveComponent: {
      type: 'gantt-chart',
      data: {
        tasks: [
          // Phase 1: Requirements & Planning
          {
            id: 'req1',
            title: 'Requirements Gathering',
            description: 'Define OAuth2 requirements, supported providers, and security requirements',
            startDate: new Date(),
            endDate: addDays(new Date(), 3),
            progress: 100,
            status: 'completed',
            priority: 'critical',
            assignee: 'John Doe',
            milestones: [
              {
                id: 'req-m1',
                title: 'Requirements Signed Off',
                date: addDays(new Date(), 3),
                completed: true,
              },
            ],
          },
          {
            id: 'req2',
            title: 'Architecture Design',
            description: 'Design OAuth2 flow, token management, and security architecture',
            startDate: addDays(new Date(), 3),
            endDate: addDays(new Date(), 7),
            progress: 80,
            status: 'in-progress',
            priority: 'critical',
            assignee: 'Alex Kim',
          },
          // Phase 2: Backend Development
          {
            id: 'dev1',
            title: 'OAuth2 Provider Setup',
            description: 'Configure Google, GitHub, and Microsoft OAuth2 providers',
            startDate: addDays(new Date(), 7),
            endDate: addDays(new Date(), 10),
            progress: 40,
            status: 'in-progress',
            priority: 'high',
            assignee: 'Alex Kim',
          },
          {
            id: 'dev2',
            title: 'Token Service Implementation',
            description: 'Implement JWT token generation, validation, and refresh logic',
            startDate: addDays(new Date(), 10),
            endDate: addDays(new Date(), 14),
            progress: 0,
            status: 'pending',
            priority: 'critical',
            assignee: 'Alex Kim',
          },
          {
            id: 'dev3',
            title: 'Session Management',
            description: 'Implement secure session handling and token storage',
            startDate: addDays(new Date(), 14),
            endDate: addDays(new Date(), 17),
            progress: 0,
            status: 'pending',
            priority: 'high',
            assignee: 'Alex Kim',
          },
          // Phase 3: Frontend Development
          {
            id: 'frontend1',
            title: 'Login UI Components',
            description: 'Build OAuth2 login buttons and callback handlers',
            startDate: addDays(new Date(), 17),
            endDate: addDays(new Date(), 21),
            progress: 0,
            status: 'pending',
            priority: 'high',
            assignee: 'John Doe',
          },
          {
            id: 'frontend2',
            title: 'Authentication Context',
            description: 'Implement React context for auth state management',
            startDate: addDays(new Date(), 21),
            endDate: addDays(new Date(), 24),
            progress: 0,
            status: 'pending',
            priority: 'high',
            assignee: 'John Doe',
          },
          // Phase 4: Unit Testing
          {
            id: 'test1',
            title: 'Backend Unit Tests',
            description: 'Write comprehensive unit tests for OAuth2 and token services',
            startDate: addDays(new Date(), 24),
            endDate: addDays(new Date(), 28),
            progress: 0,
            status: 'pending',
            priority: 'high',
            assignee: 'Sarah Chen',
            milestones: [
              {
                id: 'test-m1',
                title: '90% Code Coverage',
                date: addDays(new Date(), 28),
                completed: false,
              },
            ],
          },
        ],
        allTasks: [
          // Phase 1: Requirements & Planning
          {
            id: 'req1',
            title: 'Requirements Gathering',
            description: 'Define OAuth2 requirements, supported providers, and security requirements',
            startDate: new Date(),
            endDate: addDays(new Date(), 3),
            progress: 100,
            status: 'completed',
            priority: 'critical',
            assignee: 'John Doe',
            milestones: [
              {
                id: 'req-m1',
                title: 'Requirements Signed Off',
                date: addDays(new Date(), 3),
                completed: true,
              },
            ],
          },
          {
            id: 'req2',
            title: 'Architecture Design',
            description: 'Design OAuth2 flow, token management, and security architecture',
            startDate: addDays(new Date(), 3),
            endDate: addDays(new Date(), 7),
            progress: 80,
            status: 'in-progress',
            priority: 'critical',
            assignee: 'Alex Kim',
          },
          {
            id: 'req3',
            title: 'Database Schema Design',
            description: 'Design user, session, and refresh token tables',
            startDate: addDays(new Date(), 5),
            endDate: addDays(new Date(), 7),
            progress: 60,
            status: 'in-progress',
            priority: 'high',
            assignee: 'Alex Kim',
          },
          // Phase 2: Backend Development
          {
            id: 'dev1',
            title: 'OAuth2 Provider Setup',
            description: 'Configure Google, GitHub, and Microsoft OAuth2 providers',
            startDate: addDays(new Date(), 7),
            endDate: addDays(new Date(), 10),
            progress: 40,
            status: 'in-progress',
            priority: 'high',
            assignee: 'Alex Kim',
          },
          {
            id: 'dev2',
            title: 'Token Service Implementation',
            description: 'Implement JWT token generation, validation, and refresh logic',
            startDate: addDays(new Date(), 10),
            endDate: addDays(new Date(), 14),
            progress: 0,
            status: 'pending',
            priority: 'critical',
            assignee: 'Alex Kim',
          },
          {
            id: 'dev3',
            title: 'Session Management',
            description: 'Implement secure session handling and token storage',
            startDate: addDays(new Date(), 14),
            endDate: addDays(new Date(), 17),
            progress: 0,
            status: 'pending',
            priority: 'high',
            assignee: 'Alex Kim',
          },
          {
            id: 'dev4',
            title: 'User Service Integration',
            description: 'Integrate OAuth2 with existing user management system',
            startDate: addDays(new Date(), 17),
            endDate: addDays(new Date(), 20),
            progress: 0,
            status: 'pending',
            priority: 'medium',
            assignee: 'Alex Kim',
          },
          {
            id: 'dev5',
            title: 'API Endpoints',
            description: 'Create REST API endpoints for auth, token refresh, and logout',
            startDate: addDays(new Date(), 20),
            endDate: addDays(new Date(), 24),
            progress: 0,
            status: 'pending',
            priority: 'high',
            assignee: 'Alex Kim',
          },
          // Phase 3: Frontend Development
          {
            id: 'frontend1',
            title: 'Login UI Components',
            description: 'Build OAuth2 login buttons and callback handlers',
            startDate: addDays(new Date(), 17),
            endDate: addDays(new Date(), 21),
            progress: 0,
            status: 'pending',
            priority: 'high',
            assignee: 'John Doe',
          },
          {
            id: 'frontend2',
            title: 'Authentication Context',
            description: 'Implement React context for auth state management',
            startDate: addDays(new Date(), 21),
            endDate: addDays(new Date(), 24),
            progress: 0,
            status: 'pending',
            priority: 'high',
            assignee: 'John Doe',
          },
          {
            id: 'frontend3',
            title: 'Protected Routes',
            description: 'Implement route guards and authentication checks',
            startDate: addDays(new Date(), 24),
            endDate: addDays(new Date(), 27),
            progress: 0,
            status: 'pending',
            priority: 'high',
            assignee: 'John Doe',
          },
          {
            id: 'frontend4',
            title: 'Token Refresh Logic',
            description: 'Implement automatic token refresh on expiry',
            startDate: addDays(new Date(), 27),
            endDate: addDays(new Date(), 30),
            progress: 0,
            status: 'pending',
            priority: 'critical',
            assignee: 'John Doe',
          },
          {
            id: 'frontend5',
            title: 'Error Handling UI',
            description: 'Build user-friendly error messages and retry logic',
            startDate: addDays(new Date(), 30),
            endDate: addDays(new Date(), 32),
            progress: 0,
            status: 'pending',
            priority: 'medium',
            assignee: 'John Doe',
          },
          // Phase 4: Unit Testing
          {
            id: 'test1',
            title: 'Backend Unit Tests',
            description: 'Write comprehensive unit tests for OAuth2 and token services',
            startDate: addDays(new Date(), 24),
            endDate: addDays(new Date(), 28),
            progress: 0,
            status: 'pending',
            priority: 'high',
            assignee: 'Sarah Chen',
            milestones: [
              {
                id: 'test-m1',
                title: '90% Code Coverage',
                date: addDays(new Date(), 28),
                completed: false,
              },
            ],
          },
          {
            id: 'test2',
            title: 'Frontend Unit Tests',
            description: 'Test React components and authentication flows',
            startDate: addDays(new Date(), 28),
            endDate: addDays(new Date(), 32),
            progress: 0,
            status: 'pending',
            priority: 'high',
            assignee: 'Sarah Chen',
          },
          {
            id: 'test3',
            title: 'Mock OAuth2 Provider Tests',
            description: 'Create mock providers for testing without external dependencies',
            startDate: addDays(new Date(), 30),
            endDate: addDays(new Date(), 33),
            progress: 0,
            status: 'pending',
            priority: 'medium',
            assignee: 'Sarah Chen',
          },
          // Phase 5: Integration Testing
          {
            id: 'integration1',
            title: 'End-to-End OAuth2 Flow Tests',
            description: 'Test complete OAuth2 flow with real providers in staging',
            startDate: addDays(new Date(), 33),
            endDate: addDays(new Date(), 37),
            progress: 0,
            status: 'pending',
            priority: 'critical',
            assignee: 'Sarah Chen',
            milestones: [
              {
                id: 'int-m1',
                title: 'All Providers Tested',
                date: addDays(new Date(), 37),
                completed: false,
              },
            ],
          },
          {
            id: 'integration2',
            title: 'Token Lifecycle Tests',
            description: 'Test token generation, validation, refresh, and revocation',
            startDate: addDays(new Date(), 37),
            endDate: addDays(new Date(), 40),
            progress: 0,
            status: 'pending',
            priority: 'high',
            assignee: 'Sarah Chen',
          },
          {
            id: 'integration3',
            title: 'Cross-Browser Testing',
            description: 'Test authentication flow in Chrome, Firefox, Safari, Edge',
            startDate: addDays(new Date(), 40),
            endDate: addDays(new Date(), 43),
            progress: 0,
            status: 'pending',
            priority: 'medium',
            assignee: 'Sarah Chen',
          },
          // Phase 6: Security & QA
          {
            id: 'security1',
            title: 'Security Audit',
            description: 'Conduct comprehensive security review of OAuth2 implementation',
            startDate: addDays(new Date(), 43),
            endDate: addDays(new Date(), 48),
            progress: 0,
            status: 'pending',
            priority: 'critical',
            assignee: 'Mike Wilson',
            milestones: [
              {
                id: 'sec-m1',
                title: 'Security Clearance',
                date: addDays(new Date(), 48),
                completed: false,
              },
            ],
          },
          {
            id: 'security2',
            title: 'Penetration Testing',
            description: 'Test for common OAuth2 vulnerabilities and attack vectors',
            startDate: addDays(new Date(), 48),
            endDate: addDays(new Date(), 52),
            progress: 0,
            status: 'pending',
            priority: 'critical',
            assignee: 'Mike Wilson',
          },
          {
            id: 'security3',
            title: 'CSRF Protection Validation',
            description: 'Verify CSRF tokens and state parameters are properly implemented',
            startDate: addDays(new Date(), 50),
            endDate: addDays(new Date(), 52),
            progress: 0,
            status: 'pending',
            priority: 'high',
            assignee: 'Mike Wilson',
          },
          {
            id: 'qa1',
            title: 'User Acceptance Testing',
            description: 'UAT with internal team and selected beta users',
            startDate: addDays(new Date(), 52),
            endDate: addDays(new Date(), 56),
            progress: 0,
            status: 'pending',
            priority: 'high',
            assignee: 'Sarah Chen',
          },
          // Phase 7: Documentation
          {
            id: 'doc1',
            title: 'API Documentation',
            description: 'Document all authentication endpoints and token management APIs',
            startDate: addDays(new Date(), 45),
            endDate: addDays(new Date(), 50),
            progress: 0,
            status: 'pending',
            priority: 'medium',
            assignee: 'John Doe',
          },
          {
            id: 'doc2',
            title: 'Developer Guide',
            description: 'Write guide for integrating OAuth2 in new features',
            startDate: addDays(new Date(), 50),
            endDate: addDays(new Date(), 54),
            progress: 0,
            status: 'pending',
            priority: 'medium',
            assignee: 'John Doe',
          },
          {
            id: 'doc3',
            title: 'User Documentation',
            description: 'Create help articles for end-users on OAuth2 login',
            startDate: addDays(new Date(), 54),
            endDate: addDays(new Date(), 57),
            progress: 0,
            status: 'pending',
            priority: 'low',
            assignee: 'Mike Wilson',
          },
          // Phase 8: Deployment
          {
            id: 'deploy1',
            title: 'Staging Deployment',
            description: 'Deploy OAuth2 system to staging environment',
            startDate: addDays(new Date(), 56),
            endDate: addDays(new Date(), 57),
            progress: 0,
            status: 'pending',
            priority: 'high',
            assignee: 'Alex Kim',
            milestones: [
              {
                id: 'deploy-m1',
                title: 'Staging Live',
                date: addDays(new Date(), 57),
                completed: false,
              },
            ],
          },
          {
            id: 'deploy2',
            title: 'Production Deployment',
            description: 'Gradual rollout to production with feature flags',
            startDate: addDays(new Date(), 60),
            endDate: addDays(new Date(), 61),
            progress: 0,
            status: 'pending',
            priority: 'critical',
            assignee: 'Alex Kim',
            milestones: [
              {
                id: 'deploy-m2',
                title: 'Production Launch',
                date: addDays(new Date(), 61),
                completed: false,
              },
            ],
          },
          {
            id: 'deploy3',
            title: 'Monitoring Setup',
            description: 'Configure alerts for auth failures, token issues, and security events',
            startDate: addDays(new Date(), 61),
            endDate: addDays(new Date(), 63),
            progress: 0,
            status: 'pending',
            priority: 'high',
            assignee: 'Alex Kim',
          },
        ],
        title: 'OAuth2 Authentication System - Implementation Plan',
        subtitle: '28 tasks across 8 phases • 63 days • Click to view complete breakdown',
        mode: 'mini',
      },
    },
  },
  {
    id: '14',
    type: 'text',
    content: 'This is really helpful! One more thing - can you show me the complete company organizational structure? I want to see how all teams, people, and projects are connected.',
    sender: {
      id: 'user1',
      name: 'Sarah Chen',
      avatar: undefined,
    },
    timestamp: new Date(Date.now() - 1000),
    status: 'read',
    isOwn: false,
  },
  {
    id: '15',
    type: 'text',
    content: `Absolutely! Here's an interactive knowledge graph visualization of our entire organizational structure with ${largeGraphData.nodes.length} nodes and ${largeGraphData.edges.length} relationships. You can click on any node to explore connections and relationships:`,
    sender: {
      id: 'ai',
      name: 'AI Assistant',
      avatar: undefined,
    },
    timestamp: new Date(),
    status: 'delivered',
    isOwn: false,
    interactiveComponent: {
      type: 'graph-visualization',
      data: {
        data: largeGraphData,
        title: 'Company Organizational Network',
        subtitle: `${largeGraphData.nodes.length} nodes • ${largeGraphData.edges.length} relationships • Click nodes to explore`,
        mode: 'mini',
        showLabels: true,
        showEdgeLabels: true,
        enablePhysics: true,
        maxVisibleNodes: 100,
        maxVisibleEdges: 150,
      },
    },
  },
];
};

// Mock chat data
const generateMockChats = (count: number): ChatPreview[] => {
  const chatTypes: Array<'direct' | 'group' | 'ai'> = ['direct', 'group', 'ai'];
  const names = [
    'Sarah Johnson',
    'Mike Chen',
    'Emily Rodriguez',
    'James Wilson',
    'Lisa Anderson',
    'David Kim',
    'Maria Garcia',
    'Robert Taylor',
    'Jennifer Lee',
    'Michael Brown',
    'Product Team',
    'Design Review',
    'Engineering Sync',
    'Marketing Campaign',
    'Sales Strategy',
    'Customer Support',
    'AI Assistant',
    'Code Helper',
    'Research Bot',
    'Data Analyst AI',
  ];

  const lastMessages = [
    'Hey, are we still on for the meeting tomorrow?',
    'I just sent over the latest designs, let me know what you think!',
    'Can you review this proposal by end of day?',
    'Thanks for your help yesterday! Really appreciated it.',
    'The project timeline looks great, let\'s move forward.',
    'I have some concerns about the Q4 roadmap we should discuss.',
    'Just finished the code review, found a few minor issues.',
    'The client meeting went really well today!',
    'Updated the documentation as requested.',
    'Let\'s schedule a quick sync this week.',
    'Great work on the presentation!',
    'I\'ll have the report ready by Friday.',
    'Can we push the deadline by a few days?',
    'The new feature is ready for testing.',
    'I analyzed the data and here are my findings...',
    'Based on your requirements, I recommend...',
    'I\'ve completed the research you requested.',
    'Here\'s a summary of today\'s metrics.',
  ];

  const chats: ChatPreview[] = [];

  for (let i = 0; i < count; i++) {
    const type = chatTypes[i % chatTypes.length];
    const isAI = type === 'ai';
    const isGroup = type === 'group';
    const isPinned = i < 3; // First 3 are pinned
    const isMuted = i % 7 === 0; // Every 7th is muted
    const isArchived = i % 11 === 0 && i > 0; // Every 11th is archived

    const baseDate = new Date();
    baseDate.setHours(baseDate.getHours() - i * 2); // 2 hours apart

    const participantCount = isGroup ? Math.floor(Math.random() * 8) + 3 : (isAI ? 1 : 2);
    const participants = [];

    for (let j = 0; j < participantCount; j++) {
      participants.push({
        id: `user-${i}-${j}`,
        name: isAI ? 'AI Assistant' : names[(i + j) % names.length],
        avatar: undefined,
      });
    }

    const unreadCount = isPinned ? Math.floor(Math.random() * 5) : (i % 5 === 0 ? Math.floor(Math.random() * 20) : 0);

    chats.push({
      id: `chat-${i}`,
      title: isAI
        ? `AI: ${names[i % names.length]}`
        : isGroup
        ? names[i % names.length]
        : participants.find(p => p.name !== 'You')?.name || names[i % names.length],
      lastMessage: {
        content: lastMessages[i % lastMessages.length],
        timestamp: baseDate,
        senderId: participants[0].id,
        senderName: participants[0].name,
      },
      participants,
      unreadCount,
      type,
      updatedAt: baseDate,
      createdAt: new Date(baseDate.getTime() - 1000 * 60 * 60 * 24 * 7), // 7 days before
      isPinned,
      isMuted,
      isArchived,
      metadata: {
        lastReadAt: new Date(baseDate.getTime() - 1000 * 60 * 30), // 30 min ago
      },
    });
  }

  return chats;
};

// Generate 1000+ messages for pagination demo
const getLargeMessageHistory = (): Message[] => {
  const messages: Message[] = [];
  const startDate = subDays(new Date(), 60); // 60 days ago

  for (let i = 0; i < 1200; i++) {
    const isOwn = i % 3 === 0; // Every 3rd message is from user
    const dayOffset = Math.floor(i / 20); // ~20 messages per day
    const hourOffset = (i % 20) * 1.2; // Spread throughout the day

    messages.push({
      id: `msg-${i}`,
      type: 'text',
      content: isOwn
        ? `User message ${i + 1}: This is a test message to demonstrate pagination with large message histories.`
        : `AI response ${i + 1}: Acknowledged. The system is handling ${1200} total messages efficiently with proper pagination and windowing.`,
      sender: isOwn
        ? { id: 'user-1', name: 'You', avatar: '👤' }
        : { id: 'ai-pagination', name: 'AI Assistant', avatar: '🤖' },
      timestamp: addHours(addDays(startDate, dayOffset), hourOffset),
      status: 'delivered',
      isOwn,
    });
  }

  return messages;
};

// Generate initial 100 chats
const ALL_MOCK_CHATS = generateMockChats(100);

// Insert the "What is Stash?" demo conversation
ALL_MOCK_CHATS.unshift({
  id: 'chat-demo',
  title: '✨ What is Stash?',
  type: 'ai',
  participants: [
    { id: 'user-demo', name: 'You', avatar: '👤' },
    { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
  ],
  lastMessage: {
    content: 'Getting Started is Easy: npm install @stash/react-native...',
    timestamp: new Date(),
    senderId: 'ai-demo',
    senderName: 'Stash AI',
  },
  unreadCount: 0,
  updatedAt: new Date(),
  createdAt: new Date(),
  isPinned: true,
  isMuted: false,
  isArchived: false,
  metadata: {
    lastReadAt: new Date(),
  },
});

// Insert pagination demo conversation
ALL_MOCK_CHATS.unshift({
  id: 'chat-pagination',
  title: '📄 Pagination Demo: 1,200 Messages',
  type: 'ai',
  participants: [
    { id: 'user-1', name: 'You', avatar: '👤' },
    { id: 'ai-pagination', name: 'AI Assistant', avatar: '🤖' },
  ],
  lastMessage: {
    content: 'AI response 1200: Acknowledged. The system is handling 1200 total messages efficiently...',
    timestamp: new Date(),
    senderId: 'ai-pagination',
    senderName: 'AI Assistant',
  },
  unreadCount: 0,
  updatedAt: new Date(),
  createdAt: subDays(new Date(), 60),
  isPinned: true,
  isMuted: false,
  isArchived: false,
  metadata: {
    lastReadAt: new Date(),
  },
});

// Insert the "Why Chat Needs to Evolve" philosophy conversation at the very top
ALL_MOCK_CHATS.unshift({
  id: 'chat-philosophy',
  title: '💭 Why Chat Needs to Evolve',
  type: 'ai',
  participants: [
    { id: 'user-phil', name: 'You', avatar: '👤' },
    { id: 'ai-phil', name: 'Stash AI', avatar: '🤖' },
  ],
  lastMessage: {
    content: 'Welcome to Stash. Ready to build the future?',
    timestamp: new Date(),
    senderId: 'ai-phil',
    senderName: 'Stash AI',
  },
  unreadCount: 0,
  updatedAt: new Date(),
  createdAt: new Date(),
  isPinned: true,
  isMuted: false,
  isArchived: false,
  metadata: {
    lastReadAt: new Date(),
  },
});

// Update the fourth chat (originally first) to be the Project Management chat
ALL_MOCK_CHATS[3] = {
  ...ALL_MOCK_CHATS[3],
  id: 'chat-0',
  title: 'Q1 Website Redesign',
  type: 'group',
  participants: [
    { id: 'user1', name: 'Sarah Chen', avatar: undefined },
    { id: 'user2', name: 'John Doe', avatar: undefined },
    { id: 'user3', name: 'Mike Wilson', avatar: undefined },
    { id: 'user4', name: 'Alex Kim', avatar: undefined },
    { id: 'ai', name: 'AI Assistant', avatar: undefined },
  ],
  lastMessage: {
    content: 'Absolutely! Here\'s an interactive knowledge graph visualization...',
    timestamp: new Date(),
    senderId: 'ai',
    senderName: 'AI Assistant',
  },
  isPinned: true,
  unreadCount: 0,
};

export default function ChatHistoryExample() {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [allChats] = useState(ALL_MOCK_CHATS);
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  // Memoize initial messages to avoid regenerating large datasets
  const philosophyMessages = useMemo(() => getStashPhilosophyMessages(), []);
  const demoMessages = useMemo(() => getStashDemoMessages(), []);
  const allPaginationMessages = useMemo(() => getLargeMessageHistory(), []); // Store all 1200 messages
  const initialMessages = useMemo(() => getAIIntegratedMessages(), []);

  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>({
    'chat-philosophy': philosophyMessages,
    'chat-demo': demoMessages,
    'chat-0': initialMessages,
  });

  // Simulate loading initial chats - memoized for performance
  const loadInitialChats = useCallback(async (limit: number) => {
    console.log(`[ChatHistoryExample] Loading initial ${limit} chats`);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const chats = allChats.slice(0, limit);
      return {
        chats,
        totalCount: allChats.length,
      };
    } catch (error) {
      console.error('[ChatHistoryExample] Error loading initial chats:', error);
      return { chats: [], totalCount: 0 };
    }
  }, [allChats]);

  // Simulate loading older chats (pagination) - memoized for performance
  const loadOlderChats = useCallback(async (beforeId: string, limit: number) => {
    console.log(`[ChatHistoryExample] Loading ${limit} older chats before ${beforeId}`);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const beforeIndex = allChats.findIndex(chat => chat.id === beforeId);
      if (beforeIndex === -1) {
        console.warn(`[ChatHistoryExample] Chat ${beforeId} not found`);
        return [];
      }

      const startIndex = beforeIndex + 1;
      return allChats.slice(startIndex, startIndex + limit);
    } catch (error) {
      console.error('[ChatHistoryExample] Error loading older chats:', error);
      return [];
    }
  }, [allChats]);

  // Simulate loading newer chats (pagination) - memoized for performance
  const loadNewerChats = useCallback(async (afterId: string, limit: number) => {
    console.log(`[ChatHistoryExample] Loading ${limit} newer chats after ${afterId}`);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const afterIndex = allChats.findIndex(chat => chat.id === afterId);
      if (afterIndex === -1) {
        console.warn(`[ChatHistoryExample] Chat ${afterId} not found`);
        return [];
      }

      const endIndex = afterIndex;
      const startIndex = Math.max(0, endIndex - limit);
      return allChats.slice(startIndex, endIndex);
    } catch (error) {
      console.error('[ChatHistoryExample] Error loading newer chats:', error);
      return [];
    }
  }, [allChats]);

  const handleChatSelect = useCallback((chatId: string) => {
    console.log('[ChatHistoryExample] Selected chat:', chatId);
    setCurrentChatId(chatId);
    // Enable presentation mode for philosophy chat
    setIsPresentationMode(chatId === 'chat-philosophy');
  }, []);

  const handleCreateNewChat = useCallback(() => {
    console.log('[ChatHistoryExample] Create new chat clicked');
    // In a real app, navigate to new chat creation screen
  }, []);

  const handleRefresh = useCallback(async () => {
    console.log('[ChatHistoryExample] Refreshing chats...');
    // In a real app, fetch latest chats from server
    await new Promise(resolve => setTimeout(resolve, 1000));
  }, []);

  const handleSendMessage = useCallback((newMessage: Message) => {
    if (!currentChatId) return;

    setChatMessages((prev) => ({
      ...prev,
      [currentChatId]: [...(prev[currentChatId] || []), newMessage],
    }));

    // Simulate AI response for demo purposes
    setTimeout(() => {
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        type: 'text',
        content: 'I received your message! In a real implementation, this would connect to an AI backend.',
        sender: {
          id: 'ai',
          name: 'AI Assistant',
          avatar: undefined,
        },
        timestamp: new Date(),
        status: 'delivered',
        isOwn: false,
      };
      setChatMessages((prev) => ({
        ...prev,
        [currentChatId]: [...(prev[currentChatId] || []), aiResponse],
      }));
    }, 1000);
  }, [currentChatId]); // Include currentChatId in dependencies since it's used in the callback

  // Pagination handlers for large message demo (memoized for performance)
  const loadInitialPaginationMessages = useCallback(async (chatId: string, limit: number) => {
    console.log(`[ChatHistoryExample] Loading initial ${limit} messages for pagination demo`);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

      // Return the most recent messages (from the end of the array)
      const messages = allPaginationMessages.slice(-limit);
      return {
        messages,
        totalCount: allPaginationMessages.length,
      };
    } catch (error) {
      console.error('[ChatHistoryExample] Error loading initial pagination messages:', error);
      return { messages: [], totalCount: 0 };
    }
  }, [allPaginationMessages]);

  const loadMessagesBefore = useCallback(async (chatId: string, beforeMessageId: string, limit: number) => {
    console.log(`[ChatHistoryExample] Loading ${limit} messages before ${beforeMessageId}`);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

      const beforeIndex = allPaginationMessages.findIndex(m => m.id === beforeMessageId);
      if (beforeIndex === -1) {
        console.warn(`[ChatHistoryExample] Message ${beforeMessageId} not found`);
        return [];
      }

      const startIndex = Math.max(0, beforeIndex - limit);
      return allPaginationMessages.slice(startIndex, beforeIndex);
    } catch (error) {
      console.error('[ChatHistoryExample] Error loading messages before:', error);
      return [];
    }
  }, [allPaginationMessages]);

  const loadMessagesAfter = useCallback(async (chatId: string, afterMessageId: string, limit: number) => {
    console.log(`[ChatHistoryExample] Loading ${limit} messages after ${afterMessageId}`);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

      const afterIndex = allPaginationMessages.findIndex(m => m.id === afterMessageId);
      if (afterIndex === -1) {
        console.warn(`[ChatHistoryExample] Message ${afterMessageId} not found`);
        return [];
      }

      const endIndex = Math.min(allPaginationMessages.length, afterIndex + 1 + limit);
      return allPaginationMessages.slice(afterIndex + 1, endIndex);
    } catch (error) {
      console.error('[ChatHistoryExample] Error loading messages after:', error);
      return [];
    }
  }, [allPaginationMessages]);

  const currentChat = allChats.find(c => c.id === currentChatId);
  const messages = currentChatId ? chatMessages[currentChatId] || [] : [];

  return (
    <ChatLayout
      chatHistoryProps={{
        userId: 'current-user',
        currentChatId: currentChatId || undefined,
        windowSize: 50,
        loadMoreThreshold: 10,
        showSearch: true,
        showCreateButton: true,
        onChatSelect: (chat) => handleChatSelect(chat.id),
        onLoadInitial: loadInitialChats,
        onLoadBefore: loadOlderChats,
        onLoadAfter: loadNewerChats,
        onCreateNewChat: handleCreateNewChat,
        onRefresh: handleRefresh,
      }}
      sidebarWidth={320}
      mobileBreakpoint={768}
      defaultSidebarVisible={true}
      defaultMobileVisible={true}
      autoSelectFirstChat={true}
      showMenuButton={true}
      onChatSelect={handleChatSelect}
    >
      {/* Chat content area */}
      {currentChatId ? (
        currentChatId === 'chat-pagination' ? (
          // Use ChatWithPagination for the large message demo
          <ChatWithPagination
            userId="current-user"
            chatType="ai"
            chatId={currentChatId}
            windowSize={50}
            loadMoreThreshold={10}
            onLoadInitialMessages={loadInitialPaginationMessages}
            onLoadMessagesBefore={loadMessagesBefore}
            onLoadMessagesAfter={loadMessagesAfter}
            onSendMessage={handleSendMessage}
            placeholder="Type a message..."
            enableWebSocket={false}
            enableHTTP={false}
            showConnectionStatus={false}
          />
        ) : (
          // Use regular Chat for other chats
          <Chat
            userId="current-user"
            chatType={currentChat?.type || 'group'}
            chatId={currentChatId}
            messages={messages}
            onSendMessage={handleSendMessage}
            placeholder="Type a message..."
            enableWebSocket={false}
            enableHTTP={false}
            showConnectionStatus={false}
            presentationMode={isPresentationMode}
            onExitPresentation={() => setIsPresentationMode(false)}
          />
        )
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>💬</Text>
          <Text style={styles.emptyStateTitle}>Select a chat to start messaging</Text>
          <Text style={styles.emptyStateSubtitle}>
            Choose from {allChats.length} conversations on the left
          </Text>
        </View>
      )}
    </ChatLayout>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
