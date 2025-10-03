import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chat, Message, User } from '../../src/components/Chat';
import type { TimeSeriesSeries, TimeSeriesDataPoint } from '../../src/components/Chat/InteractiveComponents';
import { streamingCallbackRegistry } from '../../src/components/Chat/InteractiveComponents/StreamingCallbackRegistry';

const MOCK_USER: User = {
  id: 'user-1',
  name: 'You',
};

const AI_USER: User = {
  id: 'ai-assistant',
  name: 'Sales AI',
};

// Simulated WebSocket manager for sales data
class SalesDataSimulator {
  private intervalId: NodeJS.Timeout | null = null;
  private subscribers: Array<(data: SalesEvent) => void> = [];
  private isRunning = false;
  private baseRevenue = 100;
  private revenueVolatility = 50;
  private salesFrequency = 1000;

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.intervalId = setInterval(() => {
      const salesEvent = this.generateSalesEvent();
      this.notifySubscribers(salesEvent);
    }, this.salesFrequency);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  subscribe(callback: (data: SalesEvent) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private generateSalesEvent(): SalesEvent {
    const hour = new Date().getHours();
    const timeMultiplier = hour >= 9 && hour <= 17 ? 1.5 : 0.5;
    const saleAmount = Math.max(
      10,
      this.baseRevenue + (Math.random() - 0.5) * this.revenueVolatility * timeMultiplier
    );

    return {
      timestamp: new Date(),
      amount: saleAmount,
      product: this.getRandomProduct(),
    };
  }

  private getRandomProduct(): string {
    const products = ['Widget A', 'Widget B', 'Premium Plan', 'Basic Plan', 'Enterprise'];
    return products[Math.floor(Math.random() * products.length)];
  }

  private notifySubscribers(event: SalesEvent) {
    this.subscribers.forEach(callback => callback(event));
  }
}

interface SalesEvent {
  timestamp: Date;
  amount: number;
  product: string;
}

const LiveStreamingChatExample: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [totalSales, setTotalSales] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Sales data for the chart
  const salesSeriesRef = useRef<TimeSeriesSeries[]>([
    {
      id: 'revenue',
      name: 'Revenue per Sale ($)',
      data: [],
      color: '#10B981',
      lineWidth: 3,
    },
  ]);

  // WebSocket simulator
  const simulatorRef = useRef<SalesDataSimulator | null>(null);
  const streamingMessageIdRef = useRef<string | null>(null);

  // Initialize simulator
  useEffect(() => {
    simulatorRef.current = new SalesDataSimulator();

    // Initial welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'text',
      content: "👋 Hi! I'm your Sales AI Assistant. I can show you real-time sales data streaming into our dashboard.\n\nTry asking me:\n• \"Show me live sales data\"\n• \"Start the sales dashboard\"\n\nOnce streaming starts, you can use the **⏸ Pause/▶️ Resume** button directly on the chart to control the stream!",
      sender: AI_USER,
      timestamp: new Date(),
      isFromCurrentUser: false,
    };

    setMessages([welcomeMessage]);

    return () => {
      simulatorRef.current?.stop();
    };
  }, []);

  // Start streaming (defined early so it can be used in toggle handler)
  const startStreamingRef = useRef<() => void>();
  const stopStreamingRef = useRef<() => void>();

  // Handle streaming toggle from controls
  const handleStreamingToggle = useCallback((streaming: boolean) => {
    console.log('[LiveStreamingChat] Streaming toggle:', streaming);
    if (streaming) {
      // Start/Resume
      startStreamingRef.current?.();
    } else {
      // Pause/Stop
      stopStreamingRef.current?.();
    }
  }, []);

  // Register the callback globally so it can be called from the chart
  useEffect(() => {
    const callbackId = 'live-streaming-sales';
    const unregister = streamingCallbackRegistry.register(callbackId, handleStreamingToggle);

    return () => {
      unregister();
    };
  }, [handleStreamingToggle]);

  // Handle incoming sales events
  const handleSalesEvent = useCallback((event: SalesEvent) => {
    // Skip if paused
    if (isPaused) return;

    // Update the sales data
    salesSeriesRef.current[0].data.push({
      timestamp: event.timestamp,
      value: event.amount,
      label: event.product,
      metadata: { product: event.product },
    });

    // Update statistics
    setTotalSales(prev => prev + 1);
    setTotalRevenue(prev => prev + event.amount);

    // Update the message with new data
    if (streamingMessageIdRef.current) {
      setMessages(prevMessages =>
        prevMessages.map(msg => {
          if (msg.id === streamingMessageIdRef.current) {
            return {
              ...msg,
              interactiveComponent: {
                type: 'time-series-chart',
                data: {
                  series: [...salesSeriesRef.current],
                  mode: 'full',
                  title: '📈 Live Sales Dashboard',
                  subtitle: `${totalSales + 1} sales • $${(totalRevenue + event.amount).toFixed(2)} total revenue`,
                  enableLiveStreaming: true,
                  maxDataPoints: 100,
                  streamingWindowSize: 50,
                  showStreamingControls: true,
                  streamingPaused: !isStreaming,
                  streamingCallbackId: 'live-streaming-sales',
                  showLegend: true,
                  showGrid: true,
                  showXAxis: true,
                  showYAxis: true,
                  xAxisLabel: 'Time',
                  yAxisLabel: 'Sale Amount ($)',
                  valueFormatter: (value: number) => `$${value.toFixed(0)}`,
                  height: 350,
                },
              },
            };
          }
          return msg;
        })
      );
    }
  }, [totalSales, totalRevenue, isPaused]);

  // Start streaming
  const startStreaming = useCallback(() => {
    if (!simulatorRef.current || isStreaming) return;
    setIsPaused(false);

    // Reset data
    salesSeriesRef.current[0].data = [];
    setTotalSales(0);
    setTotalRevenue(0);

    // Create the streaming message
    const streamingMessageId = `streaming-${Date.now()}`;
    streamingMessageIdRef.current = streamingMessageId;

    const streamingMessage: Message = {
      id: streamingMessageId,
      type: 'text',
      content: 'Here\'s your live sales dashboard! Watch as sales stream in real-time. Use the controls below the title to pause/resume streaming.',
      sender: AI_USER,
      timestamp: new Date(),
      isFromCurrentUser: false,
      interactiveComponent: {
        type: 'time-series-chart',
        data: {
          series: salesSeriesRef.current,
          mode: 'full',
          title: '📈 Live Sales Dashboard',
          subtitle: 'Waiting for sales data...',
          enableLiveStreaming: true,
          maxDataPoints: 100,
          streamingWindowSize: 50,
          showStreamingControls: true,
          streamingPaused: !isStreaming,
          streamingCallbackId: 'live-streaming-sales',
          showLegend: true,
          showGrid: true,
          showXAxis: true,
          showYAxis: true,
          xAxisLabel: 'Time',
          yAxisLabel: 'Sale Amount ($)',
          valueFormatter: (value: number) => `$${value.toFixed(0)}`,
          height: 350,
        },
      },
    };

    setMessages(prev => [...prev, streamingMessage]);

    // Subscribe to sales events
    simulatorRef.current.subscribe(handleSalesEvent);

    // Start simulator
    simulatorRef.current.start();
    setIsStreaming(true);

    // Add status message
    setTimeout(() => {
      const statusMessage: Message = {
        id: `status-${Date.now()}`,
        type: 'text',
        content: '🟢 Streaming started! Sales data is now flowing in real-time. Use the ⏸ Pause button on the chart to pause, or type "stop" to end the session.',
        sender: AI_USER,
        timestamp: new Date(),
        isFromCurrentUser: false,
      };
      setMessages(prev => [...prev, statusMessage]);
    }, 500);
  }, [isStreaming, handleSalesEvent]);

  // Assign refs
  startStreamingRef.current = startStreaming;

  // Stop streaming
  const stopStreaming = useCallback(() => {
    if (!simulatorRef.current) return;

    simulatorRef.current.stop();
    setIsStreaming(false);
    setIsPaused(true);
    streamingMessageIdRef.current = null;

    const stopMessage: Message = {
      id: `stop-${Date.now()}`,
      type: 'text',
      content: `🔴 Streaming stopped.\n\n**Final Stats:**\n• Total Sales: ${totalSales}\n• Total Revenue: $${totalRevenue.toFixed(2)}\n• Average Sale: $${totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : '0.00'}\n\nType "start" to begin streaming again!`,
      sender: AI_USER,
      timestamp: new Date(),
      isFromCurrentUser: false,
    };

    setMessages(prev => [...prev, stopMessage]);
  }, [totalSales, totalRevenue]);

  // Assign refs
  stopStreamingRef.current = stopStreaming;

  // Handle user messages
  const handleSendMessage = useCallback((message: Message) => {
    // Add user message to chat
    setMessages(prev => [...prev, message]);

    // Parse user intent - ensure content is a string
    const content = typeof message.content === 'string' ? message.content : '';
    const lowerContent = content.toLowerCase();

    setTimeout(() => {
      if (lowerContent.includes('start') || lowerContent.includes('show') || lowerContent.includes('live')) {
        if (isStreaming) {
          const alreadyStreamingMessage: Message = {
            id: `response-${Date.now()}`,
            type: 'text',
            content: 'The sales dashboard is already streaming! You can see the live data above. Type "stop" to pause it.',
            sender: AI_USER,
            timestamp: new Date(),
            isFromCurrentUser: false,
          };
          setMessages(prev => [...prev, alreadyStreamingMessage]);
        } else {
          startStreaming();
        }
      } else if (lowerContent.includes('stop') || lowerContent.includes('pause')) {
        if (isStreaming) {
          stopStreaming();
        } else {
          const notStreamingMessage: Message = {
            id: `response-${Date.now()}`,
            type: 'text',
            content: 'No active stream to stop. Type "start" to begin streaming sales data!',
            sender: AI_USER,
            timestamp: new Date(),
            isFromCurrentUser: false,
          };
          setMessages(prev => [...prev, notStreamingMessage]);
        }
      } else if (lowerContent.includes('stats') || lowerContent.includes('status')) {
        const statsMessage: Message = {
          id: `response-${Date.now()}`,
          type: 'text',
          content: `**Current Status:**\n• Streaming: ${isStreaming ? '🟢 Active' : '🔴 Inactive'}\n• Total Sales: ${totalSales}\n• Total Revenue: $${totalRevenue.toFixed(2)}\n• Data Points: ${salesSeriesRef.current[0].data.length}`,
          sender: AI_USER,
          timestamp: new Date(),
          isFromCurrentUser: false,
        };
        setMessages(prev => [...prev, statsMessage]);
      } else if (lowerContent.includes('help')) {
        const helpMessage: Message = {
          id: `response-${Date.now()}`,
          type: 'text',
          content: '**Available Commands:**\n\n• **start** / **show** - Start live streaming\n• **stop** / **pause** - Stop the stream\n• **stats** / **status** - View current statistics\n• **help** - Show this message\n\nThe dashboard automatically maintains fixed memory (last 100 points) and displays the most recent 50 points for optimal performance.',
          sender: AI_USER,
          timestamp: new Date(),
          isFromCurrentUser: false,
        };
        setMessages(prev => [...prev, helpMessage]);
      } else {
        const defaultMessage: Message = {
          id: `response-${Date.now()}`,
          type: 'text',
          content: `I can help you with live sales data! Try:\n• "start" - Begin streaming\n• "stop" - Pause streaming\n• "stats" - View current stats\n• "help" - See all commands`,
          sender: AI_USER,
          timestamp: new Date(),
          isFromCurrentUser: false,
        };
        setMessages(prev => [...prev, defaultMessage]);
      }
    }, 300);
  }, [isStreaming, startStreaming, stopStreaming, totalSales, totalRevenue]);

  return (
    <View style={styles.container}>
      <Chat
        userId={MOCK_USER.id}
        chatType="ai"
        chatId="live-streaming-sales"
        messages={messages}
        onSendMessage={handleSendMessage}
        placeholder="Ask about sales data... (try 'start', 'stop', 'stats')"
        showConnectionStatus={false}
        enableWebSocket={false}
        enableHTTP={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
});

export default LiveStreamingChatExample;
