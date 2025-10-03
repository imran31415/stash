import type {
  GraphNode,
  GraphEdge,
  GraphData,
  GraphStats,
  ForceSimulationParams,
  Neo4jNode,
  Neo4jRelationship,
} from './GraphVisualization.types';

/**
 * Convert Neo4j query results to GraphData format
 */
export function neo4jToGraphData(
  nodes: Neo4jNode[],
  relationships: Neo4jRelationship[]
): GraphData {
  const graphNodes: GraphNode[] = nodes.map(node => ({
    id: String(node.identity),
    labels: node.labels,
    properties: node.properties,
  }));

  const graphEdges: GraphEdge[] = relationships.map(rel => ({
    id: String(rel.identity),
    type: rel.type,
    source: String(rel.start),
    target: String(rel.end),
    properties: rel.properties,
    directed: true,
  }));

  return {
    nodes: graphNodes,
    edges: graphEdges,
    metadata: {
      nodeCount: graphNodes.length,
      edgeCount: graphEdges.length,
    },
  };
}

/**
 * Calculate graph statistics
 */
export function calculateGraphStats(data: GraphData): GraphStats {
  const nodesByLabel: Record<string, number> = {};
  const edgesByType: Record<string, number> = {};

  data.nodes.forEach(node => {
    node.labels.forEach(label => {
      nodesByLabel[label] = (nodesByLabel[label] || 0) + 1;
    });
  });

  data.edges.forEach(edge => {
    edgesByType[edge.type] = (edgesByType[edge.type] || 0) + 1;
  });

  return {
    totalNodes: data.nodes.length,
    totalEdges: data.edges.length,
    visibleNodes: data.nodes.length,
    visibleEdges: data.edges.length,
    nodesByLabel,
    edgesByType,
  };
}

/**
 * Get a color for a node based on its primary label
 */
export function getNodeColor(node: GraphNode, index: number): string {
  if (node.color) return node.color;

  // Color palette for different node types
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
  ];

  // Use primary label to determine color
  const primaryLabel = node.labels[0] || 'Unknown';
  const hash = primaryLabel.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return colors[hash % colors.length];
}

/**
 * Get node size based on number of connections (degree centrality)
 */
export function getNodeSize(node: GraphNode, edges: GraphEdge[]): number {
  if (node.size) return node.size;

  // Count connections
  const degree = edges.filter(
    edge => edge.source === node.id || edge.target === node.id
  ).length;

  // Base size + size based on degree
  return Math.max(20, Math.min(50, 20 + degree * 3));
}

/**
 * Initialize node positions in a circle layout (fast initial layout)
 */
export function initializeCircleLayout(
  nodes: GraphNode[],
  width: number,
  height: number
): GraphNode[] {
  const radius = Math.min(width, height) * 0.35;
  const centerX = width / 2;
  const centerY = height / 2;

  return nodes.map((node, i) => {
    const angle = (2 * Math.PI * i) / nodes.length;
    return {
      ...node,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      vx: 0,
      vy: 0,
    };
  });
}

/**
 * Initialize node positions randomly
 */
export function initializeRandomLayout(
  nodes: GraphNode[],
  width: number,
  height: number
): GraphNode[] {
  return nodes.map(node => ({
    ...node,
    x: Math.random() * width,
    y: Math.random() * height,
    vx: 0,
    vy: 0,
  }));
}

/**
 * Force-directed layout algorithm (improved)
 * Based on Fruchterman-Reingold with improvements for better spacing
 */
export function applyForceLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number,
  params: ForceSimulationParams = {}
): GraphNode[] {
  const {
    repulsionStrength = 5000, // Increased for better spacing
    attractionStrength = 0.005, // Reduced to allow more separation
    centerStrength = 0.02, // Gentler center pull
    friction = 0.85, // Slightly more friction for stability
    iterations = 100, // More iterations for better convergence
  } = params;

  // Clone nodes to avoid mutation
  let layoutNodes = nodes.map(n => ({ ...n }));

  // Initialize positions if not set (use circle layout as starting point)
  layoutNodes = layoutNodes.map((node, i) => {
    if (node.x === undefined || node.y === undefined) {
      const angle = (2 * Math.PI * i) / nodes.length;
      const radius = Math.min(width, height) * 0.3;
      return {
        ...node,
        x: width / 2 + radius * Math.cos(angle),
        y: height / 2 + radius * Math.sin(angle),
        vx: 0,
        vy: 0,
      };
    }
    return node;
  });

  const centerX = width / 2;
  const centerY = height / 2;

  // Ideal edge length (minimum distance between connected nodes)
  const idealEdgeLength = 120;

  // Minimum distance between any two nodes (for collision detection)
  const minNodeDistance = 80;

  // Run simulation
  for (let iter = 0; iter < iterations; iter++) {
    // Cooling factor (reduces force strength over time)
    const cooling = 1 - iter / iterations;
    const temp = cooling * 0.5; // Temperature for velocity scaling

    // Reset forces
    layoutNodes.forEach(node => {
      node.vx = (node.vx || 0) * friction;
      node.vy = (node.vy || 0) * friction;
    });

    // Repulsive forces between all nodes (O(n²))
    for (let i = 0; i < layoutNodes.length; i++) {
      for (let j = i + 1; j < layoutNodes.length; j++) {
        const nodeA = layoutNodes[i];
        const nodeB = layoutNodes[j];

        const dx = (nodeB.x || 0) - (nodeA.x || 0);
        const dy = (nodeB.y || 0) - (nodeA.y || 0);
        const distanceSquared = dx * dx + dy * dy;
        const distance = Math.sqrt(distanceSquared) || 1;

        // Strong repulsion when nodes are too close
        let force = (repulsionStrength * cooling) / Math.max(distanceSquared, 100);

        // Extra repulsion if nodes are within minimum distance
        if (distance < minNodeDistance) {
          force += (minNodeDistance - distance) * 2;
        }

        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        nodeA.vx = (nodeA.vx || 0) - fx;
        nodeA.vy = (nodeA.vy || 0) - fy;
        nodeB.vx = (nodeB.vx || 0) + fx;
        nodeB.vy = (nodeB.vy || 0) + fy;
      }
    }

    // Attractive forces along edges with ideal length
    edges.forEach(edge => {
      const source = layoutNodes.find(n => n.id === edge.source);
      const target = layoutNodes.find(n => n.id === edge.target);

      if (!source || !target) return;

      const dx = (target.x || 0) - (source.x || 0);
      const dy = (target.y || 0) - (source.y || 0);
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;

      // Spring force toward ideal edge length
      const displacement = distance - idealEdgeLength;
      const force = displacement * attractionStrength * cooling;

      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;

      source.vx = (source.vx || 0) + fx;
      source.vy = (source.vy || 0) + fy;
      target.vx = (target.vx || 0) - fx;
      target.vy = (target.vy || 0) - fy;
    });

    // Center gravity (weaker for larger graphs)
    const centerForce = centerStrength * cooling * Math.max(0.3, 1 - nodes.length / 100);
    layoutNodes.forEach(node => {
      const dx = centerX - (node.x || 0);
      const dy = centerY - (node.y || 0);

      node.vx = (node.vx || 0) + dx * centerForce;
      node.vy = (node.vy || 0) + dy * centerForce;
    });

    // Update positions
    layoutNodes.forEach(node => {
      // Skip if node is fixed
      if (node.fx !== undefined && node.fy !== undefined) {
        node.x = node.fx;
        node.y = node.fy;
        return;
      }

      // Apply velocity with temperature scaling
      node.x = (node.x || 0) + (node.vx || 0) * temp;
      node.y = (node.y || 0) + (node.vy || 0) * temp;

      // Keep nodes within bounds with padding
      const padding = 80;
      node.x = Math.max(padding, Math.min(width - padding, node.x));
      node.y = Math.max(padding, Math.min(height - padding, node.y));
    });
  }

  return layoutNodes;
}

/**
 * Async force-directed layout with progress updates
 * Breaks computation into chunks to prevent UI freezing
 */
export async function applyForceLayoutAsync(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number,
  params: ForceSimulationParams = {},
  onProgress?: (progress: number, iteration: number) => void
): Promise<GraphNode[]> {
  const {
    repulsionStrength = 5000,
    attractionStrength = 0.005,
    centerStrength = 0.02,
    friction = 0.85,
    iterations = 100,
  } = params;

  // Reduce iterations for very large graphs to improve performance
  const adjustedIterations = nodes.length > 500 ? Math.min(iterations, 50) : iterations;

  // Process iterations in smaller chunks to avoid blocking
  const chunkSize = nodes.length > 200 ? 5 : 10;

  // Clone nodes to avoid mutation
  let layoutNodes = nodes.map(n => ({ ...n }));

  // Initialize positions if not set
  layoutNodes = layoutNodes.map((node, i) => {
    if (node.x === undefined || node.y === undefined) {
      const angle = (2 * Math.PI * i) / nodes.length;
      const radius = Math.min(width, height) * 0.3;
      return {
        ...node,
        x: width / 2 + radius * Math.cos(angle),
        y: height / 2 + radius * Math.sin(angle),
        vx: 0,
        vy: 0,
      };
    }
    return node;
  });

  const centerX = width / 2;
  const centerY = height / 2;
  const idealEdgeLength = 120;
  const minNodeDistance = 80;

  // Process iterations in chunks
  for (let chunkStart = 0; chunkStart < adjustedIterations; chunkStart += chunkSize) {
    const chunkEnd = Math.min(chunkStart + chunkSize, adjustedIterations);

    // Process a chunk of iterations synchronously
    for (let iter = chunkStart; iter < chunkEnd; iter++) {
      const cooling = 1 - iter / adjustedIterations;
      const temp = cooling * 0.5;

      // Reset forces
      layoutNodes.forEach(node => {
        node.vx = (node.vx || 0) * friction;
        node.vy = (node.vy || 0) * friction;
      });

      // Repulsive forces between all nodes
      for (let i = 0; i < layoutNodes.length; i++) {
        for (let j = i + 1; j < layoutNodes.length; j++) {
          const nodeA = layoutNodes[i];
          const nodeB = layoutNodes[j];

          const dx = (nodeB.x || 0) - (nodeA.x || 0);
          const dy = (nodeB.y || 0) - (nodeA.y || 0);
          const distanceSquared = dx * dx + dy * dy;
          const distance = Math.sqrt(distanceSquared) || 1;

          let force = (repulsionStrength * cooling) / Math.max(distanceSquared, 100);

          if (distance < minNodeDistance) {
            force += (minNodeDistance - distance) * 2;
          }

          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;

          nodeA.vx = (nodeA.vx || 0) - fx;
          nodeA.vy = (nodeA.vy || 0) - fy;
          nodeB.vx = (nodeB.vx || 0) + fx;
          nodeB.vy = (nodeB.vy || 0) + fy;
        }
      }

      // Attractive forces along edges
      edges.forEach(edge => {
        const source = layoutNodes.find(n => n.id === edge.source);
        const target = layoutNodes.find(n => n.id === edge.target);

        if (!source || !target) return;

        const dx = (target.x || 0) - (source.x || 0);
        const dy = (target.y || 0) - (source.y || 0);
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

        const displacement = distance - idealEdgeLength;
        const force = displacement * attractionStrength * cooling;

        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        source.vx = (source.vx || 0) + fx;
        source.vy = (source.vy || 0) + fy;
        target.vx = (target.vx || 0) - fx;
        target.vy = (target.vy || 0) - fy;
      });

      // Center gravity
      const centerForce = centerStrength * cooling * Math.max(0.3, 1 - nodes.length / 100);
      layoutNodes.forEach(node => {
        const dx = centerX - (node.x || 0);
        const dy = centerY - (node.y || 0);

        node.vx = (node.vx || 0) + dx * centerForce;
        node.vy = (node.vy || 0) + dy * centerForce;
      });

      // Update positions
      layoutNodes.forEach(node => {
        if (node.fx !== undefined && node.fy !== undefined) {
          node.x = node.fx;
          node.y = node.fy;
          return;
        }

        node.x = (node.x || 0) + (node.vx || 0) * temp;
        node.y = (node.y || 0) + (node.vy || 0) * temp;

        const padding = 80;
        node.x = Math.max(padding, Math.min(width - padding, node.x));
        node.y = Math.max(padding, Math.min(height - padding, node.y));
      });
    }

    // Update progress
    if (onProgress) {
      const progress = Math.round((chunkEnd / adjustedIterations) * 100);
      onProgress(progress, chunkEnd);
    }

    // Yield to event loop between chunks (except for the last chunk)
    if (chunkEnd < adjustedIterations) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  return layoutNodes;
}

/**
 * Find nodes within a viewport (for rendering optimization)
 */
export function getVisibleNodes(
  nodes: GraphNode[],
  viewportX: number,
  viewportY: number,
  viewportWidth: number,
  viewportHeight: number,
  scale: number
): GraphNode[] {
  return nodes.filter(node => {
    if (node.x === undefined || node.y === undefined) return false;

    const scaledX = node.x * scale;
    const scaledY = node.y * scale;

    return (
      scaledX >= viewportX - 100 &&
      scaledX <= viewportX + viewportWidth + 100 &&
      scaledY >= viewportY - 100 &&
      scaledY <= viewportY + viewportHeight + 100
    );
  });
}

/**
 * Find edges connected to visible nodes
 */
export function getVisibleEdges(
  edges: GraphEdge[],
  visibleNodeIds: Set<string>
): GraphEdge[] {
  return edges.filter(
    edge => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
  );
}

/**
 * Calculate bounding box of all nodes
 */
export function calculateBoundingBox(nodes: GraphNode[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach(node => {
    if (node.x !== undefined && node.y !== undefined) {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x);
      maxY = Math.max(maxY, node.y);
    }
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Get a display label for a node
 */
export function getNodeLabel(node: GraphNode): string {
  // Try common property names for labels
  const nameProps = ['name', 'title', 'label', 'id'];

  for (const prop of nameProps) {
    if (node.properties[prop]) {
      return String(node.properties[prop]);
    }
  }

  // Fallback to primary label
  return node.labels[0] || node.id;
}

/**
 * Search nodes by label or properties
 */
export function searchNodes(nodes: GraphNode[], query: string): GraphNode[] {
  const lowerQuery = query.toLowerCase();

  return nodes.filter(node => {
    // Search in labels
    if (node.labels.some(label => label.toLowerCase().includes(lowerQuery))) {
      return true;
    }

    // Search in properties
    const nodeLabel = getNodeLabel(node).toLowerCase();
    if (nodeLabel.includes(lowerQuery)) {
      return true;
    }

    // Search in all property values
    return Object.values(node.properties).some(value =>
      String(value).toLowerCase().includes(lowerQuery)
    );
  });
}

/**
 * Filter nodes by label
 */
export function filterNodesByLabel(nodes: GraphNode[], labels: string[]): GraphNode[] {
  if (labels.length === 0) return nodes;

  return nodes.filter(node =>
    node.labels.some(label => labels.includes(label))
  );
}

/**
 * Filter edges by type
 */
export function filterEdgesByType(edges: GraphEdge[], types: string[]): GraphEdge[] {
  if (types.length === 0) return edges;

  return edges.filter(edge => types.includes(edge.type));
}

/**
 * Get all neighbors of a node (connected by edges)
 */
export function getNodeNeighbors(nodeId: string, edges: GraphEdge[]): string[] {
  const neighbors = new Set<string>();

  edges.forEach(edge => {
    if (edge.source === nodeId) {
      neighbors.add(edge.target);
    }
    if (edge.target === nodeId) {
      neighbors.add(edge.source);
    }
  });

  return Array.from(neighbors);
}

/**
 * Get edges connected to a specific node
 */
export function getNodeEdges(nodeId: string, edges: GraphEdge[]): GraphEdge[] {
  return edges.filter(edge => edge.source === nodeId || edge.target === nodeId);
}

/**
 * Create a focused layout around a selected node
 * Arranges immediate neighbors in a radial pattern around the focused node
 */
export function applyFocusedLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  focusedNodeId: string,
  width: number,
  height: number,
  currentLayout?: GraphNode[]
): GraphNode[] {
  const centerX = width / 2;
  const centerY = height / 2;

  // Find the focused node
  const focusedNode = nodes.find(n => n.id === focusedNodeId);
  if (!focusedNode) return currentLayout || nodes;

  // Get neighbors
  const neighborIds = getNodeNeighbors(focusedNodeId, edges);

  // Clone current layout or nodes
  let layoutNodes = (currentLayout || nodes).map(n => ({ ...n }));

  // Position focused node at center
  const focusedLayoutNode = layoutNodes.find(n => n.id === focusedNodeId);
  if (focusedLayoutNode) {
    focusedLayoutNode.fx = centerX;
    focusedLayoutNode.fy = centerY;
    focusedLayoutNode.x = centerX;
    focusedLayoutNode.y = centerY;
  }

  // Arrange neighbors in a circle around the focused node
  const radius = 180; // Distance from center
  neighborIds.forEach((neighborId, index) => {
    const neighbor = layoutNodes.find(n => n.id === neighborId);
    if (!neighbor) return;

    const angle = (2 * Math.PI * index) / neighborIds.length;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    // Fix neighbor positions temporarily
    neighbor.fx = x;
    neighbor.fy = y;
    neighbor.x = x;
    neighbor.y = y;
  });

  // Get second-level neighbors (neighbors of neighbors)
  const secondLevelIds = new Set<string>();
  neighborIds.forEach(nid => {
    getNodeNeighbors(nid, edges).forEach(n2id => {
      if (n2id !== focusedNodeId && !neighborIds.includes(n2id)) {
        secondLevelIds.add(n2id);
      }
    });
  });

  // Arrange second-level neighbors in outer circle
  if (secondLevelIds.size > 0) {
    const outerRadius = 320;
    Array.from(secondLevelIds).forEach((nodeId, index) => {
      const node = layoutNodes.find(n => n.id === nodeId);
      if (!node) return;

      const angle = (2 * Math.PI * index) / secondLevelIds.size;
      const x = centerX + outerRadius * Math.cos(angle);
      const y = centerY + outerRadius * Math.sin(angle);

      node.fx = x;
      node.fy = y;
      node.x = x;
      node.y = y;
    });
  }

  // Position other nodes farther away
  layoutNodes.forEach(node => {
    if (
      node.id !== focusedNodeId &&
      !neighborIds.includes(node.id) &&
      !secondLevelIds.has(node.id)
    ) {
      // Push them to the periphery
      const angle = Math.random() * 2 * Math.PI;
      const dist = 450 + Math.random() * 100;
      node.fx = undefined;
      node.fy = undefined;
      if (node.x === undefined || node.y === undefined) {
        node.x = centerX + dist * Math.cos(angle);
        node.y = centerY + dist * Math.sin(angle);
      }
    }
  });

  // Run a few iterations of force layout to settle positions
  const focusedLayout = applyForceLayout(layoutNodes, edges, width, height, {
    iterations: 30,
    repulsionStrength: 3000,
    attractionStrength: 0.01,
    centerStrength: 0.01,
    friction: 0.9,
  });

  // Clear fixed positions after layout
  focusedLayout.forEach(node => {
    node.fx = undefined;
    node.fy = undefined;
  });

  return focusedLayout;
}

/**
 * Create a focused layout around a selected node (async version)
 * Arranges immediate neighbors in a radial pattern around the focused node
 */
export async function applyFocusedLayoutAsync(
  nodes: GraphNode[],
  edges: GraphEdge[],
  focusedNodeId: string,
  width: number,
  height: number,
  currentLayout?: GraphNode[],
  onProgress?: (progress: number) => void
): Promise<GraphNode[]> {
  const centerX = width / 2;
  const centerY = height / 2;

  // Find the focused node
  const focusedNode = nodes.find(n => n.id === focusedNodeId);
  if (!focusedNode) return currentLayout || nodes;

  // Get neighbors
  const neighborIds = getNodeNeighbors(focusedNodeId, edges);

  // Clone current layout or nodes
  let layoutNodes = (currentLayout || nodes).map(n => ({ ...n }));

  // Position focused node at center
  const focusedLayoutNode = layoutNodes.find(n => n.id === focusedNodeId);
  if (focusedLayoutNode) {
    focusedLayoutNode.fx = centerX;
    focusedLayoutNode.fy = centerY;
    focusedLayoutNode.x = centerX;
    focusedLayoutNode.y = centerY;
  }

  if (onProgress) onProgress(20);

  // Arrange neighbors in a circle around the focused node
  const radius = 180; // Distance from center
  neighborIds.forEach((neighborId, index) => {
    const neighbor = layoutNodes.find(n => n.id === neighborId);
    if (!neighbor) return;

    const angle = (2 * Math.PI * index) / neighborIds.length;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    // Fix neighbor positions temporarily
    neighbor.fx = x;
    neighbor.fy = y;
    neighbor.x = x;
    neighbor.y = y;
  });

  if (onProgress) onProgress(40);

  // Get second-level neighbors (neighbors of neighbors)
  const secondLevelIds = new Set<string>();
  neighborIds.forEach(nid => {
    getNodeNeighbors(nid, edges).forEach(n2id => {
      if (n2id !== focusedNodeId && !neighborIds.includes(n2id)) {
        secondLevelIds.add(n2id);
      }
    });
  });

  // Arrange second-level neighbors in outer circle
  if (secondLevelIds.size > 0) {
    const outerRadius = 320;
    Array.from(secondLevelIds).forEach((nodeId, index) => {
      const node = layoutNodes.find(n => n.id === nodeId);
      if (!node) return;

      const angle = (2 * Math.PI * index) / secondLevelIds.size;
      const x = centerX + outerRadius * Math.cos(angle);
      const y = centerY + outerRadius * Math.sin(angle);

      node.fx = x;
      node.fy = y;
      node.x = x;
      node.y = y;
    });
  }

  if (onProgress) onProgress(60);

  // Position other nodes farther away
  layoutNodes.forEach(node => {
    if (
      node.id !== focusedNodeId &&
      !neighborIds.includes(node.id) &&
      !secondLevelIds.has(node.id)
    ) {
      // Push them to the periphery
      const angle = Math.random() * 2 * Math.PI;
      const dist = 450 + Math.random() * 100;
      node.fx = undefined;
      node.fy = undefined;
      if (node.x === undefined || node.y === undefined) {
        node.x = centerX + dist * Math.cos(angle);
        node.y = centerY + dist * Math.sin(angle);
      }
    }
  });

  // Run a few iterations of force layout to settle positions (async)
  const focusedLayout = await applyForceLayoutAsync(
    layoutNodes,
    edges,
    width,
    height,
    {
      iterations: 30,
      repulsionStrength: 3000,
      attractionStrength: 0.01,
      centerStrength: 0.01,
      friction: 0.9,
    },
    (progress) => {
      // Map 0-100 to 60-100
      const adjustedProgress = 60 + Math.round(progress * 0.4);
      if (onProgress) onProgress(adjustedProgress);
    }
  );

  // Clear fixed positions after layout
  focusedLayout.forEach(node => {
    node.fx = undefined;
    node.fy = undefined;
  });

  if (onProgress) onProgress(100);

  return focusedLayout;
}

/**
 * Reset layout - removes all fixed positions
 */
export function resetLayout(nodes: GraphNode[]): GraphNode[] {
  return nodes.map(node => ({
    ...node,
    fx: undefined,
    fy: undefined,
  }));
}
