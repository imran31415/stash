import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import type { DataTableDetailViewProps, SortConfig, RowData, FilterConfig } from './DataTable.types';
import {
  sortRows,
  searchRows,
  paginateRows,
  calculateTotalPages,
  formatCellValue,
  validatePageNumber,
} from './DataTable.utils';

export const DataTableDetailView: React.FC<DataTableDetailViewProps> = ({
  visible,
  columns,
  data,
  title = 'Data Table',
  subtitle,
  onClose,
  sortable = true,
  filterable = true,
  paginated = true,
  selectable = false,
  defaultSort,
  defaultPageSize = 25,
  pageSizeOptions = [10, 25, 50, 100, 250],
  onSort,
  onPageChange,
  onPageSizeChange,
  onRowSelect,
  onRowPress,
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(defaultSort || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  // Process data
  const processedData = useMemo(() => {
    let result = [...data];

    if (searchQuery) {
      result = searchRows(result, searchQuery, columns);
    }

    if (sortConfig) {
      result = sortRows(result, sortConfig, columns);
    }

    return result;
  }, [data, searchQuery, sortConfig, columns]);

  const totalPages = calculateTotalPages(processedData.length, pageSize);
  const validatedPage = validatePageNumber(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    if (!paginated) return processedData;
    return paginateRows(processedData, validatedPage, pageSize);
  }, [processedData, validatedPage, pageSize, paginated]);

  const handleSort = (columnId: string) => {
    if (!sortable) return;

    const column = columns.find(col => col.id === columnId);
    if (!column?.sortable && column?.sortable !== undefined) return;

    let newSortConfig: SortConfig | null;

    if (sortConfig?.columnId === columnId) {
      if (sortConfig.direction === 'asc') {
        newSortConfig = { columnId, direction: 'desc' };
      } else {
        newSortConfig = null;
      }
    } else {
      newSortConfig = { columnId, direction: 'asc' };
    }

    setSortConfig(newSortConfig);
    onSort?.(newSortConfig);
  };

  const handlePageChange = (newPage: number) => {
    const validPage = validatePageNumber(newPage, totalPages);
    setCurrentPage(validPage);
    onPageChange?.(validPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    onPageSizeChange?.(newPageSize);
  };

  const handleRowPress = (row: RowData) => {
    if (selectable) {
      const newSelected = new Set(selectedRows);
      if (newSelected.has(row.id)) {
        newSelected.delete(row.id);
      } else {
        newSelected.add(row.id);
      }
      setSelectedRows(newSelected);
      onRowSelect?.(Array.from(newSelected).map(id => data.find(r => r.id === id)!).filter(Boolean));
    }
    onRowPress?.(row);
  };

  const renderSortIndicator = (columnId: string) => {
    if (!sortConfig || sortConfig.columnId !== columnId) {
      return <Text style={styles.sortIcon}>⇅</Text>;
    }
    return (
      <Text style={[styles.sortIcon, styles.sortIconActive]}>
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
      </Text>
    );
  };

  const renderCell = (row: RowData, column: any) => {
    const value = row[column.accessor];

    if (column.renderCell) {
      return column.renderCell(value, row);
    }

    const formattedValue = formatCellValue(value, column);

    return (
      <Text
        style={[
          styles.cellText,
          column.align === 'center' && styles.textCenter,
          column.align === 'right' && styles.textRight,
        ]}
        numberOfLines={3}
      >
        {formattedValue}
      </Text>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Toolbar */}
        <View style={styles.toolbar}>
          {/* Search */}
          {filterable && (
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search across all columns..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total:</Text>
              <Text style={styles.statValue}>{data.length}</Text>
            </View>
            {searchQuery && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Filtered:</Text>
                <Text style={styles.statValue}>{processedData.length}</Text>
              </View>
            )}
            {selectable && selectedRows.size > 0 && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Selected:</Text>
                <Text style={styles.statValue}>{selectedRows.size}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Table */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          style={styles.tableScrollView}
        >
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              {selectable && (
                <View style={[styles.headerCell, styles.checkboxCell]}>
                  <Text style={styles.headerText}>☑</Text>
                </View>
              )}
              {columns.map((column) => (
                <TouchableOpacity
                  key={column.id}
                  style={[
                    styles.headerCell,
                    { width: column.width || 200, minWidth: column.minWidth || 150 },
                  ]}
                  onPress={() => handleSort(column.id)}
                  disabled={!sortable && !column.sortable}
                >
                  <View style={styles.headerCellContent}>
                    {column.renderHeader ? (
                      column.renderHeader()
                    ) : (
                      <Text style={styles.headerText} numberOfLines={1}>
                        {column.header}
                      </Text>
                    )}
                    {(sortable || column.sortable) && renderSortIndicator(column.id)}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Table Body */}
            <ScrollView
              style={styles.tableBody}
              nestedScrollEnabled
              showsVerticalScrollIndicator={true}
            >
              {paginatedData.map((row, rowIndex) => {
                const isSelected = selectedRows.has(row.id);

                return (
                  <TouchableOpacity
                    key={row.id}
                    style={[
                      styles.tableRow,
                      isSelected && styles.tableRowSelected,
                      rowIndex % 2 === 1 && styles.tableRowStriped,
                    ]}
                    onPress={() => handleRowPress(row)}
                    activeOpacity={0.7}
                  >
                    {selectable && (
                      <View style={[styles.cell, styles.checkboxCell]}>
                        <Text style={styles.checkbox}>{isSelected ? '☑' : '☐'}</Text>
                      </View>
                    )}
                    {columns.map((column) => (
                      <View
                        key={column.id}
                        style={[
                          styles.cell,
                          { width: column.width || 200, minWidth: column.minWidth || 150 },
                        ]}
                      >
                        {renderCell(row, column)}
                      </View>
                    ))}
                  </TouchableOpacity>
                );
              })}

              {/* Empty State */}
              {paginatedData.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'No results found' : 'No data available'}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Footer with Pagination */}
        {paginated && totalPages > 1 && (
          <View style={styles.footer}>
            {/* Page Size Selector */}
            <View style={styles.pageSizeContainer}>
              <Text style={styles.footerLabel}>Rows per page:</Text>
              <View style={styles.pageSizeOptions}>
                {pageSizeOptions.map((size) => (
                  <TouchableOpacity
                    key={size}
                    onPress={() => handlePageSizeChange(size)}
                    style={[
                      styles.pageSizeButton,
                      pageSize === size && styles.pageSizeButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pageSizeButtonText,
                        pageSize === size && styles.pageSizeButtonTextActive,
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Pagination Info */}
            <View style={styles.paginationInfo}>
              <Text style={styles.paginationText}>
                Showing {(validatedPage - 1) * pageSize + 1}-
                {Math.min(validatedPage * pageSize, processedData.length)} of{' '}
                {processedData.length}
              </Text>
            </View>

            {/* Page Navigation */}
            <View style={styles.pageNavigation}>
              <TouchableOpacity
                onPress={() => handlePageChange(1)}
                disabled={validatedPage === 1}
                style={[styles.navButton, validatedPage === 1 && styles.navButtonDisabled]}
              >
                <Text style={[styles.navButtonText, validatedPage === 1 && styles.navButtonTextDisabled]}>
                  ⟨⟨
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handlePageChange(validatedPage - 1)}
                disabled={validatedPage === 1}
                style={[styles.navButton, validatedPage === 1 && styles.navButtonDisabled]}
              >
                <Text style={[styles.navButtonText, validatedPage === 1 && styles.navButtonTextDisabled]}>
                  ⟨
                </Text>
              </TouchableOpacity>

              <View style={styles.pageNumberContainer}>
                <Text style={styles.pageNumber}>
                  Page {validatedPage} of {totalPages}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handlePageChange(validatedPage + 1)}
                disabled={validatedPage === totalPages}
                style={[
                  styles.navButton,
                  validatedPage === totalPages && styles.navButtonDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.navButtonText,
                    validatedPage === totalPages && styles.navButtonTextDisabled,
                  ]}
                >
                  ⟩
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handlePageChange(totalPages)}
                disabled={validatedPage === totalPages}
                style={[
                  styles.navButton,
                  validatedPage === totalPages && styles.navButtonDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.navButtonText,
                    validatedPage === totalPages && styles.navButtonTextDisabled,
                  ]}
                >
                  ⟩⟩
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '600',
  },
  toolbar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    color: '#111827',
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '700',
  },
  tableScrollView: {
    flex: 1,
  },
  table: {
    minWidth: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 2,
    borderBottomColor: '#D1D5DB',
  },
  headerCell: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  headerCellContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    flex: 1,
  },
  sortIcon: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 6,
  },
  sortIconActive: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  tableBody: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 52,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableRowStriped: {
    backgroundColor: '#F9FAFB',
  },
  tableRowSelected: {
    backgroundColor: '#EFF6FF',
  },
  cell: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  cellText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  textCenter: {
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },
  checkboxCell: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    fontSize: 20,
    color: '#3B82F6',
  },
  emptyState: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  pageSizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  pageSizeOptions: {
    flexDirection: 'row',
    gap: 6,
  },
  pageSizeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  pageSizeButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  pageSizeButtonText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  pageSizeButtonTextActive: {
    color: '#FFFFFF',
  },
  paginationInfo: {
    flex: 1,
    alignItems: 'center',
  },
  paginationText: {
    fontSize: 13,
    color: '#6B7280',
  },
  pageNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '700',
  },
  navButtonTextDisabled: {
    color: '#9CA3AF',
  },
  pageNumberContainer: {
    paddingHorizontal: 12,
  },
  pageNumber: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
  },
});
