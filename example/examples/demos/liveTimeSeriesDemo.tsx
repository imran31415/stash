import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TimeSeriesChart, type TimeSeriesSeries, type TimeSeriesDataPoint } from '../../../src/components/Chat/InteractiveComponents';
import { DemoConfig } from './types';

// Simulated live data generator
class LiveDataSimulator {
  private intervalId: NodeJS.Timeout | null = null;
  private subscribers: Array<(data: number) => void> = [];
  private baseValue = 100;
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    this.intervalId = setInterval(() => {
      // Generate realistic fluctuating data
      const volatility = 20;
      const value = this.baseValue + (Math.random() - 0.5) * volatility;
      this.baseValue = value; // Trending value
      this.notifySubscribers(value);
    }, 1000); // Update every second
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  subscribe(callback: (data: number) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers(value: number) {
    this.subscribers.forEach(callback => callback(value));
  }
}

const liveTimeSeriesDemo: DemoConfig<TimeSeriesSeries[]> = {
  id: 'live-timeseries',
  title: 'Live Time Series',
  description: 'Real-time streaming chart with pause/resume controls and fixed memory management',

  initialCode: `{
  "series": [
    {
      "id": "metrics",
      "name": "Live Metrics",
      "color": "#10B981",
      "lineWidth": 3,
      "data": []
    }
  ],
  "enableLiveStreaming": true,
  "maxDataPoints": 100,
  "streamingWindowSize": 50,
  "showStreamingControls": true
}`,

  implementationCode: `import { TimeSeriesChart, type TimeSeriesSeries } from 'stash';
import { useState, useEffect, useRef } from 'react';

// Live data simulator
class DataSimulator {
  private intervalId: NodeJS.Timeout | null = null;
  private subscribers: Array<(data: number) => void> = [];
  private baseValue = 100;

  start() {
    this.intervalId = setInterval(() => {
      const value = this.baseValue + (Math.random() - 0.5) * 20;
      this.baseValue = value;
      this.subscribers.forEach(cb => cb(value));
    }, 1000);
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  subscribe(callback: (data: number) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== callback);
    };
  }
}

function LiveChart() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [series, setSeries] = useState<TimeSeriesSeries[]>([
    { id: 'metrics', name: 'Live Metrics', data: [], color: '#10B981' }
  ]);
  const simulatorRef = useRef<DataSimulator | null>(null);

  useEffect(() => {
    simulatorRef.current = new DataSimulator();
    return () => simulatorRef.current?.stop();
  }, []);

  const handleDataPoint = (value: number) => {
    setSeries(prev => {
      const updated = [...prev];
      updated[0].data = [
        ...updated[0].data,
        { timestamp: new Date(), value }
      ];
      return updated;
    });
  };

  const handleStreamingToggle = (active: boolean) => {
    if (active) {
      simulatorRef.current?.subscribe(handleDataPoint);
      simulatorRef.current?.start();
    } else {
      simulatorRef.current?.stop();
    }
    setIsStreaming(active);
  };

  return (
    <TimeSeriesChart
      series={series}
      mode="full"
      title="Real-Time Metrics"
      subtitle={isStreaming ? 'Streaming live data...' : 'Stream paused'}
      enableLiveStreaming={true}
      maxDataPoints={100}
      streamingWindowSize={50}
      showStreamingControls={true}
      onStreamingToggle={handleStreamingToggle}
      streamingPaused={!isStreaming}
      showLegend={true}
      showGrid={true}
      xAxisLabel="Time"
      yAxisLabel="Value"
      height={400}
    />
  );
}`,

  parseData: (code: string): TimeSeriesSeries[] | null => {
    try {
      const parsed = JSON.parse(code);

      if (!parsed || typeof parsed !== 'object') {
        console.error('LiveTimeSeriesDemo: Data must be an object');
        return null;
      }

      if (!Array.isArray(parsed.series)) {
        console.error('LiveTimeSeriesDemo: Data must have series array');
        return null;
      }

      return parsed.series.map((s: any) => ({
        id: String(s.id),
        name: String(s.name || s.id),
        data: Array.isArray(s.data) ? s.data.map((d: any) => ({
          timestamp: new Date(d.timestamp || Date.now()),
          value: Number(d.value || 0),
          label: d.label ? String(d.label) : undefined,
        })) : [],
        color: s.color ? String(s.color) : undefined,
        lineWidth: s.lineWidth ? Number(s.lineWidth) : undefined,
      }));
    } catch (e) {
      console.error('LiveTimeSeriesDemo parse error:', e);
      return null;
    }
  },

  renderPreview: (data: TimeSeriesSeries[]) => {
    const [series, setSeries] = useState<TimeSeriesSeries[]>(data);
    const [isStreaming, setIsStreaming] = useState(false);
    const simulatorRef = useRef<LiveDataSimulator | null>(null);

    useEffect(() => {
      simulatorRef.current = new LiveDataSimulator();

      return () => {
        simulatorRef.current?.stop();
      };
    }, []);

    useEffect(() => {
      if (!simulatorRef.current) return;

      const handleDataPoint = (value: number) => {
        setSeries(prevSeries => {
          const updatedSeries = [...prevSeries];
          if (updatedSeries[0]) {
            const newDataPoint: TimeSeriesDataPoint = {
              timestamp: new Date(),
              value: value,
            };

            updatedSeries[0] = {
              ...updatedSeries[0],
              data: [...updatedSeries[0].data, newDataPoint],
            };
          }
          return updatedSeries;
        });
      };

      if (isStreaming) {
        const unsubscribe = simulatorRef.current.subscribe(handleDataPoint);
        simulatorRef.current.start();

        return () => {
          unsubscribe();
          simulatorRef.current?.stop();
        };
      } else {
        simulatorRef.current.stop();
      }
    }, [isStreaming]);

    const handleStreamingToggle = (active: boolean) => {
      setIsStreaming(active);
    };

    if (!data || data.length === 0) {
      return (
        <View style={styles.errorView}>
          <Text style={styles.errorText}>Please provide series data for the live chart</Text>
        </View>
      );
    }

    return (
      <TimeSeriesChart
        series={series}
        mode="full"
        title="Real-Time Metrics Dashboard"
        subtitle={isStreaming ? '🔴 Streaming live data...' : '⏸ Stream paused'}
        enableLiveStreaming={true}
        maxDataPoints={100}
        streamingWindowSize={50}
        showStreamingControls={true}
        onStreamingToggle={handleStreamingToggle}
        streamingPaused={!isStreaming}
        showLegend={true}
        showGrid={true}
        showXAxis={true}
        showYAxis={true}
        xAxisLabel="Time"
        yAxisLabel="Value"
        height={400}
      />
    );
  },
};

const styles = StyleSheet.create({
  errorView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    margin: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default liveTimeSeriesDemo;
