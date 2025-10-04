import type { TreeNode, TreeViewData, TreeViewStats } from './TreeView.types';

/**
 * Calculate tree statistics
 */
export function calculateTreeStats(data: TreeViewData, expandedNodes: Set<string>): TreeViewStats {
  let totalNodes = 0;
  let visibleNodes = 0;
  let leafNodes = 0;
  let maxDepth = 0;

  const traverse = (node: TreeNode, depth: number, isVisible: boolean) => {
    totalNodes++;
    if (isVisible) visibleNodes++;
    maxDepth = Math.max(maxDepth, depth);

    if (!node.children || node.children.length === 0) {
      leafNodes++;
    } else {
      const nodeExpanded = expandedNodes.has(node.id) || Boolean(node.expanded);
      node.children.forEach((child) => {
        traverse(child, depth + 1, isVisible && nodeExpanded);
      });
    }
  };

  data.roots.forEach((root) => traverse(root, 0, true));

  return {
    totalNodes,
    visibleNodes,
    expandedNodes: expandedNodes.size,
    maxDepth,
    leafNodes,
  };
}

/**
 * Get default icon for node type
 */
export function getDefaultIcon(node: TreeNode): string {
  if (node.icon) return node.icon;

  switch (node.type) {
    case 'folder':
      return node.expanded ? '📂' : '📁';
    case 'file':
      return '📄';
    case 'category':
      return '🏷️';
    case 'item':
      return '•';
    default:
      return '▪️';
  }
}

/**
 * Find node by ID
 */
export function findNode(roots: TreeNode[], id: string): { node: TreeNode; path: TreeNode[] } | null {
  const search = (nodes: TreeNode[], path: TreeNode[]): { node: TreeNode; path: TreeNode[] } | null => {
    for (const node of nodes) {
      if (node.id === id) {
        return { node, path: [...path, node] };
      }
      if (node.children) {
        const result = search(node.children, [...path, node]);
        if (result) return result;
      }
    }
    return null;
  };

  return search(roots, []);
}

/**
 * Expand nodes up to a certain depth
 */
export function getInitiallyExpandedNodes(roots: TreeNode[], depth: number): Set<string> {
  const expanded = new Set<string>();

  const traverse = (node: TreeNode, currentDepth: number) => {
    if (currentDepth < depth && node.children && node.children.length > 0) {
      expanded.add(node.id);
      node.children.forEach((child) => traverse(child, currentDepth + 1));
    }
  };

  roots.forEach((root) => traverse(root, 0));
  return expanded;
}

/**
 * Format file size
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
