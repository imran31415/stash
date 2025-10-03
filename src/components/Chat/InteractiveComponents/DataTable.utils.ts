import { RowData, SortConfig, FilterConfig, ColumnDefinition, FilterOperator } from './DataTable.types';

/**
 * Sort rows based on sort configuration
 */
export const sortRows = (
  rows: RowData[],
  sortConfig: SortConfig | null,
  columns: ColumnDefinition[]
): RowData[] => {
  if (!sortConfig) return rows;

  const column = columns.find(col => col.id === sortConfig.columnId);
  if (!column) return rows;

  const sortedRows = [...rows].sort((a, b) => {
    const aValue = a[column.accessor];
    const bValue = b[column.accessor];

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    // Type-specific comparison
    let comparison = 0;
    switch (column.type) {
      case 'number':
      case 'currency':
        comparison = Number(aValue) - Number(bValue);
        break;
      case 'date':
        comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
        break;
      case 'boolean':
        comparison = (aValue === bValue) ? 0 : aValue ? -1 : 1;
        break;
      default:
        comparison = String(aValue).localeCompare(String(bValue));
    }

    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  return sortedRows;
};

/**
 * Filter rows based on filter configurations
 */
export const filterRows = (
  rows: RowData[],
  filters: FilterConfig[],
  columns: ColumnDefinition[]
): RowData[] => {
  if (filters.length === 0) return rows;

  return rows.filter(row => {
    return filters.every(filter => {
      const column = columns.find(col => col.id === filter.columnId);
      if (!column) return true;

      const cellValue = row[column.accessor];
      return matchesFilter(cellValue, filter, column);
    });
  });
};

/**
 * Check if a cell value matches a filter
 */
const matchesFilter = (
  value: any,
  filter: FilterConfig,
  column: ColumnDefinition
): boolean => {
  if (value == null) return false;

  const { operator, value: filterValue, value2 } = filter;

  switch (operator) {
    case 'equals':
      return String(value).toLowerCase() === String(filterValue).toLowerCase();

    case 'contains':
      return String(value).toLowerCase().includes(String(filterValue).toLowerCase());

    case 'startsWith':
      return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());

    case 'endsWith':
      return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());

    case 'greaterThan':
      if (column.type === 'number' || column.type === 'currency') {
        return Number(value) > Number(filterValue);
      }
      if (column.type === 'date') {
        return new Date(value).getTime() > new Date(filterValue).getTime();
      }
      return String(value) > String(filterValue);

    case 'lessThan':
      if (column.type === 'number' || column.type === 'currency') {
        return Number(value) < Number(filterValue);
      }
      if (column.type === 'date') {
        return new Date(value).getTime() < new Date(filterValue).getTime();
      }
      return String(value) < String(filterValue);

    case 'between':
      if (!value2) return false;
      if (column.type === 'number' || column.type === 'currency') {
        const numValue = Number(value);
        return numValue >= Number(filterValue) && numValue <= Number(value2);
      }
      if (column.type === 'date') {
        const dateValue = new Date(value).getTime();
        return dateValue >= new Date(filterValue).getTime() &&
               dateValue <= new Date(value2).getTime();
      }
      return false;

    default:
      return true;
  }
};

/**
 * Search rows by query string across all columns
 */
export const searchRows = (
  rows: RowData[],
  query: string,
  columns: ColumnDefinition[]
): RowData[] => {
  if (!query.trim()) return rows;

  const lowercaseQuery = query.toLowerCase();

  return rows.filter(row => {
    return columns.some(column => {
      const value = row[column.accessor];
      if (value == null) return false;
      return String(value).toLowerCase().includes(lowercaseQuery);
    });
  });
};

/**
 * Paginate rows
 */
export const paginateRows = (
  rows: RowData[],
  currentPage: number,
  pageSize: number
): RowData[] => {
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return rows.slice(startIndex, endIndex);
};

/**
 * Calculate total pages
 */
export const calculateTotalPages = (totalRows: number, pageSize: number): number => {
  return Math.ceil(totalRows / pageSize);
};

/**
 * Format cell value based on column type
 */
export const formatCellValue = (
  value: any,
  column: ColumnDefinition
): string => {
  if (value == null) return '';

  // Use custom format function if provided
  if (column.format) {
    return column.format(value);
  }

  // Default formatting based on type
  switch (column.type) {
    case 'number':
      return Number(value).toLocaleString();

    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(Number(value));

    case 'date':
      return new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

    case 'boolean':
      return value ? 'Yes' : 'No';

    default:
      return String(value);
  }
};

/**
 * Get filter operators available for a column type
 */
export const getAvailableOperators = (columnType: ColumnDefinition['type']): FilterOperator[] => {
  switch (columnType) {
    case 'number':
    case 'currency':
      return ['equals', 'greaterThan', 'lessThan', 'between'];
    case 'date':
      return ['equals', 'greaterThan', 'lessThan', 'between'];
    case 'boolean':
      return ['equals'];
    case 'text':
    default:
      return ['equals', 'contains', 'startsWith', 'endsWith'];
  }
};

/**
 * Validate pagination bounds
 */
export const validatePageNumber = (
  page: number,
  totalPages: number
): number => {
  if (page < 1) return 1;
  if (page > totalPages) return totalPages;
  return page;
};
