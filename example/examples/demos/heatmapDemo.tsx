import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Heatmap, type HeatmapDataPoint } from '../../../src/components/Chat/InteractiveComponents';
import { DemoConfig } from './types';

const heatmapDemo: DemoConfig<HeatmapDataPoint[]> = {
  id: 'heatmap',
  title: 'Heatmap',
  description: 'Intensity-based data visualization for patterns and correlations',

  initialCode: `[
  {"x": 0, "y": 0, "value": 45, "label": "Mon 12AM"},
  {"x": 1, "y": 0, "value": 30, "label": "Mon 1AM"},
  {"x": 2, "y": 0, "value": 20, "label": "Mon 2AM"},
  {"x": 3, "y": 0, "value": 15, "label": "Mon 3AM"},
  {"x": 4, "y": 0, "value": 25, "label": "Mon 4AM"},
  {"x": 0, "y": 1, "value": 55, "label": "Tue 12AM"},
  {"x": 1, "y": 1, "value": 40, "label": "Tue 1AM"},
  {"x": 2, "y": 1, "value": 35, "label": "Tue 2AM"},
  {"x": 3, "y": 1, "value": 20, "label": "Tue 3AM"},
  {"x": 4, "y": 1, "value": 30, "label": "Tue 4AM"},
  {"x": 0, "y": 2, "value": 70, "label": "Wed 12AM"},
  {"x": 1, "y": 2, "value": 60, "label": "Wed 1AM"},
  {"x": 2, "y": 2, "value": 50, "label": "Wed 2AM"},
  {"x": 3, "y": 2, "value": 40, "label": "Wed 3AM"},
  {"x": 4, "y": 2, "value": 55, "label": "Wed 4AM"},
  {"x": 0, "y": 3, "value": 80, "label": "Thu 12AM"},
  {"x": 1, "y": 3, "value": 75, "label": "Thu 1AM"},
  {"x": 2, "y": 3, "value": 65, "label": "Thu 2AM"},
  {"x": 3, "y": 3, "value": 55, "label": "Thu 3AM"},
  {"x": 4, "y": 3, "value": 70, "label": "Thu 4AM"}
]`,

  implementationCode: `import { Heatmap, type HeatmapDataPoint } from 'stash';

// Define your heatmap data points
const data: HeatmapDataPoint[] = [
  { x: 0, y: 0, value: 45, label: "Mon 12AM" },
  { x: 1, y: 0, value: 30, label: "Mon 1AM" },
  { x: 2, y: 0, value: 20, label: "Mon 2AM" },
  { x: 3, y: 0, value: 15, label: "Mon 3AM" },
  { x: 4, y: 0, value: 25, label: "Mon 4AM" },
  // ... more data points
];

// Render the Heatmap component
<Heatmap
  data={data}
  mode="full"
  showValues={false}
  height={400}
  xAxisLabel="Hour"
  yAxisLabel="Day"
  colorScale="blue"
  showGrid={true}
/>`,

  parseData: (code: string): HeatmapDataPoint[] | null => {
    try {
      const parsed = JSON.parse(code);
      if (!Array.isArray(parsed)) {
        console.error('HeatmapDemo: Data must be an array');
        return null;
      }

      const dataPoints = parsed.map((point: any) => {
        if (!point || typeof point !== 'object') {
          console.error('HeatmapDemo: Each data point must be an object');
          return null;
        }

        return {
          x: typeof point.x === 'number' ? point.x : Number(point.x) || 0,
          y: typeof point.y === 'number' ? point.y : Number(point.y) || 0,
          value: typeof point.value === 'number' ? point.value : Number(point.value) || 0,
          label: point.label ? String(point.label) : undefined,
          metadata: point.metadata || undefined,
        };
      }).filter(Boolean);

      return dataPoints.length > 0 ? dataPoints as HeatmapDataPoint[] : null;
    } catch (e) {
      console.error('HeatmapDemo parse error:', e);
      return null;
    }
  },

  renderPreview: (data: HeatmapDataPoint[]) => {
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <View style={styles.errorView}>
          <Text style={styles.errorText}>Please provide an array of data points</Text>
        </View>
      );
    }

    return (
      <Heatmap
        data={data}
        mode="full"
        showValues={false}
        height={400}
        xAxisLabel="Hour"
        yAxisLabel="Day"
        colorScale="blue"
        showGrid={true}
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

export default heatmapDemo;
