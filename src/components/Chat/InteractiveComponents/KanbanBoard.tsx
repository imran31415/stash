import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import type { KanbanBoardProps, KanbanColumn, KanbanCard } from './KanbanBoard.types';
import {
  calculateBoardStats,
  getPriorityColor,
  getPriorityIcon,
  isCardOverdue,
  formatDueDate,
  getInitials,
  isColumnOverWIPLimit,
  getWIPUtilization,
} from './KanbanBoard.utils';
import {
  borderRadius,
  spacing,
  typography,
  useThemeColors,
  useResponsiveMode,
  StatsBar,
} from './shared';

// Local colors for consistent styling
const colors = {
  surface: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
  },
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    inverse: '#FFFFFF',
  },
  border: {
    default: '#E2E8F0',
  },
  accent: {
    500: '#3B82F6',
  },
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  data,
  mode = 'mini',
  layout = 'horizontal',
  height = 400,
  width,
  showStats = true,
  enableDragDrop = false,
  onCardPress,
  onCardMove,
  onColumnPress,
  onExpandPress,
}) => {
  const themeColors = useThemeColors();
  const { isMini } = useResponsiveMode(mode);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={[styles.headerTitle, isMini && styles.headerTitleMini]} numberOfLines={1}>
          {data?.title || 'Kanban Board'}
        </Text>
        {data?.description && !isMini && (
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {data.description}
          </Text>
        )}
      </View>
      {mode !== 'full' && onExpandPress && (
        <TouchableOpacity
          style={styles.expandButton}
          onPress={onExpandPress}
          accessibilityLabel="Expand Kanban board"
          accessibilityRole="button"
        >
          <Text style={styles.expandButtonText}>👁️ Expand</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Early return if data is not provided
  if (!data || !data.columns) {
    return (
      <View style={[styles.container, { height }]}>
        {renderHeader()}
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
            No kanban board data available
          </Text>
        </View>
      </View>
    );
  }

  const stats = useMemo(() => calculateBoardStats(data), [data]);

  const renderCard = useCallback((card: KanbanCard, column: KanbanColumn) => {
    const isOverdue = isCardOverdue(card);
    const priorityColor = getPriorityColor(card.priority);
    const priorityIcon = getPriorityIcon(card.priority);

    return (
      <TouchableOpacity
        key={card.id}
        style={[
          styles.card,
          { backgroundColor: themeColors.surface, borderColor: themeColors.border },
          isOverdue && { borderColor: '#FF3B30', borderWidth: 2 },
        ]}
        onPress={() => onCardPress?.(card, column)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Card: ${card.title}${card.priority ? `, ${card.priority} priority` : ''}${isOverdue ? ', overdue' : ''}`}
        accessibilityHint="Double tap to view card details"
      >
        {/* Priority indicator */}
        {card.priority && (
          <View style={[styles.priorityBar, { backgroundColor: priorityColor }]} />
        )}

        {/* Card content */}
        <View style={styles.cardContent}>
          {/* Title */}
          <Text
            style={[styles.cardTitle, { color: themeColors.text }]}
            numberOfLines={isMini ? 1 : 2}
          >
            {card.title}
          </Text>

          {/* Description */}
          {!isMini && card.description && (
            <Text
              style={[styles.cardDescription, { color: themeColors.textSecondary }]}
              numberOfLines={2}
            >
              {card.description}
            </Text>
          )}

          {/* Tags */}
          {!isMini && card.tags && card.tags.length > 0 && (
            <View style={styles.cardTags}>
              {card.tags.slice(0, 3).map((tag) => (
                <View
                  key={tag.id}
                  style={[styles.tag, { backgroundColor: tag.color + '20', borderColor: tag.color }]}
                >
                  <Text style={[styles.tagText, { color: tag.color }]}>{tag.label}</Text>
                </View>
              ))}
              {card.tags.length > 3 && (
                <Text style={[styles.tagMore, { color: themeColors.textSecondary }]}>
                  +{card.tags.length - 3}
                </Text>
              )}
            </View>
          )}

          {/* Metadata */}
          <View style={styles.cardMeta}>
            {/* Due date */}
            {card.dueDate && (
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>📅</Text>
                <Text
                  style={[
                    styles.metaText,
                    { color: isOverdue ? '#FF3B30' : themeColors.textSecondary },
                  ]}
                >
                  {formatDueDate(card.dueDate)}
                </Text>
              </View>
            )}

            {/* Checklist */}
            {card.checklistItems && card.checklistItems > 0 && (
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>✓</Text>
                <Text style={[styles.metaText, { color: themeColors.textSecondary }]}>
                  {card.checklistCompleted}/{card.checklistItems}
                </Text>
              </View>
            )}

            {/* Comments */}
            {card.comments && card.comments > 0 && (
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>💬</Text>
                <Text style={[styles.metaText, { color: themeColors.textSecondary }]}>
                  {card.comments}
                </Text>
              </View>
            )}

            {/* Attachments */}
            {card.attachments && card.attachments > 0 && (
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>📎</Text>
                <Text style={[styles.metaText, { color: themeColors.textSecondary }]}>
                  {card.attachments}
                </Text>
              </View>
            )}
          </View>

          {/* Assignees */}
          {card.assignees && card.assignees.length > 0 && (
            <View style={styles.cardAssignees}>
              {card.assignees.slice(0, 3).map((assignee, index) => (
                <View
                  key={assignee.id}
                  style={[
                    styles.assigneeAvatar,
                    { backgroundColor: assignee.color || themeColors.primary },
                    index > 0 && { marginLeft: -8 },
                  ]}
                >
                  <Text style={styles.assigneeText}>{getInitials(assignee.name)}</Text>
                </View>
              ))}
              {card.assignees.length > 3 && (
                <View
                  style={[
                    styles.assigneeAvatar,
                    { backgroundColor: themeColors.border, marginLeft: -8 },
                  ]}
                >
                  <Text style={[styles.assigneeText, { color: themeColors.textSecondary }]}>
                    +{card.assignees.length - 3}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [themeColors, isMini, onCardPress]);

  const renderColumn = useCallback((column: KanbanColumn) => {
    const isOverLimit = isColumnOverWIPLimit(column);
    const wipUtilization = getWIPUtilization(column);

    return (
      <View
        key={column.id}
        style={[
          styles.column,
          { backgroundColor: themeColors.surface },
          isMini && styles.columnMini,
        ]}
      >
        {/* Column header */}
        <TouchableOpacity
          style={[styles.columnHeader, { borderBottomColor: themeColors.border }]}
          onPress={() => onColumnPress?.(column)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Column: ${column.title}, ${column.cards.length} card${column.cards.length !== 1 ? 's' : ''}`}
          accessibilityHint="Double tap to view column options"
        >
          <View style={styles.columnHeaderContent}>
            {column.icon && <Text style={styles.columnIcon}>{column.icon}</Text>}
            <Text style={[styles.columnTitle, { color: themeColors.text }]} numberOfLines={1}>
              {column.title}
            </Text>
            <View style={[styles.columnCount, { backgroundColor: themeColors.primary }]}>
              <Text style={styles.columnCountText}>{column.cards.length}</Text>
            </View>
          </View>

          {/* WIP Limit indicator */}
          {column.wipLimit && (
            <View style={styles.wipLimitContainer}>
              <View style={[styles.wipLimitBar, { backgroundColor: themeColors.border }]}>
                <View
                  style={[
                    styles.wipLimitProgress,
                    {
                      backgroundColor: isOverLimit ? '#FF3B30' : themeColors.primary,
                      width: `${Math.min(wipUtilization, 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.wipLimitText, { color: themeColors.textSecondary }]}>
                {column.cards.length}/{column.wipLimit}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Cards */}
        <ScrollView
          style={styles.columnCards}
          contentContainerStyle={styles.columnCardsContent}
          showsVerticalScrollIndicator={false}
        >
          {column.cards.map((card) => renderCard(card, column))}
          {column.cards.length === 0 && (
            <View style={styles.emptyColumn}>
              <Text style={[styles.emptyColumnText, { color: themeColors.textTertiary }]}>
                No cards
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }, [themeColors, isMini, renderCard, onColumnPress]);

  return (
    <View style={[styles.container, isMini && styles.containerMini, { height }]}>
      {renderHeader()}

      {showStats && (
        <StatsBar
          stats={[
            { value: stats.totalCards, label: 'Total' },
            { value: stats.completedCards, label: 'Done', color: '#34C759' },
            { value: stats.inProgressCards, label: 'In Progress', color: '#007AFF' },
            ...(stats.blockedCards > 0 ? [{ value: stats.blockedCards, label: 'Blocked', color: '#FF3B30' }] : []),
            ...(stats.overdueCards > 0 ? [{ value: stats.overdueCards, label: 'Overdue', color: '#FF9500' }] : []),
          ]}
        />
      )}

      {/* Board */}
      <ScrollView
        horizontal
        style={styles.board}
        contentContainerStyle={styles.boardContent}
        showsHorizontalScrollIndicator={true}
      >
        {data.columns.map(renderColumn)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    paddingLeft: 2,
    marginLeft: 1,
  },
  containerMini: {
    borderRadius: borderRadius.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    backgroundColor: colors.surface.secondary,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerTitleMini: {
    fontSize: typography.fontSize.base,
    marginBottom: 0,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  expandButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.base,
    backgroundColor: colors.accent[500],
    marginLeft: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
  board: {
    flex: 1,
  },
  boardContent: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    paddingLeft: 14,
    gap: 10,
  },
  column: {
    width: 240,
    borderRadius: borderRadius.base,
    overflow: 'hidden',
  },
  columnMini: {
    width: 200,
  },
  columnHeader: {
    padding: 12,
    borderBottomWidth: 1,
  },
  columnHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  columnIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  columnTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  columnCount: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  columnCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  wipLimitContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wipLimitBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  wipLimitProgress: {
    height: '100%',
  },
  wipLimitText: {
    fontSize: 11,
    fontWeight: '600',
  },
  columnCards: {
    flex: 1,
  },
  columnCardsContent: {
    padding: 12,
    gap: 8,
  },
  emptyColumn: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyColumnText: {
    fontSize: 13,
  },
  card: {
    borderRadius: borderRadius.base,
    borderWidth: 1,
    overflow: 'hidden',
  },
  priorityBar: {
    height: 4,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  cardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  tagMore: {
    fontSize: 10,
    fontWeight: '600',
    alignSelf: 'center',
  },
  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaIcon: {
    fontSize: 12,
  },
  metaText: {
    fontSize: 11,
  },
  cardAssignees: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assigneeAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  assigneeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
