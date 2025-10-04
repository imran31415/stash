import type {
  ComparisonTableData,
  ComparisonTableStats,
  ComparisonCell,
  ComparisonRow,
  ComparisonResult,
} from './ComparisonTable.types';

/**
 * Calculate comparison table statistics
 */
export function calculateComparisonStats(data: ComparisonTableData): ComparisonTableStats {
  let categorizedRows = 0;
  let highlightedRows = 0;

  data.rows.forEach((row) => {
    if (row.category) categorizedRows++;
    if (row.highlighted) highlightedRows++;
  });

  const highlightedColumns = data.columns.filter((col) => col.highlighted).length;
  const totalCells = data.rows.length * data.columns.length;

  return {
    totalRows: data.rows.length,
    totalColumns: data.columns.length,
    totalCells,
    categorizedRows,
    highlightedRows,
    highlightedColumns,
  };
}

/**
 * Format cell value for display
 */
export function formatCellValue(cell: ComparisonCell): string {
  if (cell.displayValue !== undefined) return cell.displayValue;

  switch (cell.type) {
    case 'boolean':
      return cell.value ? '✓' : '✗';
    case 'number':
      if (typeof cell.value === 'number') {
        return cell.value.toLocaleString();
      }
      return String(cell.value);
    case 'rating':
      if (typeof cell.value === 'number') {
        return '⭐'.repeat(Math.min(5, Math.max(0, Math.round(cell.value))));
      }
      return String(cell.value);
    case 'badge':
      return String(cell.value);
    default:
      return String(cell.value ?? '');
  }
}

/**
 * Get color for comparison result
 */
export function getComparisonColor(comparison?: ComparisonResult): string | undefined {
  switch (comparison) {
    case 'better':
      return '#10B981';
    case 'worse':
      return '#EF4444';
    case 'equal':
      return '#6B7280';
    case 'neutral':
    default:
      return undefined;
  }
}

/**
 * Get background color for comparison result
 */
export function getComparisonBackgroundColor(comparison?: ComparisonResult): string | undefined {
  switch (comparison) {
    case 'better':
      return '#D1FAE5';
    case 'worse':
      return '#FEE2E2';
    case 'equal':
      return '#F3F4F6';
    case 'neutral':
    default:
      return undefined;
  }
}

/**
 * Auto-compare cells in a row (compare to first column or best value)
 */
export function autoCompareRow(row: ComparisonRow): ComparisonRow {
  if (row.cells.length < 2) return row;

  // For numeric values, compare to the best value in the row
  const numericCells = row.cells
    .map((cell, index) => ({ cell, index }))
    .filter(({ cell }) => cell.type === 'number' && typeof cell.value === 'number');

  if (numericCells.length > 0) {
    const maxValue = Math.max(...numericCells.map(({ cell }) => cell.value as number));
    const minValue = Math.min(...numericCells.map(({ cell }) => cell.value as number));

    return {
      ...row,
      cells: row.cells.map((cell, index) => {
        if (cell.type === 'number' && typeof cell.value === 'number') {
          let comparison: ComparisonResult = 'neutral';
          if (cell.value === maxValue && maxValue !== minValue) {
            comparison = 'better';
          } else if (cell.value === minValue && maxValue !== minValue) {
            comparison = 'worse';
          } else if (maxValue === minValue) {
            comparison = 'equal';
          }

          return { ...cell, comparison };
        }
        return cell;
      }),
    };
  }

  // For boolean values, true is better
  const booleanCells = row.cells.filter((cell) => cell.type === 'boolean');
  if (booleanCells.length > 0) {
    return {
      ...row,
      cells: row.cells.map((cell) => {
        if (cell.type === 'boolean') {
          return {
            ...cell,
            comparison: cell.value === true ? 'better' : 'worse',
          };
        }
        return cell;
      }),
    };
  }

  return row;
}

/**
 * Group rows by category
 */
export function groupRowsByCategory(rows: ComparisonRow[]): Map<string, ComparisonRow[]> {
  const groups = new Map<string, ComparisonRow[]>();

  rows.forEach((row) => {
    const category = row.category || 'Other';
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category)!.push(row);
  });

  return groups;
}

/**
 * Get icon for cell type
 */
export function getCellTypeIcon(cell: ComparisonCell): string | undefined {
  if (cell.icon) return cell.icon;

  switch (cell.type) {
    case 'boolean':
      return cell.value ? '✓' : '✗';
    case 'rating':
      return '⭐';
    default:
      return undefined;
  }
}

/**
 * Calculate column winner (best value in column)
 */
export function getColumnWinner(
  rows: ComparisonRow[],
  columnIndex: number
): { rowId: string; value: any } | null {
  const numericValues = rows
    .map((row) => ({
      rowId: row.id,
      cell: row.cells[columnIndex],
    }))
    .filter(({ cell }) => cell?.type === 'number' && typeof cell.value === 'number');

  if (numericValues.length === 0) return null;

  const best = numericValues.reduce((prev, curr) => {
    return (curr.cell.value as number) > (prev.cell.value as number) ? curr : prev;
  });

  return { rowId: best.rowId, value: best.cell.value };
}
