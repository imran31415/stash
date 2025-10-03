// Task and Risk types for interactive components

export interface Task {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  progress: number; // 0-100
  status: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  dependencies?: string[];
  milestones?: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  date: Date;
  completed: boolean;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  category: 'security' | 'operational' | 'financial' | 'compliance' | 'strategic' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-100
  impact: number; // 0-100
  riskScore: number; // Calculated score
  status: 'identified' | 'assessed' | 'mitigating' | 'monitoring' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  mitigationActions?: MitigationAction[];
}

export interface MitigationAction {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignee?: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// Interactive component props

export interface TaskListProps {
  title?: string;
  subtitle?: string;
  tasks: Task[];
  onTaskPress?: (task: Task) => void;
  onTaskSelect?: (task: Task) => void;
  onExpandPress?: () => void;
  showExpandButton?: boolean;
}

export interface RiskListProps {
  title?: string;
  subtitle?: string;
  risks: Risk[];
  onRiskPress?: (risk: Risk) => void;
  onRiskSelect?: (risk: Risk) => void;
  onCreateRisk?: (risk: Risk) => void;
}

export interface GanttChartProps {
  tasks: Task[];
  title?: string;
  subtitle?: string;
  mode?: 'mini' | 'full';
  onTaskPress?: (task: Task) => void;
  onExpandPress?: () => void;
  showProgress?: boolean;
  showToday?: boolean;
  height?: number;
}

export interface TaskDetailModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export interface RiskDetailModalProps {
  visible: boolean;
  risk: Risk | null;
  onClose: () => void;
  onEdit?: (risk: Risk) => void;
  onDelete?: (riskId: string) => void;
  onCreateMitigation?: (risk: Risk) => void;
}

// Resource types for generic list display
export interface Resource {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  imageUrl?: string;
  icon?: string;
  color?: string;
}

export interface ResourceListProps {
  title?: string;
  subtitle?: string;
  resources: Resource[];
  maxItems?: number; // Maximum items to show before "show more"
  adaptiveHeight?: boolean; // Auto-calculate height based on platform
  onResourcePress?: (resource: Resource) => void;
  onResourceSelect?: (resource: Resource) => void;
  showCategory?: boolean;
  showStatus?: boolean;
  showMetadata?: boolean;
}

export interface ResourceDetailModalProps {
  visible: boolean;
  resource: Resource | null;
  onClose: () => void;
  onEdit?: (resource: Resource) => void;
  onDelete?: (resourceId: string) => void;
  customFields?: Array<{
    key: string;
    label: string;
    render?: (value: any) => React.ReactNode;
  }>;
}
