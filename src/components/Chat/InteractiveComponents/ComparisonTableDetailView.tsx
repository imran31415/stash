import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useThemeColors } from '../../../theme';
import type {
  ComparisonTableDetailViewProps,
  ComparisonRow,
  ComparisonColumn,
  ComparisonCell,
} from './ComparisonTable.types';
import { ComparisonTable } from './ComparisonTable';
import {
  calculateComparisonStats,
  formatCellValue,
  getComparisonColor,
  groupRowsByCategory,
} from './ComparisonTable.utils';

export const ComparisonTableDetailView: React.FC<ComparisonTableDetailViewProps> = ({
  data,
  visible,
  onClose,
  onCellPress,
  onColumnPress,
  onRowPress,
}) => {
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState<'table' | 'rows' | 'columns' | 'stats'>('table');
  const [selectedCell, setSelectedCell] = useState<{
    row: ComparisonRow;
    column: ComparisonColumn;
    cell: ComparisonCell;
  } | null>(null);

  const stats = useMemo(() => calculateComparisonStats(data), [data]);
  const groupedRows = useMemo(() => groupRowsByCategory(data.rows), [data.rows]);

  const handleCellPress = (row: ComparisonRow, column: ComparisonColumn, cell: ComparisonCell) => {
    setSelectedCell({ row, column, cell });
    onCellPress?.(row, column, cell);
  };

  const renderTableTab = () => (
    <View style={{ flex: 1 }}>
      <ComparisonTable
        data={data}
        mode="full"
        showComparison={true}
        stickyHeader={true}
        stickyFirstColumn={true}
        onCellPress={handleCellPress}
        onColumnPress={onColumnPress}
        onRowPress={onRowPress}
      />
      {selectedCell && renderCellDetails()}
    </View>
  );

  const renderRowsTab = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.listContent}>
      {Array.from(groupedRows.entries()).map(([category, rows]) => (
        <View key={category} style={[styles.categorySection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.categoryTitle, { color: colors.text }]}>{category}</Text>
          {rows.map((row) => (
            <TouchableOpacity
              key={row.id}
              style={[
                styles.rowItem,
                { backgroundColor: colors.background, borderColor: colors.border },
              ]}
              onPress={() => onRowPress?.(row)}
            >
              <Text style={[styles.rowItemTitle, { color: colors.text }]}>{row.label}</Text>
              {row.description && (
                <Text style={[styles.rowItemDescription, { color: colors.textSecondary }]}>
                  {row.description}
                </Text>
              )}
              <View style={styles.rowItemCells}>
                <Text style={[styles.rowItemCellsLabel, { color: colors.textSecondary }]}>
                  {row.cells.length} cells
                </Text>
                {row.highlighted && (
                  <View style={[styles.highlightedBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.highlightedBadgeText}>Highlighted</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );

  const renderColumnsTab = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.listContent}>
      {data.columns.map((column, index) => (
        <TouchableOpacity
          key={column.id}
          style={[
            styles.columnItem,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => onColumnPress?.(column)}
        >
          <View style={styles.columnItemHeader}>
            {column.icon && <Text style={styles.columnItemIcon}>{column.icon}</Text>}
            <View style={{ flex: 1 }}>
              <Text style={[styles.columnItemTitle, { color: colors.text }]}>{column.label}</Text>
              {column.description && (
                <Text style={[styles.columnItemDescription, { color: colors.textSecondary }]}>
                  {column.description}
                </Text>
              )}
            </View>
            {column.highlighted && (
              <View style={[styles.highlightedBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.highlightedBadgeText}>★</Text>
              </View>
            )}
          </View>
          <Text style={[styles.columnItemMeta, { color: colors.textSecondary }]}>
            Column {index + 1} • {data.rows.length} values
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderStatsTab = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.statsContent}>
      {/* Overview */}
      <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.statsCardTitle, { color: colors.text }]}>Table Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statsGridItem}>
            <Text style={[styles.statsGridValue, { color: colors.text }]}>{stats.totalRows}</Text>
            <Text style={[styles.statsGridLabel, { color: colors.textSecondary }]}>Rows</Text>
          </View>
          <View style={styles.statsGridItem}>
            <Text style={[styles.statsGridValue, { color: colors.primary }]}>{stats.totalColumns}</Text>
            <Text style={[styles.statsGridLabel, { color: colors.textSecondary }]}>Columns</Text>
          </View>
          <View style={styles.statsGridItem}>
            <Text style={[styles.statsGridValue, { color: colors.text }]}>{stats.totalCells}</Text>
            <Text style={[styles.statsGridLabel, { color: colors.textSecondary }]}>Cells</Text>
          </View>
        </View>
      </View>

      {/* Highlights */}
      <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.statsCardTitle, { color: colors.text }]}>Highlights</Text>
        <View style={styles.statsList}>
          <View style={styles.statsListItem}>
            <Text style={[styles.statsListLabel, { color: colors.textSecondary }]}>
              Highlighted Rows
            </Text>
            <Text style={[styles.statsListValue, { color: '#10B981' }]}>
              {stats.highlightedRows}
            </Text>
          </View>
          <View style={styles.statsListItem}>
            <Text style={[styles.statsListLabel, { color: colors.textSecondary }]}>
              Highlighted Columns
            </Text>
            <Text style={[styles.statsListValue, { color: '#10B981' }]}>
              {stats.highlightedColumns}
            </Text>
          </View>
          <View style={styles.statsListItem}>
            <Text style={[styles.statsListLabel, { color: colors.textSecondary }]}>
              Categorized Rows
            </Text>
            <Text style={[styles.statsListValue, { color: colors.text }]}>
              {stats.categorizedRows}
            </Text>
          </View>
        </View>
      </View>

      {/* Categories */}
      {groupedRows.size > 1 && (
        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statsCardTitle, { color: colors.text }]}>Categories</Text>
          {Array.from(groupedRows.entries()).map(([category, rows]) => (
            <View key={category} style={styles.categoryStatItem}>
              <Text style={[styles.categoryStatLabel, { color: colors.text }]}>{category}</Text>
              <Text style={[styles.categoryStatValue, { color: colors.textSecondary }]}>
                {rows.length} row{rows.length !== 1 ? 's' : ''}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderCellDetails = () => {
    if (!selectedCell) return null;
    const { row, column, cell } = selectedCell;

    return (
      <View
        style={[styles.cellDetailsPanel, { backgroundColor: colors.surface, borderTopColor: colors.border }]}
      >
        <View style={styles.cellDetailsHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cellDetailsTitle, { color: colors.text }]}>Cell Details</Text>
            <Text style={[styles.cellDetailsSubtitle, { color: colors.textSecondary }]}>
              {column.label} • {row.label}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setSelectedCell(null)} style={styles.closeDetailsButton}>
            <Text style={[styles.closeDetailsText, { color: colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.cellDetailsContent} showsVerticalScrollIndicator={false}>
          <View style={styles.detailsSection}>
            <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>Value</Text>
            <Text
              style={[
                styles.detailsSectionText,
                { color: getComparisonColor(cell.comparison) || colors.text },
              ]}
            >
              {formatCellValue(cell)}
            </Text>
          </View>

          <View style={styles.detailsSection}>
            <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>Type</Text>
            <Text style={[styles.detailsSectionText, { color: colors.text }]}>{cell.type || 'text'}</Text>
          </View>

          {cell.comparison && (
            <View style={styles.detailsSection}>
              <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>Comparison</Text>
              <Text
                style={[
                  styles.detailsSectionText,
                  { color: getComparisonColor(cell.comparison) || colors.text },
                ]}
              >
                {cell.comparison}
              </Text>
            </View>
          )}

          {cell.metadata && Object.keys(cell.metadata).length > 0 && (
            <View style={styles.detailsSection}>
              <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>Metadata</Text>
              {Object.entries(cell.metadata).map(([key, value]) => (
                <Text key={key} style={[styles.metadataText, { color: colors.text }]}>
                  {key}: {String(value)}
                </Text>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: colors.text }]}>{data.title}</Text>
            {data.description && (
              <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
                {data.description}
              </Text>
            )}
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={[styles.tabs, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'table' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('table')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'table' ? colors.primary : colors.textSecondary },
              ]}
            >
              Table
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'rows' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('rows')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'rows' ? colors.primary : colors.textSecondary },
              ]}
            >
              Rows
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'columns' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('columns')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'columns' ? colors.primary : colors.textSecondary },
              ]}
            >
              Columns
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'stats' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('stats')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'stats' ? colors.primary : colors.textSecondary },
              ]}
            >
              Stats
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'table' && renderTableTab()}
          {activeTab === 'rows' && renderRowsTab()}
          {activeTab === 'columns' && renderColumnsTab()}
          {activeTab === 'stats' && renderStatsTab()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
    marginLeft: 12,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: '300',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  categorySection: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  rowItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  rowItemTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowItemDescription: {
    fontSize: 13,
  },
  rowItemCells: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  rowItemCellsLabel: {
    fontSize: 12,
  },
  highlightedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  highlightedBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  columnItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  columnItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  columnItemIcon: {
    fontSize: 20,
  },
  columnItemTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  columnItemDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  columnItemMeta: {
    fontSize: 12,
  },
  statsContent: {
    padding: 16,
    gap: 16,
  },
  statsCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statsGridItem: {
    flex: 1,
    alignItems: 'center',
  },
  statsGridValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statsGridLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  statsList: {
    gap: 12,
  },
  statsListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsListLabel: {
    fontSize: 14,
  },
  statsListValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  categoryStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryStatLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryStatValue: {
    fontSize: 13,
  },
  cellDetailsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cellDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
  },
  cellDetailsTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cellDetailsSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeDetailsButton: {
    padding: 4,
  },
  closeDetailsText: {
    fontSize: 20,
  },
  cellDetailsContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailsSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  detailsSectionText: {
    fontSize: 16,
    lineHeight: 22,
  },
  metadataText: {
    fontSize: 13,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});
