import ganttDemo from './ganttDemo';
import timeSeriesDemo from './timeSeriesDemo';
import liveTimeSeriesDemo from './liveTimeSeriesDemo';
import heatmapDemo from './heatmapDemo';
import kanbanDemo from './kanbanDemo';
import treeViewDemo from './treeViewDemo';
import graphVisualizationDemo from './graphVisualizationDemo';
import workflowDemo from './workflowDemo';
import dashboardDemo from './dashboardDemo';
import { DemoConfig } from './types';

export const demos: Record<string, DemoConfig> = {
  gantt: ganttDemo,
  timeseries: timeSeriesDemo,
  'live-timeseries': liveTimeSeriesDemo,
  heatmap: heatmapDemo,
  kanban: kanbanDemo,
  treeview: treeViewDemo,
  graph: graphVisualizationDemo,
  workflow: workflowDemo,
  dashboard: dashboardDemo,
};

export type { DemoConfig } from './types';
