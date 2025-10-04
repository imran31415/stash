export type CellType = 'text' | 'number' | 'boolean' | 'rating' | 'badge' | 'custom';
export type ComparisonResult = 'better' | 'worse' | 'equal' | 'neutral';

export interface ComparisonCell {
  value: any;
  type?: CellType;
  displayValue?: string;
  color?: string;
  icon?: string;
  comparison?: ComparisonResult;
  metadata?: {
    [key: string]: any;
  };
}

export interface ComparisonRow {
  id: string;
  label: string;
  description?: string;
  cells: ComparisonCell[];
  highlighted?: boolean;
  category?: string;
}

export interface ComparisonColumn {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  color?: string;
  highlighted?: boolean;
  metadata?: {
    [key: string]: any;
  };
}

export interface ComparisonTableData {
  id: string;
  title: string;
  description?: string;
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
  metadata?: {
    totalRows?: number;
    totalColumns?: number;
    [key: string]: any;
  };
}

export type ComparisonTableMode = 'mini' | 'full';

export interface ComparisonTableProps {
  data: ComparisonTableData;
  mode?: ComparisonTableMode;
  height?: number;
  width?: number;
  showComparison?: boolean;
  stickyHeader?: boolean;
  stickyFirstColumn?: boolean;
  onCellPress?: (row: ComparisonRow, column: ComparisonColumn, cell: ComparisonCell) => void;
  onColumnPress?: (column: ComparisonColumn) => void;
  onRowPress?: (row: ComparisonRow) => void;
  onExpandPress?: () => void;
}

export interface ComparisonTableDetailViewProps {
  data: ComparisonTableData;
  visible: boolean;
  onClose: () => void;
  onCellPress?: (row: ComparisonRow, column: ComparisonColumn, cell: ComparisonCell) => void;
  onColumnPress?: (column: ComparisonColumn) => void;
  onRowPress?: (row: ComparisonRow) => void;
}

export interface ComparisonTableStats {
  totalRows: number;
  totalColumns: number;
  totalCells: number;
  categorizedRows: number;
  highlightedRows: number;
  highlightedColumns: number;
}
