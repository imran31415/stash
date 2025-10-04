// Workflow DAG visualization types for Airflow/n8n-like workflows

export type WorkflowNodeStatus = 'idle' | 'running' | 'success' | 'failed' | 'skipped' | 'waiting';

export type WorkflowNodeType =
  | 'start'
  | 'end'
  | 'task'
  | 'condition'
  | 'parallel'
  | 'merge'
  | 'api'
  | 'database'
  | 'transform'
  | 'notification'
  | 'schedule'
  | 'manual'
  | 'custom';

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  label: string;
  description?: string;
  status?: WorkflowNodeStatus;
  icon?: string; // Emoji or icon identifier

  // Node execution metadata
  metadata?: {
    startTime?: Date;
    endTime?: Date;
    duration?: number; // in milliseconds
    retries?: number;
    logs?: string;
    error?: string;
    output?: any;
    [key: string]: any;
  };

  // Visual properties
  color?: string; // Override default color based on type/status
  size?: number;

  // Layout properties (managed by layout algorithm)
  x?: number;
  y?: number;
  layer?: number; // DAG layer/level for hierarchical layout
  column?: number; // Column within layer for parallel nodes
}

export interface WorkflowEdge {
  id: string;
  source: string; // Source node ID
  target: string; // Target node ID
  label?: string; // Edge label (e.g., "success", "failure", "condition=true")

  // Conditional edge properties
  condition?: string; // Display condition (e.g., "if status == 200")
  conditionType?: 'success' | 'failure' | 'always' | 'conditional';

  // Edge execution metadata
  metadata?: {
    executionCount?: number;
    lastExecuted?: Date;
    [key: string]: any;
  };

  // Visual properties
  color?: string;
  width?: number;
  style?: 'solid' | 'dashed' | 'dotted';
  animated?: boolean; // Animate edge when workflow is running

  // Internal cached properties
  sourceNode?: WorkflowNode;
  targetNode?: WorkflowNode;
}

export interface WorkflowData {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];

  // Workflow metadata
  metadata?: {
    created?: Date;
    modified?: Date;
    version?: string;
    author?: string;
    tags?: string[];
    executionCount?: number;
    lastExecuted?: Date;
    averageDuration?: number;
    successRate?: number;
    [key: string]: any;
  };
}

export interface WorkflowLayout {
  width: number;
  height: number;
  nodeWidth: number;
  nodeHeight: number;
  horizontalSpacing: number;
  verticalSpacing: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
}

export interface WorkflowStats {
  totalNodes: number;
  totalEdges: number;
  nodesByType: Record<WorkflowNodeType, number>;
  nodesByStatus: Record<WorkflowNodeStatus, number>;
  layers: number;
  maxNodesPerLayer: number;
  longestPath: number; // Critical path length
}

export interface WorkflowProps {
  data: WorkflowData;
  mode?: 'mini' | 'full';
  title?: string;
  subtitle?: string;

  // Interaction
  onNodePress?: (node: WorkflowNode) => void;
  onEdgePress?: (edge: WorkflowEdge) => void;
  onExpandPress?: () => void;

  // Visual configuration
  showLabels?: boolean;
  showEdgeLabels?: boolean;
  showStatus?: boolean; // Show status indicators on nodes
  showMetadata?: boolean; // Show execution metadata
  orientation?: 'horizontal' | 'vertical'; // DAG flow direction

  // Live execution
  enableLiveUpdates?: boolean; // Update workflow status in real-time
  animateExecution?: boolean; // Animate nodes/edges during execution
  highlightCriticalPath?: boolean; // Highlight the longest execution path

  // Layout options
  layoutAlgorithm?: 'layered' | 'compact' | 'centered'; // DAG layout strategy
  nodeSpacing?: number; // Spacing between nodes
  layerSpacing?: number; // Spacing between layers

  // Dimensions
  height?: number;
  width?: number;
}

export interface WorkflowDetailViewProps {
  visible: boolean;
  data: WorkflowData;
  title?: string;
  subtitle?: string;
  onClose: () => void;

  // Interaction
  onNodePress?: (node: WorkflowNode) => void;
  onEdgePress?: (edge: WorkflowEdge) => void;

  // Visual configuration
  showLabels?: boolean;
  showEdgeLabels?: boolean;
  showStatus?: boolean;
  showMetadata?: boolean;
  orientation?: 'horizontal' | 'vertical';

  // Features
  enableLiveUpdates?: boolean;
  animateExecution?: boolean;
  highlightCriticalPath?: boolean;

  // Search and filter
  searchable?: boolean;
  filterByType?: WorkflowNodeType[];
  filterByStatus?: WorkflowNodeStatus[];
}

// DAG layout algorithm parameters
export interface DAGLayoutParams {
  width: number;
  height: number;
  nodeWidth: number;
  nodeHeight: number;
  horizontalSpacing: number;
  verticalSpacing: number;
  orientation: 'horizontal' | 'vertical';
  algorithm: 'layered' | 'compact' | 'centered';
}

// Node position after layout calculation
export interface PositionedNode extends WorkflowNode {
  x: number;
  y: number;
  layer: number;
  column: number;
}

// Edge with calculated path
export interface PositionedEdge extends WorkflowEdge {
  path: string; // SVG path string
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  controlPoints?: { x: number; y: number }[];
}
