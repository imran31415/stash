// Graph visualization types for Neo4j-like graph data

export interface GraphNode {
  id: string;
  labels: string[]; // Neo4j node labels (e.g., ['Person', 'Employee'])
  properties: Record<string, any>;

  // Optional visual properties
  color?: string;
  size?: number;
  icon?: string;

  // Internal layout properties (managed by layout algorithm)
  x?: number;
  y?: number;
  vx?: number; // velocity x
  vy?: number; // velocity y
  fx?: number; // fixed x position
  fy?: number; // fixed y position
}

export interface GraphEdge {
  id: string;
  type: string; // Relationship type (e.g., 'KNOWS', 'WORKS_AT')
  source: string; // Source node ID
  target: string; // Target node ID
  properties?: Record<string, any>;

  // Optional visual properties
  color?: string;
  width?: number;
  label?: string;
  directed?: boolean; // Show arrow (default: true)

  // Internal cached properties
  sourceNode?: GraphNode;
  targetNode?: GraphNode;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata?: {
    name?: string;
    description?: string;
    nodeCount?: number;
    edgeCount?: number;
    [key: string]: any;
  };
}

export interface GraphLayout {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  scale: number;
  translateX: number;
  translateY: number;
}

export interface GraphStats {
  totalNodes: number;
  totalEdges: number;
  visibleNodes: number;
  visibleEdges: number;
  nodesByLabel: Record<string, number>;
  edgesByType: Record<string, number>;
}

export interface GraphVisualizationProps {
  data: GraphData;
  mode?: 'mini' | 'full';
  title?: string;
  subtitle?: string;

  // Interaction
  onNodePress?: (node: GraphNode) => void;
  onEdgePress?: (edge: GraphEdge) => void;
  onExpandPress?: () => void;

  // Visual configuration
  showLabels?: boolean;
  showEdgeLabels?: boolean;
  enablePhysics?: boolean; // Auto-layout with physics simulation
  enableZoom?: boolean;
  enablePan?: boolean;

  // Performance
  maxVisibleNodes?: number; // Limit rendering for performance
  maxVisibleEdges?: number; // Limit edge rendering for performance
  levelOfDetail?: 'low' | 'medium' | 'high';

  // Dimensions
  height?: number;
  width?: number;
}

export interface GraphVisualizationDetailViewProps {
  visible: boolean;
  data: GraphData;
  title?: string;
  subtitle?: string;
  onClose: () => void;

  // Interaction
  onNodePress?: (node: GraphNode) => void;
  onEdgePress?: (edge: GraphEdge) => void;

  // Visual configuration
  showLabels?: boolean;
  showEdgeLabels?: boolean;
  enablePhysics?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;

  // Search and filter
  searchable?: boolean;
  filterByLabel?: string[];
  filterByType?: string[];
}

// Neo4j-like query result format
export interface Neo4jNode {
  identity: number | string;
  labels: string[];
  properties: Record<string, any>;
}

export interface Neo4jRelationship {
  identity: number | string;
  start: number | string;
  end: number | string;
  type: string;
  properties?: Record<string, any>;
}

export interface Neo4jResult {
  records: Array<{
    _fields: any[];
    _fieldLookup: Record<string, number>;
  }>;
}

// Force simulation parameters
export interface ForceSimulationParams {
  repulsionStrength?: number; // How much nodes repel each other
  attractionStrength?: number; // How much edges pull nodes together
  centerStrength?: number; // How much nodes are pulled to center
  friction?: number; // Velocity damping
  iterations?: number; // Number of simulation steps
}
