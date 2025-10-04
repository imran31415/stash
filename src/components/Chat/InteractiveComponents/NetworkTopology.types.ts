export type NodeType = 'server' | 'router' | 'switch' | 'firewall' | 'database' | 'client' | 'cloud' | 'custom';
export type NodeStatus = 'online' | 'offline' | 'warning' | 'error';
export type ConnectionType = 'ethernet' | 'wireless' | 'vpn' | 'internet' | 'custom';
export type ConnectionStatus = 'active' | 'inactive' | 'slow' | 'error';

export interface NetworkNode {
  id: string;
  label: string;
  type?: NodeType;
  status?: NodeStatus;
  icon?: string;
  color?: string;
  metadata?: {
    ip?: string;
    mac?: string;
    location?: string;
    uptime?: number;
    cpu?: number;
    memory?: number;
    [key: string]: any;
  };
}

export interface NetworkConnection {
  id: string;
  source: string;
  target: string;
  type?: ConnectionType;
  status?: ConnectionStatus;
  label?: string;
  bidirectional?: boolean;
  bandwidth?: number;
  latency?: number;
  metadata?: {
    [key: string]: any;
  };
}

export interface NetworkTopologyData {
  id: string;
  title: string;
  description?: string;
  nodes: NetworkNode[];
  connections: NetworkConnection[];
  metadata?: {
    totalNodes?: number;
    totalConnections?: number;
    [key: string]: any;
  };
}

export type NetworkTopologyMode = 'mini' | 'full';
export type NetworkLayout = 'force' | 'hierarchical' | 'circular';

export interface NetworkTopologyProps {
  data: NetworkTopologyData;
  mode?: NetworkTopologyMode;
  layout?: NetworkLayout;
  height?: number;
  width?: number;
  showLabels?: boolean;
  showStatus?: boolean;
  onNodePress?: (node: NetworkNode) => void;
  onConnectionPress?: (connection: NetworkConnection) => void;
  onExpandPress?: () => void;
}

export interface NetworkTopologyDetailViewProps {
  data: NetworkTopologyData;
  visible: boolean;
  onClose: () => void;
  onNodePress?: (node: NetworkNode) => void;
  onConnectionPress?: (connection: NetworkConnection) => void;
}

export interface NetworkTopologyStats {
  totalNodes: number;
  totalConnections: number;
  onlineNodes: number;
  offlineNodes: number;
  errorNodes: number;
  activeConnections: number;
  inactiveConnections: number;
}
