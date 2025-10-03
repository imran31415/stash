import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chat } from '../../src/components/Chat/Chat';
import type { Message } from '../../src/components/Chat/types';
import { addDays, addWeeks, addHours, subDays } from 'date-fns';

const IntegratedAIHumanChatExample: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    // System message
    {
      id: '0',
      type: 'system',
      content: 'Welcome to the Project Management Chat! Ask me about timelines, tasks, and resources.',
      sender: { id: 'system', name: 'System' },
      timestamp: new Date(Date.now() - 300000),
      isOwn: false,
    },

    // User 1 asks for project timeline
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

    // AI responds with Gantt chart
    {
      id: '2',
      type: 'text',
      content: 'Sure! Here\'s the project timeline for the Q1 Website Redesign:',
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

    // User 2 asks about tasks
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

    // AI responds with task list
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

    // User 3 asks about resources
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

    // AI responds with resource list
    {
      id: '6',
      type: 'text',
      content: 'Yes! Here are all the available resources for the project:',
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
          title: 'Project Resources',
          subtitle: 'Documents & Assets',
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

    // User 4 responds
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

    // User asks about performance metrics
    {
      id: '8',
      type: 'text',
      content: 'Can we see the current website performance metrics? I want to compare with our targets.',
      sender: {
        id: 'user1',
        name: 'Sarah Chen',
        avatar: undefined,
      },
      timestamp: new Date(Date.now() - 30000),
      status: 'read',
      isOwn: false,
    },

    // AI responds with time series chart
    {
      id: '9',
      type: 'text',
      content: 'Here are the key performance metrics for the last 7 days:',
      sender: {
        id: 'ai',
        name: 'AI Assistant',
        avatar: undefined,
      },
      timestamp: new Date(Date.now() - 25000),
      status: 'read',
      isOwn: false,
      interactiveComponent: {
        type: 'time-series-chart',
        data: {
          title: 'Website Performance Metrics',
          subtitle: 'Last 7 days',
          mode: 'mini',
          series: [
            {
              id: 'page-views',
              name: 'Page Views',
              color: '#3B82F6',
              data: Array.from({ length: 84 }, (_, i) => ({
                timestamp: addHours(subDays(new Date(), 7), i * 2),
                value: 5000 + Math.random() * 2000 + Math.sin(i / 12) * 1500,
                label: `Point ${i + 1}`,
              })),
            },
            {
              id: 'unique-visitors',
              name: 'Unique Visitors',
              color: '#10B981',
              data: Array.from({ length: 84 }, (_, i) => ({
                timestamp: addHours(subDays(new Date(), 7), i * 2),
                value: 3500 + Math.random() * 1200 + Math.sin(i / 12) * 1000,
                label: `Point ${i + 1}`,
              })),
            },
            {
              id: 'bounce-rate',
              name: 'Bounce Rate %',
              color: '#EF4444',
              data: Array.from({ length: 84 }, (_, i) => ({
                timestamp: addHours(subDays(new Date(), 7), i * 2),
                value: 35 + Math.random() * 15 + Math.sin(i / 8) * 8,
                label: `Point ${i + 1}`,
              })),
            },
          ],
          showLegend: false,
          showGrid: true,
        },
      },
    },
  ]);

  const handleSendMessage = (newMessage: Message) => {
    setMessages((prev) => [...prev, newMessage]);

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
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <Chat
        userId="current-user"
        chatType="group"
        chatId="team-project-chat"
        messages={messages}
        onSendMessage={handleSendMessage}
        placeholder="Type a message..."
        enableWebSocket={false}
        enableHTTP={false}
        showConnectionStatus={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default IntegratedAIHumanChatExample;
