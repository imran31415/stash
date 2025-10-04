/**
 * MultiSwipeable Types
 *
 * Types for swipeable gallery of interactive components
 */

export type SwipeableItemType =
  | 'gantt-chart'
  | 'task-list'
  | 'time-series-chart'
  | 'graph-visualization'
  | 'code-block'
  | 'media'
  | 'data-table'
  | 'flamegraph'
  | 'workflow'
  | 'dashboard';

export interface SwipeableItem {
  /**
   * Unique identifier for the item
   */
  id: string;

  /**
   * Type of component to render
   */
  type: SwipeableItemType;

  /**
   * Data for the component (matches the props of that component type)
   */
  data: any;

  /**
   * Optional title for this slide
   */
  title?: string;

  /**
   * Optional subtitle for this slide
   */
  subtitle?: string;
}

export interface MultiSwipeableProps {
  /**
   * Array of items to display in the gallery
   */
  items: SwipeableItem[];

  /**
   * Display mode
   */
  mode?: 'mini' | 'preview' | 'full';

  /**
   * Initial index to display
   */
  initialIndex?: number;

  /**
   * Show navigation dots
   */
  showDots?: boolean;

  /**
   * Show navigation arrows
   */
  showArrows?: boolean;

  /**
   * Auto-advance interval in milliseconds (0 to disable)
   */
  autoAdvanceInterval?: number;

  /**
   * Callback when item changes
   */
  onItemChange?: (index: number, item: SwipeableItem) => void;

  /**
   * Callback when expand is pressed for an item
   */
  onExpandPress?: (item: SwipeableItem, index: number) => void;

  /**
   * Callback for item-specific actions
   */
  onItemAction?: (action: string, data: any, itemIndex: number) => void;

  /**
   * Custom styles
   */
  style?: any;
}
