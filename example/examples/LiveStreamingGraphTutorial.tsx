import React from 'react';
import type { Message, Task, TimeSeriesSeries } from '../../src/components/Chat';
import { addDays, addHours, addMinutes } from 'date-fns';

// Tutorial: Live Streaming Graphs with WebSockets and Stash
export const getLiveStreamingGraphTutorialMessages = (): Message[] => {
  // Implementation timeline for Gantt chart
  const implementationTasks: Task[] = [
    // Phase 1: Setup (Day 1)
    {
      id: 'setup-1',
      title: '📦 Install Dependencies',
      description: 'Install Stash library and WebSocket client',
      startDate: new Date(),
      endDate: addHours(new Date(), 1),
      progress: 100,
      status: 'completed',
      priority: 'critical',
      assignee: 'Developer',
    },
    {
      id: 'setup-2',
      title: '🎨 Import TimeSeriesChart Component',
      description: 'Import TimeSeriesChart and related types from Stash',
      startDate: addHours(new Date(), 1),
      endDate: addHours(new Date(), 2),
      progress: 100,
      status: 'completed',
      priority: 'high',
      assignee: 'Developer',
    },

    // Phase 2: Backend Setup (Day 1-2)
    {
      id: 'backend-1',
      title: '🔌 Set Up WebSocket Server',
      description: 'Create WebSocket endpoint for streaming data',
      startDate: addHours(new Date(), 2),
      endDate: addHours(new Date(), 6),
      progress: 80,
      status: 'in-progress',
      priority: 'critical',
      assignee: 'Backend Team',
    },
    {
      id: 'backend-2',
      title: '📊 Configure Data Stream',
      description: 'Set up data pipeline to push metrics to WebSocket',
      startDate: addHours(new Date(), 6),
      endDate: addDays(new Date(), 1),
      progress: 60,
      status: 'in-progress',
      priority: 'high',
      assignee: 'Backend Team',
    },

    // Phase 3: Frontend Integration (Day 2-3)
    {
      id: 'frontend-1',
      title: '⚛️ Implement Streaming Callback',
      description: 'Register callback to receive live data updates',
      startDate: addDays(new Date(), 1),
      endDate: addDays(new Date(), 2),
      progress: 40,
      status: 'in-progress',
      priority: 'critical',
      assignee: 'Frontend Team',
    },
    {
      id: 'frontend-2',
      title: '📈 Render Live Graph',
      description: 'Display TimeSeriesChart with streaming data',
      startDate: addDays(new Date(), 2),
      endDate: addDays(new Date(), 3),
      progress: 20,
      status: 'in-progress',
      priority: 'high',
      assignee: 'Frontend Team',
    },

    // Phase 4: Testing & Optimization (Day 3-4)
    {
      id: 'testing-1',
      title: '🧪 Performance Testing',
      description: 'Test with high-frequency data streams',
      startDate: addDays(new Date(), 3),
      endDate: addDays(new Date(), 4),
      progress: 0,
      status: 'pending',
      priority: 'medium',
      assignee: 'QA Team',
    },
    {
      id: 'testing-2',
      title: '🚀 Deploy to Production',
      description: 'Launch live streaming dashboard',
      startDate: addDays(new Date(), 4),
      endDate: addDays(new Date(), 5),
      progress: 0,
      status: 'pending',
      priority: 'critical',
      assignee: 'DevOps',
    },
  ];

  return [
    // Welcome message
    {
      id: 'tutorial-graph-1',
      content: 'How do I implement live streaming graphs with WebSockets using Stash?',
      sender: { id: 'user-tutorial', name: 'You', avatar: '👤' },
      timestamp: new Date(),
      type: 'text',
      isOwn: true,
    },
    {
      id: 'tutorial-graph-2',
      content:
        "Great question! Let me walk you through building **live streaming graphs** with Stash and WebSockets. This is perfect for real-time dashboards, monitoring systems, or live analytics.\n\nWe'll build a complete implementation in **4 phases**. Let's start with the roadmap:",
      sender: { id: 'ai-assistant', name: 'Stash AI', avatar: '🤖' },
      timestamp: addMinutes(new Date(), 1),
      type: 'text',
      isOwn: false,
    },

    // Project timeline
    {
      id: 'tutorial-graph-3',
      content: '',
      sender: { id: 'ai-assistant', name: 'Stash AI', avatar: '🤖' },
      timestamp: addMinutes(new Date(), 2),
      type: 'text',
      isOwn: false,
      interactiveComponent: {
        type: 'gantt-chart',
        data: {
          tasks: implementationTasks,
          title: '📊 Live Streaming Graph Implementation',
          subtitle: 'Complete integration roadmap',
          mode: 'preview',
        },
      },
    },

    // Phase 1: Installation
    {
      id: 'tutorial-graph-4',
      content: '## Phase 1: Installation & Setup\n\nFirst, install the required packages:',
      sender: { id: 'ai-assistant', name: 'Stash AI', avatar: '🤖' },
      timestamp: addMinutes(new Date(), 3),
      type: 'text',
      isOwn: false,
    },
    {
      id: 'tutorial-graph-5',
      content: '',
      sender: { id: 'ai-assistant', name: 'Stash AI', avatar: '🤖' },
      timestamp: addMinutes(new Date(), 4),
      type: 'text',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `# Install Stash library
npm install @stash/chat

# Install WebSocket client (if not already installed)
npm install socket.io-client`,
          language: 'bash',
          title: 'Install Dependencies',
          fileName: 'installation.sh',
        },
      },
    },

    // Phase 2: Import Components
    {
      id: 'tutorial-graph-6',
      content: '## Phase 2: Import Required Components\n\nImport the TimeSeriesChart and streaming utilities:',
      sender: { id: 'ai-assistant', name: 'Stash AI', avatar: '🤖' },
      timestamp: addMinutes(new Date(), 5),
      type: 'text',
      isOwn: false,
    },
    {
      id: 'tutorial-graph-7',
      content: '',
      sender: { id: 'ai-assistant', name: 'Stash AI', avatar: '🤖' },
      timestamp: addMinutes(new Date(), 6),
      type: 'text',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `import React, { useState, useEffect } from 'react';
import {
  Chat,
  TimeSeriesChart,
  TimeSeriesSeries,
  streamingCallbackRegistry,
} from '@stash/chat';
import io from 'socket.io-client';

// Your component
export const LiveDashboard = () => {
  // State for live data
  const [liveData, setLiveData] = useState<TimeSeriesSeries[]>([]);

  // ... implementation
};`,
          language: 'typescript',
          title: 'Import Components',
          fileName: 'LiveDashboard.tsx',
        },
      },
    },

    // Phase 3: WebSocket Setup
    {
      id: 'tutorial-graph-8',
      content:
        '## Phase 3: Set Up WebSocket Connection\n\nConnect to your WebSocket server and listen for data:',
      sender: { id: 'ai-assistant', name: 'Stash AI', avatar: '🤖' },
      timestamp: addMinutes(new Date(), 7),
      type: 'text',
      isOwn: false,
    },
    {
      id: 'tutorial-graph-9',
      content: '',
      sender: { id: 'ai-assistant', name: 'Stash AI', avatar: '🤖' },
      timestamp: addMinutes(new Date(), 8),
      type: 'text',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `useEffect(() => {
  // Connect to WebSocket server
  const socket = io('https://your-api.com', {
    transports: ['websocket'],
    auth: {
      token: 'your-auth-token',
    },
  });

  // Listen for metric updates
  socket.on('metrics:update', (data) => {
    console.log('Received metrics:', data);
    // Data format: { timestamp: Date, value: number, metric: string }
  });

  // Handle connection events
  socket.on('connect', () => {
    console.log('✅ Connected to metrics stream');
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from metrics stream');
  });

  // Cleanup on unmount
  return () => {
    socket.disconnect();
  };
}, []);`,
          language: 'typescript',
          title: 'WebSocket Connection',
          fileName: 'LiveDashboard.tsx',
        },
      },
    },

    // Phase 4: Streaming Callback
    {
      id: 'tutorial-graph-10',
      content:
        '## Phase 4: Register Streaming Callback\n\nStash provides a **streaming callback registry** that automatically updates your graphs:',
      sender: { id: 'ai-assistant', name: 'Stash AI', avatar: '🤖' },
      timestamp: addMinutes(new Date(), 9),
      type: 'text',
      isOwn: false,
    },
    {
      id: 'tutorial-graph-11',
      content: '',
      sender: { id: 'ai-assistant', name: 'Stash AI', avatar: '🤖' },
      timestamp: addMinutes(new Date(), 10),
      type: 'text',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `const STREAM_ID = 'live-metrics-dashboard';

useEffect(() => {
  // Register callback for live updates
  const unregister = streamingCallbackRegistry.register(
    STREAM_ID,
    (newDataPoint) => {
      setLiveData((prevSeries) => {
        // Find or create the series
        const seriesIndex = prevSeries.findIndex(
          (s) => s.id === newDataPoint.seriesId
        );

        if (seriesIndex >= 0) {
          // Update existing series
          const updated = [...prevSeries];
          updated[seriesIndex] = {
            ...updated[seriesIndex],
            data: [
              ...updated[seriesIndex].data,
              {
                timestamp: new Date(newDataPoint.timestamp),
                value: newDataPoint.value,
              },
            ],
          };
          return updated;
        } else {
          // Create new series
          return [
            ...prevSeries,
            {
              id: newDataPoint.seriesId,
              name: newDataPoint.seriesName || newDataPoint.seriesId,
              data: [
                {
                  timestamp: new Date(newDataPoint.timestamp),
                  value: newDataPoint.value,
                },
              ],
            },
          ];
        }
      });
    }
  );

  // Cleanup
  return () => unregister();
}, []);`,
          language: 'typescript',
          title: 'Streaming Callback Registration',
          fileName: 'LiveDashboard.tsx',
        },
      },
    },

    // Phase 5: Push Data to Callback
    {
      id: 'tutorial-graph-12',
      content:
        '## Phase 5: Push Data to the Callback\n\nWhen you receive WebSocket data, push it to the registered callback:',
      sender: { id: 'ai-assistant', name: 'Stash AI', avatar: '🤖' },
      timestamp: addMinutes(new Date(), 11),
      type: 'text',
      isOwn: false,
    },
    {
      id: 'tutorial-graph-13',
      content: '',
      sender: { id: 'ai-assistant', name: 'Stash AI', avatar: '🤖' },
      timestamp: addMinutes(new Date(), 12),
      type: 'text',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `// In your WebSocket event handler
socket.on('metrics:update', (data) => {
  // Push to the streaming callback
  streamingCallbackRegistry.push(STREAM_ID, {
    seriesId: data.metric, // e.g., 'cpu', 'memory', 'network'
    seriesName: data.metricName, // e.g., 'CPU Usage', 'Memory'
    timestamp: data.timestamp,
    value: data.value,
  });
});`,
          language: 'typescript',
          title: 'Push Data to Stream',
          fileName: 'LiveDashboard.tsx',
        },
      },
    },

    // Phase 6: Render the Chart
    {
      id: 'tutorial-graph-14',
      content: '## Phase 6: Render the Live Graph\n\nFinally, render the TimeSeriesChart with your live data:',
      sender: { id: 'ai-assistant', name: 'Stash AI', avatar: '🤖' },
      timestamp: addMinutes(new Date(), 13),
      type: 'text',
      isOwn: false,
    },
    {
      id: 'tutorial-graph-15',
      content: '',
      sender: { id: 'ai-assistant', name: 'Stash AI', avatar: '🤖' },
      timestamp: addMinutes(new Date(), 14),
      type: 'text',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `return (
  <View style={styles.container}>
    <Text style={styles.title}>Live Metrics Dashboard</Text>

    <TimeSeriesChart
      series={liveData}
      title="Real-Time System Metrics"
      subtitle="Live data streaming via WebSocket"
      mode="full"
      height={400}
      showLegend={true}
      streamingConfig={{
        streamId: STREAM_ID,
        enabled: true,
        maxDataPoints: 50, // Keep last 50 points per series
      }}
      onDataPointPress={(point, series) => {
        console.log('Clicked:', point, series);
      }}
    />
  </View>
);`,
          language: 'typescript',
          title: 'Render Live Chart',
          fileName: 'LiveDashboard.tsx',
        },
      },
    },

    // Complete Example
    {
      id: 'tutorial-graph-16',
      content:
        '## Complete Example\n\nHere\'s the **complete implementation** putting it all together:',
      sender: { id: 'ai-assistant', name: 'Stash AI', avatar: '🤖' },
      timestamp: addMinutes(new Date(), 15),
      type: 'text',
      isOwn: false,
    },
    {
      id: 'tutorial-graph-17',
      content: '',
      sender: { id: 'ai-assistant', name: 'Stash AI', avatar: '🤖' },
      timestamp: addMinutes(new Date(), 16),
      type: 'text',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  TimeSeriesChart,
  TimeSeriesSeries,
  streamingCallbackRegistry,
} from '@stash/chat';
import io from 'socket.io-client';

const STREAM_ID = 'live-metrics-dashboard';

export const LiveDashboard = () => {
  const [liveData, setLiveData] = useState<TimeSeriesSeries[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Register streaming callback
    const unregister = streamingCallbackRegistry.register(
      STREAM_ID,
      (newDataPoint) => {
        setLiveData((prevSeries) => {
          const seriesIndex = prevSeries.findIndex(
            (s) => s.id === newDataPoint.seriesId
          );

          if (seriesIndex >= 0) {
            const updated = [...prevSeries];
            updated[seriesIndex] = {
              ...updated[seriesIndex],
              data: [
                ...updated[seriesIndex].data,
                {
                  timestamp: new Date(newDataPoint.timestamp),
                  value: newDataPoint.value,
                },
              ].slice(-50), // Keep last 50 points
            };
            return updated;
          } else {
            return [
              ...prevSeries,
              {
                id: newDataPoint.seriesId,
                name: newDataPoint.seriesName || newDataPoint.seriesId,
                data: [
                  {
                    timestamp: new Date(newDataPoint.timestamp),
                    value: newDataPoint.value,
                  },
                ],
              },
            ];
          }
        });
      }
    );

    // Connect to WebSocket
    const socket = io('https://your-api.com', {
      transports: ['websocket'],
      auth: { token: 'your-auth-token' },
    });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('metrics:update', (data) => {
      streamingCallbackRegistry.push(STREAM_ID, {
        seriesId: data.metric,
        seriesName: data.metricName,
        timestamp: data.timestamp,
        value: data.value,
      });
    });

    return () => {
      socket.disconnect();
      unregister();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Metrics Dashboard</Text>
        <Text style={[styles.status, isConnected && styles.connected]}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </Text>
      </View>

      <TimeSeriesChart
        series={liveData}
        title="Real-Time System Metrics"
        subtitle="Live data streaming via WebSocket"
        mode="full"
        height={400}
        showLegend={true}
        streamingConfig={{
          streamId: STREAM_ID,
          enabled: true,
          maxDataPoints: 50,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold' },
  status: { fontSize: 14, color: '#999' },
  connected: { color: '#10B981' },
});`,
          language: 'typescript',
          title: 'Complete Live Dashboard',
          fileName: 'LiveDashboard.tsx',
        },
      },
    },

    // Backend Example
    {
      id: 'tutorial-graph-18',
      content:
        '## Backend Setup (Node.js Example)\n\nHere\'s a simple **backend** that streams random metrics:',
      sender: { id: 'ai-assistant', name: 'Stash AI', avatar: '🤖' },
      timestamp: addMinutes(new Date(), 17),
      type: 'text',
      isOwn: false,
    },
    {
      id: 'tutorial-graph-19',
      content: '',
      sender: { id: 'ai-assistant', name: 'Stash AI', avatar: '🤖' },
      timestamp: addMinutes(new Date(), 18),
      type: 'text',
      isOwn: false,
      interactiveComponent: {
        type: 'code-block',
        data: {
          code: `const io = require('socket.io')(3000, {
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Stream metrics every second
  const interval = setInterval(() => {
    // Emit CPU metric
    socket.emit('metrics:update', {
      metric: 'cpu',
      metricName: 'CPU Usage',
      timestamp: new Date(),
      value: Math.random() * 100,
    });

    // Emit Memory metric
    socket.emit('metrics:update', {
      metric: 'memory',
      metricName: 'Memory Usage',
      timestamp: new Date(),
      value: Math.random() * 16384, // MB
    });

    // Emit Network metric
    socket.emit('metrics:update', {
      metric: 'network',
      metricName: 'Network Traffic',
      timestamp: new Date(),
      value: Math.random() * 1000, // Mbps
    });
  }, 1000);

  socket.on('disconnect', () => {
    clearInterval(interval);
    console.log('Client disconnected:', socket.id);
  });
});

console.log('📊 Metrics streaming server running on port 3000');`,
          language: 'javascript',
          title: 'WebSocket Server',
          fileName: 'server.js',
        },
      },
    },

    // Summary
    {
      id: 'tutorial-graph-20',
      content:
        "## 🎉 You're All Set!\n\nYou now have a **complete live streaming graph** implementation with:\n\n✅ WebSocket connection for real-time data\n✅ Streaming callback registry for automatic updates\n✅ TimeSeriesChart component with live rendering\n✅ Backend server streaming metrics\n\n**Key Benefits:**\n- 📊 Real-time visualization\n- ⚡ High-performance streaming\n- 🎨 Beautiful, interactive charts\n- 🔧 Easy to customize and extend\n\n**Next Steps:**\n- Add authentication to your WebSocket server\n- Implement error handling and reconnection logic\n- Add data aggregation for historical views\n- Create alerts based on threshold values",
      sender: { id: 'ai-assistant', name: 'Stash AI', avatar: '🤖' },
      timestamp: addMinutes(new Date(), 19),
      type: 'text',
      isOwn: false,
    },

    // Final question
    {
      id: 'tutorial-graph-21',
      content: 'This is amazing! Can I see a live demo?',
      sender: { id: 'user-tutorial', name: 'You', avatar: '👤' },
      timestamp: addMinutes(new Date(), 20),
      type: 'text',
      isOwn: true,
    },
    {
      id: 'tutorial-graph-22',
      content:
        "Absolutely! Check out the **Live Streaming Chat** example in the chat list. It demonstrates real-time graphs with simulated WebSocket data. You can see exactly how the streaming works in action! 📈",
      sender: { id: 'ai-assistant', name: 'Stash AI', avatar: '🤖' },
      timestamp: addMinutes(new Date(), 21),
      type: 'text',
      isOwn: false,
    },
  ];
};
