import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useThemeColors } from '../../../theme';
import type {
  ComparisonTableProps,
  ComparisonRow,
  ComparisonColumn,
  ComparisonCell,
} from './ComparisonTable.types';
import {
  calculateComparisonStats,
  formatCellValue,
  getComparisonColor,
  getCellTypeIcon,
} from './ComparisonTable.utils';

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  data,
  mode = 'mini',
  height,
  width,
  showComparison = true,
  stickyHeader = true,
  stickyFirstColumn = true,
  onCellPress,
  onColumnPress,
  onRowPress,
  onExpandPress,
}) => {
  const colors = useThemeColors();
  const isMini = mode === 'mini';
  const [selectedCell, setSelectedCell] = useState<{
    row: ComparisonRow;
    column: ComparisonColumn;
    cell: ComparisonCell;
  } | null>(null);

  const stats = useMemo(() => calculateComparisonStats(data), [data]);

  const displayRows = isMini ? data.rows.slice(0, 5) : data.rows;
  const displayColumns = isMini ? data.columns.slice(0, 3) : data.columns;

  const handleCellPress = (row: ComparisonRow, column: ComparisonColumn, cell: ComparisonCell) => {
    setSelectedCell({ row, column, cell });
    onCellPress?.(row, column, cell);
  };

  const getComparisonIcon = (comparison: ComparisonCell['comparison']): string => {
    switch (comparison) {
      case 'better':
        return '↑';
      case 'worse':
        return '↓';
      case 'equal':
        return '=';
      default:
        return '';
    }
  };

  const renderCell = (row: ComparisonRow, column: ComparisonColumn, cell: ComparisonCell, columnIndex: number) => {
    const cellColor = getComparisonColor(cell.comparison);
    const displayValue = formatCellValue(cell);
    const isHighlighted = row.highlighted || column.highlighted;

    return (
      <TouchableOpacity
        key={`${row.id}-${column.id}`}
        style={[
          styles.cell,
          columnIndex === 0 && stickyFirstColumn && styles.firstColumn,
          {
            backgroundColor: isHighlighted ? colors.surface : colors.background,
            borderColor: colors.border,
            minWidth: isMini ? 80 : 100,
          },
        ]}
        onPress={() => handleCellPress(row, column, cell)}
        activeOpacity={0.7}
      >
        <View style={styles.cellContent}>
          {getCellTypeIcon(cell) && <Text style={styles.cellIcon}>{getCellTypeIcon(cell)}</Text>}
          <Text
            style={[
              styles.cellText,
              {
                color: cell.type === 'text' ? colors.text : cellColor || colors.text,
                fontWeight: isHighlighted ? '600' : '400',
              },
            ]}
            numberOfLines={1}
          >
            {displayValue}
          </Text>
          {showComparison && cell.comparison && cell.comparison !== 'neutral' && (
            <Text
              style={[
                styles.comparisonIcon,
                { color: cellColor || colors.textSecondary },
              ]}
            >
              {getComparisonIcon(cell.comparison)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeaderCell = (column: ComparisonColumn, index: number) => {
    return (
      <TouchableOpacity
        key={column.id}
        style={[
          styles.headerCell,
          {
            backgroundColor: column.highlighted ? colors.primary : colors.surface,
            borderColor: colors.border,
            minWidth: isMini ? 80 : 100,
          },
        ]}
        onPress={() => onColumnPress?.(column)}
        activeOpacity={0.7}
      >
        {column.icon && <Text style={styles.headerIcon}>{column.icon}</Text>}
        <Text
          style={[
            styles.headerText,
            {
              color: column.highlighted ? '#FFFFFF' : colors.text,
            },
          ]}
          numberOfLines={2}
        >
          {column.label}
        </Text>
        {column.description && !isMini && (
          <Text
            style={[
              styles.headerDescription,
              {
                color: column.highlighted ? '#FFFFFF' : colors.textSecondary,
              },
            ]}
            numberOfLines={1}
          >
            {column.description}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderRow = (row: ComparisonRow, rowIndex: number) => {
    return (
      <View key={row.id} style={styles.row}>
        {/* Row label */}
        <TouchableOpacity
          style={[
            styles.rowLabel,
            stickyFirstColumn && styles.stickyColumn,
            {
              backgroundColor: row.highlighted ? colors.primary : colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={() => onRowPress?.(row)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.rowLabelText,
              {
                color: row.highlighted ? '#FFFFFF' : colors.text,
              },
            ]}
            numberOfLines={2}
          >
            {row.label}
          </Text>
          {row.category && !isMini && (
            <Text
              style={[
                styles.rowCategory,
                {
                  color: row.highlighted ? '#FFFFFF' : colors.textSecondary,
                },
              ]}
              numberOfLines={1}
            >
              {row.category}
            </Text>
          )}
        </TouchableOpacity>

        {/* Row cells */}
        {displayColumns.map((column, colIndex) => renderCell(row, column, row.cells[colIndex], colIndex))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { height, width }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {data.title}
          </Text>
          {data.description && !isMini && (
            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
              {data.description}
            </Text>
          )}
        </View>
        {isMini && onExpandPress && (
          <TouchableOpacity style={styles.expandButton} onPress={onExpandPress}>
            <Text style={styles.expandIcon}>⤢</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats bar */}
      <View style={[styles.statsBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalRows}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rows</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{stats.totalColumns}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Columns</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalCells}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Cells</Text>
        </View>
        {!isMini && (
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>{stats.highlightedRows}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Highlighted</Text>
          </View>
        )}
      </View>

      {/* Table */}
      <ScrollView style={styles.tableContainer} showsVerticalScrollIndicator={true}>
        {/* Header row */}
        {stickyHeader && (
          <View style={[styles.headerRow, { backgroundColor: colors.surface }]}>
            <View
              style={[
                styles.cornerCell,
                stickyFirstColumn && styles.stickyColumn,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={isMini}>
              <View style={styles.headerRowContent}>{displayColumns.map(renderHeaderCell)}</View>
            </ScrollView>
          </View>
        )}

        {/* Data rows */}
        <ScrollView horizontal showsHorizontalScrollIndicator={!isMini}>
          <View>
            {displayRows.map((row, index) => renderRow(row, index))}

            {isMini && data.rows.length > 5 && (
              <View style={[styles.moreRowsIndicator, { backgroundColor: colors.surface }]}>
                <Text style={[styles.moreRowsText, { color: colors.textSecondary }]}>
                  +{data.rows.length - 5} more rows...
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    marginTop: 4,
  },
  expandButton: {
    padding: 8,
    marginLeft: 8,
  },
  expandIcon: {
    fontSize: 20,
  },
  statsBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  tableContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
  },
  cornerCell: {
    width: 120,
    height: 60,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  headerRowContent: {
    flexDirection: 'row',
  },
  headerCell: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  headerIcon: {
    fontSize: 16,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerDescription: {
    fontSize: 11,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  rowLabel: {
    width: 120,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRightWidth: 1,
    justifyContent: 'center',
    gap: 2,
  },
  stickyColumn: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  firstColumn: {
    marginLeft: 120,
  },
  rowLabelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rowCategory: {
    fontSize: 11,
  },
  cell: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRightWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cellIcon: {
    fontSize: 14,
  },
  cellText: {
    fontSize: 13,
  },
  comparisonIcon: {
    fontSize: 12,
    marginLeft: 2,
  },
  moreRowsIndicator: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  moreRowsText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
