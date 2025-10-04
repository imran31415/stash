import React from 'react';
import type { Message, Task, GraphData } from '../../src/components/Chat';
import { addDays, addWeeks, addHours } from 'date-fns';

// Tutorial: Real-Time WebSocket Integration with Stash
export const getWebSocketTutorialMessages = (): Message[] => {
  // Implementation timeline for Gantt chart
  const implementationTasks: Task[] = [
    // Phase 1: Setup & Installation (Week 1)
    {
      id: 'setup-1',
      title: '📦 Install Stash Library',
      description: 'Install Stash and dependencies via npm/yarn',
      startDate: new Date(),
      endDate: addHours(new Date(), 2),
      progress: 100,
      status: 'completed',
      priority: 'critical',
      assignee: 'Developer',
    },
    {
      id: 'setup-2',
      title: '🔧 Configure TypeScript',
      description: 'Set up TypeScript types and compiler options',
      startDate: addHours(new Date(), 2),
      endDate: addHours(new Date(), 4),
      progress: 100,
      status: 'completed',
      priority: 'high',
      assignee: 'Developer',
    },
    {
      id: 'setup-3',
      title: '🎨 Import Components',
      description: 'Import Chat, ChatLayout, and interactive components',
      startDate: addHours(new Date(), 4),
      endDate: addDays(new Date(), 1),
      progress: 80,
      status: 'in-progress',
      priority: 'high',
      assignee: 'Developer',
    },

    // Phase 2: Backend Architecture (Week 1-2)
    {
      id: 'backend-1',
      title: '🏗️ Design WebSocket Architecture',
      description: 'Plan WebSocket server, message protocol, and event handlers',
      startDate: addDays(new Date(), 1),
      endDate: addDays(new Date(), 2),
      progress: 60,
      status: 'in-progress',
      priority: 'critical',
      assignee: 'Backend Team',
      milestones: [
        {
          id: 'arch-milestone',
          title: 'Architecture Review',
          date: addDays(new Date(), 2),
          completed: false,
        },
      ],
    },
    {
      id: 'backend-2',
      title: '💾 Set Up Database Schema',
      description: 'Design tables for messages, users, chat rooms, and sessions',
      startDate: addDays(new Date(), 2),
      endDate: addDays(new Date(), 3),
      progress: 40,
      status: 'in-progress',
      priority: 'critical',
      assignee: 'Backend Team',
    },
    {
      id: 'backend-3',
      title: '⚡ Configure Redis Cache',
      description: 'Set up Redis for session management and message caching',
      startDate: addDays(new Date(), 3),
      endDate: addDays(new Date(), 4),
      progress: 20,
      status: 'in-progress',
      priority: 'high',
      assignee: 'Backend Team',
    },
    {
      id: 'backend-4',
      title: '🔌 Implement WebSocket Server',
      description: 'Build WebSocket server with Socket.IO or native WebSockets',
      startDate: addDays(new Date(), 4),
      endDate: addDays(new Date(), 7),
      progress: 0,
      status: 'pending',
      priority: 'critical',
      assignee: 'Backend Team',
    },

    // Phase 3: Frontend Integration (Week 2)
    {
      id: 'frontend-1',
      title: '🔗 Create WebSocketChatService',
      description: 'Implement WebSocketChatService class extending BaseChatService',
      startDate: addDays(new Date(), 7),
      endDate: addDays(new Date(), 9),
      progress: 0,
      status: 'pending',
      priority: 'critical',
      assignee: 'Frontend Team',
    },
    {
      id: 'frontend-2',
      title: '📡 Wire Up Connection Logic',
      description: 'Connect WebSocket client to backend, handle reconnection',
      startDate: addDays(new Date(), 9),
      endDate: addDays(new Date(), 11),
      progress: 0,
      status: 'pending',
      priority: 'critical',
      assignee: 'Frontend Team',
    },
    {
      id: 'frontend-3',
      title: '💬 Implement Message Handlers',
      description: 'Handle incoming/outgoing messages, typing indicators, presence',
      startDate: addDays(new Date(), 11),
      endDate: addDays(new Date(), 14),
      progress: 0,
      status: 'pending',
      priority: 'high',
      assignee: 'Frontend Team',
    },

    // Phase 4: State Management (Week 3)
    {
      id: 'state-1',
      title: '🗄️ Set Up State Management',
      description: 'Implement state management for messages, users, and connection status',
      startDate: addDays(new Date(), 14),
      endDate: addDays(new Date(), 16),
      progress: 0,
      status: 'pending',
      priority: 'high',
      assignee: 'Frontend Team',
    },
    {
      id: 'state-2',
      title: '🔄 Add Optimistic Updates',
      description: 'Implement optimistic UI updates for instant user feedback',
      startDate: addDays(new Date(), 16),
      endDate: addDays(new Date(), 18),
      progress: 0,
      status: 'pending',
      priority: 'medium',
      assignee: 'Frontend Team',
    },
    {
      id: 'state-3',
      title: '📥 Implement Message Persistence',
      description: 'Add offline support with local storage and sync on reconnect',
      startDate: addDays(new Date(), 18),
      endDate: addDays(new Date(), 21),
      progress: 0,
      status: 'pending',
      priority: 'medium',
      assignee: 'Frontend Team',
    },

    // Phase 5: Testing (Week 3-4)
    {
      id: 'test-1',
      title: '🧪 Unit Testing',
      description: 'Write unit tests for WebSocket service and message handlers',
      startDate: addDays(new Date(), 21),
      endDate: addDays(new Date(), 23),
      progress: 0,
      status: 'pending',
      priority: 'high',
      assignee: 'QA Team',
    },
    {
      id: 'test-2',
      title: '🔬 Integration Testing',
      description: 'Test end-to-end message flow and connection scenarios',
      startDate: addDays(new Date(), 23),
      endDate: addDays(new Date(), 25),
      progress: 0,
      status: 'pending',
      priority: 'high',
      assignee: 'QA Team',
    },
    {
      id: 'test-3',
      title: '📊 Load Testing',
      description: 'Test with 1000+ concurrent connections and high message volume',
      startDate: addDays(new Date(), 25),
      endDate: addDays(new Date(), 28),
      progress: 0,
      status: 'pending',
      priority: 'medium',
      assignee: 'QA Team',
      milestones: [
        {
          id: 'load-test-milestone',
          title: 'Performance Benchmarks Met',
          date: addDays(new Date(), 28),
          completed: false,
        },
      ],
    },

    // Phase 6: Deployment (Week 4)
    {
      id: 'deploy-1',
      title: '🚀 Deploy to Staging',
      description: 'Deploy WebSocket infrastructure to staging environment',
      startDate: addDays(new Date(), 28),
      endDate: addWeeks(new Date(), 4),
      progress: 0,
      status: 'pending',
      priority: 'high',
      assignee: 'DevOps',
    },
    {
      id: 'deploy-2',
      title: '📈 Monitor & Optimize',
      description: 'Set up monitoring, logging, and performance optimization',
      startDate: addWeeks(new Date(), 4),
      endDate: addWeeks(new Date(), 4.5),
      progress: 0,
      status: 'pending',
      priority: 'medium',
      assignee: 'DevOps',
    },
    {
      id: 'deploy-3',
      title: '✅ Production Deployment',
      description: 'Deploy to production with gradual rollout',
      startDate: addWeeks(new Date(), 4.5),
      endDate: addWeeks(new Date(), 5),
      progress: 0,
      status: 'pending',
      priority: 'critical',
      assignee: 'DevOps',
      milestones: [
        {
          id: 'prod-milestone',
          title: 'Go Live',
          date: addWeeks(new Date(), 5),
          completed: false,
        },
      ],
    },
  ];

  // Backend architecture graph
  const backendArchitecture: GraphData = {
    nodes: [
      // Client Layer
      { id: 'client', labels: ['Client'], properties: { name: 'React Native App', platform: 'iOS/Android/Web' }, color: '#3B82F6', size: 20 },

      // WebSocket Layer
      { id: 'ws-client', labels: ['Service'], properties: { name: 'WebSocketChatService', type: 'client' }, color: '#8B5CF6', size: 18 },
      { id: 'ws-server', labels: ['Server'], properties: { name: 'WebSocket Server', tech: 'Socket.IO/WS' }, color: '#8B5CF6', size: 20 },

      // API Layer
      { id: 'rest-api', labels: ['Server'], properties: { name: 'REST API', purpose: 'HTTP fallback' }, color: '#10B981', size: 16 },
      { id: 'auth', labels: ['Service'], properties: { name: 'Auth Service', tech: 'JWT' }, color: '#F59E0B', size: 16 },

      // Business Logic
      { id: 'message-handler', labels: ['Service'], properties: { name: 'Message Handler', role: 'process messages' }, color: '#EF4444', size: 18 },
      { id: 'presence', labels: ['Service'], properties: { name: 'Presence Service', role: 'online status' }, color: '#EF4444', size: 14 },
      { id: 'typing', labels: ['Service'], properties: { name: 'Typing Service', role: 'typing indicators' }, color: '#EF4444', size: 14 },

      // Data Layer
      { id: 'redis', labels: ['Cache'], properties: { name: 'Redis', purpose: 'sessions, pub/sub' }, color: '#DC2626', size: 18 },
      { id: 'postgres', labels: ['Database'], properties: { name: 'PostgreSQL', purpose: 'persistent storage' }, color: '#2563EB', size: 18 },
      { id: 'queue', labels: ['Queue'], properties: { name: 'Message Queue', tech: 'RabbitMQ/Redis' }, color: '#F97316', size: 16 },
    ],
    edges: [
      { id: 'e1', source: 'client', target: 'ws-client', type: 'USES', label: 'uses' },
      { id: 'e2', source: 'ws-client', target: 'ws-server', type: 'CONNECTS', label: 'WebSocket' },
      { id: 'e3', source: 'client', target: 'rest-api', type: 'FALLBACK', label: 'HTTP fallback' },
      { id: 'e4', source: 'ws-server', target: 'auth', type: 'VALIDATES', label: 'validates' },
      { id: 'e5', source: 'rest-api', target: 'auth', type: 'VALIDATES', label: 'validates' },
      { id: 'e6', source: 'ws-server', target: 'message-handler', type: 'ROUTES', label: 'routes' },
      { id: 'e7', source: 'message-handler', target: 'presence', type: 'UPDATES', label: 'updates' },
      { id: 'e8', source: 'message-handler', target: 'typing', type: 'NOTIFIES', label: 'notifies' },
      { id: 'e9', source: 'message-handler', target: 'redis', type: 'CACHES', label: 'caches' },
      { id: 'e10', source: 'message-handler', target: 'postgres', type: 'PERSISTS', label: 'persists' },
      { id: 'e11', source: 'message-handler', target: 'queue', type: 'ENQUEUES', label: 'enqueues' },
      { id: 'e12', source: 'auth', target: 'redis', type: 'STORES', label: 'sessions' },
      { id: 'e13', source: 'redis', target: 'ws-server', type: 'PUBSUB', label: 'pub/sub' },
    ],
    metadata: {
      name: 'Real-Time Chat Backend Architecture',
      description: 'Complete WebSocket integration architecture with Stash',
    },
  };

  return [
    // Welcome message
    {
      type: 'text',

      id: 'ws-tutorial-1',
      type: 'text',
      content: "I want to build a real-time chat application with Stash. Where do I start?",
      sender: { id: 'user-tutorial', name: 'You', avatar: '👤' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: true,
    },
    {
      type: 'text',

      id: 'ws-tutorial-2',
      type: 'text',
      content: "# Tutorial: Real-Time WebSocket Integration with Stash\n\nGreat question! Let me walk you through building a production-ready real-time chat application with Stash.\n\n## What You'll Learn\n\n✅ Installing and configuring Stash\n✅ Setting up a WebSocket backend (Node.js + Socket.IO)\n✅ Implementing database persistence (PostgreSQL)\n✅ Configuring Redis for caching and pub/sub\n✅ Wiring up the frontend with WebSocketChatService\n✅ Handling real-time events (messages, typing, presence)\n✅ Managing state and offline support\n✅ Testing and deployment strategies\n\nThis tutorial covers **everything** from installation to production deployment. Let's get started!",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.01),
      status: 'delivered',
      isOwn: false,
    },

    // Implementation timeline Gantt chart
    {
      type: 'text',

      id: 'ws-tutorial-3',
      content: "## Implementation Timeline\n\nFirst, let's visualize the complete implementation roadmap. Here's a Gantt chart showing all phases from setup to production deployment (approximately 5 weeks).\n\nClick the expand button (⛶) to see the full interactive timeline with dependencies and milestones!",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.02),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'gantt-chart',
        data: {
          tasks: implementationTasks,
          title: 'WebSocket Integration Roadmap',
          subtitle: `${implementationTasks.length} tasks • 5-week timeline`,
          mode: 'preview',
          showProgress: true,
          showMilestones: true,
          allTasks: implementationTasks,
        },
      },
    },

    // Phase 1: Installation
    {
      type: 'text',

      id: 'ws-tutorial-4',
      content: "Let's begin with Phase 1: Setup & Installation",
      sender: { id: 'user-tutorial', name: 'You', avatar: '👤' },
      timestamp: addHours(new Date(), 0.03),
      status: 'delivered',
      isOwn: true,
    },
    {
      type: 'text',

      id: 'ws-tutorial-5',
      content: "Perfect! Let's start.",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.04),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'task-list',
        data: {
          tasks: [{
            id: 'install-task',
            title: '📦 Step 1: Install Stash Library',
            description: 'Install Stash and required dependencies using npm or yarn',
            startDate: new Date(),
            endDate: addHours(new Date(), 1),
            progress: 0,
            status: 'in-progress',
            priority: 'critical',
            assignee: 'You',
          }],
          title: 'Current Step',
          subtitle: 'Installing Stash',
        },
      },
    },
    {
      type: 'text',

      id: 'ws-tutorial-6',
      content: "## Step 1: Install Stash Library\n\nFirst, install Stash and its peer dependencies in your React Native project:",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.05),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `# Using npm
npm install stash react-native-svg date-fns expo-av

# Or using yarn
yarn add stash react-native-svg date-fns expo-av

# For Expo projects, install additional dependencies
npx expo install react-native-svg expo-av`,
          language: 'bash',
          fileName: 'installation.sh',
          title: 'Installation Commands',
          mode: 'preview',
        },
      },
    },

    // TypeScript Configuration
    {
      type: 'text',

      id: 'ws-tutorial-7',
      content: "What's next after installation?",
      sender: { id: 'user-tutorial', name: 'You', avatar: '👤' },
      timestamp: addHours(new Date(), 0.06),
      status: 'delivered',
      isOwn: true,
    },
    {
      type: 'text',

      id: 'ws-tutorial-8',
      content: "Now let's configure TypeScript for better development experience.",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.07),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'task-list',
        data: {
          tasks: [{
            id: 'typescript-task',
            title: '🔧 Step 2: Configure TypeScript',
            description: 'Set up TypeScript configuration for Stash types',
            startDate: addHours(new Date(), 1),
            endDate: addHours(new Date(), 2),
            progress: 0,
            status: 'in-progress',
            priority: 'high',
            assignee: 'You',
          }],
          title: 'Current Step',
          subtitle: 'Configuring TypeScript',
        },
      },
    },
    {
      type: 'text',

      id: 'ws-tutorial-9',
      content: "## Step 2: Configure TypeScript\n\nUpdate your `tsconfig.json` to include Stash types:",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.08),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "jsx": "react-native",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src", "node_modules/stash/dist"],
  "exclude": ["node_modules", "dist"]
}`,
          language: 'json',
          fileName: 'tsconfig.json',
          title: 'TypeScript Configuration',
          mode: 'preview',
        },
      },
    },

    // Import Components
    {
      type: 'text',

      id: 'ws-tutorial-10',
      content: "## Step 3: Project Structure Setup\n\nFirst, let's set up the recommended folder structure for your WebSocket chat integration:",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.09),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'task-list',
        data: {
          tasks: [{
            id: 'import-task',
            title: '🎨 Step 3: Import Components',
            description: 'Import Chat, ChatLayout, and types from Stash',
            startDate: addHours(new Date(), 2),
            endDate: addHours(new Date(), 3),
            progress: 0,
            status: 'in-progress',
            priority: 'high',
            assignee: 'You',
          }],
          title: 'Current Step',
          subtitle: 'Setting up project structure',
        },
      },
    },
    {
      type: 'text',

      id: 'ws-tutorial-10a',
      content: "Here's the recommended project structure for organizing your WebSocket chat implementation:",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.091),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'tree-view',
        data: {
          data: {
            id: 'websocket-structure',
            title: 'WebSocket Chat Project Structure',
            description: 'Recommended folder organization',
            roots: [
              {
                id: 'src',
                label: 'src',
                type: 'folder',
                status: 'normal',
                children: [
                  {
                    id: 'screens',
                    label: 'screens',
                    type: 'folder',
                    status: 'normal',
                    children: [
                      { id: 'chat-screen', label: 'ChatScreen.tsx', type: 'file', status: 'normal', icon: '📱' },
                    ],
                  },
                  {
                    id: 'services',
                    label: 'services',
                    type: 'folder',
                    status: 'normal',
                    children: [
                      { id: 'websocket-service', label: 'CustomWebSocketService.ts', type: 'file', status: 'highlighted', icon: '🔌', badge: 'Core' },
                      { id: 'auth-service', label: 'AuthService.ts', type: 'file', status: 'normal', icon: '🔐' },
                    ],
                  },
                  {
                    id: 'context',
                    label: 'context',
                    type: 'folder',
                    status: 'normal',
                    children: [
                      { id: 'chat-context', label: 'ChatContext.tsx', type: 'file', status: 'highlighted', icon: '🗄️', badge: 'State' },
                    ],
                  },
                  {
                    id: 'types',
                    label: 'types',
                    type: 'folder',
                    status: 'normal',
                    children: [
                      { id: 'message-types', label: 'message.types.ts', type: 'file', status: 'normal', icon: '📝' },
                      { id: 'user-types', label: 'user.types.ts', type: 'file', status: 'normal', icon: '👤' },
                    ],
                  },
                  {
                    id: 'hooks',
                    label: 'hooks',
                    type: 'folder',
                    status: 'normal',
                    children: [
                      { id: 'use-websocket', label: 'useWebSocket.ts', type: 'file', status: 'normal', icon: '🪝' },
                      { id: 'use-chat', label: 'useChat.ts', type: 'file', status: 'normal', icon: '💬' },
                    ],
                  },
                  { id: 'app', label: 'App.tsx', type: 'file', status: 'normal', icon: '🚀' },
                ],
              },
              {
                id: 'backend',
                label: 'backend',
                type: 'folder',
                status: 'normal',
                children: [
                  { id: 'server', label: 'websocket-server.ts', type: 'file', status: 'highlighted', icon: '🔌', badge: 'Server' },
                  { id: 'redis-config', label: 'redis.config.ts', type: 'file', status: 'normal', icon: '⚡' },
                  { id: 'db-schema', label: 'schema.sql', type: 'file', status: 'normal', icon: '💾' },
                ],
              },
            ],
          },
        },
      },
    },
    {
      type: 'text',

      id: 'ws-tutorial-10b',
      content: "Now let's create the files. Start with importing the Stash components:",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.092),
      status: 'delivered',
      isOwn: false,
    },
    {
      type: 'text',

      id: 'ws-tutorial-11',
      content: "Here's how to import Stash components in your app:",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.1),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `import React from 'react';
import {
  Chat,
  ChatLayout,
  WebSocketChatService,
  type Message,
  type ChatService
} from 'stash';

// Import interactive components for rich messaging
import {
  TaskList,
  CodeBlock,
  GanttChart,
  TimeSeriesChart,
  GraphVisualization,
  Media
} from 'stash';

// You're ready to build!
export default function App() {
  return <Chat /* props */ />;
}`,
          language: 'typescript',
          fileName: 'App.tsx',
          title: 'Import Stash Components',
          mode: 'preview',
        },
      },
    },

    // Backend Architecture Overview
    {
      type: 'text',

      id: 'ws-tutorial-12',
      content: "Now I need to understand the backend architecture. What does a complete WebSocket setup look like?",
      sender: { id: 'user-tutorial', name: 'You', avatar: '👤' },
      timestamp: addHours(new Date(), 0.11),
      status: 'delivered',
      isOwn: true,
    },
    {
      type: 'text',

      id: 'ws-tutorial-13',
      content: "## Backend Architecture Overview\n\nGreat question! Here's a complete architecture diagram showing how all the pieces fit together.\n\nThis graph shows the **real-time chat backend architecture** including:\n\n🔵 **Client Layer** - Your React Native app with Stash components\n🟣 **WebSocket Layer** - Real-time bidirectional communication\n🟢 **API Layer** - REST API for HTTP fallback and authentication\n🔴 **Business Logic** - Message handling, presence, typing indicators\n💾 **Data Layer** - PostgreSQL for persistence, Redis for caching/pub-sub, Message Queue for async processing\n\nClick nodes to explore each component's role!",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.12),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'graph-visualization',
        data: {
          data: backendArchitecture,
          title: 'Real-Time Chat Backend Architecture',
          subtitle: 'Complete WebSocket integration with Stash',
          mode: 'preview',
          layout: 'force',
        },
      },
    },

    // Database Schema
    {
      type: 'text',

      id: 'ws-tutorial-14',
      content: "Let's dive into the database design.",
      sender: { id: 'user-tutorial', name: 'You', avatar: '👤' },
      timestamp: addHours(new Date(), 0.13),
      status: 'delivered',
      isOwn: true,
    },
    {
      type: 'text',

      id: 'ws-tutorial-15',
      content: "Perfect! Let's set up the database schema.",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.14),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'task-list',
        data: {
          tasks: [{
            id: 'db-task',
            title: '💾 Step 4: Set Up Database Schema',
            description: 'Create PostgreSQL tables for messages, users, and chat rooms',
            startDate: addDays(new Date(), 2),
            endDate: addDays(new Date(), 3),
            progress: 0,
            status: 'in-progress',
            priority: 'critical',
            assignee: 'Backend Team',
          }],
          title: 'Current Step',
          subtitle: 'Database Schema Design',
        },
      },
    },
    {
      type: 'text',

      id: 'ws-tutorial-16',
      content: "## Step 4: Database Schema Design\n\nHere's a complete PostgreSQL schema for your chat application:",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.15),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_seen_at TIMESTAMP,
  is_online BOOLEAN DEFAULT false
);

-- Chat rooms table
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'direct', 'group', 'channel'
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Room participants
CREATE TABLE room_participants (
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  last_read_at TIMESTAMP,
  PRIMARY KEY (room_id, user_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'file', 'interactive'
  metadata JSONB, -- For interactive components, attachments, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_messages_room_created ON messages(room_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_room_participants_user ON room_participants(user_id);`,
          language: 'sql',
          fileName: 'schema.sql',
          title: 'PostgreSQL Database Schema',
          mode: 'preview',
        },
      },
    },

    // Redis Configuration
    {
      type: 'text',

      id: 'ws-tutorial-17',
      content: "## Step 5: Configure Redis Cache\n\nRedis is crucial for real-time features. Let's set it up:",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.16),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'task-list',
        data: {
          tasks: [{
            id: 'redis-task',
            title: '⚡ Step 5: Configure Redis Cache',
            description: 'Set up Redis for sessions, caching, and pub/sub',
            startDate: addDays(new Date(), 3),
            endDate: addDays(new Date(), 4),
            progress: 0,
            status: 'in-progress',
            priority: 'high',
            assignee: 'Backend Team',
          }],
          title: 'Current Step',
          subtitle: 'Redis Configuration',
        },
      },
    },
    {
      type: 'text',

      id: 'ws-tutorial-18',
      content: "Redis handles three critical features:\n\n1. **Session Management** - Store active WebSocket connections\n2. **Message Caching** - Cache recent messages for fast retrieval\n3. **Pub/Sub** - Broadcast messages across multiple server instances\n\nHere's the configuration:",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.17),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `import Redis from 'ioredis';

// Create Redis clients
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 0,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Separate client for pub/sub
const redisPubClient = redisClient.duplicate();
const redisSubClient = redisClient.duplicate();

// Session management
export async function saveUserSession(userId: string, socketId: string) {
  await redisClient.hset(\`user:\${userId}\`, 'socketId', socketId);
  await redisClient.hset(\`user:\${userId}\`, 'lastSeen', Date.now());
  await redisClient.expire(\`user:\${userId}\`, 86400); // 24 hours
}

// Message caching (cache last 100 messages per room)
export async function cacheMessage(roomId: string, message: any) {
  const key = \`room:\${roomId}:messages\`;
  await redisClient.lpush(key, JSON.stringify(message));
  await redisClient.ltrim(key, 0, 99); // Keep only 100 messages
  await redisClient.expire(key, 3600); // 1 hour TTL
}

// Pub/Sub for multi-server broadcasting
export function publishMessage(channel: string, message: any) {
  redisPubClient.publish(channel, JSON.stringify(message));
}

export function subscribeToChannel(channel: string, handler: Function) {
  redisSubClient.subscribe(channel);
  redisSubClient.on('message', (ch, msg) => {
    if (ch === channel) handler(JSON.parse(msg));
  });
}`,
          language: 'typescript',
          fileName: 'redis.config.ts',
          title: 'Redis Configuration',
          mode: 'preview',
        },
      },
    },

    // WebSocket Server Implementation
    {
      type: 'text',

      id: 'ws-tutorial-19',
      content: "Now show me how to build the WebSocket server.",
      sender: { id: 'user-tutorial', name: 'You', avatar: '👤' },
      timestamp: addHours(new Date(), 0.18),
      status: 'delivered',
      isOwn: true,
    },
    {
      type: 'text',

      id: 'ws-tutorial-20',
      content: "Great! Here's a complete WebSocket server implementation using Socket.IO.",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.19),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'task-list',
        data: {
          tasks: [{
            id: 'ws-server-task',
            title: '🔌 Step 6: Implement WebSocket Server',
            description: 'Build WebSocket server with Socket.IO for real-time messaging',
            startDate: addDays(new Date(), 4),
            endDate: addDays(new Date(), 7),
            progress: 0,
            status: 'in-progress',
            priority: 'critical',
            assignee: 'Backend Team',
          }],
          title: 'Current Step',
          subtitle: 'WebSocket Server Implementation',
        },
      },
    },
    {
      type: 'text',

      id: 'ws-tutorial-21',
      content: "## Step 6: WebSocket Server Implementation\n\nHere's a production-ready WebSocket server with Socket.IO:",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.2),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import { verifyToken } from './auth';
import {
  saveUserSession,
  cacheMessage,
  publishMessage,
  subscribeToChannel
} from './redis.config';
import { saveMessageToDb, getRecentMessages } from './database';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const user = await verifyToken(token);
    socket.data.userId = user.id;
    socket.data.username = user.username;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
});

// Connection handler
io.on('connection', async (socket) => {
  const userId = socket.data.userId;
  const username = socket.data.username;

  console.log(\`User connected: \${username} (socket: \${socket.id})\`);

  // Save user session
  await saveUserSession(userId, socket.id);

  // Join user's rooms
  const userRooms = await getUserRooms(userId);
  userRooms.forEach(roomId => socket.join(roomId));

  // Handle joining a room
  socket.on('join_room', async (roomId: string) => {
    socket.join(roomId);

    // Send recent messages
    const messages = await getRecentMessages(roomId, 50);
    socket.emit('room_messages', { roomId, messages });

    // Notify others
    socket.to(roomId).emit('user_joined', { userId, username });
  });

  // Handle sending a message
  socket.on('send_message', async (data: {
    roomId: string;
    content: string;
    messageType?: string;
    metadata?: any;
  }) => {
    const message = {
      id: crypto.randomUUID(),
      roomId: data.roomId,
      senderId: userId,
      senderName: username,
      content: data.content,
      messageType: data.messageType || 'text',
      metadata: data.metadata,
      timestamp: new Date().toISOString(),
    };

    // Save to database
    await saveMessageToDb(message);

    // Cache in Redis
    await cacheMessage(data.roomId, message);

    // Broadcast to all servers (for horizontal scaling)
    publishMessage(\`room:\${data.roomId}\`, message);

    // Send to room participants
    io.to(data.roomId).emit('new_message', message);
  });

  // Handle typing indicator
  socket.on('typing', (data: { roomId: string; isTyping: boolean }) => {
    socket.to(data.roomId).emit('user_typing', {
      userId,
      username,
      isTyping: data.isTyping,
    });
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    console.log(\`User disconnected: \${username}\`);

    // Update user status
    await updateUserStatus(userId, false);

    // Notify all rooms
    userRooms.forEach(roomId => {
      io.to(roomId).emit('user_left', { userId, username });
    });
  });
});

// Subscribe to Redis pub/sub for horizontal scaling
subscribeToChannel('messages', (message: any) => {
  io.to(message.roomId).emit('new_message', message);
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(\`WebSocket server running on port \${PORT}\`);
});`,
          language: 'typescript',
          fileName: 'websocket-server.ts',
          title: 'WebSocket Server with Socket.IO',
          mode: 'preview',
        },
      },
    },

    // Frontend WebSocketChatService
    {
      type: 'text',

      id: 'ws-tutorial-22',
      content: "Now how do I connect my Stash frontend to this WebSocket server?",
      sender: { id: 'user-tutorial', name: 'You', avatar: '👤' },
      timestamp: addHours(new Date(), 0.21),
      status: 'delivered',
      isOwn: true,
    },
    {
      type: 'text',

      id: 'ws-tutorial-23',
      content: "Perfect! Let's create a custom WebSocketChatService that connects to your backend.",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.22),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'task-list',
        data: {
          tasks: [{
            id: 'frontend-service-task',
            title: '🔗 Step 7: Create WebSocketChatService',
            description: 'Implement frontend WebSocket client extending Stash base service',
            startDate: addDays(new Date(), 7),
            endDate: addDays(new Date(), 9),
            progress: 0,
            status: 'in-progress',
            priority: 'critical',
            assignee: 'Frontend Team',
          }],
          title: 'Current Step',
          subtitle: 'Frontend WebSocket Integration',
        },
      },
    },
    {
      type: 'text',

      id: 'ws-tutorial-24',
      content: "## Step 7: Create Custom WebSocketChatService\n\nStash provides a base `WebSocketChatService` class. Here's how to customize it for your backend:",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.23),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `import { WebSocketChatService } from 'stash';
import io, { Socket } from 'socket.io-client';
import type { Message } from 'stash';

export class CustomWebSocketService extends WebSocketChatService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(private serverUrl: string, private authToken: string) {
    super();
  }

  // Connect to WebSocket server
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl, {
        auth: { token: this.authToken },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit('connected');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        this.emit('error', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        this.emit('disconnected', reason);
      });

      // Handle incoming messages
      this.socket.on('new_message', (message: Message) => {
        this.emit('message', message);
      });

      // Handle typing indicators
      this.socket.on('user_typing', (data: any) => {
        this.emit('typing', data);
      });

      // Handle user presence
      this.socket.on('user_joined', (data: any) => {
        this.emit('user_joined', data);
      });

      this.socket.on('user_left', (data: any) => {
        this.emit('user_left', data);
      });
    });
  }

  // Send a message
  async sendMessage(
    roomId: string,
    content: string,
    metadata?: any
  ): Promise<Message> {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    return new Promise((resolve, reject) => {
      const tempMessage: Message = {
        id: \`temp-\${Date.now()}\`,
        content,
        sender: { id: 'current-user', name: 'You' },
        timestamp: new Date(),
        status: 'sending',
        isOwn: true,
        metadata,
      };

      // Optimistic update
      this.emit('message', tempMessage);

      this.socket!.emit('send_message', {
        roomId,
        content,
        metadata,
      }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.message);
        }
      });
    });
  }

  // Join a chat room
  async joinRoom(roomId: string): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    this.socket.emit('join_room', roomId);
  }

  // Send typing indicator
  setTyping(roomId: string, isTyping: boolean): void {
    if (this.socket?.connected) {
      this.socket.emit('typing', { roomId, isTyping });
    }
  }

  // Disconnect
  async disconnect(): Promise<void> {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Usage in your app
const chatService = new CustomWebSocketService(
  'http://localhost:3000',
  'your-auth-token'
);

export default chatService;`,
          language: 'typescript',
          fileName: 'CustomWebSocketService.ts',
          title: 'Custom WebSocket Chat Service',
          mode: 'preview',
        },
      },
    },

    // Using the service in Chat component
    {
      type: 'text',

      id: 'ws-tutorial-25',
      content: "## Step 8: Wire Up the Chat Component\n\nNow let's use your custom service with the Stash Chat component:",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.24),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'task-list',
        data: {
          tasks: [{
            id: 'wire-up-task',
            title: '📡 Step 8: Wire Up Connection Logic',
            description: 'Connect Chat component to WebSocket service with reconnection handling',
            startDate: addDays(new Date(), 9),
            endDate: addDays(new Date(), 11),
            progress: 0,
            status: 'in-progress',
            priority: 'critical',
            assignee: 'Frontend Team',
          }],
          title: 'Current Step',
          subtitle: 'Connecting Chat to WebSocket',
        },
      },
    },
    {
      type: 'text',

      id: 'ws-tutorial-26',
      content: "Here's how to integrate everything in your React Native app:",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.25),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Chat } from 'stash';
import type { Message } from 'stash';
import chatService from './CustomWebSocketService';

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const roomId = 'room-123'; // Your chat room ID

  useEffect(() => {
    // Initialize WebSocket connection
    const initWebSocket = async () => {
      try {
        await chatService.connect();
        await chatService.joinRoom(roomId);
        setIsConnected(true);
      } catch (error) {
        console.error('WebSocket connection failed:', error);
      }
    };

    // Set up event listeners
    chatService.on('message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    chatService.on('connected', () => {
      setIsConnected(true);
    });

    chatService.on('disconnected', () => {
      setIsConnected(false);
    });

    chatService.on('typing', (data) => {
      console.log('User typing:', data);
      // Handle typing indicator UI
    });

    initWebSocket();

    // Cleanup on unmount
    return () => {
      chatService.disconnect();
    };
  }, []);

  // Handle sending messages
  const handleSendMessage = async (content: string) => {
    try {
      const message = await chatService.sendMessage(roomId, content);
      console.log('Message sent:', message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Chat
        userId="current-user"
        chatType="group"
        chatId={roomId}
        messages={messages}
        onSendMessage={handleSendMessage}
        placeholder="Type a message..."
        showConnectionStatus={true}
        connectionStatus={isConnected ? 'connected' : 'disconnected'}
      />
    </View>
  );
}`,
          language: 'typescript',
          fileName: 'ChatScreen.tsx',
          title: 'Chat Component Integration',
          mode: 'preview',
        },
      },
    },

    // State Management
    {
      type: 'text',

      id: 'ws-tutorial-27',
      content: "How do I handle state management for a complex chat app?",
      sender: { id: 'user-tutorial', name: 'You', avatar: '👤' },
      timestamp: addHours(new Date(), 0.26),
      status: 'delivered',
      isOwn: true,
    },
    {
      type: 'text',

      id: 'ws-tutorial-28',
      content: "Great question! Let's implement proper state management with Context API and optimistic updates.",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.27),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'task-list',
        data: {
          tasks: [{
            id: 'state-mgmt-task',
            title: '🗄️ Step 9: Set Up State Management',
            description: 'Implement state management for messages, users, and connection status',
            startDate: addDays(new Date(), 14),
            endDate: addDays(new Date(), 16),
            progress: 0,
            status: 'in-progress',
            priority: 'high',
            assignee: 'Frontend Team',
          }],
          title: 'Current Step',
          subtitle: 'State Management',
        },
      },
    },
    {
      type: 'text',

      id: 'ws-tutorial-29',
      content: "## Step 9: State Management with Context API\n\nHere's a robust state management solution:",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.28),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { Message } from 'stash';
import chatService from './CustomWebSocketService';

// State types
interface ChatState {
  messages: Record<string, Message[]>; // roomId -> messages[]
  users: Record<string, UserPresence>;
  typingUsers: Record<string, string[]>; // roomId -> userIds[]
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  currentRoomId: string | null;
}

interface UserPresence {
  id: string;
  name: string;
  isOnline: boolean;
  lastSeen: Date;
}

// Actions
type ChatAction =
  | { type: 'ADD_MESSAGE'; roomId: string; message: Message }
  | { type: 'UPDATE_MESSAGE'; messageId: string; updates: Partial<Message> }
  | { type: 'SET_MESSAGES'; roomId: string; messages: Message[] }
  | { type: 'USER_TYPING'; roomId: string; userId: string; isTyping: boolean }
  | { type: 'UPDATE_USER_PRESENCE'; userId: string; presence: Partial<UserPresence> }
  | { type: 'SET_CONNECTION_STATUS'; status: ChatState['connectionStatus'] }
  | { type: 'SET_CURRENT_ROOM'; roomId: string | null };

// Reducer
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.roomId]: [
            ...(state.messages[action.roomId] || []),
            action.message,
          ],
        },
      };

    case 'UPDATE_MESSAGE':
      const updatedMessages = { ...state.messages };
      Object.keys(updatedMessages).forEach((roomId) => {
        updatedMessages[roomId] = updatedMessages[roomId].map((msg) =>
          msg.id === action.messageId ? { ...msg, ...action.updates } : msg
        );
      });
      return { ...state, messages: updatedMessages };

    case 'SET_MESSAGES':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.roomId]: action.messages,
        },
      };

    case 'USER_TYPING':
      const typing = { ...state.typingUsers };
      const roomTyping = typing[action.roomId] || [];

      if (action.isTyping && !roomTyping.includes(action.userId)) {
        typing[action.roomId] = [...roomTyping, action.userId];
      } else if (!action.isTyping) {
        typing[action.roomId] = roomTyping.filter(id => id !== action.userId);
      }

      return { ...state, typingUsers: typing };

    case 'UPDATE_USER_PRESENCE':
      return {
        ...state,
        users: {
          ...state.users,
          [action.userId]: {
            ...state.users[action.userId],
            ...action.presence,
          },
        },
      };

    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.status };

    case 'SET_CURRENT_ROOM':
      return { ...state, currentRoomId: action.roomId };

    default:
      return state;
  }
}

// Context
const ChatContext = createContext<{
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
} | null>(null);

// Provider
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, {
    messages: {},
    users: {},
    typingUsers: {},
    connectionStatus: 'disconnected',
    currentRoomId: null,
  });

  useEffect(() => {
    // Set up WebSocket event listeners
    chatService.on('message', (message: Message) => {
      dispatch({
        type: 'ADD_MESSAGE',
        roomId: state.currentRoomId!,
        message,
      });
    });

    chatService.on('typing', (data: any) => {
      dispatch({
        type: 'USER_TYPING',
        roomId: data.roomId,
        userId: data.userId,
        isTyping: data.isTyping,
      });
    });

    chatService.on('connected', () => {
      dispatch({ type: 'SET_CONNECTION_STATUS', status: 'connected' });
    });

    chatService.on('disconnected', () => {
      dispatch({ type: 'SET_CONNECTION_STATUS', status: 'disconnected' });
    });
  }, [state.currentRoomId]);

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
}

// Hook
export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
}`,
          language: 'typescript',
          fileName: 'ChatContext.tsx',
          title: 'State Management with Context API',
          mode: 'preview',
        },
      },
    },

    // Testing
    {
      type: 'text',

      id: 'ws-tutorial-30',
      content: "What about testing? How do I test WebSocket functionality?",
      sender: { id: 'user-tutorial', name: 'You', avatar: '👤' },
      timestamp: addHours(new Date(), 0.29),
      status: 'delivered',
      isOwn: true,
    },
    {
      type: 'text',

      id: 'ws-tutorial-31',
      content: "Excellent question! Testing is critical for real-time apps. Let me show you comprehensive testing strategies.",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.3),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'task-list',
        data: {
          tasks: [
            {
              id: 'unit-test-task',
              title: '🧪 Step 10: Unit Testing',
              description: 'Write unit tests for WebSocket service and message handlers',
              startDate: addDays(new Date(), 21),
              endDate: addDays(new Date(), 23),
              progress: 0,
              status: 'in-progress',
              priority: 'high',
              assignee: 'QA Team',
            },
            {
              id: 'integration-test-task',
              title: '🔬 Step 11: Integration Testing',
              description: 'Test end-to-end message flow and connection scenarios',
              startDate: addDays(new Date(), 23),
              endDate: addDays(new Date(), 25),
              progress: 0,
              status: 'pending',
              priority: 'high',
              assignee: 'QA Team',
            },
            {
              id: 'load-test-task',
              title: '📊 Step 12: Load Testing',
              description: 'Test with 1000+ concurrent connections and high message volume',
              startDate: addDays(new Date(), 25),
              endDate: addDays(new Date(), 28),
              progress: 0,
              status: 'pending',
              priority: 'medium',
              assignee: 'QA Team',
            },
          ],
          title: 'Testing Phase',
          subtitle: 'Comprehensive testing strategy',
        },
      },
    },
    {
      type: 'text',

      id: 'ws-tutorial-32',
      content: "## Step 10-12: Testing Strategy\n\nHere's a complete testing setup with Jest and Socket.IO mock:",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.31),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `import { CustomWebSocketService } from './CustomWebSocketService';
import { Server } from 'socket.io';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';

describe('WebSocket Integration Tests', () => {
  let io: Server;
  let serverSocket: any;
  let clientSocket: ClientSocket;
  let chatService: CustomWebSocketService;

  beforeAll((done) => {
    // Set up test server
    const httpServer = require('http').createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = httpServer.address().port;

      // Connect client
      clientSocket = ioc(\`http://localhost:\${port}\`, {
        auth: { token: 'test-token' },
      });

      io.on('connection', (socket) => {
        serverSocket = socket;
      });

      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  test('should connect to WebSocket server', async () => {
    chatService = new CustomWebSocketService(
      \`http://localhost:\${io.path()}\`,
      'test-token'
    );

    await expect(chatService.connect()).resolves.not.toThrow();
    expect(chatService.isConnected()).toBe(true);
  });

  test('should send and receive messages', (done) => {
    const testMessage = 'Hello, World!';

    // Server receives message
    serverSocket.on('send_message', (data: any, callback: Function) => {
      expect(data.content).toBe(testMessage);

      // Send back to client
      serverSocket.emit('new_message', {
        id: '123',
        content: data.content,
        sender: { id: 'user-1', name: 'Test User' },
        timestamp: new Date(),
      });

      callback({ success: true });
    });

    // Client receives message
    chatService.on('message', (message) => {
      expect(message.content).toBe(testMessage);
      done();
    });

    chatService.sendMessage('room-1', testMessage);
  });

  test('should handle typing indicators', (done) => {
    serverSocket.on('typing', (data: any) => {
      expect(data.isTyping).toBe(true);
      done();
    });

    chatService.setTyping('room-1', true);
  });

  test('should handle disconnection gracefully', async () => {
    await chatService.disconnect();
    expect(chatService.isConnected()).toBe(false);
  });

  test('should reconnect after connection loss', (done) => {
    chatService.on('connected', () => {
      done();
    });

    // Simulate reconnection
    chatService.connect();
  });
});

// Load testing with Artillery
describe('Load Testing', () => {
  test('should handle 1000 concurrent connections', async () => {
    // Use Artillery or k6 for load testing
    // artillery.yml configuration:
    /*
    config:
      target: 'http://localhost:3000'
      phases:
        - duration: 60
          arrivalRate: 50
          name: Ramp up
    scenarios:
      - name: 'WebSocket Connection Test'
        engine: socketio
        flow:
          - emit:
              channel: 'send_message'
              data:
                roomId: 'test-room'
                content: 'Load test message'
          - think: 1
    */
  });
});`,
          language: 'typescript',
          fileName: 'websocket.test.ts',
          title: 'WebSocket Testing Suite',
          mode: 'preview',
        },
      },
    },

    // Deployment
    {
      type: 'text',

      id: 'ws-tutorial-33',
      content: "Finally, how do I deploy this to production?",
      sender: { id: 'user-tutorial', name: 'You', avatar: '👤' },
      timestamp: addHours(new Date(), 0.32),
      status: 'delivered',
      isOwn: true,
    },
    {
      type: 'text',

      id: 'ws-tutorial-34',
      content: "Great! Let's cover deployment best practices for production.",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.33),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'task-list',
        data: {
          tasks: [
            {
              id: 'deploy-staging-task',
              title: '🚀 Step 13: Deploy to Staging',
              description: 'Deploy WebSocket infrastructure to staging environment',
              startDate: addDays(new Date(), 28),
              endDate: addWeeks(new Date(), 4),
              progress: 0,
              status: 'in-progress',
              priority: 'high',
              assignee: 'DevOps',
            },
            {
              id: 'monitor-task',
              title: '📈 Step 14: Monitor & Optimize',
              description: 'Set up monitoring, logging, and performance optimization',
              startDate: addWeeks(new Date(), 4),
              endDate: addWeeks(new Date(), 4.5),
              progress: 0,
              status: 'pending',
              priority: 'medium',
              assignee: 'DevOps',
            },
            {
              id: 'prod-deploy-task',
              title: '✅ Step 15: Production Deployment',
              description: 'Deploy to production with gradual rollout',
              startDate: addWeeks(new Date(), 4.5),
              endDate: addWeeks(new Date(), 5),
              progress: 0,
              status: 'pending',
              priority: 'critical',
              assignee: 'DevOps',
            },
          ],
          title: 'Deployment Phase',
          subtitle: 'Production deployment checklist',
        },
      },
    },
    {
      type: 'text',

      id: 'ws-tutorial-35',
      content: "## Step 13-15: Production Deployment\n\nHere's a Docker Compose setup for production deployment:",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.34),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `version: '3.8'

services:
  # WebSocket Server (scale horizontally)
  websocket-server:
    build: ./backend
    environment:
      - NODE_ENV=production
      - REDIS_HOST=redis
      - POSTGRES_HOST=postgres
      - JWT_SECRET=\${JWT_SECRET}
    ports:
      - "3000-3004:3000"
    depends_on:
      - redis
      - postgres
    deploy:
      replicas: 5
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    networks:
      - chat-network

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=chatdb
      - POSTGRES_USER=chatuser
      - POSTGRES_PASSWORD=\${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - chat-network

  # Redis for caching and pub/sub
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass \${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    networks:
      - chat-network

  # Nginx Load Balancer
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - websocket-server
    networks:
      - chat-network

volumes:
  postgres-data:
  redis-data:

networks:
  chat-network:
    driver: bridge`,
          language: 'yaml',
          fileName: 'docker-compose.yml',
          title: 'Production Docker Compose Setup',
          mode: 'preview',
        },
      },
    },

    // Summary
    {
      type: 'text',

      id: 'ws-tutorial-36',
      content: "## 🎉 Tutorial Complete!\n\nCongratulations! You've learned how to build a production-ready real-time chat application with Stash.\n\n## What You've Accomplished\n\n✅ Installed and configured Stash\n✅ Designed a complete WebSocket backend architecture\n✅ Set up PostgreSQL database with proper schema\n✅ Configured Redis for caching and pub/sub\n✅ Implemented a WebSocket server with Socket.IO\n✅ Created a custom WebSocketChatService\n✅ Wired up state management with Context API\n✅ Implemented comprehensive testing\n✅ Deployed to production with Docker\n\n## Next Steps\n\n🔸 Add file uploads and media sharing\n🔸 Implement message reactions and threads\n🔸 Add end-to-end encryption\n🔸 Build notification systems\n🔸 Scale to millions of users\n\n## Resources\n\n📚 [Stash Documentation](https://stash.dev/docs)\n💬 [Community Discord](https://discord.gg/stash)\n🐛 [GitHub Issues](https://github.com/stash/stash/issues)\n\nHappy coding! 🚀",
      sender: { id: 'ai-tutorial', name: 'Stash Tutorial', avatar: '📚' },
      timestamp: addHours(new Date(), 0.35),
      status: 'delivered',
      isOwn: false,
    },
  ];
};
