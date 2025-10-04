import type {
  SankeyDiagramData,
  SankeyDiagramStats,
  SankeyNode,
  SankeyLink,
  PositionedSankeyNode,
  PositionedSankeyLink,
} from './SankeyDiagram.types';

/**
 * Calculate Sankey diagram statistics
 */
export function calculateSankeyStats(data: SankeyDiagramData): SankeyDiagramStats {
  const totalFlow = data.links.reduce((sum, link) => sum + link.value, 0);
  const maxLinkValue = Math.max(...data.links.map((l) => l.value), 0);

  // Calculate max node value
  const nodeValues = new Map<string, number>();
  data.links.forEach((link) => {
    nodeValues.set(link.source, (nodeValues.get(link.source) || 0) + link.value);
    nodeValues.set(link.target, (nodeValues.get(link.target) || 0) + link.value);
  });
  const maxNodeValue = Math.max(...Array.from(nodeValues.values()), 0);

  // Calculate layers
  const layers = calculateNodeLayers(data.nodes, data.links);
  const numLayers = Math.max(...layers.values(), 0) + 1;

  return {
    totalNodes: data.nodes.length,
    totalLinks: data.links.length,
    totalFlow,
    layers: numLayers,
    maxNodeValue,
    maxLinkValue,
  };
}

/**
 * Calculate node layers using topological sort
 */
export function calculateNodeLayers(nodes: SankeyNode[], links: SankeyLink[]): Map<string, number> {
  const layers = new Map<string, number>();
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  // Initialize
  nodes.forEach((node) => {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  });

  // Build graph
  links.forEach((link) => {
    inDegree.set(link.target, (inDegree.get(link.target) || 0) + 1);
    adjacency.get(link.source)?.push(link.target);
  });

  // Find source nodes (layer 0)
  const queue: string[] = [];
  nodes.forEach((node) => {
    if ((inDegree.get(node.id) || 0) === 0) {
      layers.set(node.id, 0);
      queue.push(node.id);
    }
  });

  // BFS to assign layers
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const currentLayer = layers.get(nodeId) || 0;

    adjacency.get(nodeId)?.forEach((targetId) => {
      const currentTargetLayer = layers.get(targetId) || 0;
      layers.set(targetId, Math.max(currentTargetLayer, currentLayer + 1));

      inDegree.set(targetId, (inDegree.get(targetId) || 0) - 1);
      if ((inDegree.get(targetId) || 0) === 0) {
        queue.push(targetId);
      }
    });
  }

  // Assign layer 0 to any remaining nodes
  nodes.forEach((node) => {
    if (!layers.has(node.id)) {
      layers.set(node.id, 0);
    }
  });

  return layers;
}

/**
 * Calculate positioned nodes and links for rendering
 */
export function calculateSankeyLayout(
  data: SankeyDiagramData,
  width: number,
  height: number,
  orientation: 'horizontal' | 'vertical' = 'horizontal'
): { nodes: PositionedSankeyNode[]; links: PositionedSankeyLink[] } {
  const padding = 40;
  const nodePadding = 10;
  const minNodeHeight = 20;

  // Calculate layers
  const nodeLayers = calculateNodeLayers(data.nodes, data.links);
  const maxLayer = Math.max(...Array.from(nodeLayers.values()), 0);
  const numLayers = maxLayer + 1;

  // Group nodes by layer
  const layerGroups: string[][] = Array.from({ length: numLayers }, () => []);
  data.nodes.forEach((node) => {
    const layer = nodeLayers.get(node.id) || 0;
    layerGroups[layer].push(node.id);
  });

  // Calculate node values
  const nodeIncoming = new Map<string, number>();
  const nodeOutgoing = new Map<string, number>();
  data.nodes.forEach((node) => {
    nodeIncoming.set(node.id, 0);
    nodeOutgoing.set(node.id, 0);
  });
  data.links.forEach((link) => {
    nodeOutgoing.set(link.source, (nodeOutgoing.get(link.source) || 0) + link.value);
    nodeIncoming.set(link.target, (nodeIncoming.get(link.target) || 0) + link.value);
  });

  const totalFlow = Math.max(...Array.from(nodeOutgoing.values()), ...Array.from(nodeIncoming.values()), 1);

  // Calculate positions
  const nodeWidth = 15;
  const availableWidth = width - 2 * padding;
  const availableHeight = height - 2 * padding;
  const layerWidth = numLayers > 1 ? availableWidth / (numLayers - 1) : availableWidth;

  const positionedNodes: PositionedSankeyNode[] = [];
  const nodeMap = new Map<string, PositionedSankeyNode>();

  data.nodes.forEach((node) => {
    const layer = nodeLayers.get(node.id) || 0;
    const layerNodes = layerGroups[layer];
    const nodeIndex = layerNodes.indexOf(node.id);
    const numNodesInLayer = layerNodes.length;

    const nodeValue = Math.max(nodeIncoming.get(node.id) || 0, nodeOutgoing.get(node.id) || 0);
    const nodeHeight = Math.max(minNodeHeight, (nodeValue / totalFlow) * availableHeight * 0.8);

    const x = padding + layer * layerWidth;
    const layerHeight = availableHeight - nodePadding * (numNodesInLayer - 1);
    const y = padding + (layerHeight / numNodesInLayer) * nodeIndex + nodePadding * nodeIndex;

    const positioned: PositionedSankeyNode = {
      ...node,
      x,
      y,
      width: nodeWidth,
      height: nodeHeight,
      incomingValue: nodeIncoming.get(node.id) || 0,
      outgoingValue: nodeOutgoing.get(node.id) || 0,
    };

    positionedNodes.push(positioned);
    nodeMap.set(node.id, positioned);
  });

  // Calculate link paths
  const positionedLinks: PositionedSankeyLink[] = data.links.map((link) => {
    const sourceNode = nodeMap.get(link.source)!;
    const targetNode = nodeMap.get(link.target)!;
    const linkWidth = (link.value / totalFlow) * availableHeight * 0.8;

    // Simple cubic bezier path
    const x0 = sourceNode.x + sourceNode.width;
    const y0 = sourceNode.y + sourceNode.height / 2;
    const x1 = targetNode.x;
    const y1 = targetNode.y + targetNode.height / 2;
    const cx0 = x0 + (x1 - x0) / 3;
    const cx1 = x0 + (2 * (x1 - x0)) / 3;

    const path = `M ${x0} ${y0} C ${cx0} ${y0}, ${cx1} ${y1}, ${x1} ${y1}`;

    return {
      ...link,
      sourceNode,
      targetNode,
      width: linkWidth,
      path,
    };
  });

  return { nodes: positionedNodes, links: positionedLinks };
}

/**
 * Get default color for node
 */
export function getNodeColor(node: SankeyNode, index: number): string {
  if (node.color) return node.color;

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
  return colors[index % colors.length];
}

/**
 * Get default color for link
 */
export function getLinkColor(link: SankeyLink, sourceNode?: PositionedSankeyNode): string {
  if (link.color) return link.color;
  if (sourceNode?.color) return sourceNode.color + '40'; // Add transparency
  return '#3B82F6' + '40';
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}
