import type { NetworkTopologyData, NetworkTopologyStats, NetworkNode, NetworkConnection } from './NetworkTopology.types';

/**
 * Calculate network topology statistics
 */
export function calculateNetworkStats(data: NetworkTopologyData): NetworkTopologyStats {
  let onlineNodes = 0;
  let offlineNodes = 0;
  let errorNodes = 0;
  let activeConnections = 0;
  let inactiveConnections = 0;

  data.nodes.forEach((node) => {
    if (node.status === 'online') onlineNodes++;
    else if (node.status === 'offline') offlineNodes++;
    else if (node.status === 'error') errorNodes++;
  });

  data.connections.forEach((conn) => {
    if (conn.status === 'active') activeConnections++;
    else if (conn.status === 'inactive') inactiveConnections++;
  });

  return {
    totalNodes: data.nodes.length,
    totalConnections: data.connections.length,
    onlineNodes,
    offlineNodes,
    errorNodes,
    activeConnections,
    inactiveConnections,
  };
}

/**
 * Get default icon for node type
 */
export function getNodeIcon(node: NetworkNode): string {
  if (node.icon) return node.icon;

  switch (node.type) {
    case 'server':
      return '🖥️';
    case 'router':
      return '📡';
    case 'switch':
      return '🔀';
    case 'firewall':
      return '🛡️';
    case 'database':
      return '💾';
    case 'client':
      return '💻';
    case 'cloud':
      return '☁️';
    default:
      return '⚫';
  }
}

/**
 * Get color for node status
 */
export function getNodeStatusColor(node: NetworkNode): string {
  if (node.color) return node.color;

  switch (node.status) {
    case 'online':
      return '#10B981';
    case 'offline':
      return '#6B7280';
    case 'warning':
      return '#F59E0B';
    case 'error':
      return '#EF4444';
    default:
      return '#3B82F6';
  }
}

/**
 * Get color for connection status
 */
export function getConnectionStatusColor(connection: NetworkConnection): string {
  switch (connection.status) {
    case 'active':
      return '#10B981';
    case 'inactive':
      return '#6B7280';
    case 'slow':
      return '#F59E0B';
    case 'error':
      return '#EF4444';
    default:
      return '#3B82F6';
  }
}

/**
 * Get connection stroke style
 */
export function getConnectionStrokeDashArray(connection: NetworkConnection): string | undefined {
  if (connection.type === 'wireless') return '5,5';
  if (connection.type === 'vpn') return '10,5';
  return undefined;
}

/**
 * Calculate simple force-directed layout
 */
export function calculateForceLayout(
  nodes: NetworkNode[],
  connections: NetworkConnection[],
  width: number,
  height: number
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  // Initialize random positions
  nodes.forEach((node) => {
    positions.set(node.id, {
      x: Math.random() * width,
      y: Math.random() * height,
    });
  });

  return positions;
}

/**
 * Calculate hierarchical layout
 */
export function calculateHierarchicalLayout(
  nodes: NetworkNode[],
  connections: NetworkConnection[],
  width: number,
  height: number
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const nodeWidth = 100;
  const nodeHeight = 80;
  const horizontalSpacing = 120;
  const verticalSpacing = 100;

  // Simple layering based on node dependencies
  const layers: string[][] = [];
  const visited = new Set<string>();
  const inDegree = new Map<string, number>();

  // Calculate in-degrees
  nodes.forEach((node) => inDegree.set(node.id, 0));
  connections.forEach((conn) => {
    inDegree.set(conn.target, (inDegree.get(conn.target) || 0) + 1);
  });

  // Find root nodes (no incoming connections)
  const roots = nodes.filter((node) => (inDegree.get(node.id) || 0) === 0);
  if (roots.length > 0) {
    layers.push(roots.map((n) => n.id));
    roots.forEach((n) => visited.add(n.id));
  }

  // Position nodes in layers
  layers.forEach((layer, layerIndex) => {
    const layerY = layerIndex * verticalSpacing + nodeHeight / 2;
    const startX = (width - (layer.length - 1) * horizontalSpacing) / 2;

    layer.forEach((nodeId, index) => {
      positions.set(nodeId, {
        x: startX + index * horizontalSpacing,
        y: layerY,
      });
    });
  });

  // Position remaining nodes
  let currentY = layers.length * verticalSpacing;
  nodes.forEach((node, index) => {
    if (!positions.has(node.id)) {
      positions.set(node.id, {
        x: (index % 4) * horizontalSpacing + nodeWidth / 2,
        y: currentY,
      });
    }
  });

  return positions;
}

/**
 * Calculate circular layout
 */
export function calculateCircularLayout(
  nodes: NetworkNode[],
  width: number,
  height: number
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.35;

  nodes.forEach((node, index) => {
    const angle = (index / nodes.length) * 2 * Math.PI;
    positions.set(node.id, {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });
  });

  return positions;
}

/**
 * Format bandwidth
 */
export function formatBandwidth(mbps: number): string {
  if (mbps < 1) return `${(mbps * 1000).toFixed(0)} Kbps`;
  if (mbps < 1000) return `${mbps.toFixed(0)} Mbps`;
  return `${(mbps / 1000).toFixed(1)} Gbps`;
}

/**
 * Format latency
 */
export function formatLatency(ms: number): string {
  return `${ms.toFixed(0)}ms`;
}
