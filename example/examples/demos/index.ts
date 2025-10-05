import ganttDemo from './ganttDemo';
import timeSeriesDemo from './timeSeriesDemo';
import heatmapDemo from './heatmapDemo';
import kanbanDemo from './kanbanDemo';
import treeViewDemo from './treeViewDemo';
import { DemoConfig } from './types';

export const demos: Record<string, DemoConfig> = {
  gantt: ganttDemo,
  timeseries: timeSeriesDemo,
  heatmap: heatmapDemo,
  kanban: kanbanDemo,
  treeview: treeViewDemo,
};

export type { DemoConfig } from './types';
