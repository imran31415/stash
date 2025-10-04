import type {
  WorkflowNode,
  WorkflowEdge,
  WorkflowData,
  DAGLayoutParams,
  PositionedNode,
  PositionedEdge,
  WorkflowStats,
  WorkflowNodeType,
  WorkflowNodeStatus,
} from './Workflow.types';

// Color schemes for different node types
const NODE_TYPE_COLORS: Record<WorkflowNodeType, string> = {
  start: '#10B981', // Green
  end: '#EF4444', // Red
  task: '#3B82F6', // Blue
  condition: '#F59E0B', // Orange
  parallel: '#8B5CF6', // Purple
  merge: '#6366F1', // Indigo
  api: '#06B6D4', // Cyan
  database: '#EC4899', // Pink
  transform: '#14B8A6', // Teal
  notification: '#F97316', // Orange
  schedule: '#84CC16', // Lime
  manual: '#64748B', // Slate
  custom: '#6B7280', // Gray
};

// Color schemes for different node statuses
const NODE_STATUS_COLORS: Record<WorkflowNodeStatus, string> = {
  idle: '#9CA3AF', // Gray
  waiting: '#FCD34D', // Yellow
  running: '#60A5FA', // Blue
  success: '#34D399', // Green
  failed: '#F87171', // Red
  skipped: '#D1D5DB', // Light Gray
};

// Icon mappings for node types
const NODE_TYPE_ICONS: Record<WorkflowNodeType, string> = {
  start: '▶️',
  end: '🏁',
  task: '⚙️',
  condition: '🔀',
  parallel: '⚡',
  merge: '🔗',
  api: '🌐',
  database: '💾',
  transform: '🔄',
  notification: '📬',
  schedule: '⏰',
  manual: '👤',
  custom: '📦',
};

/**
 * Calculate statistics for a workflow
 */
export function calculateWorkflowStats(data: WorkflowData): WorkflowStats {
  const nodesByType: Record<WorkflowNodeType, number> = {
    start: 0,
    end: 0,
    task: 0,
    condition: 0,
    parallel: 0,
    merge: 0,
    api: 0,
    database: 0,
    transform: 0,
    notification: 0,
    schedule: 0,
    manual: 0,
    custom: 0,
  };

  const nodesByStatus: Record<WorkflowNodeStatus, number> = {
    idle: 0,
    waiting: 0,
    running: 0,
    success: 0,
    failed: 0,
    skipped: 0,
  };

  data.nodes.forEach((node) => {
    nodesByType[node.type] = (nodesByType[node.type] || 0) + 1;
    if (node.status) {
      nodesByStatus[node.status] = (nodesByStatus[node.status] || 0) + 1;
    }
  });

  const positioned = calculateLayeredLayout(data.nodes, data.edges, {
    width: 800,
    height: 600,
    nodeWidth: 120,
    nodeHeight: 60,
    horizontalSpacing: 80,
    verticalSpacing: 100,
    orientation: 'horizontal',
    algorithm: 'layered',
  });

  const layers = new Set(positioned.map((n) => n.layer)).size;
  const nodesPerLayer = positioned.reduce((acc, node) => {
    acc[node.layer] = (acc[node.layer] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  const maxNodesPerLayer = Math.max(...Object.values(nodesPerLayer), 0);

  return {
    totalNodes: data.nodes.length,
    totalEdges: data.edges.length,
    nodesByType,
    nodesByStatus,
    layers,
    maxNodesPerLayer,
    longestPath: calculateLongestPath(data.nodes, data.edges),
  };
}

/**
 * Get color for a node based on status or type
 */
export function getNodeColor(node: WorkflowNode, prioritizeStatus = true): string {
  if (node.color) return node.color;
  if (prioritizeStatus && node.status) {
    return NODE_STATUS_COLORS[node.status];
  }
  return NODE_TYPE_COLORS[node.type];
}

/**
 * Get icon for a node
 */
export function getNodeIcon(node: WorkflowNode): string {
  return node.icon || NODE_TYPE_ICONS[node.type] || '📦';
}

/**
 * Get node label (truncated if too long)
 */
export function getNodeLabel(node: WorkflowNode, maxLength = 20): string {
  if (node.label.length <= maxLength) return node.label;
  return node.label.substring(0, maxLength - 3) + '...';
}

/**
 * Build adjacency list for DAG
 */
function buildAdjacencyList(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): Map<string, string[]> {
  const adjacencyList = new Map<string, string[]>();

  nodes.forEach((node) => {
    adjacencyList.set(node.id, []);
  });

  edges.forEach((edge) => {
    const neighbors = adjacencyList.get(edge.source) || [];
    neighbors.push(edge.target);
    adjacencyList.set(edge.source, neighbors);
  });

  return adjacencyList;
}

/**
 * Build reverse adjacency list (parent nodes)
 */
function buildReverseAdjacencyList(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): Map<string, string[]> {
  const reverseList = new Map<string, string[]>();

  nodes.forEach((node) => {
    reverseList.set(node.id, []);
  });

  edges.forEach((edge) => {
    const parents = reverseList.get(edge.target) || [];
    parents.push(edge.source);
    reverseList.set(edge.target, parents);
  });

  return reverseList;
}

/**
 * Topological sort using Kahn's algorithm
 */
function topologicalSort(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[][] {
  const adjacencyList = buildAdjacencyList(nodes, edges);
  const reverseList = buildReverseAdjacencyList(nodes, edges);
  const inDegree = new Map<string, number>();

  // Calculate in-degree for each node
  nodes.forEach((node) => {
    inDegree.set(node.id, reverseList.get(node.id)?.length || 0);
  });

  const layers: string[][] = [];
  const processed = new Set<string>();

  while (processed.size < nodes.length) {
    const currentLayer: string[] = [];

    // Find all nodes with in-degree 0 that haven't been processed
    nodes.forEach((node) => {
      if (!processed.has(node.id) && inDegree.get(node.id) === 0) {
        currentLayer.push(node.id);
      }
    });

    if (currentLayer.length === 0) {
      // Handle cycles or disconnected nodes
      const remaining = nodes.filter((n) => !processed.has(n.id));
      if (remaining.length > 0) {
        currentLayer.push(remaining[0].id);
      } else {
        break;
      }
    }

    layers.push(currentLayer);

    // Mark nodes as processed and update in-degrees
    currentLayer.forEach((nodeId) => {
      processed.add(nodeId);
      const neighbors = adjacencyList.get(nodeId) || [];
      neighbors.forEach((neighborId) => {
        const degree = inDegree.get(neighborId) || 0;
        inDegree.set(neighborId, Math.max(0, degree - 1));
      });
    });
  }

  return layers;
}

/**
 * Calculate layered layout for DAG (Sugiyama framework)
 */
export function calculateLayeredLayout(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  params: DAGLayoutParams
): PositionedNode[] {
  if (nodes.length === 0) return [];

  // Step 1: Assign nodes to layers using topological sort
  const layers = topologicalSort(nodes, edges);

  // Step 2: Minimize edge crossings (simplified - just center align for now)
  const positionedNodes: PositionedNode[] = [];
  const nodeMap = new Map<string, WorkflowNode>();
  nodes.forEach((node) => nodeMap.set(node.id, node));

  const {
    width,
    height,
    nodeWidth,
    nodeHeight,
    horizontalSpacing,
    verticalSpacing,
    orientation,
  } = params;

  layers.forEach((layer, layerIndex) => {
    const nodesInLayer = layer.length;

    layer.forEach((nodeId, columnIndex) => {
      const node = nodeMap.get(nodeId);
      if (!node) return;

      let x: number;
      let y: number;

      if (orientation === 'horizontal') {
        // Horizontal layout: layers go left to right
        x = layerIndex * (nodeWidth + horizontalSpacing) + horizontalSpacing;

        // Center nodes vertically in their layer
        const totalHeight = nodesInLayer * nodeHeight + (nodesInLayer - 1) * verticalSpacing;
        const startY = (height - totalHeight) / 2;
        y = startY + columnIndex * (nodeHeight + verticalSpacing);
      } else {
        // Vertical layout: layers go top to bottom
        y = layerIndex * (nodeHeight + verticalSpacing) + verticalSpacing;

        // Center nodes horizontally in their layer
        const totalWidth = nodesInLayer * nodeWidth + (nodesInLayer - 1) * horizontalSpacing;
        const startX = (width - totalWidth) / 2;
        x = startX + columnIndex * (nodeWidth + horizontalSpacing);
      }

      positionedNodes.push({
        ...node,
        x,
        y,
        layer: layerIndex,
        column: columnIndex,
      });
    });
  });

  return positionedNodes;
}

/**
 * Calculate SVG path for edge with smooth curves
 */
export function calculateEdgePath(
  sourceNode: PositionedNode,
  targetNode: PositionedNode,
  nodeWidth: number,
  nodeHeight: number,
  orientation: 'horizontal' | 'vertical'
): string {
  let sourceX: number;
  let sourceY: number;
  let targetX: number;
  let targetY: number;

  if (orientation === 'horizontal') {
    // Connect from right edge of source to left edge of target
    sourceX = sourceNode.x + nodeWidth;
    sourceY = sourceNode.y + nodeHeight / 2;
    targetX = targetNode.x;
    targetY = targetNode.y + nodeHeight / 2;

    // Use cubic Bezier curve for smooth connection
    const controlPoint1X = sourceX + (targetX - sourceX) / 2;
    const controlPoint1Y = sourceY;
    const controlPoint2X = targetX - (targetX - sourceX) / 2;
    const controlPoint2Y = targetY;

    return `M ${sourceX} ${sourceY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${targetX} ${targetY}`;
  } else {
    // Connect from bottom edge of source to top edge of target
    sourceX = sourceNode.x + nodeWidth / 2;
    sourceY = sourceNode.y + nodeHeight;
    targetX = targetNode.x + nodeWidth / 2;
    targetY = targetNode.y;

    // Use cubic Bezier curve for smooth connection
    const controlPoint1X = sourceX;
    const controlPoint1Y = sourceY + (targetY - sourceY) / 2;
    const controlPoint2X = targetX;
    const controlPoint2Y = targetY - (targetY - sourceY) / 2;

    return `M ${sourceX} ${sourceY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${targetX} ${targetY}`;
  }
}

/**
 * Calculate positioned edges with paths
 */
export function calculatePositionedEdges(
  edges: WorkflowEdge[],
  positionedNodes: PositionedNode[],
  nodeWidth: number,
  nodeHeight: number,
  orientation: 'horizontal' | 'vertical'
): PositionedEdge[] {
  const nodeMap = new Map<string, PositionedNode>();
  positionedNodes.forEach((node) => nodeMap.set(node.id, node));

  return edges.map((edge) => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);

    if (!sourceNode || !targetNode) {
      return {
        ...edge,
        path: '',
        sourceX: 0,
        sourceY: 0,
        targetX: 0,
        targetY: 0,
      };
    }

    const path = calculateEdgePath(sourceNode, targetNode, nodeWidth, nodeHeight, orientation);

    let sourceX: number;
    let sourceY: number;
    let targetX: number;
    let targetY: number;

    if (orientation === 'horizontal') {
      sourceX = sourceNode.x + nodeWidth;
      sourceY = sourceNode.y + nodeHeight / 2;
      targetX = targetNode.x;
      targetY = targetNode.y + nodeHeight / 2;
    } else {
      sourceX = sourceNode.x + nodeWidth / 2;
      sourceY = sourceNode.y + nodeHeight;
      targetX = targetNode.x + nodeWidth / 2;
      targetY = targetNode.y;
    }

    return {
      ...edge,
      path,
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourceNode,
      targetNode,
    };
  });
}

/**
 * Calculate longest path in DAG (critical path)
 */
export function calculateLongestPath(nodes: WorkflowNode[], edges: WorkflowEdge[]): number {
  const adjacencyList = buildAdjacencyList(nodes, edges);
  const reverseList = buildReverseAdjacencyList(nodes, edges);
  const distance = new Map<string, number>();

  // Initialize distances
  nodes.forEach((node) => {
    distance.set(node.id, 0);
  });

  // Process nodes in topological order
  const layers = topologicalSort(nodes, edges);
  layers.forEach((layer) => {
    layer.forEach((nodeId) => {
      const parents = reverseList.get(nodeId) || [];
      const maxParentDistance = Math.max(
        0,
        ...parents.map((parentId) => distance.get(parentId) || 0)
      );
      distance.set(nodeId, maxParentDistance + 1);
    });
  });

  return Math.max(...Array.from(distance.values()), 0);
}

/**
 * Find critical path nodes (longest path in DAG)
 */
export function findCriticalPath(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
  const adjacencyList = buildAdjacencyList(nodes, edges);
  const reverseList = buildReverseAdjacencyList(nodes, edges);
  const distance = new Map<string, number>();
  const parent = new Map<string, string | null>();

  // Initialize
  nodes.forEach((node) => {
    distance.set(node.id, 0);
    parent.set(node.id, null);
  });

  // Calculate distances
  const layers = topologicalSort(nodes, edges);
  layers.forEach((layer) => {
    layer.forEach((nodeId) => {
      const parents = reverseList.get(nodeId) || [];
      let maxDistance = 0;
      let maxParent: string | null = null;

      parents.forEach((parentId) => {
        const parentDistance = distance.get(parentId) || 0;
        if (parentDistance > maxDistance) {
          maxDistance = parentDistance;
          maxParent = parentId;
        }
      });

      distance.set(nodeId, maxDistance + 1);
      parent.set(nodeId, maxParent);
    });
  });

  // Find node with maximum distance
  let maxDistance = 0;
  let endNode: string | null = null;
  distance.forEach((dist, nodeId) => {
    if (dist > maxDistance) {
      maxDistance = dist;
      endNode = nodeId;
    }
  });

  // Backtrack to find path
  const path: string[] = [];
  let current: string | null = endNode;
  while (current !== null) {
    path.unshift(current);
    current = parent.get(current) || null;
  }

  return path;
}

/**
 * Format duration for display
 */
export function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) return `${milliseconds}ms`;
  if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`;
  if (milliseconds < 3600000) return `${(milliseconds / 60000).toFixed(1)}m`;
  return `${(milliseconds / 3600000).toFixed(1)}h`;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(date: Date): string {
  return date.toLocaleString();
}

/**
 * Get edge color based on condition type
 */
export function getEdgeColor(edge: WorkflowEdge): string {
  if (edge.color) return edge.color;

  switch (edge.conditionType) {
    case 'success':
      return '#10B981'; // Green
    case 'failure':
      return '#EF4444'; // Red
    case 'conditional':
      return '#F59E0B'; // Orange
    default:
      return '#6B7280'; // Gray
  }
}

/**
 * Get stroke dash array based on edge style
 */
export function getEdgeStrokeDashArray(edge: WorkflowEdge): string | undefined {
  if (edge.style === 'dashed') return '5,5';
  if (edge.style === 'dotted') return '2,2';
  return undefined;
}
