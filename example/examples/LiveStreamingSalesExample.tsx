import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  TimeSeriesChart,
  CodeBlock,
  type TimeSeriesSeries,
  type TimeSeriesDataPoint,
} from '../../src/components/Chat/InteractiveComponents';

/**
 * Live Streaming Sales Example
 *
 * This example demonstrates:
 * 1. Real-time WebSocket-style data streaming
 * 2. Fixed memory usage with circular buffer
 * 3. Smooth UI updates without performance degradation
 * 4. Simulated sales data with realistic patterns
 */

// Simulated WebSocket manager for sales data
class SalesDataSimulator {
  private intervalId: NodeJS.Timeout | null = null;
  private subscribers: Array<(data: SalesEvent) => void> = [];
  private isRunning = false;

  // Sales simulation parameters
  private baseRevenue = 100;
  private revenueVolatility = 50;
  private salesFrequency = 1000; // ms between sales events

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
    // Simulate realistic sales patterns with some randomness
    const hour = new Date().getHours();

    // Business hours multiplier (9am-5pm are busy)
    const timeMultiplier = hour >= 9 && hour <= 17 ? 1.5 : 0.5;

    // Generate sale amount with realistic distribution
    const saleAmount = Math.max(
      10,
      this.baseRevenue +
      (Math.random() - 0.5) * this.revenueVolatility * timeMultiplier
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

  setFrequency(ms: number) {
    this.salesFrequency = Math.max(100, ms); // Minimum 100ms
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }
}

interface SalesEvent {
  timestamp: Date;
  amount: number;
  product: string;
}

const LiveStreamingSalesExample: React.FC = () => {
  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [salesSeries, setSalesSeries] = useState<TimeSeriesSeries[]>([
    {
      id: 'revenue',
      name: 'Revenue per Sale ($)',
      data: [],
      color: '#10B981',
      lineWidth: 3,
    },
  ]);

  // Statistics
  const [totalSales, setTotalSales] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [avgSaleAmount, setAvgSaleAmount] = useState(0);
  const [salesFrequency, setSalesFrequency] = useState(1000);

  // WebSocket simulator
  const simulatorRef = useRef<SalesDataSimulator | null>(null);

  // Initialize simulator
  useEffect(() => {
    simulatorRef.current = new SalesDataSimulator();

    return () => {
      simulatorRef.current?.stop();
    };
  }, []);

  // Handle incoming sales events
  const handleSalesEvent = useCallback((event: SalesEvent) => {
    setSalesSeries(prevSeries => {
      const updatedSeries = [...prevSeries];
      const revenueSeries = updatedSeries[0];

      // Add new data point
      const newDataPoint: TimeSeriesDataPoint = {
        timestamp: event.timestamp,
        value: event.amount,
        label: event.product,
        metadata: {
          product: event.product,
        },
      };

      // Update series data
      revenueSeries.data = [...revenueSeries.data, newDataPoint];

      return updatedSeries;
    });

    // Update statistics
    setTotalSales(prev => prev + 1);
    setTotalRevenue(prev => prev + event.amount);
    setAvgSaleAmount(prev => {
      const currentTotal = prev * totalSales;
      return (currentTotal + event.amount) / (totalSales + 1);
    });
  }, [totalSales]);

  // Start streaming
  const startStreaming = useCallback(() => {
    if (!simulatorRef.current) return;

    // Subscribe to sales events
    const unsubscribe = simulatorRef.current.subscribe(handleSalesEvent);

    // Start simulator
    simulatorRef.current.start();
    setIsStreaming(true);

    // Store cleanup function
    return unsubscribe;
  }, [handleSalesEvent]);

  // Stop streaming
  const stopStreaming = useCallback(() => {
    simulatorRef.current?.stop();
    setIsStreaming(false);
  }, []);

  // Handle streaming toggle from chart controls
  const handleStreamingToggle = useCallback((streaming: boolean) => {
    console.log('[LiveStreamingSalesExample] Streaming toggle from chart:', streaming);
    if (streaming) {
      startStreaming();
    } else {
      stopStreaming();
    }
  }, [startStreaming, stopStreaming]);

  // Toggle streaming
  const toggleStreaming = useCallback(() => {
    if (isStreaming) {
      stopStreaming();
    } else {
      startStreaming();
    }
  }, [isStreaming, startStreaming, stopStreaming]);

  // Reset data
  const resetData = useCallback(() => {
    stopStreaming();
    setSalesSeries([
      {
        id: 'revenue',
        name: 'Revenue per Sale ($)',
        data: [],
        color: '#10B981',
        lineWidth: 3,
      },
    ]);
    setTotalSales(0);
    setTotalRevenue(0);
    setAvgSaleAmount(0);
  }, [stopStreaming]);

  // Update sales frequency
  const updateFrequency = useCallback((frequency: number) => {
    setSalesFrequency(frequency);
    simulatorRef.current?.setFrequency(frequency);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, [stopStreaming]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.title}>Live Streaming Sales Dashboard</Text>
        <Text style={styles.description}>
          Real-time sales data visualization with WebSocket-style streaming.
          This demo shows how the TimeSeriesChart handles live data with fixed memory usage.
        </Text>
      </View>

      {/* Control Panel */}
      <View style={styles.controlPanel}>
        <Text style={styles.sectionTitle}>Controls</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.button,
              isStreaming ? styles.buttonDanger : styles.buttonPrimary,
            ]}
            onPress={toggleStreaming}
          >
            <Text style={styles.buttonText}>
              {isStreaming ? '⏸ Stop Streaming' : '▶ Start Streaming'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={resetData}
          >
            <Text style={styles.buttonText}>🔄 Reset</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.frequencyControl}>
          <Text style={styles.frequencyLabel}>Sales Frequency:</Text>
          <View style={styles.frequencyButtons}>
            {[
              { label: 'Fast (500ms)', value: 500 },
              { label: 'Normal (1s)', value: 1000 },
              { label: 'Slow (2s)', value: 2000 },
            ].map(freq => (
              <TouchableOpacity
                key={freq.value}
                style={[
                  styles.frequencyButton,
                  salesFrequency === freq.value && styles.frequencyButtonActive,
                ]}
                onPress={() => updateFrequency(freq.value)}
              >
                <Text
                  style={[
                    styles.frequencyButtonText,
                    salesFrequency === freq.value && styles.frequencyButtonTextActive,
                  ]}
                >
                  {freq.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Statistics Panel */}
      <View style={styles.statsPanel}>
        <Text style={styles.sectionTitle}>Live Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalSales}</Text>
            <Text style={styles.statLabel}>Total Sales</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${totalRevenue.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${avgSaleAmount.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Avg Sale Amount</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{salesSeries[0].data.length}</Text>
            <Text style={styles.statLabel}>Data Points</Text>
          </View>
        </View>
      </View>

      {/* Live Chart */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Live Sales Chart</Text>
        <Text style={styles.chartDescription}>
          Automatically maintains last 100 data points in memory. Shows last 50 points on screen.
        </Text>
        <TimeSeriesChart
          series={salesSeries}
          mode="full"
          title="Real-Time Sales Revenue"
          subtitle={isStreaming ? 'Streaming live data...' : 'Stream paused'}
          enableLiveStreaming={true}
          maxDataPoints={100} // Keep last 100 points in memory
          streamingWindowSize={50} // Display last 50 points
          showStreamingControls={true}
          onStreamingToggle={handleStreamingToggle}
          streamingPaused={!isStreaming}
          showLegend={true}
          showGrid={true}
          showXAxis={true}
          showYAxis={true}
          xAxisLabel="Time"
          yAxisLabel="Sale Amount ($)"
          valueFormatter={(value) => `$${value.toFixed(0)}`}
          height={350}
          onDataPointPress={(dataPoint, series) => {
            console.log('Sale clicked:', {
              amount: dataPoint.value,
              product: dataPoint.label,
              time: dataPoint.timestamp,
            });
          }}
        />
      </View>

      {/* Performance Info */}
      <View style={styles.infoPanel}>
        <Text style={styles.infoTitle}>📊 Performance Features</Text>
        <View style={styles.infoList}>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoBold}>Fixed Memory Usage:</Text> Circular buffer keeps only the last 100 data points
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoBold}>Efficient Updates:</Text> Only re-renders when new data arrives
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoBold}>Smooth Animations:</Text> No UI blocking even at high frequencies
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoBold}>Windowed Display:</Text> Shows last 50 points while keeping 100 in memory
            </Text>
          </View>
        </View>
      </View>

      {/* Integration Example */}
      <View style={styles.codeSection}>
        <Text style={styles.sectionTitle}>Integration Example</Text>
        <CodeBlock
          code={`// WebSocket Integration
const [salesData, setSalesData] = useState([]);

useEffect(() => {
  const ws = new WebSocket('wss://api.example.com/sales');

  ws.onmessage = (event) => {
    const sale = JSON.parse(event.data);
    setSalesData(prev => [...prev, {
      timestamp: new Date(sale.timestamp),
      value: sale.amount,
      label: sale.product,
    }]);
  };

  return () => ws.close();
}, []);

// Render Chart
<TimeSeriesChart
  series={[{ id: 'sales', name: 'Revenue', data: salesData }]}
  enableLiveStreaming={true}
  maxDataPoints={100}
  streamingWindowSize={50}
/>`}
          language="typescript"
          mode="preview"
          fileName="integration-example.tsx"
          showLineNumbers={true}
        />
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  section: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  controlPanel: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#10B981',
  },
  buttonDanger: {
    backgroundColor: '#EF4444',
  },
  buttonSecondary: {
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  frequencyControl: {
    marginTop: 4,
  },
  frequencyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  frequencyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  frequencyButtonActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  frequencyButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },
  frequencyButtonTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  statsPanel: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  chartSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartDescription: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  infoPanel: {
    padding: 20,
    backgroundColor: '#F0F9FF',
    marginTop: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 12,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    gap: 8,
  },
  infoBullet: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '700',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: '700',
  },
  codeSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  codeBlock: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 8,
  },
  codeText: {
    fontFamily: 'Courier',
    fontSize: 11,
    color: '#E2E8F0',
    lineHeight: 16,
  },
  bottomPadding: {
    height: 40,
  },
});

export default LiveStreamingSalesExample;
