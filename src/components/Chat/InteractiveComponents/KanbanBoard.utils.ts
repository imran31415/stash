import type {
  KanbanBoardData,
  KanbanColumn,
  KanbanCard,
  KanbanCardPriority,
  KanbanBoardStats,
} from './KanbanBoard.types';

/**
 * Calculate board statistics
 */
export function calculateBoardStats(data: KanbanBoardData): KanbanBoardStats {
  const allCards: KanbanCard[] = [];

  if (data.useSwimlanes && data.swimlanes) {
    data.swimlanes.forEach((swimlane) => {
      swimlane.columns.forEach((column) => {
        allCards.push(...column.cards);
      });
    });
  } else {
    data.columns.forEach((column) => {
      allCards.push(...column.cards);
    });
  }

  const totalCards = allCards.length;
  const completedCards = allCards.filter((card) => card.status === 'done').length;
  const inProgressCards = allCards.filter((card) => card.status === 'in_progress').length;
  const blockedCards = allCards.filter((card) => card.status === 'blocked').length;

  const now = new Date();
  const overdueCards = allCards.filter((card) => {
    if (!card.dueDate) return false;
    return new Date(card.dueDate) < now && card.status !== 'done';
  }).length;

  const completionRate = totalCards > 0 ? (completedCards / totalCards) * 100 : 0;

  const columnsWithWIP = data.columns.filter((col) => col.wipLimit && col.wipLimit > 0);
  const wipUtilization = columnsWithWIP.length > 0
    ? columnsWithWIP.reduce((sum, col) => {
        const utilization = col.wipLimit ? (col.cards.length / col.wipLimit) * 100 : 0;
        return sum + utilization;
      }, 0) / columnsWithWIP.length
    : 0;

  const averageCardsPerColumn = data.columns.length > 0
    ? totalCards / data.columns.length
    : 0;

  return {
    totalCards,
    completedCards,
    inProgressCards,
    blockedCards,
    overdueCards,
    completionRate,
    averageCardsPerColumn,
    wipUtilization,
  };
}

/**
 * Get color for card priority
 */
export function getPriorityColor(priority?: KanbanCardPriority): string {
  switch (priority) {
    case 'urgent':
      return '#FF3B30';
    case 'high':
      return '#FF9500';
    case 'medium':
      return '#FFCC00';
    case 'low':
      return '#34C759';
    default:
      return '#8E8E93';
  }
}

/**
 * Get icon for card priority
 */
export function getPriorityIcon(priority?: KanbanCardPriority): string {
  switch (priority) {
    case 'urgent':
      return '🔥';
    case 'high':
      return '⬆️';
    case 'medium':
      return '➡️';
    case 'low':
      return '⬇️';
    default:
      return '📝';
  }
}

/**
 * Check if card is overdue
 */
export function isCardOverdue(card: KanbanCard): boolean {
  if (!card.dueDate || card.status === 'done') return false;
  return new Date(card.dueDate) < new Date();
}

/**
 * Format due date
 */
export function formatDueDate(date: Date): string {
  const now = new Date();
  const dueDate = new Date(date);
  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `${Math.abs(diffDays)}d overdue`;
  } else if (diffDays === 0) {
    return 'Due today';
  } else if (diffDays === 1) {
    return 'Due tomorrow';
  } else if (diffDays <= 7) {
    return `${diffDays}d remaining`;
  } else {
    return dueDate.toLocaleDateString();
  }
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  const parts = name.split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Check if column is at WIP limit
 */
export function isColumnAtWIPLimit(column: KanbanColumn): boolean {
  if (!column.wipLimit) return false;
  return column.cards.length >= column.wipLimit;
}

/**
 * Check if column is over WIP limit
 */
export function isColumnOverWIPLimit(column: KanbanColumn): boolean {
  if (!column.wipLimit) return false;
  return column.cards.length > column.wipLimit;
}

/**
 * Calculate WIP utilization percentage
 */
export function getWIPUtilization(column: KanbanColumn): number {
  if (!column.wipLimit || column.wipLimit === 0) return 0;
  return (column.cards.length / column.wipLimit) * 100;
}
