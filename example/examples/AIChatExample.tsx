import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chat, Message, User, ChatTheme } from '../../src/components/Chat';
import type { GraphData, GraphNode, GraphEdge } from '../../src/components/Chat/InteractiveComponents';
import { addDays, addWeeks } from 'date-fns';

const MOCK_USER: User = {
  id: 'user-1',
  name: 'You',
};

const AI_USER: User = {
  id: 'ai-assistant',
  name: 'AI Assistant',
};

// Sample graph data (Neo4j-like structure)
const SAMPLE_GRAPH_DATA: GraphData = {
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
      labels: ['Person', 'Employee'],
      properties: { name: 'Frank Chen', role: 'Senior Engineer', department: 'Technology' },
      color: '#10B981',
    },
    {
      id: '7',
      labels: ['Person', 'Employee'],
      properties: { name: 'Grace Kim', role: 'Product Manager', department: 'Product' },
      color: '#8B5CF6',
    },
    {
      id: '8',
      labels: ['Project'],
      properties: { name: 'Mobile App Redesign', status: 'In Progress', priority: 'High' },
      color: '#EF4444',
    },
    {
      id: '9',
      labels: ['Project'],
      properties: { name: 'API v2.0', status: 'Planning', priority: 'Critical' },
      color: '#EF4444',
    },
    {
      id: '10',
      labels: ['Department'],
      properties: { name: 'Technology', budget: 5000000, headcount: 45 },
      color: '#06B6D4',
    },
    {
      id: '11',
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
      properties: { since: '2020-01-01' },
      directed: true,
    },
    {
      id: 'e2',
      type: 'REPORTS_TO',
      source: '3',
      target: '1',
      properties: { since: '2020-01-01' },
      directed: true,
    },
    {
      id: 'e3',
      type: 'REPORTS_TO',
      source: '4',
      target: '2',
      properties: { since: '2021-03-15' },
      directed: true,
    },
    {
      id: 'e4',
      type: 'REPORTS_TO',
      source: '5',
      target: '1',
      properties: { since: '2021-06-01' },
      directed: true,
    },
    {
      id: 'e5',
      type: 'REPORTS_TO',
      source: '6',
      target: '4',
      properties: { since: '2022-01-10' },
      directed: true,
    },
    {
      id: 'e6',
      type: 'REPORTS_TO',
      source: '7',
      target: '5',
      properties: { since: '2022-08-20' },
      directed: true,
    },
    {
      id: 'e7',
      type: 'WORKS_ON',
      source: '6',
      target: '8',
      properties: { role: 'Lead Developer', hours_per_week: 40 },
      directed: false,
    },
    {
      id: 'e8',
      type: 'WORKS_ON',
      source: '7',
      target: '8',
      properties: { role: 'Product Owner', hours_per_week: 30 },
      directed: false,
    },
    {
      id: 'e9',
      type: 'WORKS_ON',
      source: '4',
      target: '9',
      properties: { role: 'Technical Lead', hours_per_week: 20 },
      directed: false,
    },
    {
      id: 'e10',
      type: 'BELONGS_TO',
      source: '2',
      target: '10',
      directed: true,
    },
    {
      id: 'e11',
      type: 'BELONGS_TO',
      source: '4',
      target: '10',
      directed: true,
    },
    {
      id: 'e12',
      type: 'BELONGS_TO',
      source: '6',
      target: '10',
      directed: true,
    },
    {
      id: 'e13',
      type: 'BELONGS_TO',
      source: '5',
      target: '11',
      directed: true,
    },
    {
      id: 'e14',
      type: 'BELONGS_TO',
      source: '7',
      target: '11',
      directed: true,
    },
    {
      id: 'e15',
      type: 'COLLABORATES_WITH',
      source: '4',
      target: '5',
      properties: { projects: 3, frequency: 'Weekly' },
      directed: false,
    },
  ],
  metadata: {
    name: 'Company Organization Graph',
    description: 'Organizational structure and project relationships',
    nodeCount: 11,
    edgeCount: 15,
  },
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    type: 'system',
    content: 'AI Assistant is ready to help! 🤖',
    sender: { id: 'system', name: 'System' },
    timestamp: new Date(Date.now() - 60000),
    isOwn: false,
  },
  {
    id: 'msg-2',
    type: 'text',
    content: 'Hello! I\'m your AI assistant. How can I help you today?',
    sender: AI_USER,
    timestamp: new Date(Date.now() - 45000),
    status: 'delivered',
    isOwn: false,
  },
  {
    id: 'msg-3',
    type: 'text',
    content: 'Can you show me the current project tasks?',
    sender: MOCK_USER,
    timestamp: new Date(Date.now() - 30000),
    status: 'read',
    isOwn: true,
  },
  {
    id: 'msg-4',
    type: 'text',
    content: 'Here are your current project tasks:',
    sender: AI_USER,
    timestamp: new Date(Date.now() - 25000),
    status: 'delivered',
    isOwn: false,
    interactiveComponent: {
      type: 'task-list',
      data: {
        title: 'Active Tasks',
        subtitle: '3 tasks in progress',
        tasks: [
          {
            id: '1',
            title: 'Design landing page',
            description: 'Create wireframes and mockups',
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
            description: 'Add OAuth and JWT',
            startDate: addDays(new Date(), 1),
            endDate: addDays(new Date(), 7),
            progress: 30,
            status: 'in-progress',
            priority: 'critical',
            assignee: 'John Doe',
          },
          {
            id: '3',
            title: 'Write documentation',
            description: 'API docs',
            startDate: addDays(new Date(), 3),
            endDate: addDays(new Date(), 10),
            progress: 0,
            status: 'pending',
            priority: 'medium',
            assignee: 'Alex Kim',
          },
        ],
      },
      onAction: (action, data) => console.log('Action:', action, data),
    },
  },
  {
    id: 'msg-5',
    type: 'text',
    content: 'Show me the project timeline',
    sender: MOCK_USER,
    timestamp: new Date(Date.now() - 15000),
    status: 'read',
    isOwn: true,
  },
  {
    id: 'msg-6',
    type: 'text',
    content: 'Here\'s the project timeline in a Gantt chart:',
    sender: AI_USER,
    timestamp: new Date(Date.now() - 10000),
    status: 'delivered',
    isOwn: false,
    interactiveComponent: {
      type: 'gantt-chart',
      data: {
        tasks: [
          {
            id: '1',
            title: 'Planning',
            startDate: new Date(),
            endDate: addDays(new Date(), 5),
            progress: 100,
            status: 'completed',
            priority: 'high',
            assignee: 'Team',
          },
          {
            id: '2',
            title: 'Design',
            startDate: addDays(new Date(), 3),
            endDate: addDays(new Date(), 12),
            progress: 60,
            status: 'in-progress',
            priority: 'high',
            assignee: 'Sarah',
          },
          {
            id: '3',
            title: 'Development',
            startDate: addDays(new Date(), 10),
            endDate: addWeeks(new Date(), 4),
            progress: 20,
            status: 'in-progress',
            priority: 'critical',
            assignee: 'John',
            milestones: [
              {
                id: 'm1',
                title: 'Alpha',
                date: addWeeks(new Date(), 2),
                completed: false,
              },
            ],
          },
        ],
        mode: 'mini',
        title: 'Project Timeline',
        showProgress: true,
        showToday: true,
      },
      onAction: (action, data) => console.log('Gantt action:', action, data),
    },
  },
  {
    id: 'msg-7',
    type: 'text',
    content: 'What resources are available?',
    sender: MOCK_USER,
    timestamp: new Date(Date.now() - 5000),
    status: 'read',
    isOwn: true,
  },
  {
    id: 'msg-8',
    type: 'text',
    content: 'Here are the available resources:',
    sender: AI_USER,
    timestamp: new Date(Date.now() - 2000),
    status: 'delivered',
    isOwn: false,
    interactiveComponent: {
      type: 'resource-list',
      data: {
        title: 'Company Resources',
        subtitle: 'Documents and reports',
        resources: [
          {
            id: '1',
            title: 'Q4 Financial Report',
            description: 'Comprehensive financial analysis',
            category: 'Finance',
            status: 'Active',
            priority: 'high',
            icon: '📊',
            tags: ['finance', 'quarterly'],
            updatedAt: new Date(),
          },
          {
            id: '2',
            title: 'Marketing Strategy',
            description: '2025 product launch plan',
            category: 'Marketing',
            status: 'Draft',
            priority: 'medium',
            icon: '📱',
            tags: ['marketing', 'strategy'],
            updatedAt: addDays(new Date(), -2),
          },
          {
            id: '3',
            title: 'Engineering Roadmap',
            description: 'Next 6 months technical plan',
            category: 'Engineering',
            status: 'Active',
            priority: 'critical',
            icon: '🚀',
            tags: ['engineering', 'roadmap'],
            updatedAt: addDays(new Date(), -1),
          },
        ],
        adaptiveHeight: true,
        showCategory: true,
        showStatus: true,
      },
      onAction: (action, data) => console.log('Resource action:', action, data),
    },
  },
  {
    id: 'msg-9',
    type: 'text',
    content: 'Can you show me the company org chart?',
    sender: MOCK_USER,
    timestamp: new Date(Date.now() - 1000),
    status: 'read',
    isOwn: true,
  },
  {
    id: 'msg-10',
    type: 'text',
    content: 'Here\'s the organizational structure as a knowledge graph:',
    sender: AI_USER,
    timestamp: new Date(),
    status: 'delivered',
    isOwn: false,
    interactiveComponent: {
      type: 'graph-visualization',
      data: {
        data: SAMPLE_GRAPH_DATA,
        title: 'Company Organization Graph',
        subtitle: '11 nodes • 15 relationships',
        mode: 'mini',
        showLabels: true,
        enablePhysics: true,
        maxVisibleNodes: 50,
      },
      onAction: (action, data) => console.log('Graph action:', action, data),
    },
  },
];

const AI_THEME: ChatTheme = {
  primaryColor: '#8B5CF6',
  backgroundColor: '#F9FAFB',
  messageBackgroundOwn: '#8B5CF6',
  messageBackgroundOther: '#EDE9FE',
  textColorOwn: '#FFFFFF',
  textColorOther: '#5B21B6',
  inputBackgroundColor: '#FFFFFF',
  borderColor: '#E5E7EB',
};

export default function AIChatExample() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);

  const handleSendMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const getAuthToken = async () => {
    return 'mock-token-123';
  };

  return (
    <View style={styles.container}>
      <Chat
        userId={MOCK_USER.id}
        chatType="ai"
        chatId="ai-assistant"
        messages={messages}
        onSendMessage={handleSendMessage}
        theme={AI_THEME}

        // WebSocket configuration
        enableWebSocket={true}
        wsConfig={{
          baseUrl: 'ws://localhost:8082',
          getAuthToken,
          tenantId: 'tenant-1',
          projectId: 'project-1',
        }}

        // HTTP fallback configuration
        enableHTTP={true}
        httpConfig={{
          baseUrl: 'http://localhost:8082/api',
        }}

        showConnectionStatus={true}
        showTypingIndicator={true}
        placeholder="Ask AI anything..."

        onMessagePress={(msg) => console.log('Message clicked:', msg)}
        onMessageLongPress={(msg) => console.log('Message long pressed:', msg)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
