import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TimeSeriesChart, type TimeSeriesSeries } from '../../../src/components/Chat/InteractiveComponents';
import { DemoConfig } from './types';

const timeSeriesDemo: DemoConfig<TimeSeriesSeries[]> = {
  id: 'timeseries',
  title: 'Time Series Chart',
  description: 'Multi-series time-based data visualization with interactive legend',

  initialCode: `[
  {
    "id": "revenue",
    "name": "Revenue",
    "color": "#10B981",
    "data": [
      {"timestamp": "2025-01-01T00:00:00.000Z", "value": 10000},
      {"timestamp": "2025-01-02T00:00:00.000Z", "value": 12000},
      {"timestamp": "2025-01-03T00:00:00.000Z", "value": 11500},
      {"timestamp": "2025-01-04T00:00:00.000Z", "value": 13000},
      {"timestamp": "2025-01-05T00:00:00.000Z", "value": 14500},
      {"timestamp": "2025-01-06T00:00:00.000Z", "value": 15200},
      {"timestamp": "2025-01-07T00:00:00.000Z", "value": 16000}
    ]
  },
  {
    "id": "expenses",
    "name": "Expenses",
    "color": "#EF4444",
    "data": [
      {"timestamp": "2025-01-01T00:00:00.000Z", "value": 7000},
      {"timestamp": "2025-01-02T00:00:00.000Z", "value": 8000},
      {"timestamp": "2025-01-03T00:00:00.000Z", "value": 7500},
      {"timestamp": "2025-01-04T00:00:00.000Z", "value": 8500},
      {"timestamp": "2025-01-05T00:00:00.000Z", "value": 9000},
      {"timestamp": "2025-01-06T00:00:00.000Z", "value": 9200},
      {"timestamp": "2025-01-07T00:00:00.000Z", "value": 9500}
    ]
  }
]`,

  implementationCode: `import { TimeSeriesChart, type TimeSeriesSeries } from 'stash';

// Define your time series data
const series: TimeSeriesSeries[] = [
  {
    id: 'revenue',
    name: 'Revenue',
    color: '#10B981',
    data: [
      { timestamp: new Date('2025-01-01'), value: 10000 },
      { timestamp: new Date('2025-01-02'), value: 12000 },
      { timestamp: new Date('2025-01-03'), value: 11500 },
      { timestamp: new Date('2025-01-04'), value: 13000 },
      { timestamp: new Date('2025-01-05'), value: 14500 },
      { timestamp: new Date('2025-01-06'), value: 15200 },
      { timestamp: new Date('2025-01-07'), value: 16000 }
    ]
  },
  {
    id: 'expenses',
    name: 'Expenses',
    color: '#EF4444',
    data: [
      { timestamp: new Date('2025-01-01'), value: 7000 },
      { timestamp: new Date('2025-01-02'), value: 8000 },
      { timestamp: new Date('2025-01-03'), value: 7500 },
      { timestamp: new Date('2025-01-04'), value: 8500 },
      { timestamp: new Date('2025-01-05'), value: 9000 },
      { timestamp: new Date('2025-01-06'), value: 9200 },
      { timestamp: new Date('2025-01-07'), value: 9500 }
    ]
  }
];

// Render the TimeSeriesChart component
<TimeSeriesChart
  series={series}
  mode="full"
  showLegend={true}
  showGrid={true}
  height={400}
  xAxisLabel="Date"
  yAxisLabel="Amount ($)"
/>`,

  parseData: (code: string): TimeSeriesSeries[] | null => {
    try {
      const parsed = JSON.parse(code);
      if (!Array.isArray(parsed)) {
        console.error('TimeSeriesDemo: Data must be an array');
        return null;
      }

      const result = parsed.map((series: any) => {
        if (!series || typeof series !== 'object') {
          console.error('TimeSeriesDemo: Each series must be an object');
          return null;
        }

        if (!Array.isArray(series.data)) {
          console.error('TimeSeriesDemo: Each series must have a data array');
          return null;
        }

        const dataPoints = series.data.map((d: any) => {
          const timestamp = new Date(d.timestamp);
          // Validate timestamp
          if (isNaN(timestamp.getTime())) {
            console.error('TimeSeriesDemo: Invalid timestamp:', d.timestamp);
            return null;
          }
          return {
            timestamp,
            value: Number(d.value) || 0,
            label: d.label ? String(d.label) : undefined,
            metadata: d.metadata || undefined,
          };
        }).filter(Boolean);

        return {
          id: String(series.id),
          name: String(series.name || series.id),
          color: series.color ? String(series.color) : undefined,
          lineWidth: series.lineWidth ? Number(series.lineWidth) : undefined,
          showPoints: series.showPoints !== undefined ? Boolean(series.showPoints) : undefined,
          pointRadius: series.pointRadius ? Number(series.pointRadius) : undefined,
          data: dataPoints,
        };
      }).filter(Boolean);

      return result.length > 0 ? result as TimeSeriesSeries[] : null;
    } catch (e) {
      console.error('TimeSeriesDemo parse error:', e);
      return null;
    }
  },

  renderPreview: (series: TimeSeriesSeries[]) => {
    if (!Array.isArray(series) || series.length === 0) {
      return (
        <View style={styles.errorView}>
          <Text style={styles.errorText}>Please provide an array of series</Text>
        </View>
      );
    }

    return (
      <TimeSeriesChart
        series={series}
        mode="full"
        showLegend={true}
        showGrid={true}
        height={400}
        xAxisLabel="Date"
        yAxisLabel="Value"
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

export default timeSeriesDemo;
