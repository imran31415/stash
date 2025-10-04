/**
 * FlameGraph Types
 *
 * Types for flame graph visualization (profiling data, call stacks, performance analysis)
 */

export interface FlameGraphNode {
  /**
   * Unique identifier for the node
   */
  id: string;

  /**
   * Function/method name
   */
  name: string;

  /**
   * Value (e.g., CPU time, memory, samples)
   */
  value: number;

  /**
   * Children nodes (nested calls)
   */
  children?: FlameGraphNode[];

  /**
   * Additional metadata
   */
  metadata?: {
    /**
     * File path or module name
     */
    file?: string;

    /**
     * Line number
     */
    line?: number;

    /**
     * Percentage of total
     */
    percentage?: number;

    /**
     * Number of samples
     */
    samples?: number;

    /**
     * Self time (excluding children)
     */
    selfTime?: number;

    /**
     * Total time (including children)
     */
    totalTime?: number;

    /**
     * Additional custom properties
     */
    [key: string]: any;
  };
}

export interface FlameGraphData {
  /**
   * Root node of the flame graph
   */
  root: FlameGraphNode;

  /**
   * Total value (for percentage calculations)
   */
  total: number;

  /**
   * Unit of measurement (e.g., 'ms', 'samples', 'bytes')
   */
  unit?: string;

  /**
   * Metadata about the profiling session
   */
  metadata?: {
    /**
     * Profile type (cpu, memory, etc.)
     */
    type?: 'cpu' | 'memory' | 'wall' | 'custom';

    /**
     * Duration of profiling
     */
    duration?: number;

    /**
     * Timestamp when profile was captured
     */
    timestamp?: Date;

    /**
     * Application/service name
     */
    application?: string;

    /**
     * Additional custom metadata
     */
    [key: string]: any;
  };
}

export interface FlameGraphProps {
  /**
   * Flame graph data
   */
  data: FlameGraphData;

  /**
   * Title for the flame graph
   */
  title?: string;

  /**
   * Subtitle/description
   */
  subtitle?: string;

  /**
   * Display mode
   */
  mode?: 'mini' | 'preview' | 'detail';

  /**
   * Color scheme
   */
  colorScheme?: 'hot' | 'cold' | 'green' | 'blue' | 'rainbow';

  /**
   * Show tooltips on hover
   */
  showTooltips?: boolean;

  /**
   * Show search bar
   */
  showSearch?: boolean;

  /**
   * Minimum percentage to display (filter out small nodes)
   */
  minPercentage?: number;

  /**
   * Callback when a node is clicked
   */
  onNodeClick?: (node: FlameGraphNode) => void;

  /**
   * Callback when search is performed
   */
  onSearch?: (query: string) => void;

  /**
   * Height of the component (in pixels)
   */
  height?: number;

  /**
   * Custom styles
   */
  style?: any;
}
