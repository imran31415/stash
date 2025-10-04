export type TreeNodeType = 'folder' | 'file' | 'category' | 'item' | 'custom';
export type TreeNodeStatus = 'normal' | 'selected' | 'disabled' | 'highlighted';

export interface TreeNode {
  id: string;
  label: string;
  type?: TreeNodeType;
  icon?: string;
  children?: TreeNode[];
  metadata?: {
    size?: number;
    modified?: Date;
    count?: number;
    description?: string;
    [key: string]: any;
  };
  status?: TreeNodeStatus;
  color?: string;
  expanded?: boolean;
  selectable?: boolean;
  badge?: string | number;
}

export interface TreeViewData {
  id: string;
  title: string;
  description?: string;
  roots: TreeNode[];
  metadata?: {
    totalNodes?: number;
    maxDepth?: number;
    [key: string]: any;
  };
}

export type TreeViewMode = 'mini' | 'full';
export type TreeViewLayout = 'vertical' | 'horizontal';

export interface TreeViewProps {
  data: TreeViewData;
  mode?: TreeViewMode;
  layout?: TreeViewLayout;
  height?: number;
  width?: number;
  showIcons?: boolean;
  showLines?: boolean;
  initialExpandedDepth?: number;
  onNodePress?: (node: TreeNode, path: TreeNode[]) => void;
  onNodeExpand?: (node: TreeNode, expanded: boolean) => void;
  onExpandPress?: () => void;
}

export interface TreeViewDetailViewProps {
  data: TreeViewData;
  visible: boolean;
  onClose: () => void;
  onNodePress?: (node: TreeNode, path: TreeNode[]) => void;
  onNodeExpand?: (node: TreeNode, expanded: boolean) => void;
}

export interface TreeViewStats {
  totalNodes: number;
  visibleNodes: number;
  expandedNodes: number;
  maxDepth: number;
  leafNodes: number;
}
