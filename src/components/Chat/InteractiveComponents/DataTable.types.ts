export type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'currency' | 'custom';
export type SortDirection = 'asc' | 'desc';
export type FilterOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between';

export interface ColumnDefinition {
  id: string;
  header: string;
  accessor: string; // Key to access the value in the row data
  type?: ColumnType;
  width?: number; // Pixel value
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  align?: 'left' | 'center' | 'right';
  priority?: number; // Lower number = higher priority (1 = always show, 2 = hide on small, 3 = hide on medium)
  renderCell?: (value: any, row: RowData) => React.ReactNode;
  renderHeader?: () => React.ReactNode;
  format?: (value: any) => string; // For formatting numbers, dates, currency, etc.
}

export interface RowData {
  id: string | number;
  [key: string]: any;
}

export interface SortConfig {
  columnId: string;
  direction: SortDirection;
}

export interface FilterConfig {
  columnId: string;
  operator: FilterOperator;
  value: any;
  value2?: any; // For 'between' operator
}

export interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  totalRows: number;
  pageSizeOptions?: number[];
}

export interface DataTableProps {
  // Core data
  columns: ColumnDefinition[];
  data: RowData[];

  // Display options
  title?: string;
  subtitle?: string;
  mode?: 'mini' | 'preview' | 'full';
  maxHeight?: number;

  // Features
  sortable?: boolean;
  filterable?: boolean;
  paginated?: boolean;
  selectable?: boolean;
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;

  // Default configurations
  defaultSort?: SortConfig;
  defaultFilters?: FilterConfig[];
  defaultPageSize?: number;
  pageSizeOptions?: number[];

  // Callbacks
  onSort?: (sortConfig: SortConfig | null) => void;
  onFilter?: (filters: FilterConfig[]) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onRowSelect?: (selectedRows: RowData[]) => void;
  onRowPress?: (row: RowData) => void;
  onExpandPress?: () => void;

  // Styling
  headerBackgroundColor?: string;
  rowBackgroundColor?: string;
  alternateRowBackgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  headerTextColor?: string;
}

export interface DataTableDetailViewProps {
  visible: boolean;
  columns: ColumnDefinition[];
  data: RowData[];
  title?: string;
  subtitle?: string;
  onClose: () => void;

  // Features
  sortable?: boolean;
  filterable?: boolean;
  paginated?: boolean;
  selectable?: boolean;

  // Default configurations
  defaultSort?: SortConfig;
  defaultFilters?: FilterConfig[];
  defaultPageSize?: number;
  pageSizeOptions?: number[];

  // Callbacks
  onSort?: (sortConfig: SortConfig | null) => void;
  onFilter?: (filters: FilterConfig[]) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onRowSelect?: (selectedRows: RowData[]) => void;
  onRowPress?: (row: RowData) => void;
}

export interface DataTableState {
  sortConfig: SortConfig | null;
  filters: FilterConfig[];
  currentPage: number;
  pageSize: number;
  selectedRows: Set<string | number>;
  searchQuery: string;
}
