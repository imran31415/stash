import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ChatLayout, Chat, ChatWithPagination } from '../../src/components/Chat';
import type { ChatPreview, Message, GraphData } from '../../src/components/Chat';
import { addDays, addWeeks, addHours, addMinutes, subDays } from 'date-fns';
import {
  generateMockTasks,
  generateMockResources,
  generateMockGanttTasks,
  generateMockTimeSeriesData,
  generateLargeGraph,
} from '../utils/mockDataGenerator';
import MediaChatExample from './MediaChatExample';

// Combined "What is Stash?" - Philosophy + Demo
const getStashOverviewMessages = (): Message[] => {
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
      content: "What is Stash and what problem does it solve?",
      sender: { id: 'user-demo', name: 'You', avatar: '👤' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: true,
    },
    {
      id: 'demo-2',
      content: "Great question! Let me start with the problem space.\n\n## The Evolution of Chat Interfaces\n\nChat started simple: send text, receive text. But modern collaboration demands more:\n\n❌ **Traditional chat is too limited** - Text can't convey complex project data, timelines, or relationships\n\n❌ **Switching contexts kills productivity** - Users constantly jump between chat, project management tools, dashboards, and documentation\n\n❌ **AI agents need rich output** - AI assistants generate structured data (tasks, charts, code) that doesn't fit in plain text\n\n❌ **Mobile experiences lag behind** - Rich visualizations work on desktop but break on mobile",
      sender: { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.01),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'demo-2a',
      content: "## The Cross-Platform Challenge\n\nBuilding rich, interactive UIs that work seamlessly across web, iOS, and Android is notoriously complex:\n\n🔴 **Separate codebases** - Build the same component 3 times (React web, Swift, Kotlin)\n\n🔴 **Inconsistent UX** - Each platform feels different, users get confused\n\n🔴 **Performance issues** - WebViews are slow, native bridges are complex\n\n🔴 **Maintenance nightmare** - Bug fixes and features need 3x the work\n\nMost solutions make you choose: either maintain separate native apps OR use a lowest-common-denominator approach that sacrifices user experience.",
      sender: { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.015),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'demo-2b',
      content: "## Enter Stash\n\n**Stash** is a React Native component library that solves both problems:\n\n✅ **True Cross-Platform** - Write once, runs natively on iOS, Android, and Web\n\n✅ **Rich Interactive Components** - Task lists, Gantt charts, graphs, time series - all built for chat\n\n✅ **Built for Scale** - Handles thousands of items with smart pagination and virtualization\n\n✅ **AI-Native** - Components designed for AI-generated content (structured data, code, visualizations)\n\n✅ **Performance Obsessed** - Smooth 60fps interactions even with massive datasets\n\nLet me show you what this looks like in practice...",
      sender: { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.02),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'demo-3',
      content: "## Real-World Example: Task Lists\n\nFirst, let's look at a **Task List** component - one of our most popular. Instead of describing tasks in text:\n\n*\"We have 50 tasks: design homepage (high priority, 75% done), implement API (critical, in progress), write tests (pending)...\"*\n\nStash lets you send an actual interactive task list. It handles 1000+ tasks gracefully with built-in pagination, filtering, and sorting.\n\nTry tapping the expand button (⛶) to see the full detail view!",
      sender: { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.025),
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
      content: "## Project Timelines: Gantt Charts\n\n**Gantt Charts** are perfect for discussing project timelines. Instead of:\n\n*\"Phase 1 runs Jan 1-15, Phase 2 is Jan 10-25 (depends on Phase 1), Phase 3...\"*\n\nYou get an interactive timeline showing all dependencies, milestones, and progress. This example has 100+ tasks with **smart pagination** - no UI freezing, no matter how much data.\n\nNotice the smooth interactions even on mobile!",
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
      content: "## Analytics & Metrics: Time Series Charts\n\n**Time Series Charts** bring data conversations to life. Instead of:\n\n*\"Revenue was $45K on Monday, $52K Tuesday, $48K Wednesday...\"*\n\nYou see trends instantly. Perfect for analytics dashboards, IoT data, or financial tracking.\n\nStash components support **WebSocket connections** - charts update in real-time as new data arrives. This is crucial for AI agents that generate streaming data.",
      sender: { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.035),
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
      content: "## Knowledge Graphs: Network Visualization\n\nHere's something really powerful: **Graph Visualization** for complex relationships.\n\nImagine an AI agent explaining how it understands your codebase - files, functions, dependencies, concepts, all interconnected. Or mapping a social network, org chart, or knowledge base.\n\nWith **1000+ nodes**, traditional libraries freeze the UI. Stash handles it smoothly with:\n\n• **Smart edge limiting** - Shows most important connections first\n• **Async layout computation** - No UI blocking, stays at 60fps\n• **Interactive focus mode** - Click any node to explore connections\n• **Full search and filtering** - Find what you need instantly\n\nThis graph shows an AI's mental model of the Stash architecture itself!",
      sender: { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.04),
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
      id: 'demo-6a',
      content: "What about images, videos, and other media? Can Stash handle rich media in conversations?",
      sender: { id: 'user-demo', name: 'You', avatar: '👤' },
      timestamp: addHours(new Date(), 0.0425),
      status: 'delivered',
      isOwn: true,
    },
    {
      id: 'demo-6b',
      content: "## Rich Media Support\n\nAbsolutely! **Stash handles images, videos, and files beautifully** - crucial for modern collaboration.\n\nInstead of:\n*\"I uploaded the design mockup to Dropbox, check the Q1-Campaign folder, file v3-final-FINAL.png\"*\n\nYou get inline media with:\n• **Image preview and zoom** - High-res images with pinch-to-zoom\n• **Video playback** - Native video player with controls\n• **File attachments** - Documents, PDFs, archives with metadata\n• **Smart layout** - Automatically adapts to image dimensions\n• **Gallery mode** - Swipe through multiple images\n• **Download support** - Save media locally\n\nPerfect for design reviews, campaign assets, documentation, and any visual collaboration. All with the same cross-platform performance guarantees.\n\nCheck out the **🎨 Creative Team** chat to see media-rich conversations in action!",
      sender: { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.0435),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'media',
        data: {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead',
          width: 1200,
          height: 800,
          thumbnail: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400',
          caption: 'Campaign Hero Image - Q1 2024',
          metadata: {
            fileName: 'hero-image-v3-final.jpg',
            fileSize: '2.4 MB',
            uploadedBy: 'Sarah Chen',
            uploadedAt: new Date(),
          },
        },
      },
    },
    {
      id: 'demo-7',
      content: "## Why Stash?\n\nYou've seen the components in action. Here's what makes Stash different from other UI libraries:\n\n✅ **True Cross-Platform** - One codebase, truly native performance on iOS, Android, and Web. No compromises.\n\n✅ **Built for Scale** - Handles 1000+ items smoothly with pagination, virtualization, and smart rendering. Your app stays responsive.\n\n✅ **Rich Media Support** - Images, videos, files with preview, zoom, and gallery modes. Perfect for visual collaboration.\n\n✅ **AI-Native Design** - Components designed for AI-generated content. Perfect for chatbots, assistants, and agentic workflows.\n\n✅ **Real-time Ready** - WebSocket support built-in. Live updates without custom integration work.\n\n✅ **Beautiful by Default** - Polished UI/UX out of the box. Fully customizable to match your brand.\n\n✅ **Developer Friendly** - TypeScript-first API, comprehensive docs, easy integration. Works with Expo.\n\n✅ **Performance Obsessed** - Optimized rendering, async computations, 60fps interactions. No UI freezing, ever.\n\nEvery component you saw can be expanded (⛶) for full-screen detail views with filtering, search, and advanced features!",
      sender: { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.0475),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `# Why Stash?

✅ **True Cross-Platform**
   One codebase, truly native performance on iOS, Android, and Web

✅ **Built for Scale**
   Handles 1000+ items with pagination, virtualization, smart rendering

✅ **Rich Media Support**
   Images, videos, files with preview, zoom, and gallery modes

✅ **AI-Native Design**
   Components designed for AI-generated content and agentic workflows

✅ **Real-time Ready**
   WebSocket support built-in for live updates

✅ **Beautiful by Default**
   Polished UI/UX, fully customizable to match your brand

✅ **Developer Friendly**
   TypeScript-first, comprehensive docs, works with Expo

✅ **Performance Obsessed**
   Optimized rendering, async computations, 60fps interactions`,
          language: 'markdown',
          fileName: 'WHY_STASH.md',
          mode: 'preview',
        },
      },
    },
    {
      id: 'demo-8',
      content: "## Getting Started is Easy\n\nReady to transform your chat interface? Here's all it takes:\n\n**1. Install**\n```bash\nnpm install @stash/react-native\n```\n\n**2. Import**\n```tsx\nimport { TaskList, GanttChart, GraphVisualization } from '@stash/react-native';\n```\n\n**3. Use**\n```tsx\n<TaskList tasks={myTasks} mode=\"full\" />\n```\n\nThat's it! You get a production-ready, performant component that works across iOS, Android, and Web.\n\n**Next Steps:**\n• Explore the **🎨 Creative Team** chat for media-rich collaboration examples\n• Check out the **📄 Pagination Demo** chat to see 1,200 messages handled smoothly\n• Try the **Q1 Website Redesign** chat for real-world interactive components\n• Visit the **📊 UI tab** to explore individual components in depth\n\nWelcome to the future of chat interfaces! 🚀",
      sender: { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.05),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `# Getting Started with Stash

## Installation

\`\`\`bash
npm install @stash/react-native
# or
yarn add @stash/react-native
\`\`\`

## Basic Usage

\`\`\`tsx
import { TaskList, GanttChart, GraphVisualization } from '@stash/react-native';

// Use any component
function MyChat() {
  return (
    <TaskList
      tasks={myTasks}
      mode="full"
      onTaskClick={handleTaskClick}
    />
  );
}
\`\`\`

## Key Features

✅ Works on iOS, Android, and Web
✅ TypeScript support out of the box
✅ Comprehensive component library
✅ Production-ready performance
✅ Easy customization

## Next Steps

📚 Read the docs
🎨 Explore components
🚀 Build amazing chat interfaces`,
          language: 'markdown',
          fileName: 'GETTING_STARTED.md',
          mode: 'preview',
        },
      },
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

// Core demo chats showcasing Stash capabilities
const ALL_MOCK_CHATS: ChatPreview[] = [
  // Combined overview - what is Stash and why it exists
  {
    id: 'chat-overview',
    title: '✨ What is Stash?',
    type: 'ai',
    participants: [
      { id: 'user-overview', name: 'You', avatar: '👤' },
      { id: 'ai-overview', name: 'Stash AI', avatar: '🤖' },
    ],
    lastMessage: {
      content: 'Getting Started is Easy: npm install @stash/react-native...',
      timestamp: new Date(),
      senderId: 'ai-overview',
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
  },
  // Media collaboration demo
  {
    id: 'chat-media',
    title: '🎨 Creative Team - Campaign Assets',
    type: 'group',
    participants: [
      { id: 'user-sarah', name: 'Sarah Chen', avatar: '👩‍🎨' },
      { id: 'user-mike', name: 'Mike Rodriguez', avatar: '🧑‍💼' },
      { id: 'user-alex', name: 'Alex Kim', avatar: '🎬' },
      { id: 'user-jamie', name: 'Jamie Foster', avatar: '🎙️' },
      { id: 'user-you', name: 'You', avatar: '👤' },
    ],
    lastMessage: {
      content: 'Thanks everyone! Let\'s sync tomorrow morning to finalize the timeline.',
      timestamp: addMinutes(new Date(), -1),
      senderId: 'user-sarah',
      senderName: 'Sarah Chen',
    },
    unreadCount: 0,
    updatedAt: new Date(),
    createdAt: addMinutes(new Date(), -45),
    isPinned: true,
    isMuted: false,
    isArchived: false,
  },
  // Pagination demo - 1,200 messages
  {
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
  },
  // Interactive components demo
  {
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
    updatedAt: new Date(),
    createdAt: new Date(),
    isMuted: false,
    isArchived: false,
  },
];

export default function ChatHistoryExample() {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [allChats] = useState(ALL_MOCK_CHATS);
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  // Memoize initial messages to avoid regenerating large datasets
  const overviewMessages = useMemo(() => getStashOverviewMessages(), []);
  const allPaginationMessages = useMemo(() => getLargeMessageHistory(), []); // Store all 1200 messages
  const initialMessages = useMemo(() => getAIIntegratedMessages(), []);

  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>({
    'chat-overview': overviewMessages,
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
    // Enable presentation mode for overview chat
    setIsPresentationMode(chatId === 'chat-overview');
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
        currentChatId === 'chat-media' ? (
          // Use MediaChatExample for media collaboration demo
          <MediaChatExample />
        ) : currentChatId === 'chat-pagination' ? (
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
