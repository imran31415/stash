import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ChatLayout, Chat, ChatWithPagination } from '../../src/components/Chat';
import type { ChatPreview, Message, GraphData, ChatGroup } from '../../src/components/Chat';
import { addDays, addWeeks, addHours, addMinutes, subDays } from 'date-fns';
import {
  generateMockTasks,
  generateMockResources,
  generateMockGanttTasks,
  generateMockTimeSeriesData,
  generateLargeGraph,
} from '../utils/mockDataGenerator';
import MediaChatExample from './MediaChatExample';
import LiveStreamingChatExample from './LiveStreamingChatExample';
import { getWebSocketTutorialMessages } from './WebSocketTutorialExample';
import { getLiveStreamingGraphTutorialMessages } from './LiveStreamingGraphTutorial';

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
          media: {
            id: 'demo-hero-image',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead',
            thumbnailUrl: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400',
            title: 'Campaign Hero Image - Q1 2024',
            caption: 'Campaign Hero Image - Q1 2024',
            metadata: {
              fileName: 'hero-image-v3-final.jpg',
              fileSize: 2400000,
              width: 1200,
              height: 800,
            },
          },
          mode: 'mini',
          showCaption: true,
        },
      },
    },
    {
      id: 'demo-6c',
      content: "What about structured data? Like customer lists, sales reports, or analytics tables?",
      sender: { id: 'user-demo', name: 'You', avatar: '👤' },
      timestamp: addHours(new Date(), 0.045),
      status: 'delivered',
      isOwn: true,
    },
    {
      id: 'demo-6d',
      content: "## Data Tables: Power Meets Simplicity\n\nExcellent question! **Data Tables** are perfect for structured data that needs filtering, sorting, and analysis.\n\nInstead of:\n*\"Customer #1: John Smith, $45,230 revenue, 12 orders... Customer #2: Sarah Lee, $32,180 revenue, 8 orders...\"*\n\nYou get a **fully interactive table** with:\n• **Smart Sorting** - Click any column header to sort ascending/descending\n• **Powerful Search** - Filter across all columns instantly\n• **Pagination** - Handle thousands of rows smoothly (configurable page sizes)\n• **Row Selection** - Multi-select with callbacks for bulk actions\n• **Custom Formatters** - Auto-format currency, dates, numbers, percentages\n• **Responsive Design** - Horizontal scroll for wide tables, adapts to mobile\n\nPerfect for sales reports, customer data, analytics dashboards, inventory management, and any tabular data.\n\nTry the expand button (👁️) to see the full-featured detail view with advanced filtering!",
      sender: { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.046),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'data-table',
        data: {
          columns: [
            { id: 'name', header: 'Customer Name', accessor: 'name', type: 'text', sortable: true, width: 180, priority: 1 },
            { id: 'email', header: 'Email', accessor: 'email', type: 'text', sortable: true, width: 220, priority: 3 },
            { id: 'revenue', header: 'Total Revenue', accessor: 'revenue', type: 'currency', sortable: true, align: 'right', width: 140, priority: 1 },
            { id: 'orders', header: 'Orders', accessor: 'orders', type: 'number', sortable: true, align: 'center', width: 100, priority: 2 },
            { id: 'lastOrder', header: 'Last Order', accessor: 'lastOrder', type: 'date', sortable: true, width: 140, priority: 3 },
            { id: 'status', header: 'Status', accessor: 'status', type: 'text', sortable: true, align: 'center', width: 120, priority: 2 },
          ],
          data: [
            { id: 1, name: 'John Smith', email: 'john.smith@example.com', revenue: 45230, orders: 12, lastOrder: subDays(new Date(), 3), status: 'Active' },
            { id: 2, name: 'Sarah Lee', email: 'sarah.lee@example.com', revenue: 32180, orders: 8, lastOrder: subDays(new Date(), 7), status: 'Active' },
            { id: 3, name: 'Mike Johnson', email: 'mike.j@example.com', revenue: 28940, orders: 15, lastOrder: subDays(new Date(), 1), status: 'Active' },
            { id: 4, name: 'Emily Chen', email: 'emily.chen@example.com', revenue: 56720, orders: 22, lastOrder: subDays(new Date(), 2), status: 'VIP' },
            { id: 5, name: 'David Park', email: 'david.park@example.com', revenue: 19650, orders: 5, lastOrder: subDays(new Date(), 45), status: 'Inactive' },
            { id: 6, name: 'Lisa Anderson', email: 'lisa.a@example.com', revenue: 41200, orders: 18, lastOrder: subDays(new Date(), 5), status: 'Active' },
            { id: 7, name: 'Tom Wilson', email: 'tom.wilson@example.com', revenue: 67890, orders: 31, lastOrder: subDays(new Date(), 1), status: 'VIP' },
            { id: 8, name: 'Anna Rodriguez', email: 'anna.r@example.com', revenue: 23450, orders: 9, lastOrder: subDays(new Date(), 12), status: 'Active' },
          ],
          title: 'Top Customers - Q1 2024',
          subtitle: 'Click 👁️ to expand with search, filters, and advanced sorting',
          mode: 'preview',
          sortable: true,
          filterable: true,
          paginated: true,
          defaultPageSize: 5,
          striped: true,
          bordered: true,
        },
      },
    },
    {
      id: 'demo-6e',
      content: "What about heat maps? Can I visualize patterns and density in data?",
      sender: { id: 'user-demo', name: 'You', avatar: '👤' },
      timestamp: addHours(new Date(), 0.047),
      status: 'delivered',
      isOwn: true,
    },
    {
      id: 'demo-6f',
      content: "## Heat Maps: Visualize Patterns at Scale\n\nAbsolutely! **Heat Maps** are perfect for showing patterns, density, and intensity across large datasets.\n\nInstead of:\n*\"Server load was 45% at 9am, 67% at 10am, 89% at 11am across all regions...\"*\n\nYou get a **visual heat map** that instantly reveals:\n• **Temporal Patterns** - When are peaks and valleys?\n• **Geographic Distribution** - Where is activity concentrated?\n• **Resource Utilization** - Which servers/regions are hot spots?\n• **Anomaly Detection** - Spot unusual patterns instantly\n\nPerfect for:\n• Server/infrastructure monitoring\n• Sales performance by region/time\n• User activity patterns\n• A/B test results visualization\n• System health dashboards\n\nThis example shows server performance across regions over 24 hours. Notice how you can instantly spot the traffic spike during business hours and identify which regions need scaling!",
      sender: { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.0475),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'heatmap',
        data: {
          xLabels: ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'],
          yLabels: ['US-East', 'US-West', 'EU-Central', 'Asia-Pacific', 'South America', 'Middle East'],
          values: [
            [12, 8, 5, 15, 45, 78, 92, 45],
            [15, 10, 8, 20, 52, 85, 88, 50],
            [35, 42, 55, 78, 85, 72, 45, 38],
            [82, 75, 65, 55, 45, 58, 72, 85],
            [8, 6, 10, 25, 48, 62, 55, 22],
            [18, 15, 22, 35, 52, 68, 75, 42],
          ],
          title: 'Server Load Heat Map - Last 24 Hours',
          subtitle: 'CPU utilization % by region and time • Tap 👁️ to expand',
          mode: 'mini',
          colorScheme: 'temperature',
          showValues: false,
          minValue: 0,
          maxValue: 100,
        },
      },
    },
    {
      id: 'demo-6g',
      content: "How does Stash handle live streaming data? Like real-time stock prices or IoT sensor data?",
      sender: { id: 'user-demo', name: 'You', avatar: '👤' },
      timestamp: addHours(new Date(), 0.0485),
      status: 'delivered',
      isOwn: true,
    },
    {
      id: 'demo-6h',
      content: "## Live Data Streaming: Real-Time Updates Made Easy\n\nExcellent question! **Live data streaming** is a first-class feature in Stash, not an afterthought.\n\n**The Challenge:**\nTraditional chat components freeze or stutter when receiving rapid updates. You've probably seen dashboards that:\n• Drop frames during updates\n• Queue updates and lag behind real-time\n• Re-render the entire UI on every data point\n• Struggle with high-frequency data (>10 updates/sec)\n\n**Stash's Solution:**\n✅ **WebSocket-Native** - Built-in support, no custom integration needed\n✅ **Smart Batching** - Bundles rapid updates to prevent UI thrashing\n✅ **Incremental Rendering** - Only updates changed elements\n✅ **Adaptive Throttling** - Auto-adjusts update frequency to maintain 60fps\n✅ **Buffer Management** - Handles bursts without memory bloat\n\n**Real-World Use Cases:**\n• Stock tickers and crypto prices\n• IoT sensor dashboards (temperature, pressure, etc.)\n• Live sports scores and stats\n• Server metrics and alerts\n• Real-time analytics\n• Live auction bidding\n\nCheck out the **📈 Live** tab to see a live-streaming sales dashboard in action - updating multiple charts simultaneously with zero lag!",
      sender: { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.049),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'time-series-chart',
        data: {
          series: [
            {
              id: 'live-demo',
              name: 'Live Stream Demo',
              data: Array.from({ length: 20 }, (_, i) => ({
                timestamp: addMinutes(new Date(), -20 + i),
                value: Math.random() * 100 + 50,
              })),
              color: '#3B82F6',
              strokeWidth: 2,
            },
          ],
          title: 'Live Streaming Demo',
          subtitle: 'Simulated real-time data • Updates every second',
          mode: 'mini',
          showLegend: false,
          enableZoom: false,
          yAxisLabel: 'Value',
          streaming: true,
        },
      },
    },
    {
      id: 'demo-6i',
      content: "What about workflow visualization? Like CI/CD pipelines or data processing flows?",
      sender: { id: 'user-demo', name: 'You', avatar: '👤' },
      timestamp: addHours(new Date(), 0.0495),
      status: 'delivered',
      isOwn: true,
    },
    {
      id: 'demo-6j',
      content: "## DAG Graphs: Workflow & Pipeline Visualization\n\nPerfect timing! **DAG (Directed Acyclic Graph)** visualization is crucial for understanding workflows, dependencies, and data flows.\n\nInstead of describing:\n*\"Build depends on Test, which depends on Lint and TypeCheck. Deploy depends on Build succeeding...\"*\n\nYou get an **interactive pipeline visualization** showing:\n• **Execution Flow** - See the exact order of operations\n• **Dependencies** - Understand what depends on what\n• **Status at a Glance** - Success, failure, running, pending\n• **Critical Path** - Identify bottlenecks instantly\n• **Parallel Execution** - See what runs concurrently\n\n**Perfect For:**\n• CI/CD pipeline visualization (GitHub Actions, Jenkins, etc.)\n• Data processing workflows (Airflow, ETL pipelines)\n• ML model training pipelines\n• Microservice dependencies\n• Task execution plans\n• State machines and workflow engines\n\nThis example shows a typical deployment pipeline with parallel testing, build stages, and conditional deployment. Notice how you can instantly see:\n• Which stages can run in parallel\n• Where the pipeline is currently executing\n• Which stage failed and blocked downstream tasks\n\nClick any node to see detailed logs, timing, and configuration!",
      sender: { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.0505),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'graph-visualization',
        data: {
          data: {
            nodes: [
              { id: 'start', labels: ['Start'], properties: { name: 'Trigger', type: 'start' }, color: '#10B981', size: 16 },
              { id: 'checkout', labels: ['Stage'], properties: { name: 'Checkout Code', status: 'success' }, color: '#10B981' },
              { id: 'install', labels: ['Stage'], properties: { name: 'Install Deps', status: 'success' }, color: '#10B981' },
              { id: 'lint', labels: ['Stage'], properties: { name: 'Lint', status: 'success' }, color: '#10B981' },
              { id: 'typecheck', labels: ['Stage'], properties: { name: 'TypeCheck', status: 'success' }, color: '#10B981' },
              { id: 'test-unit', labels: ['Stage'], properties: { name: 'Unit Tests', status: 'success' }, color: '#10B981' },
              { id: 'test-e2e', labels: ['Stage'], properties: { name: 'E2E Tests', status: 'failed' }, color: '#EF4444', size: 18 },
              { id: 'build', labels: ['Stage'], properties: { name: 'Build', status: 'success' }, color: '#10B981' },
              { id: 'security', labels: ['Stage'], properties: { name: 'Security Scan', status: 'running' }, color: '#F59E0B', size: 18 },
              { id: 'docker', labels: ['Stage'], properties: { name: 'Build Image', status: 'pending' }, color: '#94A3B8' },
              { id: 'deploy-staging', labels: ['Stage'], properties: { name: 'Deploy Staging', status: 'blocked' }, color: '#94A3B8' },
              { id: 'deploy-prod', labels: ['Stage'], properties: { name: 'Deploy Prod', status: 'blocked' }, color: '#94A3B8' },
            ],
            edges: [
              { id: 'e1', source: 'start', target: 'checkout', type: 'TRIGGERS', label: 'git push' },
              { id: 'e2', source: 'checkout', target: 'install', type: 'THEN', label: '' },
              { id: 'e3', source: 'install', target: 'lint', type: 'PARALLEL', label: '' },
              { id: 'e4', source: 'install', target: 'typecheck', type: 'PARALLEL', label: '' },
              { id: 'e5', source: 'install', target: 'test-unit', type: 'PARALLEL', label: '' },
              { id: 'e6', source: 'install', target: 'test-e2e', type: 'PARALLEL', label: '' },
              { id: 'e7', source: 'lint', target: 'build', type: 'REQUIRED', label: 'must pass' },
              { id: 'e8', source: 'typecheck', target: 'build', type: 'REQUIRED', label: 'must pass' },
              { id: 'e9', source: 'test-unit', target: 'build', type: 'REQUIRED', label: 'must pass' },
              { id: 'e10', source: 'test-e2e', target: 'build', type: 'REQUIRED', label: 'must pass' },
              { id: 'e11', source: 'build', target: 'security', type: 'THEN', label: '' },
              { id: 'e12', source: 'build', target: 'docker', type: 'THEN', label: '' },
              { id: 'e13', source: 'security', target: 'deploy-staging', type: 'REQUIRED', label: 'must pass' },
              { id: 'e14', source: 'docker', target: 'deploy-staging', type: 'REQUIRED', label: 'image ready' },
              { id: 'e15', source: 'deploy-staging', target: 'deploy-prod', type: 'APPROVAL', label: 'manual approval' },
            ],
            metadata: {
              name: 'CI/CD Pipeline - Production Deployment',
              description: 'Automated deployment pipeline with parallel testing and security checks',
            },
          },
          title: 'CI/CD Pipeline Visualization',
          subtitle: 'Deployment workflow • E2E tests failed, blocking deployment',
          mode: 'mini',
          layout: 'hierarchical',
          direction: 'LR',
          showLabels: true,
          showEdgeLabels: true,
          enablePhysics: false,
        },
      },
    },
    {
      id: 'demo-6k',
      content: "What about performance profiling? Can I visualize where my code is spending time?",
      sender: { id: 'user-demo', name: 'You', avatar: '👤' },
      timestamp: addHours(new Date(), 0.051),
      status: 'delivered',
      isOwn: true,
    },
    {
      id: 'demo-6l',
      content: "## Flame Graphs: Performance Profiling Made Visual\n\nAbsolutely! **Flame Graphs** are the gold standard for visualizing performance profiling data, and Stash brings them to chat interfaces.\n\nInstead of scrolling through text-based profiler output:\n```\nmain(): 10000 samples (100%)\n  handleRequest(): 6500 samples (65%)\n    authenticateUser(): 1200 samples (12%)\n      jwt.verify(): 600 samples (6%)\n```\n\nYou get an **interactive flame graph** that:\n• **Shows Call Hierarchy** - See the entire call stack at a glance\n• **Reveals Hot Paths** - Instantly identify performance bottlenecks\n• **Interactive Zoom** - Click any function to focus and explore\n• **Smart Search** - Find specific functions across the entire profile\n• **Time Distribution** - Width shows time spent, color shows depth\n\n**Perfect For:**\n• CPU profiling (pprof, perf, FlameScope)\n• Memory allocation analysis\n• Performance optimization\n• Production incident investigation\n• Benchmarking and regression testing\n\nThis example shows a real API server profile captured with pprof. Notice how you can instantly see:\n• `handleRequest()` takes 65% of total time\n• Most time is in `processBusinessLogic()` → `fetchRelatedData()`\n• Database queries are the primary bottleneck\n• Authentication overhead is acceptable at 12%\n\n**Pro tip:** Click on any node to see detailed metrics (file, line number, samples, self vs. total time). Use the search to find specific functions!",
      sender: { id: 'ai-demo', name: 'Stash AI', avatar: '🤖' },
      timestamp: addHours(new Date(), 0.052),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'flamegraph',
        data: {
          root: {
            id: 'main',
            name: 'main()',
            value: 10000,
            metadata: {
              file: 'src/main.ts',
              line: 1,
              samples: 10000,
              selfTime: 100,
              totalTime: 10000,
            },
            children: [
              {
                id: 'app-init',
                name: 'initializeApp()',
                value: 2500,
                metadata: { file: 'src/app.ts', line: 45, samples: 2500, selfTime: 200, totalTime: 2500 },
                children: [
                  {
                    id: 'config',
                    name: 'loadConfig()',
                    value: 800,
                    metadata: { file: 'src/config.ts', samples: 800 },
                  },
                  {
                    id: 'db',
                    name: 'connectDatabase()',
                    value: 1200,
                    metadata: { file: 'src/database.ts', samples: 1200 },
                  },
                ],
              },
              {
                id: 'request',
                name: 'handleRequest()',
                value: 6500,
                metadata: { file: 'src/server.ts', line: 156, samples: 6500, selfTime: 400, totalTime: 6500 },
                children: [
                  {
                    id: 'auth',
                    name: 'authenticateUser()',
                    value: 1200,
                    metadata: { file: 'src/auth.ts', samples: 1200 },
                    children: [
                      {
                        id: 'jwt',
                        name: 'jwt.verify()',
                        value: 600,
                        metadata: { samples: 600 },
                      },
                    ],
                  },
                  {
                    id: 'controller',
                    name: 'controller.execute()',
                    value: 3500,
                    metadata: { file: 'src/controllers/api.ts', line: 234, samples: 3500 },
                    children: [
                      {
                        id: 'business',
                        name: 'processBusinessLogic()',
                        value: 2600,
                        metadata: { file: 'src/services/business.ts', samples: 2600 },
                        children: [
                          {
                            id: 'db-queries',
                            name: 'fetchRelatedData()',
                            value: 1800,
                            metadata: { samples: 1800 },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          total: 10000,
          unit: 'samples',
          metadata: {
            type: 'cpu',
            duration: 10000,
            application: 'API Server',
          },
        },
        title: 'API Server CPU Profile',
        subtitle: '10,000 samples • pprof format • Tap 🔍 to explore',
        mode: 'preview',
        colorScheme: 'hot',
        showSearch: true,
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
    id: '7a',
    type: 'text',
    content: 'Can I get a system status dashboard? I want to see server health, API performance, and database metrics all in one view.',
    sender: {
      id: 'user2',
      name: 'John Doe',
      avatar: undefined,
    },
    timestamp: new Date(Date.now() - 90000),
    status: 'read',
    isOwn: false,
  },
  {
    id: '7b',
    type: 'text',
    content: 'Absolutely! Here\'s a comprehensive system status dashboard showing all critical metrics:',
    sender: {
      id: 'ai',
      name: 'AI Assistant',
      avatar: undefined,
    },
    timestamp: new Date(Date.now() - 88000),
    status: 'read',
    isOwn: false,
    interactiveComponent: {
      type: 'dashboard',
      data: {
        config: {
          id: 'system-status',
          title: 'System Status Dashboard',
          subtitle: 'Real-time infrastructure monitoring',
          description: 'Live metrics for servers, APIs, and databases',
          gridSize: '2x2',
          spacing: 12,
          items: [
            {
              id: 'cpu-usage',
              type: 'time-series-chart',
              gridPosition: { row: 0, col: 0 },
              data: {
                series: [
                  {
                    id: 'cpu',
                    name: 'CPU Usage',
                    data: Array.from({ length: 24 }, (_, i) => ({
                      timestamp: addHours(new Date(), -24 + i),
                      value: Math.random() * 40 + 30,
                    })),
                    color: '#3B82F6',
                  },
                ],
                title: 'CPU Usage',
                subtitle: 'Last 24 hours',
                yAxisLabel: 'Usage (%)',
                showLegend: false,
                showGrid: true,
              },
            },
            {
              id: 'memory-usage',
              type: 'time-series-chart',
              gridPosition: { row: 0, col: 1 },
              data: {
                series: [
                  {
                    id: 'memory',
                    name: 'Memory',
                    data: Array.from({ length: 24 }, (_, i) => ({
                      timestamp: addHours(new Date(), -24 + i),
                      value: Math.random() * 20 + 60,
                    })),
                    color: '#10B981',
                  },
                ],
                title: 'Memory Usage',
                subtitle: 'Last 24 hours',
                yAxisLabel: 'Usage (%)',
                showLegend: false,
                showGrid: true,
              },
            },
            {
              id: 'api-response-time',
              type: 'time-series-chart',
              gridPosition: { row: 1, col: 0 },
              data: {
                series: [
                  {
                    id: 'response-time',
                    name: 'Response Time',
                    data: Array.from({ length: 24 }, (_, i) => ({
                      timestamp: addHours(new Date(), -24 + i),
                      value: Math.random() * 100 + 50,
                    })),
                    color: '#F59E0B',
                  },
                ],
                title: 'API Response Time',
                subtitle: 'Average latency',
                yAxisLabel: 'Time (ms)',
                showLegend: false,
                showGrid: true,
              },
            },
            {
              id: 'db-connections',
              type: 'time-series-chart',
              gridPosition: { row: 1, col: 1 },
              data: {
                series: [
                  {
                    id: 'connections',
                    name: 'Active Connections',
                    data: Array.from({ length: 24 }, (_, i) => ({
                      timestamp: addHours(new Date(), -24 + i),
                      value: Math.floor(Math.random() * 200) + 100,
                    })),
                    color: '#8B5CF6',
                  },
                ],
                title: 'Database Connections',
                subtitle: 'Active pool size',
                yAxisLabel: 'Connections',
                showLegend: false,
                showGrid: true,
              },
            },
          ],
        },
        mode: 'mini',
      },
    },
  },
  {
    id: '7c',
    type: 'text',
    content: '✅ All systems operational! CPU and memory are within normal ranges, API response times are healthy at ~100ms average, and database connections are stable.',
    sender: {
      id: 'ai',
      name: 'AI Assistant',
      avatar: undefined,
    },
    timestamp: new Date(Date.now() - 87000),
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

// Thundering Herd Incident - Full End-to-End Example
const getSystemIncidentMessages = (): Message[] => {
  // Start timestamp: 5 minutes ago
  const startTime = new Date(Date.now() - 300000);

  return [
    // 1. Initial Alert
    {
      id: 'incident-001',
      type: 'text',
      content: 'CRITICAL ALERT: Redis cache cluster showing massive spike in connection errors. Database query latency up 2000%. Multiple services reporting timeouts.',
      sender: { id: 'user-ops', name: 'DevOps Team', avatar: '👨‍💻' },
      timestamp: startTime,
      status: 'delivered',
      isOwn: false,
    },

    // 2. Dashboard - Critical System Metrics (2x2 grid)
    {
      id: 'incident-002',
      type: 'text',
      content: 'System health dashboard shows critical degradation across all metrics:',
      sender: { id: 'ai-monitor', name: 'System Monitor AI', avatar: '🤖' },
      timestamp: addMinutes(startTime, 0.5),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'dashboard',
        data: {
          config: {
            id: 'incident-critical-dashboard',
            title: '🚨 Critical System Metrics Dashboard',
            subtitle: 'Real-time monitoring - ALL SYSTEMS DEGRADED',
            description: 'Live monitoring of critical infrastructure metrics during incident',
            gridSize: '2x3',
            spacing: 8,
            items: [
              {
                id: 'system-metrics',
                type: 'time-series-chart',
                title: 'CPU & Memory',
                gridPosition: { row: 0, col: 0, rowSpan: 1, colSpan: 1 },
                data: {
                  series: [
                    {
                      id: 'cpu',
                      name: 'CPU Usage (%)',
                      data: [
                        ...Array.from({ length: 10 }, (_, i) => ({
                          timestamp: addMinutes(startTime, -10 + i),
                          value: 45 + Math.random() * 10,
                        })),
                        { timestamp: addMinutes(startTime, 0), value: 52 },
                        { timestamp: addMinutes(startTime, 0.5), value: 98 },
                      ],
                      color: '#EF4444',
                      lineWidth: 2,
                    },
                    {
                      id: 'memory',
                      name: 'Memory Usage (%)',
                      data: [
                        ...Array.from({ length: 10 }, (_, i) => ({
                          timestamp: addMinutes(startTime, -10 + i),
                          value: 55 + Math.random() * 8,
                        })),
                        { timestamp: addMinutes(startTime, 0), value: 60 },
                        { timestamp: addMinutes(startTime, 0.5), value: 95 },
                      ],
                      color: '#F59E0B',
                      lineWidth: 2,
                    },
                  ],
                  showLegend: true,
                  showGrid: false,
                  height: 160,
                },
              },
              {
                id: 'api-metrics',
                type: 'time-series-chart',
                title: 'API Response Time',
                gridPosition: { row: 0, col: 1, rowSpan: 1, colSpan: 1 },
                data: {
                  series: [
                    {
                      id: 'api-response',
                      name: 'Response Time (ms)',
                      data: [
                        ...Array.from({ length: 10 }, (_, i) => ({
                          timestamp: addMinutes(startTime, -10 + i),
                          value: 120 + Math.random() * 30,
                        })),
                        { timestamp: addMinutes(startTime, 0), value: 150 },
                        { timestamp: addMinutes(startTime, 0.5), value: 3500 },
                      ],
                      color: '#8B5CF6',
                      lineWidth: 2,
                    },
                  ],
                  showLegend: true,
                  showGrid: false,
                  height: 160,
                },
              },
              {
                id: 'db-connections',
                type: 'time-series-chart',
                title: 'Database Connections',
                gridPosition: { row: 0, col: 2, rowSpan: 1, colSpan: 1 },
                data: {
                  series: [
                    {
                      id: 'db-pool',
                      name: 'Active Connections',
                      data: [
                        ...Array.from({ length: 10 }, (_, i) => ({
                          timestamp: addMinutes(startTime, -10 + i),
                          value: 150 + Math.random() * 50,
                        })),
                        { timestamp: addMinutes(startTime, 0), value: 200 },
                        { timestamp: addMinutes(startTime, 0.5), value: 500 },
                      ],
                      color: '#EF4444',
                      lineWidth: 2,
                    },
                  ],
                  showLegend: true,
                  showGrid: false,
                  height: 160,
                  maxY: 500,
                  annotations: [{ value: 500, label: 'Max Pool Size', color: '#DC2626' }],
                },
              },
              {
                id: 'cache-hit-rate',
                type: 'time-series-chart',
                title: 'Cache Hit Rate',
                gridPosition: { row: 1, col: 0, rowSpan: 1, colSpan: 1 },
                data: {
                  series: [
                    {
                      id: 'cache-hits',
                      name: 'Hit Rate (%)',
                      data: [
                        ...Array.from({ length: 10 }, (_, i) => ({
                          timestamp: addMinutes(startTime, -10 + i),
                          value: 95 + Math.random() * 3,
                        })),
                        { timestamp: addMinutes(startTime, 0), value: 0 },
                        { timestamp: addMinutes(startTime, 0.5), value: 0 },
                      ],
                      color: '#10B981',
                      lineWidth: 2,
                    },
                  ],
                  showLegend: true,
                  showGrid: false,
                  height: 160,
                  maxY: 100,
                },
              },
              {
                id: 'error-rate',
                type: 'time-series-chart',
                title: 'Error Rate',
                gridPosition: { row: 1, col: 1, rowSpan: 1, colSpan: 1 },
                data: {
                  series: [
                    {
                      id: 'errors',
                      name: 'Error Rate (%)',
                      data: [
                        ...Array.from({ length: 10 }, (_, i) => ({
                          timestamp: addMinutes(startTime, -10 + i),
                          value: Math.random() * 0.5,
                        })),
                        { timestamp: addMinutes(startTime, 0), value: 5 },
                        { timestamp: addMinutes(startTime, 0.5), value: 42 },
                      ],
                      color: '#EF4444',
                      lineWidth: 2,
                    },
                  ],
                  showLegend: true,
                  showGrid: false,
                  height: 160,
                },
              },
              {
                id: 'health-status',
                type: 'time-series-chart',
                title: 'Health Status',
                gridPosition: { row: 1, col: 2, rowSpan: 1, colSpan: 1 },
                data: {
                  series: [
                    {
                      id: 'health-check',
                      name: 'System Health',
                      data: [
                        ...Array.from({ length: 10 }, (_, i) => ({
                          timestamp: addMinutes(startTime, -10 + i),
                          value: 1,
                          label: 'HEALTHY',
                        })),
                        { timestamp: addMinutes(startTime, 0), value: 0.5, label: 'DEGRADED' },
                        { timestamp: addMinutes(startTime, 0.5), value: 0, label: 'CRITICAL' },
                        { timestamp: addMinutes(startTime, 0.75), value: 0, label: 'CRITICAL' },
                      ],
                      color: '#EF4444',
                      lineWidth: 3,
                      showPoints: true,
                      pointRadius: 6,
                    },
                  ],
                  showLegend: false,
                  showGrid: false,
                  minY: 0,
                  maxY: 1,
                  height: 160,
                  valueFormatter: (value: number) => {
                    if (value >= 0.8) return 'HEALTHY';
                    if (value >= 0.4) return 'DEGRADED';
                    return 'CRITICAL';
                  },
                },
              },
            ],
          },
          mode: 'preview',
        },
      },
    },

    // 3. Root Cause Analysis
    {
      id: 'incident-003',
      type: 'text',
      content: 'What happened? I need root cause analysis NOW.',
      sender: { id: 'user-ops', name: 'DevOps Team', avatar: '👨‍💻' },
      timestamp: addMinutes(startTime, 1),
      status: 'delivered',
      isOwn: false,
    },

    {
      id: 'incident-004',
      type: 'text',
      content: 'ROOT CAUSE IDENTIFIED: Classic Thundering Herd Problem\n\n**Timeline:**\n- T-0: Redis cache TTL expired for product catalog key at 14:23:47 UTC\n- T+0.1s: All 10,000 application servers detected cache miss simultaneously\n- T+0.2s: 10,000 concurrent database queries initiated for same data\n- T+0.5s: Database connection pool exhausted (max 500 connections)\n- T+1s: Database CPU spiked to 98%, query latency increased 20x\n- T+2s: Cascade failure - API timeouts, health checks failing\n\n**The Problem:**\nWithout rate limiting or cache stampede protection, all servers rushed to repopulate the cache at once. The database couldn\'t handle 10,000 simultaneous queries for the same data.\n\n**Impact:**\n- Database: 10,000 redundant queries\n- Connection pool: 100% exhausted\n- Response time: 150ms → 3500ms (2,233% increase)\n- Error rate: 0% → 42%\n- Affected users: ~150,000 active sessions',
      sender: { id: 'ai-monitor', name: 'System Monitor AI', avatar: '🤖' },
      timestamp: addMinutes(startTime, 1.5),
      status: 'delivered',
      isOwn: false,
    },

    // 4. Task List - Incident Response
    {
      id: 'incident-005',
      type: 'text',
      content: 'Generating incident response action plan...',
      sender: { id: 'ai-monitor', name: 'System Monitor AI', avatar: '🤖' },
      timestamp: addMinutes(startTime, 2),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'task-list',
        data: {
          title: 'Incident Response Tasks',
          subtitle: 'Priority-ordered remediation steps',
          tasks: [
            {
              id: 'task-1',
              title: 'IMMEDIATE: Restart cache cluster',
              description: 'Clear corrupted cache state and restore cache availability',
              startDate: addMinutes(startTime, 2),
              endDate: addMinutes(startTime, 3),
              progress: 100,
              status: 'completed',
              priority: 'critical',
              assignee: 'DevOps Team',
            },
            {
              id: 'task-2',
              title: 'IMMEDIATE: Enable database read replicas',
              description: 'Distribute load across read replicas to reduce primary DB pressure',
              startDate: addMinutes(startTime, 2.5),
              endDate: addMinutes(startTime, 3.5),
              progress: 100,
              status: 'completed',
              priority: 'critical',
              assignee: 'DevOps Team',
            },
            {
              id: 'task-3',
              title: 'SHORT TERM: Deploy cache stampede protection',
              description: 'Implement probabilistic early expiration and request coalescing',
              startDate: addMinutes(startTime, 3),
              endDate: addMinutes(startTime, 10),
              progress: 60,
              status: 'in-progress',
              priority: 'high',
              assignee: 'Senior Engineer',
            },
            {
              id: 'task-4',
              title: 'SHORT TERM: Add rate limiting to cache refresh',
              description: 'Limit concurrent cache refresh operations per key',
              startDate: addMinutes(startTime, 5),
              endDate: addMinutes(startTime, 12),
              progress: 30,
              status: 'in-progress',
              priority: 'high',
              assignee: 'Senior Engineer',
            },
            {
              id: 'task-5',
              title: 'MONITORING: Verify system recovery',
              description: 'Monitor all metrics return to healthy baselines',
              startDate: addMinutes(startTime, 10),
              endDate: addMinutes(startTime, 15),
              progress: 0,
              status: 'pending',
              priority: 'high',
              assignee: 'DevOps Team',
            },
            {
              id: 'task-6',
              title: 'POST-INCIDENT: Write postmortem',
              description: 'Document incident timeline, root cause, and prevention measures',
              startDate: addMinutes(startTime, 20),
              endDate: addMinutes(startTime, 60),
              progress: 0,
              status: 'pending',
              priority: 'medium',
              assignee: 'Senior Engineer',
            },
          ],
          mode: 'mini',
          showProgress: true,
        },
      },
    },

    // 5. Code Block - Buggy Implementation
    {
      id: 'incident-006',
      type: 'text',
      content: 'Show me the problematic code.',
      sender: { id: 'user-engineer', name: 'Senior Engineer', avatar: '👨‍💻' },
      timestamp: addMinutes(startTime, 3),
      status: 'delivered',
      isOwn: false,
    },

    {
      id: 'incident-007',
      type: 'text',
      content: 'Here is the current implementation causing the thundering herd:',
      sender: { id: 'ai-monitor', name: 'System Monitor AI', avatar: '🤖' },
      timestamp: addMinutes(startTime, 3.2),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `// BUGGY CODE - No stampede protection
class ProductCatalogService {
  private cache: RedisClient;
  private db: DatabaseClient;
  private CACHE_TTL = 3600; // 1 hour

  async getProductCatalog(): Promise<Product[]> {
    const cacheKey = 'product_catalog';

    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // PROBLEM: When cache expires, ALL 10,000 servers
    // hit this code path simultaneously
    console.log('Cache miss - fetching from database');

    // PROBLEM: No rate limiting or coordination
    // All servers query the DB at the same time
    const products = await this.db.query(
      'SELECT * FROM products WHERE active = true'
    );

    // PROBLEM: All servers try to set cache simultaneously
    await this.cache.set(
      cacheKey,
      JSON.stringify(products),
      'EX',
      this.CACHE_TTL
    );

    return products;
  }
}

// What happens when cache expires:
// 1. Request comes in to server #1
// 2. Cache miss → query database
// 3. Request comes in to server #2 (0.001s later)
// 4. Cache STILL empty → query database
// 5. Repeat 9,998 more times
// 6. Database receives 10,000 identical queries
// 7. Connection pool exhausted
// 8. System-wide failure`,
          language: 'typescript',
          fileName: 'ProductCatalogService.ts (BEFORE)',
          mode: 'preview',
          showLineNumbers: true,
        },
      },
    },

    // 6. Code Block - Fixed Implementation
    {
      id: 'incident-008',
      type: 'text',
      content: 'Here is the fixed implementation with stampede protection and rate limiting:',
      sender: { id: 'ai-monitor', name: 'System Monitor AI', avatar: '🤖' },
      timestamp: addMinutes(startTime, 3.5),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `// FIXED CODE - Multiple layers of protection
import { RateLimiter } from 'rate-limiter-flexible';
import { promisify } from 'util';

class ProductCatalogService {
  private cache: RedisClient;
  private db: DatabaseClient;
  private CACHE_TTL = 3600; // 1 hour
  private EARLY_EXPIRATION_WINDOW = 60; // 60 seconds before expiration

  // In-flight request tracking (prevents duplicate DB calls)
  private inflightRequests = new Map<string, Promise<any>>();

  // Rate limiter: max 10 cache refresh operations per minute
  private rateLimiter = new RateLimiter({
    points: 10,
    duration: 60,
    keyPrefix: 'cache_refresh',
  });

  async getProductCatalog(): Promise<Product[]> {
    const cacheKey = 'product_catalog';

    // Try cache first
    const cachedData = await this.cache.get(cacheKey);
    if (cachedData) {
      const { data, cachedAt } = JSON.parse(cachedData);

      // SOLUTION 1: Probabilistic Early Expiration
      // Refresh cache probabilistically before it expires
      // to prevent all servers from missing cache simultaneously
      const age = Date.now() - cachedAt;
      const timeUntilExpiry = this.CACHE_TTL * 1000 - age;

      if (timeUntilExpiry < this.EARLY_EXPIRATION_WINDOW * 1000) {
        // Probabilistic refresh: higher probability as expiry approaches
        const refreshProbability = 1 - (timeUntilExpiry / (this.EARLY_EXPIRATION_WINDOW * 1000));

        if (Math.random() < refreshProbability) {
          // Refresh in background, return stale data immediately
          this.refreshCacheInBackground(cacheKey).catch(err => {
            console.error('Background cache refresh failed:', err);
          });
        }
      }

      return data;
    }

    // Cache miss - need to fetch from database
    return this.fetchAndCacheProducts(cacheKey);
  }

  private async fetchAndCacheProducts(cacheKey: string): Promise<Product[]> {
    // SOLUTION 2: Request Coalescing
    // If another request is already fetching, wait for it instead
    // of making a duplicate database query
    if (this.inflightRequests.has(cacheKey)) {
      console.log('Coalescing request - waiting for in-flight fetch');
      return this.inflightRequests.get(cacheKey)!;
    }

    // SOLUTION 3: Rate Limiting
    // Ensure we don't overwhelm the database even if cache fails
    try {
      await this.rateLimiter.consume(cacheKey);
    } catch (rateLimitError) {
      // Rate limit exceeded - return stale data or error gracefully
      console.warn('Cache refresh rate limit exceeded');
      throw new Error('Service temporarily unavailable - rate limit exceeded');
    }

    // Create the fetch promise and track it
    const fetchPromise = this.doFetchProducts(cacheKey);
    this.inflightRequests.set(cacheKey, fetchPromise);

    try {
      const products = await fetchPromise;
      return products;
    } finally {
      // Clean up in-flight tracking
      this.inflightRequests.delete(cacheKey);
    }
  }

  private async doFetchProducts(cacheKey: string): Promise<Product[]> {
    console.log('Fetching from database (cache miss)');

    const products = await this.db.query(
      'SELECT * FROM products WHERE active = true'
    );

    // Store with timestamp for early expiration logic
    const cacheValue = {
      data: products,
      cachedAt: Date.now(),
    };

    // SOLUTION 4: Add jitter to TTL
    // Prevent all cache entries from expiring simultaneously
    const jitter = Math.floor(Math.random() * 60); // 0-60 seconds
    const ttlWithJitter = this.CACHE_TTL + jitter;

    await this.cache.set(
      cacheKey,
      JSON.stringify(cacheValue),
      'EX',
      ttlWithJitter
    );

    return products;
  }

  private async refreshCacheInBackground(cacheKey: string): Promise<void> {
    // Non-blocking background refresh
    return this.fetchAndCacheProducts(cacheKey).then(() => {
      console.log('Background cache refresh completed');
    });
  }
}

// How the fixed version prevents thundering herd:
// 1. Probabilistic early expiration: Cache refreshes before expiring
// 2. Request coalescing: Only one DB query per cache key
// 3. Rate limiting: Maximum 10 refreshes per minute
// 4. TTL jitter: Cache entries expire at different times
//
// Result: 10,000 requests → 1 database query`,
          language: 'typescript',
          fileName: 'ProductCatalogService.ts (AFTER - FIXED)',
          mode: 'preview',
          showLineNumbers: true,
        },
      },
    },

    // 7. Gantt Chart - Rollout Timeline
    {
      id: 'incident-009',
      type: 'text',
      content: 'I need a deployment timeline for rolling out this fix.',
      sender: { id: 'user-ops', name: 'DevOps Team', avatar: '👨‍💻' },
      timestamp: addMinutes(startTime, 5),
      status: 'delivered',
      isOwn: false,
    },

    {
      id: 'incident-010',
      type: 'text',
      content: 'Here is the phased rollout plan to minimize risk:',
      sender: { id: 'ai-monitor', name: 'System Monitor AI', avatar: '🤖' },
      timestamp: addMinutes(startTime, 5.2),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'gantt-chart',
        data: {
          title: 'Fix Deployment Timeline',
          subtitle: 'Phased rollout with monitoring gates',
          tasks: [
            {
              id: 'rollout-1',
              title: 'Code Review & Testing',
              description: 'Peer review, unit tests, integration tests',
              startDate: addMinutes(startTime, 5),
              endDate: addMinutes(startTime, 15),
              progress: 100,
              status: 'completed',
              priority: 'critical',
              assignee: 'Senior Engineer',
              color: '#10B981',
            },
            {
              id: 'rollout-2',
              title: 'Deploy to Staging',
              description: 'Deploy to staging environment, run load tests',
              startDate: addMinutes(startTime, 15),
              endDate: addMinutes(startTime, 25),
              progress: 100,
              status: 'completed',
              priority: 'high',
              assignee: 'DevOps Team',
              dependencies: ['rollout-1'],
              color: '#10B981',
            },
            {
              id: 'rollout-3',
              title: 'Canary Deployment (1% traffic)',
              description: 'Deploy to 1% of production servers, monitor metrics',
              startDate: addMinutes(startTime, 25),
              endDate: addMinutes(startTime, 40),
              progress: 100,
              status: 'completed',
              priority: 'critical',
              assignee: 'DevOps Team',
              dependencies: ['rollout-2'],
              color: '#10B981',
              milestones: [
                {
                  id: 'm1',
                  title: 'Canary Success',
                  date: addMinutes(startTime, 40),
                  completed: true,
                },
              ],
            },
            {
              id: 'rollout-4',
              title: 'Gradual Rollout (10% → 50%)',
              description: 'Increase to 10%, monitor 15min, then 50%',
              startDate: addMinutes(startTime, 40),
              endDate: addMinutes(startTime, 70),
              progress: 100,
              status: 'completed',
              priority: 'high',
              assignee: 'DevOps Team',
              dependencies: ['rollout-3'],
              color: '#10B981',
            },
            {
              id: 'rollout-5',
              title: 'Full Deployment (100%)',
              description: 'Deploy to all production servers',
              startDate: addMinutes(startTime, 70),
              endDate: addMinutes(startTime, 90),
              progress: 100,
              status: 'completed',
              priority: 'critical',
              assignee: 'DevOps Team',
              dependencies: ['rollout-4'],
              color: '#10B981',
              milestones: [
                {
                  id: 'm2',
                  title: 'Full Deployment Complete',
                  date: addMinutes(startTime, 90),
                  completed: true,
                },
              ],
            },
            {
              id: 'rollout-6',
              title: 'Post-Deployment Monitoring',
              description: 'Monitor metrics for 2 hours to ensure stability',
              startDate: addMinutes(startTime, 90),
              endDate: addMinutes(startTime, 210),
              progress: 45,
              status: 'in-progress',
              priority: 'high',
              assignee: 'DevOps Team',
              dependencies: ['rollout-5'],
              color: '#3B82F6',
            },
          ],
          mode: 'mini',
          showProgress: true,
          showMilestones: true,
        },
      },
    },

    // 8. Final Dashboard - Healthy Metrics with Live Streaming
    {
      id: 'incident-011',
      type: 'text',
      content: 'Deployment complete. Monitoring system recovery...',
      sender: { id: 'ai-monitor', name: 'System Monitor AI', avatar: '🤖' },
      timestamp: addMinutes(startTime, 90),
      status: 'delivered',
      isOwn: false,
    },

    {
      id: 'incident-012',
      type: 'text',
      content: 'All systems returning to healthy state. Real-time health monitoring shows GREEN:',
      sender: { id: 'ai-monitor', name: 'System Monitor AI', avatar: '🤖' },
      timestamp: addMinutes(startTime, 95),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'time-series-chart',
        data: {
          series: [
            {
              id: 'health-check-recovery',
              name: 'Health Check Status',
              data: [
                { timestamp: addMinutes(startTime, 90), value: 0.3, label: 'RECOVERING' },
                { timestamp: addMinutes(startTime, 91), value: 0.6, label: 'DEGRADED' },
                { timestamp: addMinutes(startTime, 92), value: 0.85, label: 'HEALTHY' },
                { timestamp: addMinutes(startTime, 93), value: 1, label: 'HEALTHY' },
                { timestamp: addMinutes(startTime, 94), value: 1, label: 'HEALTHY' },
                { timestamp: addMinutes(startTime, 95), value: 1, label: 'HEALTHY' },
              ],
              color: '#10B981',
              lineWidth: 4,
              showPoints: true,
              pointRadius: 6,
            },
          ],
          mode: 'full',
          title: 'Live Health Monitor - SYSTEM HEALTHY',
          subtitle: 'Status: HEALTHY (GREEN) - Streaming every 2 seconds',
          enableLiveStreaming: true,
          maxDataPoints: 50,
          streamingWindowSize: 30,
          showStreamingControls: true,
          streamingPaused: false,
          streamingCallbackId: 'health-monitor-stream',
          showLegend: false,
          showGrid: true,
          showXAxis: true,
          showYAxis: true,
          xAxisLabel: 'Time',
          yAxisLabel: 'Status',
          valueFormatter: (value: number) => {
            if (value >= 0.8) return 'HEALTHY';
            if (value >= 0.4) return 'DEGRADED';
            return 'CRITICAL';
          },
          height: 250,
          minY: 0,
          maxY: 1,
        },
      },
    },

    {
      id: 'incident-013',
      type: 'text',
      content: 'Performance metrics stabilized:',
      sender: { id: 'ai-monitor', name: 'System Monitor AI', avatar: '🤖' },
      timestamp: addMinutes(startTime, 96),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'time-series-chart',
        data: {
          series: [
            {
              id: 'cpu-recovery',
              name: 'CPU Usage (%)',
              data: [
                { timestamp: addMinutes(startTime, 90), value: 78 },
                { timestamp: addMinutes(startTime, 91), value: 65 },
                { timestamp: addMinutes(startTime, 92), value: 52 },
                { timestamp: addMinutes(startTime, 93), value: 48 },
                { timestamp: addMinutes(startTime, 94), value: 45 },
                { timestamp: addMinutes(startTime, 95), value: 47 },
                { timestamp: addMinutes(startTime, 96), value: 46 },
              ],
              color: '#10B981',
              lineWidth: 3,
            },
            {
              id: 'memory-recovery',
              name: 'Memory Usage (%)',
              data: [
                { timestamp: addMinutes(startTime, 90), value: 82 },
                { timestamp: addMinutes(startTime, 91), value: 72 },
                { timestamp: addMinutes(startTime, 92), value: 65 },
                { timestamp: addMinutes(startTime, 93), value: 62 },
                { timestamp: addMinutes(startTime, 94), value: 60 },
                { timestamp: addMinutes(startTime, 95), value: 59 },
                { timestamp: addMinutes(startTime, 96), value: 58 },
              ],
              color: '#3B82F6',
              lineWidth: 3,
            },
            {
              id: 'api-recovery',
              name: 'API Response Time (ms)',
              data: [
                { timestamp: addMinutes(startTime, 90), value: 850 },
                { timestamp: addMinutes(startTime, 91), value: 420 },
                { timestamp: addMinutes(startTime, 92), value: 250 },
                { timestamp: addMinutes(startTime, 93), value: 180 },
                { timestamp: addMinutes(startTime, 94), value: 145 },
                { timestamp: addMinutes(startTime, 95), value: 138 },
                { timestamp: addMinutes(startTime, 96), value: 132 },
              ],
              color: '#8B5CF6',
              lineWidth: 3,
            },
          ],
          mode: 'full',
          title: 'System Performance Recovery',
          subtitle: 'All metrics within normal operating ranges',
          showLegend: true,
          showGrid: true,
          showXAxis: true,
          showYAxis: true,
          xAxisLabel: 'Time',
          yAxisLabel: 'Value',
          height: 300,
        },
      },
    },

    // 9. Engineer Confirmation
    {
      id: 'incident-014',
      type: 'text',
      content: 'Confirmed. All systems healthy. Database query count reduced from 10,000 to 1 per cache refresh. Response times back to baseline. Incident resolved.\n\n**Incident Summary:**\n- Duration: 95 minutes\n- Root Cause: Thundering herd on cache expiration\n- Impact: 150,000 users affected\n- Resolution: Implemented stampede protection with request coalescing, rate limiting, and probabilistic early expiration\n- Prevention: Added monitoring alerts for cache miss rate and database connection pool exhaustion\n\nAll systems healthy. Incident closed.',
      sender: { id: 'user-engineer', name: 'Senior Engineer', avatar: '👨‍💻' },
      timestamp: addMinutes(startTime, 98),
      status: 'delivered',
      isOwn: false,
    },
  ];
};

// DataTable focused chat - Sales Analytics
const getDataTableChatMessages = (): Message[] => {
  return [
    {
      id: 'dt-1',
      content: "Hey! Can you pull the Q1 sales performance report? I need to see customer data, revenue breakdown, and identify our top performers.",
      sender: { id: 'user-sales', name: 'Sales Manager', avatar: '👔' },
      timestamp: new Date(Date.now() - 180000),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'dt-2',
      content: "Absolutely! Here's the complete Q1 2024 sales performance data. I've organized it into an interactive table so you can sort, filter, and analyze the data easily.\n\nThe table shows all customers with their key metrics. You can:\n• **Sort** by any column (click the headers)\n• **Search** across all fields (try searching for \"VIP\" or specific names)\n• **Filter** by revenue, order count, or status\n• **Paginate** through the full dataset\n\nClick the 👁️ Expand button to see the full-screen view with advanced features!",
      sender: { id: 'ai-sales', name: 'Sales AI', avatar: '🤖' },
      timestamp: new Date(Date.now() - 175000),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'data-table',
        data: {
          columns: [
            { id: 'name', header: 'Customer Name', accessor: 'name', type: 'text', sortable: true, width: 180, priority: 1 },
            { id: 'company', header: 'Company', accessor: 'company', type: 'text', sortable: true, width: 200, priority: 2 },
            { id: 'email', header: 'Email', accessor: 'email', type: 'text', sortable: true, width: 220, priority: 3 },
            { id: 'revenue', header: 'Q1 Revenue', accessor: 'revenue', type: 'currency', sortable: true, align: 'right', width: 140, priority: 1 },
            { id: 'orders', header: 'Orders', accessor: 'orders', type: 'number', sortable: true, align: 'center', width: 100, priority: 2 },
            { id: 'avgOrder', header: 'Avg Order', accessor: 'avgOrder', type: 'currency', sortable: true, align: 'right', width: 130, priority: 3 },
            { id: 'lastOrder', header: 'Last Order', accessor: 'lastOrder', type: 'date', sortable: true, width: 140, priority: 3 },
            { id: 'status', header: 'Status', accessor: 'status', type: 'text', sortable: true, align: 'center', width: 120, priority: 2 },
          ],
          data: [
            { id: 1, name: 'John Smith', company: 'TechCorp Inc', email: 'john.smith@techcorp.com', revenue: 145230, orders: 28, avgOrder: 5186.79, lastOrder: subDays(new Date(), 2), status: 'VIP' },
            { id: 2, name: 'Sarah Lee', company: 'InnovateCo', email: 'sarah.lee@innovateco.com', revenue: 132180, orders: 24, avgOrder: 5507.50, lastOrder: subDays(new Date(), 5), status: 'VIP' },
            { id: 3, name: 'Mike Johnson', company: 'DataFlow Systems', email: 'mike.j@dataflow.com', revenue: 98940, orders: 35, avgOrder: 2826.86, lastOrder: subDays(new Date(), 1), status: 'Active' },
            { id: 4, name: 'Emily Chen', company: 'CloudScale Ltd', email: 'emily.chen@cloudscale.com', revenue: 186720, orders: 42, avgOrder: 4446.67, lastOrder: subDays(new Date(), 3), status: 'VIP' },
            { id: 5, name: 'David Park', company: 'StartupHub', email: 'david.park@startuphub.com', revenue: 45650, orders: 12, avgOrder: 3804.17, lastOrder: subDays(new Date(), 45), status: 'Inactive' },
            { id: 6, name: 'Lisa Anderson', company: 'Enterprise Solutions', email: 'lisa.a@entsol.com', revenue: 121200, orders: 31, avgOrder: 3909.68, lastOrder: subDays(new Date(), 4), status: 'Active' },
            { id: 7, name: 'Tom Wilson', company: 'MegaCorp Global', email: 'tom.wilson@megacorp.com', revenue: 267890, orders: 56, avgOrder: 4783.75, lastOrder: subDays(new Date(), 1), status: 'VIP' },
            { id: 8, name: 'Anna Rodriguez', company: 'SmartTech', email: 'anna.r@smarttech.com', revenue: 87450, orders: 22, avgOrder: 3975.00, lastOrder: subDays(new Date(), 8), status: 'Active' },
            { id: 9, name: 'Chris Taylor', company: 'FinanceFirst', email: 'chris.t@financefirst.com', revenue: 156780, orders: 38, avgOrder: 4125.79, lastOrder: subDays(new Date(), 6), status: 'Active' },
            { id: 10, name: 'Rachel Kim', company: 'DevOps Pro', email: 'rachel.k@devopspro.com', revenue: 198320, orders: 47, avgOrder: 4219.57, lastOrder: subDays(new Date(), 2), status: 'VIP' },
            { id: 11, name: 'James Brown', company: 'AI Innovations', email: 'james.b@aiinnovations.com', revenue: 76540, orders: 18, avgOrder: 4252.22, lastOrder: subDays(new Date(), 15), status: 'Active' },
            { id: 12, name: 'Maria Garcia', company: 'Global Trading', email: 'maria.g@globaltrading.com', revenue: 143210, orders: 29, avgOrder: 4938.28, lastOrder: subDays(new Date(), 7), status: 'Active' },
            { id: 13, name: 'Kevin Zhang', company: 'TechVentures', email: 'kevin.z@techventures.com', revenue: 89650, orders: 21, avgOrder: 4269.05, lastOrder: subDays(new Date(), 12), status: 'Active' },
            { id: 14, name: 'Sophie Martin', company: 'Retail Plus', email: 'sophie.m@retailplus.com', revenue: 54320, orders: 15, avgOrder: 3621.33, lastOrder: subDays(new Date(), 30), status: 'Inactive' },
            { id: 15, name: 'Daniel Lee', company: 'Manufacturing Co', email: 'daniel.l@mfgco.com', revenue: 234560, orders: 52, avgOrder: 4510.77, lastOrder: subDays(new Date(), 3), status: 'VIP' },
          ],
          title: 'Q1 2024 Customer Sales Report',
          subtitle: 'Top 15 customers • Click 👁️ to expand for advanced filtering',
          mode: 'preview',
          sortable: true,
          filterable: true,
          paginated: true,
          defaultPageSize: 8,
          defaultSort: { columnId: 'revenue', direction: 'desc' },
          striped: true,
          bordered: true,
        },
      },
    },
    {
      id: 'dt-3',
      content: "Perfect! I can see we have 5 VIP customers generating the most revenue. Can you break down the product sales by category?",
      sender: { id: 'user-sales', name: 'Sales Manager', avatar: '👔' },
      timestamp: new Date(Date.now() - 150000),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'dt-4',
      content: "Here's the product category breakdown for Q1. Notice how Software & SaaS is leading with strong margins, while Hardware has higher volume but lower margins.\n\nYou can sort by any metric to identify opportunities. Try sorting by margin percentage to see which categories are most profitable!",
      sender: { id: 'ai-sales', name: 'Sales AI', avatar: '🤖' },
      timestamp: new Date(Date.now() - 145000),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'data-table',
        data: {
          columns: [
            { id: 'category', header: 'Product Category', accessor: 'category', type: 'text', sortable: true, width: 200, priority: 1 },
            { id: 'units', header: 'Units Sold', accessor: 'units', type: 'number', sortable: true, align: 'right', width: 120, priority: 3 },
            { id: 'revenue', header: 'Revenue', accessor: 'revenue', type: 'currency', sortable: true, align: 'right', width: 140, priority: 1 },
            { id: 'cost', header: 'Cost', accessor: 'cost', type: 'currency', sortable: true, align: 'right', width: 130, priority: 3 },
            { id: 'profit', header: 'Gross Profit', accessor: 'profit', type: 'currency', sortable: true, align: 'right', width: 140, priority: 2 },
            { id: 'margin', header: 'Margin %', accessor: 'margin', type: 'number', sortable: true, align: 'right', width: 110, priority: 2 },
            { id: 'growth', header: 'QoQ Growth', accessor: 'growth', type: 'text', sortable: true, align: 'center', width: 130, priority: 3 },
          ],
          data: [
            { id: 1, category: 'Software & SaaS', units: 1247, revenue: 586420, cost: 198340, profit: 388080, margin: 66.2, growth: '+12.4%' },
            { id: 2, category: 'Hardware', units: 3856, revenue: 445230, cost: 312661, profit: 132569, margin: 29.8, growth: '+5.2%' },
            { id: 3, category: 'Consulting Services', units: 428, revenue: 512800, cost: 205120, profit: 307680, margin: 60.0, growth: '+18.7%' },
            { id: 4, category: 'Cloud Infrastructure', units: 892, revenue: 398760, cost: 159504, profit: 239256, margin: 60.0, growth: '+22.1%' },
            { id: 5, category: 'Training & Support', units: 645, revenue: 193500, cost: 96750, profit: 96750, margin: 50.0, growth: '+8.9%' },
            { id: 6, category: 'Security Solutions', units: 534, revenue: 267000, cost: 120150, profit: 146850, margin: 55.0, growth: '+15.3%' },
          ],
          title: 'Product Category Performance - Q1 2024',
          subtitle: 'Sales and profitability by category',
          mode: 'preview',
          sortable: true,
          filterable: true,
          paginated: false,
          defaultSort: { columnId: 'revenue', direction: 'desc' },
          striped: true,
          bordered: true,
        },
      },
    },
    {
      id: 'dt-5',
      content: "Excellent data! This makes it really easy to spot trends. The expand view with full search is fantastic - I can quickly find specific customers or filter by status.\n\nCan you show me the regional performance breakdown?",
      sender: { id: 'user-sales', name: 'Sales Manager', avatar: '👔' },
      timestamp: new Date(Date.now() - 120000),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'dt-6',
      content: "Here's the regional breakdown! Notice North America is leading in revenue, but APAC has the highest growth rate and lowest acquisition cost.\n\nThe interactive table makes it easy to compare metrics across regions. Try the expand view to see all the data with sorting and filtering!",
      sender: { id: 'ai-sales', name: 'Sales AI', avatar: '🤖' },
      timestamp: new Date(Date.now() - 115000),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'data-table',
        data: {
          columns: [
            { id: 'region', header: 'Region', accessor: 'region', type: 'text', sortable: true, width: 180, priority: 1 },
            { id: 'customers', header: 'Customers', accessor: 'customers', type: 'number', sortable: true, align: 'right', width: 120, priority: 2 },
            { id: 'revenue', header: 'Revenue', accessor: 'revenue', type: 'currency', sortable: true, align: 'right', width: 150, priority: 1 },
            { id: 'avgDeal', header: 'Avg Deal Size', accessor: 'avgDeal', type: 'currency', sortable: true, align: 'right', width: 140, priority: 3 },
            { id: 'growth', header: 'YoY Growth', accessor: 'growth', type: 'text', sortable: true, align: 'center', width: 130, priority: 2 },
            { id: 'cac', header: 'CAC', accessor: 'cac', type: 'currency', sortable: true, align: 'right', width: 120, priority: 3 },
            { id: 'ltv', header: 'LTV', accessor: 'ltv', type: 'currency', sortable: true, align: 'right', width: 120, priority: 3 },
          ],
          data: [
            { id: 1, region: 'North America', customers: 487, revenue: 1245680, avgDeal: 2558, growth: '+14.2%', cac: 850, ltv: 12400 },
            { id: 2, region: 'Europe', customers: 356, revenue: 892340, avgDeal: 2507, growth: '+11.8%', cac: 920, ltv: 11200 },
            { id: 3, region: 'APAC', customers: 298, revenue: 734520, avgDeal: 2465, growth: '+28.5%', cac: 680, ltv: 13800 },
            { id: 4, region: 'Latin America', customers: 142, revenue: 298760, avgDeal: 2104, growth: '+19.3%', cac: 580, ltv: 8900 },
            { id: 5, region: 'Middle East & Africa', customers: 89, revenue: 187940, avgDeal: 2112, growth: '+22.7%', cac: 720, ltv: 9600 },
          ],
          title: 'Regional Sales Performance - Q1 2024',
          subtitle: 'Revenue, growth, and efficiency metrics by region',
          mode: 'preview',
          sortable: true,
          filterable: true,
          paginated: false,
          defaultSort: { columnId: 'revenue', direction: 'desc' },
          striped: true,
          bordered: true,
        },
      },
    },
    {
      id: 'dt-7',
      content: "This is perfect! The DataTable component makes complex sales data so much easier to analyze. I love that I can:\n\n✅ Sort by any metric instantly\n✅ Search across all columns\n✅ See formatted currency and dates\n✅ Compare performance across regions and categories\n✅ Export selections for presentations\n\nThis will save our team hours every week. Thanks!",
      sender: { id: 'user-sales', name: 'Sales Manager', avatar: '👔' },
      timestamp: new Date(Date.now() - 90000),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'dt-8',
      content: "Glad you find it useful! The DataTable component is designed for exactly these use cases:\n\n📊 **Sales Reports** - Customer data, revenue tracking, performance metrics\n💼 **Business Analytics** - KPIs, growth tracking, comparative analysis\n📈 **Financial Data** - P&L statements, budget tracking, forecasting\n🎯 **Marketing Metrics** - Campaign performance, conversion rates, ROI\n📦 **Inventory Management** - Stock levels, reorder points, supplier data\n\n**Key Features:**\n• Handles 1000+ rows with smooth pagination\n• Auto-formats currency, dates, numbers, percentages\n• Advanced sorting and filtering\n• Responsive design (works on mobile!)\n• Export and selection capabilities\n• Fully customizable column widths and types\n\nYou can even customize cell rendering for special formatting like progress bars, status badges, or action buttons!",
      sender: { id: 'ai-sales', name: 'Sales AI', avatar: '🤖' },
      timestamp: new Date(Date.now() - 85000),
      status: 'delivered',
      isOwn: false,
    },
  ];
};

// Heatmap focused chat - Infrastructure Monitoring
const getHeatmapChatMessages = (): Message[] => {
  const now = new Date();

  // Generate server performance heatmap data
  const generateServerHeatmapData = () => {
    const servers = ['Web-01', 'Web-02', 'Web-03', 'API-01', 'API-02', 'DB-01'];
    const metrics = ['CPU Usage', 'Memory', 'Disk I/O', 'Network', 'Latency', 'Throughput'];
    const data: any[] = [];

    servers.forEach((server) => {
      metrics.forEach((metric) => {
        const baseValue = Math.random() * 100;
        const value = metric === 'Latency' || metric === 'Throughput' ?
          baseValue * 5 : baseValue;

        data.push({
          x: server,
          y: metric,
          value: Math.round(value * 100) / 100,
          label: `${server} - ${metric}`,
          metadata: {
            timestamp: new Date().toISOString(),
            status: value > 80 ? 'critical' : value > 60 ? 'warning' : 'normal',
            unit: metric === 'Latency' ? 'ms' : metric === 'Throughput' ? 'MB/s' : '%',
          },
        });
      });
    });

    return data;
  };

  // Generate time series data for key metrics
  const generateMetricTimeSeries = (metricName: string, baseValue: number, variance: number, color: string) => {
    return {
      id: metricName.toLowerCase().replace(/\s+/g, '-'),
      name: metricName,
      data: Array.from({ length: 15 }, (_, i) => ({
        timestamp: addMinutes(now, -15 + i),
        value: baseValue + (Math.random() - 0.5) * variance,
      })),
      color,
      lineWidth: 2,
    };
  };

  const heatmapData = generateServerHeatmapData();

  return [
    {
      id: 'hm-1',
      content: "Can you show me the current infrastructure health across all our production servers?",
      sender: { id: 'user-ops', name: 'You', avatar: '👤' },
      timestamp: new Date(Date.now() - 180000),
      status: 'delivered',
      isOwn: true,
    },
    {
      id: 'hm-2',
      content: "Here's a comprehensive infrastructure monitoring dashboard with real-time metrics:\n\n**Dashboard Overview:**\n• **Performance Heatmap**: All servers × all metrics in one view\n• **CPU Trends**: Real-time CPU utilization across the cluster\n• **Memory Trends**: Memory consumption patterns\n• **Response Time**: API latency tracking\n\n**What to watch:**\n• 🟢 Green zones = Healthy operations\n• 🟡 Yellow zones = Monitor closely\n• 🔴 Red zones = Immediate attention needed\n\nClick 👁️ Expand for the full interactive dashboard with drill-down capabilities!",
      sender: { id: 'ai-ops', name: 'Ops AI', avatar: '🤖' },
      timestamp: new Date(Date.now() - 175000),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'dashboard',
        data: {
          config: {
            title: 'Infrastructure Monitoring Dashboard',
            description: 'Real-time server performance metrics',
            gridSize: '2x2',
            items: [
              {
                id: 'heatmap-performance',
                type: 'heatmap',
                title: 'Performance Matrix',
                gridPosition: { row: 0, col: 0, rowSpan: 2, colSpan: 1 },
                data: {
                  data: heatmapData,
                  colorScale: 'red',
                  showLegend: true,
                  showGrid: true,
                  xAxisLabel: 'Servers',
                  yAxisLabel: 'Metrics',
                  valueFormatter: (value: number) => `${value.toFixed(1)}`,
                  autoScale: true,
                },
              },
              {
                id: 'cpu-trends',
                type: 'time-series',
                title: 'CPU Utilization (%)',
                gridPosition: { row: 0, col: 1 },
                data: {
                  series: [
                    generateMetricTimeSeries('Web Servers', 45, 15, '#3B82F6'),
                    generateMetricTimeSeries('API Servers', 62, 18, '#8B5CF6'),
                    generateMetricTimeSeries('Database', 58, 12, '#10B981'),
                  ],
                  showLegend: true,
                  showGrid: true,
                  height: 150,
                  valueFormatter: (value: number) => `${value.toFixed(0)}%`,
                },
              },
              {
                id: 'memory-trends',
                type: 'time-series',
                title: 'Memory Usage (%)',
                gridPosition: { row: 1, col: 1 },
                data: {
                  series: [
                    generateMetricTimeSeries('Web Servers', 52, 12, '#3B82F6'),
                    generateMetricTimeSeries('API Servers', 68, 15, '#8B5CF6'),
                    generateMetricTimeSeries('Database', 75, 10, '#10B981'),
                  ],
                  showLegend: true,
                  showGrid: true,
                  height: 150,
                  valueFormatter: (value: number) => `${value.toFixed(0)}%`,
                },
              },
            ],
          },
          mode: 'mini',
          height: 400,
        },
      },
    },
    {
      id: 'hm-3',
      content: "I notice API servers have higher resource utilization. Should we be concerned?",
      sender: { id: 'user-ops', name: 'You', avatar: '👤' },
      timestamp: new Date(Date.now() - 150000),
      status: 'delivered',
      isOwn: true,
    },
    {
      id: 'hm-4',
      content: "Good observation! The API servers are running hotter than other tiers, but it's within acceptable ranges:\n\n**Current Status:**\n• **CPU**: ~62% average (threshold: 80%) ✅\n• **Memory**: ~68% average (threshold: 85%) ⚠️\n• Memory is approaching watch level\n\n**Analysis:**\n• API-01 and API-02 showing correlated load patterns\n• Likely increased traffic during business hours\n• Memory growth is gradual, not spiking\n\n**Recommendations:**\n1. **Immediate**: Monitor memory growth trend\n2. **Short-term**: Review API caching strategy to reduce memory pressure\n3. **Long-term**: Consider horizontal scaling (add API-03) if traffic continues to grow\n4. **Set alert**: Notify if memory exceeds 80%\n\nThe system is stable but approaching capacity on the API tier. I'll alert you if metrics exceed thresholds!",
      sender: { id: 'ai-ops', name: 'Ops AI', avatar: '🤖' },
      timestamp: new Date(Date.now() - 145000),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'hm-5',
      content: "Can you show me response time trends? I want to make sure latency isn't creeping up.",
      sender: { id: 'user-ops', name: 'You', avatar: '👤' },
      timestamp: new Date(Date.now() - 120000),
      status: 'delivered',
      isOwn: true,
    },
    {
      id: 'hm-6',
      content: "Here's the API response time breakdown across all endpoints over the last 15 minutes:",
      sender: { id: 'ai-ops', name: 'Ops AI', avatar: '🤖' },
      timestamp: new Date(Date.now() - 115000),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'time-series-chart',
        data: {
          series: [
            {
              id: 'p50-latency',
              name: 'p50 (Median)',
              data: Array.from({ length: 15 }, (_, i) => ({
                timestamp: addMinutes(now, -15 + i),
                value: 120 + (Math.random() - 0.5) * 30,
              })),
              color: '#10B981',
              lineWidth: 3,
            },
            {
              id: 'p95-latency',
              name: 'p95',
              data: Array.from({ length: 15 }, (_, i) => ({
                timestamp: addMinutes(now, -15 + i),
                value: 280 + (Math.random() - 0.5) * 60,
              })),
              color: '#F59E0B',
              lineWidth: 3,
            },
            {
              id: 'p99-latency',
              name: 'p99',
              data: Array.from({ length: 15 }, (_, i) => ({
                timestamp: addMinutes(now, -15 + i),
                value: 450 + (Math.random() - 0.5) * 100,
              })),
              color: '#EF4444',
              lineWidth: 3,
            },
          ],
          mode: 'full',
          title: 'API Response Time Distribution',
          subtitle: 'Last 15 minutes • All endpoints',
          showLegend: true,
          showGrid: true,
          showXAxis: true,
          showYAxis: true,
          xAxisLabel: 'Time',
          yAxisLabel: 'Latency (ms)',
          valueFormatter: (value: number) => `${value.toFixed(0)}ms`,
          height: 280,
        },
      },
    },
    {
      id: 'hm-7',
      content: "**Latency Analysis:**\n\n✅ **p50 (Median)**: 120ms - Excellent\n⚠️ **p95**: 280ms - Good, but watch for increases\n🔴 **p99**: 450ms - Approaching threshold (500ms)\n\n**Insights:**\n• 95% of requests complete in under 280ms\n• 1% of requests are slow (450ms+)\n• Likely database queries or external API calls\n\n**Action Items:**\n1. Identify slow p99 queries with query profiling\n2. Add query result caching for common patterns\n3. Consider read replicas to distribute load\n4. Set up p99 > 500ms alerts\n\nOverall system health: **GOOD** 🟢",
      sender: { id: 'ai-ops', name: 'Ops AI', avatar: '🤖' },
      timestamp: new Date(Date.now() - 110000),
      status: 'delivered',
      isOwn: false,
    },
  ];
};

const getWorkflowChatMessages = (): Message[] => {
  const now = new Date();

  // Generate CI/CD workflow data
  const generateCICDWorkflow = () => {
    const nodes: any[] = [
      {
        id: 'start',
        type: 'start',
        label: 'Trigger',
        status: 'success',
        metadata: { duration: 100, startTime: subDays(now, 0), endTime: subDays(now, 0) },
      },
      {
        id: 'checkout',
        type: 'task',
        label: 'Checkout',
        description: 'Clone repository',
        status: 'success',
        metadata: { duration: 5000, retries: 0 },
      },
      {
        id: 'install',
        type: 'task',
        label: 'Install Deps',
        description: 'npm install',
        status: 'success',
        metadata: { duration: 45000, retries: 0 },
      },
      {
        id: 'lint',
        type: 'task',
        label: 'Lint',
        description: 'ESLint check',
        status: 'success',
        metadata: { duration: 8000 },
      },
      {
        id: 'test',
        type: 'task',
        label: 'Test',
        description: 'Run tests',
        status: 'success',
        metadata: { duration: 35000, retries: 1 },
      },
      {
        id: 'build',
        type: 'task',
        label: 'Build',
        description: 'Production build',
        status: 'running',
        metadata: { startTime: now },
      },
      {
        id: 'security',
        type: 'task',
        label: 'Security Scan',
        status: 'waiting',
      },
      {
        id: 'deploy-staging',
        type: 'api',
        label: 'Deploy Staging',
        status: 'idle',
      },
      {
        id: 'e2e',
        type: 'task',
        label: 'E2E Tests',
        status: 'idle',
      },
      {
        id: 'approval',
        type: 'manual',
        label: 'Approve',
        description: 'Manual approval',
        status: 'idle',
      },
      {
        id: 'deploy-prod',
        type: 'api',
        label: 'Deploy Prod',
        status: 'idle',
      },
      {
        id: 'notify',
        type: 'notification',
        label: 'Notify',
        status: 'idle',
      },
      {
        id: 'end',
        type: 'end',
        label: 'Complete',
        status: 'idle',
      },
    ];

    const edges: any[] = [
      { id: 'e1', source: 'start', target: 'checkout', conditionType: 'always' },
      { id: 'e2', source: 'checkout', target: 'install', conditionType: 'success' },
      { id: 'e3', source: 'install', target: 'lint', conditionType: 'success' },
      { id: 'e4', source: 'install', target: 'test', conditionType: 'success' },
      { id: 'e5', source: 'lint', target: 'build', conditionType: 'success' },
      { id: 'e6', source: 'test', target: 'build', conditionType: 'success' },
      { id: 'e7', source: 'build', target: 'security', conditionType: 'success' },
      { id: 'e8', source: 'security', target: 'deploy-staging', conditionType: 'success' },
      { id: 'e9', source: 'deploy-staging', target: 'e2e', conditionType: 'success' },
      { id: 'e10', source: 'e2e', target: 'approval', conditionType: 'success' },
      { id: 'e11', source: 'approval', target: 'deploy-prod', conditionType: 'success' },
      { id: 'e12', source: 'deploy-prod', target: 'notify', conditionType: 'success' },
      { id: 'e13', source: 'notify', target: 'end', conditionType: 'always' },
      { id: 'e14', source: 'security', target: 'notify', conditionType: 'failure', label: 'on fail', style: 'dashed' },
    ];

    return {
      id: 'cicd-pipeline',
      name: 'CI/CD Pipeline',
      description: 'Automated deployment workflow',
      nodes,
      edges,
      metadata: {
        created: subDays(now, 30),
        version: '2.1.0',
        author: 'DevOps Team',
        executionCount: 487,
        averageDuration: 420000,
        successRate: 0.94,
      },
    };
  };

  const workflowData = generateCICDWorkflow();

  return [
    {
      id: 'wf-1',
      content: "Show me the current deployment pipeline status for the production release",
      sender: { id: 'user-dev', name: 'You', avatar: '👤' },
      timestamp: new Date(Date.now() - 120000),
      status: 'delivered',
      isOwn: true,
    },
    {
      id: 'wf-2',
      content: "Here's the **CI/CD Pipeline Status** for your production release:\n\n**Current State:**\n• ✅ Tests passing (with 1 retry)\n• ⚡ Build in progress...\n• ⏳ 7 stages remaining\n\n**Pipeline Highlights:**\n• **Success Rate**: 94% (487 total runs)\n• **Avg Duration**: 7 minutes\n• **Critical Path**: Highlighted in yellow\n\n**Next Steps:**\n1. Security scan (auto-triggered after build)\n2. Staging deployment\n3. Manual approval required for production\n\nClick nodes to see detailed execution logs and metadata!",
      sender: { id: 'ai-devops', name: 'DevOps AI', avatar: '🤖' },
      timestamp: new Date(Date.now() - 115000),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'workflow',
        data: workflowData,
      },
    },
  ];
};

// Core demo chats showcasing Stash capabilities
const ALL_MOCK_CHATS: ChatPreview[] = [
  // Combined overview - what is Stash and why it exists
  {
    id: 'chat-overview',
    title: '✨ What is Stash?',
    type: 'ai',
    groupId: 'tutorials',
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
  // WebSocket Integration Tutorial
  {
    id: 'chat-websocket-tutorial',
    title: '📚 Tutorial: Real-Time WebSocket Integration',
    type: 'ai',
    groupId: 'tutorials',
    participants: [
      { id: 'user-tutorial', name: 'You', avatar: '👤' },
      { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
    ],
    lastMessage: {
      content: 'Congratulations! You\'ve learned how to build a production-ready real-time chat application with Stash.',
      timestamp: new Date(),
      senderId: 'ai-tutorial',
      senderName: 'Stash Tutorial',
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
  // Thundering Herd Production Incident - End-to-End Example
  {
    id: 'chat-incident',
    title: '🚨 Thundering Herd Incident - Cache Stampede',
    type: 'ai',
    groupId: 'debugging',
    participants: [
      { id: 'user-ops', name: 'DevOps Team', avatar: '👨‍💻' },
      { id: 'ai-monitor', name: 'System Monitor AI', avatar: '🤖' },
      { id: 'user-engineer', name: 'Senior Engineer', avatar: '👨‍💻' },
    ],
    lastMessage: {
      content: 'All systems healthy. Incident closed.',
      timestamp: new Date(Date.now() - 30000),
      senderId: 'user-engineer',
      senderName: 'Senior Engineer',
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 30000),
    createdAt: new Date(Date.now() - 300000),
    isPinned: true,
    isMuted: false,
    isArchived: false,
    metadata: {
      lastReadAt: new Date(),
    },
  },
  // DataTable Sales Analytics
  {
    id: 'chat-data-table',
    title: '📊 Sales Analytics - DataTable Demo',
    type: 'ai',
    groupId: 'examples',
    participants: [
      { id: 'user-sales', name: 'Sales Manager', avatar: '👔' },
      { id: 'ai-sales', name: 'Sales AI', avatar: '🤖' },
    ],
    lastMessage: {
      content: 'The DataTable component is perfect for sales reports, analytics, and structured data!',
      timestamp: new Date(Date.now() - 85000),
      senderId: 'ai-sales',
      senderName: 'Sales AI',
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 85000),
    createdAt: new Date(Date.now() - 180000),
    isPinned: true,
    isMuted: false,
    isArchived: false,
    metadata: {
      lastReadAt: new Date(),
    },
  },
  // Live Streaming Graph Tutorial
  {
    id: 'chat-graph-tutorial',
    title: '📊 Tutorial: Live Streaming Graphs with WebSockets',
    type: 'ai',
    groupId: 'tutorials',
    participants: [
      { id: 'user-tutorial', name: 'You', avatar: '👤' },
      { id: 'ai-assistant', name: 'Stash AI', avatar: '🤖' },
    ],
    lastMessage: {
      content: 'Check out the Live Streaming Chat example to see it in action! 📈',
      timestamp: new Date(),
      senderId: 'ai-assistant',
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
  // Live Streaming Sales Dashboard
  {
    id: 'chat-live-streaming',
    title: '📈 Live Streaming Sales Dashboard',
    type: 'ai',
    groupId: 'examples',
    participants: [
      { id: 'user-streaming', name: 'You', avatar: '👤' },
      { id: 'ai-streaming', name: 'Sales AI', avatar: '📊' },
    ],
    lastMessage: {
      content: 'Type "start" to begin streaming live sales data!',
      timestamp: new Date(),
      senderId: 'ai-streaming',
      senderName: 'Sales AI',
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
  // Server Performance Monitoring with Heatmap
  {
    id: 'chat-heatmap',
    title: '🔥 Infrastructure Monitoring',
    type: 'ai',
    groupId: 'examples',
    participants: [
      { id: 'user-ops', name: 'You', avatar: '👤' },
      { id: 'ai-ops', name: 'Ops AI', avatar: '🤖' },
    ],
    lastMessage: {
      content: 'Here\'s the current server performance heatmap showing CPU, memory, and network utilization across all servers.',
      timestamp: new Date(),
      senderId: 'ai-ops',
      senderName: 'Ops AI',
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
  // CI/CD Workflow demo
  {
    id: 'chat-workflow',
    title: '🔄 CI/CD Pipeline Status',
    type: 'ai',
    groupId: 'examples',
    participants: [
      { id: 'user-dev', name: 'You', avatar: '👤' },
      { id: 'ai-devops', name: 'DevOps AI', avatar: '🤖' },
    ],
    lastMessage: {
      content: 'Build in progress. Security scan and staging deployment will start automatically after build completes.',
      timestamp: new Date(),
      senderId: 'ai-devops',
      senderName: 'DevOps AI',
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
    groupId: 'examples',
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
    groupId: 'debugging',
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
    groupId: 'examples',
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

  // Define chat groups for organizing conversations
  const chatGroups: ChatGroup[] = [
    { id: 'tutorials', title: 'Tutorials', icon: '📚', order: 1, collapsed: false },
    { id: 'examples', title: 'Chat Examples', icon: '💬', order: 2, collapsed: false },
    { id: 'debugging', title: 'Debugging & Performance', icon: '🔧', order: 3, collapsed: false },
  ];

  // Memoize initial messages to avoid regenerating large datasets
  const overviewMessages = useMemo(() => getStashOverviewMessages(), []);
  const allPaginationMessages = useMemo(() => getLargeMessageHistory(), []); // Store all 1200 messages
  const initialMessages = useMemo(() => getAIIntegratedMessages(), []);
  const webSocketTutorialMessages = useMemo(() => getWebSocketTutorialMessages(), []);
  const graphTutorialMessages = useMemo(() => getLiveStreamingGraphTutorialMessages(), []);
  const incidentMessages = useMemo(() => getSystemIncidentMessages(), []);
  const dataTableMessages = useMemo(() => getDataTableChatMessages(), []);

  const heatmapMessages = useMemo(() => getHeatmapChatMessages(), []);
  const workflowMessages = useMemo(() => getWorkflowChatMessages(), []);

  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>({
    'chat-overview': overviewMessages,
    'chat-websocket-tutorial': webSocketTutorialMessages,
    'chat-graph-tutorial': graphTutorialMessages,
    'chat-data-table': dataTableMessages,
    'chat-heatmap': heatmapMessages,
    'chat-workflow': workflowMessages,
    'chat-incident': incidentMessages,
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
    // Start in regular chat mode for all conversations
    setIsPresentationMode(false);
  }, []);

  const handleEnterPresentation = useCallback(() => {
    console.log('[ChatHistoryExample] Entering presentation mode');
    setIsPresentationMode(true);
  }, []);

  const handleCopyHistory = useCallback((json: string) => {
    console.log('[ChatHistoryExample] Chat history copied:', json.length, 'characters');
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
        groups: chatGroups,
        enableGrouping: true,
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
        currentChatId === 'chat-live-streaming' ? (
          // Use LiveStreamingChatExample for live streaming sales dashboard
          <LiveStreamingChatExample />
        ) : currentChatId === 'chat-media' ? (
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
            onEnterPresentation={handleEnterPresentation}
            onCopyHistory={handleCopyHistory}
            initialScrollPosition={currentChatId === 'chat-overview' ? 'top' : 'bottom'}
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
