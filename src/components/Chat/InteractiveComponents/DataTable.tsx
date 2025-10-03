import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import type { DataTableProps, SortConfig, RowData } from './DataTable.types';
import {
  sortRows,
  filterRows,
  searchRows,
  paginateRows,
  calculateTotalPages,
  formatCellValue,
  validatePageNumber,
} from './DataTable.utils';

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  title = 'Data Table',
  subtitle,
  mode = 'preview',
  maxHeight = 400,
  sortable = true,
  filterable = true,
  paginated = true,
  selectable = false,
  striped = true,
  bordered = true,
  hoverable = true,
  defaultSort,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  onSort,
  onPageChange,
  onPageSizeChange,
  onRowSelect,
  onRowPress,
  onExpandPress,
  headerBackgroundColor = '#F3F4F6',
  rowBackgroundColor = '#FFFFFF',
  alternateRowBackgroundColor = '#F9FAFB',
  borderColor = '#E5E7EB',
  textColor = '#111827',
  headerTextColor = '#374151',
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(defaultSort || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  const isMini = mode === 'mini';
  const isPreview = mode === 'preview';
  const screenWidth = Dimensions.get('window').width;
  const containerWidth = (isMini || isPreview) ? 400 : screenWidth;

  // Determine screen breakpoint - treat mini/preview as small screen
  const isSmallScreen = (isMini || isPreview) || containerWidth < 400;
  const isMediumScreen = containerWidth >= 400 && containerWidth < 600;

  // Filter columns based on screen size and priority
  const visibleColumns = useMemo(() => {
    return columns.filter((column) => {
      if (!column.priority) return true; // No priority = always show
      if (isSmallScreen) return column.priority === 1; // Small: only priority 1
      if (isMediumScreen) return column.priority <= 2; // Medium: priority 1 and 2
      return true; // Large: show all
    });
  }, [columns, isSmallScreen, isMediumScreen]);

  // Calculate responsive column width - fit to screen
  const getResponsiveWidth = (column: any) => {
    // For mini/preview mode (400px), use compact widths
    if (isMini || isPreview) {
      const availableWidth = 400 - 40; // Account for padding
      const numColumns = visibleColumns.length + (selectable ? 1 : 0);
      const autoWidth = Math.floor(availableWidth / numColumns);
      return Math.max(60, Math.min(autoWidth, 100)); // 60-100px for compact view
    }

    // Calculate available width per column
    const availableWidth = containerWidth - 40; // Account for padding
    const numColumns = visibleColumns.length + (selectable ? 1 : 0);
    const autoWidth = Math.floor(availableWidth / numColumns);

    // Use column width only on larger screens
    if (!isSmallScreen && !isMediumScreen && column.width) {
      return column.width;
    }

    // On small/medium screens, distribute width evenly
    if (isSmallScreen) return Math.max(80, Math.min(autoWidth, 120)); // 80-120px
    if (isMediumScreen) return Math.max(100, Math.min(autoWidth, 140)); // 100-140px
    return column.width || 150; // Tablets and larger
  };

  // Process data through filtering, searching, and sorting
  const processedData = useMemo(() => {
    let result = [...data];

    // Search
    if (searchQuery) {
      result = searchRows(result, searchQuery, columns);
    }

    // Sort
    if (sortConfig) {
      result = sortRows(result, sortConfig, columns);
    }

    return result;
  }, [data, searchQuery, sortConfig, columns]);

  // Pagination
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
        newSortConfig = null; // Clear sort
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
          { color: textColor },
          column.align === 'center' && styles.textCenter,
          column.align === 'right' && styles.textRight,
          (isSmallScreen || isMediumScreen) && styles.cellTextSmall,
        ]}
        numberOfLines={isSmallScreen ? 2 : isMini ? 1 : 2}
        adjustsFontSizeToFit={isSmallScreen}
        minimumFontScale={0.8}
      >
        {formattedValue}
      </Text>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          maxHeight,
          width: (isMini || isPreview) ? 400 : '100%',
          alignSelf: (isMini || isPreview) ? 'flex-start' : 'stretch'
        }
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{processedData.length}</Text>
            </View>
          </View>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          {visibleColumns.length < columns.length && (
            <Text style={styles.hiddenColumnsHint}>
              📱 Showing {visibleColumns.length} of {columns.length} columns • Expand for full view
            </Text>
          )}
        </View>
        {onExpandPress && (
          <TouchableOpacity
            style={styles.expandButton}
            onPress={onExpandPress}
            accessibilityLabel="Expand table"
            accessibilityRole="button"
          >
            <Text style={styles.expandButtonText}>👁️ Expand</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar */}
      {filterable && !isMini && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
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

      {/* Table */}
      <View style={styles.tableScrollView}>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableHeader, { backgroundColor: headerBackgroundColor }]}>
            {selectable && (
              <View style={[styles.headerCell, styles.checkboxCell]}>
                <Text style={[styles.headerText, { color: headerTextColor }]}>☑</Text>
              </View>
            )}
            {visibleColumns.map((column) => (
              <TouchableOpacity
                key={column.id}
                style={[
                  styles.headerCell,
                  (isSmallScreen || isMediumScreen)
                    ? { flex: 1, minWidth: 80 }
                    : { width: getResponsiveWidth(column), minWidth: column.minWidth },
                ]}
                onPress={() => handleSort(column.id)}
                disabled={!sortable && !column.sortable}
              >
                <View style={styles.headerCellContent}>
                  {column.renderHeader ? (
                    column.renderHeader()
                  ) : (
                    <Text
                      style={[
                        styles.headerText,
                        { color: headerTextColor },
                        (isSmallScreen || isMediumScreen) && styles.headerTextSmall,
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit={isSmallScreen}
                      minimumFontScale={0.7}
                    >
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
            showsVerticalScrollIndicator={!isMini}
          >
            {paginatedData.map((row, rowIndex) => {
              const isSelected = selectedRows.has(row.id);
              const backgroundColor = isSelected
                ? '#EFF6FF'
                : striped && rowIndex % 2 === 1
                ? alternateRowBackgroundColor
                : rowBackgroundColor;

              return (
                <TouchableOpacity
                  key={row.id}
                  style={[
                    styles.tableRow,
                    { backgroundColor },
                    bordered && { borderBottomWidth: 1, borderBottomColor: borderColor },
                  ]}
                  onPress={() => handleRowPress(row)}
                  activeOpacity={hoverable ? 0.7 : 1}
                >
                  {selectable && (
                    <View style={[styles.cell, styles.checkboxCell]}>
                      <Text style={styles.checkbox}>{isSelected ? '☑' : '☐'}</Text>
                    </View>
                  )}
                  {visibleColumns.map((column) => (
                    <View
                      key={column.id}
                      style={[
                        styles.cell,
                        (isSmallScreen || isMediumScreen)
                          ? { flex: 1, minWidth: 80 }
                          : { width: getResponsiveWidth(column), minWidth: column.minWidth },
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
      </View>

      {/* Pagination */}
      {paginated && !isMini && totalPages > 1 && (
        <View style={styles.pagination}>
          {screenWidth < 500 ? (
            // Mobile layout - stacked vertically
            <View style={styles.paginationControlsMobile}>
              {/* Row 1: Page Size and Navigation together */}
              <View style={styles.paginationRow}>
                {/* Page Size Selector - show fewer options on mobile */}
                <View style={styles.pageSizeSelector}>
                  <Text style={styles.paginationLabel}>Rows:</Text>
                  {pageSizeOptions.slice(0, 3).map((size) => (
                    <TouchableOpacity
                      key={size}
                      onPress={() => handlePageSizeChange(size)}
                      style={[
                        styles.pageSizeOption,
                        pageSize === size && styles.pageSizeOptionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.pageSizeText,
                          pageSize === size && styles.pageSizeTextActive,
                        ]}
                      >
                        {size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Page Navigation */}
                <View style={styles.pageNavigation}>
                  <TouchableOpacity
                    onPress={() => handlePageChange(validatedPage - 1)}
                    disabled={validatedPage === 1}
                    style={[styles.pageButton, validatedPage === 1 && styles.pageButtonDisabled]}
                  >
                    <Text
                      style={[
                        styles.pageButtonText,
                        validatedPage === 1 && styles.pageButtonTextDisabled,
                      ]}
                    >
                      ←
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.pageInfo}>
                    {validatedPage}/{totalPages}
                  </Text>

                  <TouchableOpacity
                    onPress={() => handlePageChange(validatedPage + 1)}
                    disabled={validatedPage === totalPages}
                    style={[
                      styles.pageButton,
                      validatedPage === totalPages && styles.pageButtonDisabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pageButtonText,
                        validatedPage === totalPages && styles.pageButtonTextDisabled,
                      ]}
                    >
                      →
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Row 2: Info text */}
              <View style={styles.paginationInfoMobile}>
                <Text style={styles.paginationText}>
                  {(validatedPage - 1) * pageSize + 1}-
                  {Math.min(validatedPage * pageSize, processedData.length)} of{' '}
                  {processedData.length}
                </Text>
              </View>
            </View>
          ) : (
            // Desktop layout - single row
            <View style={styles.paginationControls}>
              {/* Page Size Selector */}
              <View style={styles.pageSizeSelector}>
                <Text style={styles.paginationLabel}>Rows:</Text>
                {pageSizeOptions.map((size) => (
                  <TouchableOpacity
                    key={size}
                    onPress={() => handlePageSizeChange(size)}
                    style={[
                      styles.pageSizeOption,
                      pageSize === size && styles.pageSizeOptionActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pageSizeText,
                        pageSize === size && styles.pageSizeTextActive,
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Page Navigation */}
              <View style={styles.pageNavigation}>
                <TouchableOpacity
                  onPress={() => handlePageChange(validatedPage - 1)}
                  disabled={validatedPage === 1}
                  style={[styles.pageButton, validatedPage === 1 && styles.pageButtonDisabled]}
                >
                  <Text
                    style={[
                      styles.pageButtonText,
                      validatedPage === 1 && styles.pageButtonTextDisabled,
                    ]}
                  >
                    ←
                  </Text>
                </TouchableOpacity>

                <Text style={styles.pageInfo}>
                  Page {validatedPage} of {totalPages}
                </Text>

                <TouchableOpacity
                  onPress={() => handlePageChange(validatedPage + 1)}
                  disabled={validatedPage === totalPages}
                  style={[
                    styles.pageButton,
                    validatedPage === totalPages && styles.pageButtonDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.pageButtonText,
                      validatedPage === totalPages && styles.pageButtonTextDisabled,
                    ]}
                  >
                    →
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Info text */}
              <View style={styles.paginationInfo}>
                <Text style={styles.paginationText}>
                  Showing {(validatedPage - 1) * pageSize + 1}-
                  {Math.min(validatedPage * pageSize, processedData.length)} of{' '}
                  {processedData.length}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 8,
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  headerContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 16,
  },
  hiddenColumnsHint: {
    fontSize: 11,
    color: '#F59E0B',
    marginTop: 4,
    fontStyle: 'italic',
  },
  expandButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    height: 36,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#111827',
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  tableScrollView: {
    flex: 1,
    width: '100%',
  },
  table: {
    width: '100%',
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#D1D5DB',
  },
  headerCell: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCellContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  headerTextSmall: {
    fontSize: 11,
    fontWeight: '600',
  },
  sortIcon: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  sortIconActive: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  tableBody: {
    maxHeight: 300,
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 44,
  },
  cell: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 13,
    lineHeight: 18,
  },
  cellTextSmall: {
    fontSize: 11,
    lineHeight: 14,
  },
  textCenter: {
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },
  checkboxCell: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    fontSize: 18,
    color: '#3B82F6',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  pagination: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  paginationInfo: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  paginationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  paginationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  paginationControlsMobile: {
    flexDirection: 'column',
    gap: 8,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  paginationInfoMobile: {
    alignItems: 'center',
    paddingHorizontal: 4,
    marginTop: 0,
  },
  pageSizeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paginationLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 4,
  },
  pageSizeOption: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pageSizeOptionActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  pageSizeText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  pageSizeTextActive: {
    color: '#FFFFFF',
  },
  pageNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageButtonDisabled: {
    opacity: 0.4,
  },
  pageButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  pageButtonTextDisabled: {
    color: '#9CA3AF',
  },
  pageInfo: {
    fontSize: 12,
    color: '#6B7280',
    minWidth: 80,
    textAlign: 'center',
  },
});
