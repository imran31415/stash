export type KanbanCardPriority = 'low' | 'medium' | 'high' | 'urgent';
export type KanbanCardStatus = 'todo' | 'in_progress' | 'review' | 'blocked' | 'done';

export interface KanbanCardAssignee {
  id: string;
  name: string;
  avatar?: string;
  color?: string;
}

export interface KanbanCardTag {
  id: string;
  label: string;
  color: string;
}

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  priority?: KanbanCardPriority;
  status?: KanbanCardStatus;
  assignees?: KanbanCardAssignee[];
  tags?: KanbanCardTag[];
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  checklistItems?: number;
  checklistCompleted?: number;
  attachments?: number;
  comments?: number;
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: Record<string, any>;
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  color?: string;
  icon?: string;
  wipLimit?: number; // Work In Progress limit
  collapsed?: boolean;
}

export interface KanbanSwimlane {
  id: string;
  title: string;
  columns: KanbanColumn[];
  color?: string;
  icon?: string;
  collapsed?: boolean;
}

export interface KanbanBoardData {
  id: string;
  title: string;
  description?: string;
  columns: KanbanColumn[];
  swimlanes?: KanbanSwimlane[];
  useSwimlanes?: boolean;
  metadata?: {
    totalCards?: number;
    completedCards?: number;
    overduCards?: number;
    blockedCards?: number;
    totalEstimatedHours?: number;
    totalActualHours?: number;
    [key: string]: any;
  };
}

export type KanbanBoardMode = 'mini' | 'full' | 'preview';
export type KanbanBoardLayout = 'horizontal' | 'vertical';

export interface KanbanBoardProps {
  data: KanbanBoardData;
  mode?: KanbanBoardMode;
  layout?: KanbanBoardLayout;
  height?: number;
  width?: number;
  showStats?: boolean;
  enableDragDrop?: boolean;
  onCardPress?: (card: KanbanCard, column: KanbanColumn) => void;
  onCardMove?: (card: KanbanCard, fromColumn: KanbanColumn, toColumn: KanbanColumn) => void;
  onColumnPress?: (column: KanbanColumn) => void;
  onExpandPress?: () => void;
}

export interface KanbanBoardDetailViewProps {
  data: KanbanBoardData;
  visible: boolean;
  onClose: () => void;
  onCardPress?: (card: KanbanCard, column: KanbanColumn) => void;
  onCardMove?: (card: KanbanCard, fromColumn: KanbanColumn, toColumn: KanbanColumn) => void;
  onCardCreate?: (columnId: string, card: Partial<KanbanCard>) => void;
  onCardUpdate?: (cardId: string, updates: Partial<KanbanCard>) => void;
  onCardDelete?: (cardId: string) => void;
}

export interface KanbanBoardStats {
  totalCards: number;
  completedCards: number;
  inProgressCards: number;
  blockedCards: number;
  overdueCards: number;
  completionRate: number;
  averageCardsPerColumn: number;
  wipUtilization: number;
}
