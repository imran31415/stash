export interface SankeyNode {
  id: string;
  label: string;
  value?: number;
  color?: string;
  layer?: number;
  metadata?: {
    [key: string]: any;
  };
}

export interface SankeyLink {
  id: string;
  source: string;
  target: string;
  value: number;
  color?: string;
  label?: string;
  metadata?: {
    [key: string]: any;
  };
}

export interface SankeyDiagramData {
  id: string;
  title: string;
  description?: string;
  nodes: SankeyNode[];
  links: SankeyLink[];
  metadata?: {
    totalFlow?: number;
    layers?: number;
    [key: string]: any;
  };
}

export type SankeyDiagramMode = 'mini' | 'full';
export type SankeyOrientation = 'horizontal' | 'vertical';

export interface SankeyDiagramProps {
  data: SankeyDiagramData;
  mode?: SankeyDiagramMode;
  orientation?: SankeyOrientation;
  height?: number;
  width?: number;
  showValues?: boolean;
  showLabels?: boolean;
  onNodePress?: (node: SankeyNode) => void;
  onLinkPress?: (link: SankeyLink) => void;
  onExpandPress?: () => void;
}

export interface SankeyDiagramDetailViewProps {
  data: SankeyDiagramData;
  visible: boolean;
  onClose: () => void;
  onNodePress?: (node: SankeyNode) => void;
  onLinkPress?: (link: SankeyLink) => void;
}

export interface SankeyDiagramStats {
  totalNodes: number;
  totalLinks: number;
  totalFlow: number;
  layers: number;
  maxNodeValue: number;
  maxLinkValue: number;
}

export interface PositionedSankeyNode extends SankeyNode {
  x: number;
  y: number;
  width: number;
  height: number;
  incomingValue: number;
  outgoingValue: number;
}

export interface PositionedSankeyLink extends SankeyLink {
  sourceNode: PositionedSankeyNode;
  targetNode: PositionedSankeyNode;
  width: number;
  path: string;
}
