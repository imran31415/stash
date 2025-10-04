import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { useThemeColors } from '../../../theme';
import type { KanbanBoardDetailViewProps, KanbanColumn, KanbanCard } from './KanbanBoard.types';
import { KanbanBoard } from './KanbanBoard';
import { calculateBoardStats, isCardOverdue, formatDueDate, getInitials, getPriorityColor } from './KanbanBoard.utils';

export const KanbanBoardDetailView: React.FC<KanbanBoardDetailViewProps> = ({
  data,
  visible,
  onClose,
  onCardPress,
  onCardMove,
  onCardCreate,
  onCardUpdate,
  onCardDelete,
}) => {
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState<'board' | 'cards' | 'stats'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<{ card: KanbanCard; column: KanbanColumn } | null>(null);

  const stats = useMemo(() => calculateBoardStats(data), [data]);

  const handleCardPress = useCallback(
    (card: KanbanCard, column: KanbanColumn) => {
      setSelectedCard({ card, column });
      onCardPress?.(card, column);
    },
    [onCardPress]
  );

  // Get all cards from all columns
  const allCards = useMemo(() => {
    const cards: Array<{ card: KanbanCard; column: KanbanColumn }> = [];
    data.columns.forEach((column) => {
      column.cards.forEach((card) => {
        cards.push({ card, column });
      });
    });
    return cards;
  }, [data]);

  // Filter cards based on search
  const filteredCards = useMemo(() => {
    if (!searchQuery) return allCards;
    const query = searchQuery.toLowerCase();
    return allCards.filter(({ card }) =>
      card.title.toLowerCase().includes(query) ||
      card.description?.toLowerCase().includes(query) ||
      card.assignees?.some((a) => a.name.toLowerCase().includes(query)) ||
      card.tags?.some((t) => t.label.toLowerCase().includes(query))
    );
  }, [allCards, searchQuery]);

  const renderCardDetails = () => {
    if (!selectedCard) return null;
    const { card, column } = selectedCard;
    const isOverdue = isCardOverdue(card);

    return (
      <View style={[styles.cardDetailsPanel, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <View style={styles.cardDetailsHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardDetailsTitle, { color: colors.text }]}>{card.title}</Text>
            <Text style={[styles.cardDetailsColumn, { color: colors.textSecondary }]}>
              in {column.title}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setSelectedCard(null)} style={styles.closeDetailsButton}>
            <Text style={[styles.closeDetailsText, { color: colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.cardDetailsContent} showsVerticalScrollIndicator={false}>
          {/* Description */}
          {card.description && (
            <View style={styles.detailsSection}>
              <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>
                Description
              </Text>
              <Text style={[styles.detailsSectionText, { color: colors.text }]}>
                {card.description}
              </Text>
            </View>
          )}

          {/* Priority */}
          {card.priority && (
            <View style={styles.detailsSection}>
              <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>
                Priority
              </Text>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(card.priority) + '20', borderColor: getPriorityColor(card.priority) }]}>
                <Text style={[styles.priorityBadgeText, { color: getPriorityColor(card.priority) }]}>
                  {card.priority.toUpperCase()}
                </Text>
              </View>
            </View>
          )}

          {/* Due Date */}
          {card.dueDate && (
            <View style={styles.detailsSection}>
              <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>
                Due Date
              </Text>
              <Text style={[styles.detailsSectionText, { color: isOverdue ? '#FF3B30' : colors.text }]}>
                {formatDueDate(card.dueDate)}
                {isOverdue && ' ⚠️'}
              </Text>
            </View>
          )}

          {/* Assignees */}
          {card.assignees && card.assignees.length > 0 && (
            <View style={styles.detailsSection}>
              <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>
                Assignees ({card.assignees.length})
              </Text>
              <View style={styles.assigneesList}>
                {card.assignees.map((assignee) => (
                  <View key={assignee.id} style={styles.assigneeItem}>
                    <View style={[styles.assigneeAvatarLarge, { backgroundColor: assignee.color || colors.primary }]}>
                      <Text style={styles.assigneeTextLarge}>{getInitials(assignee.name)}</Text>
                    </View>
                    <Text style={[styles.assigneeName, { color: colors.text }]}>{assignee.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tags */}
          {card.tags && card.tags.length > 0 && (
            <View style={styles.detailsSection}>
              <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>
                Tags ({card.tags.length})
              </Text>
              <View style={styles.tagsGrid}>
                {card.tags.map((tag) => (
                  <View key={tag.id} style={[styles.tagLarge, { backgroundColor: tag.color + '20', borderColor: tag.color }]}>
                    <Text style={[styles.tagLargeText, { color: tag.color }]}>{tag.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Checklist */}
          {card.checklistItems && card.checklistItems > 0 && (
            <View style={styles.detailsSection}>
              <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>
                Checklist Progress
              </Text>
              <View style={styles.checklistProgress}>
                <View style={[styles.checklistBar, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.checklistFill,
                      {
                        backgroundColor: colors.primary,
                        width: `${(card.checklistCompleted! / card.checklistItems) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.checklistText, { color: colors.text }]}>
                  {card.checklistCompleted}/{card.checklistItems} completed
                </Text>
              </View>
            </View>
          )}

          {/* Time Tracking */}
          {(card.estimatedHours || card.actualHours) && (
            <View style={styles.detailsSection}>
              <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>
                Time Tracking
              </Text>
              <View style={styles.timeTracking}>
                {card.estimatedHours && (
                  <View style={styles.timeItem}>
                    <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Estimated</Text>
                    <Text style={[styles.timeValue, { color: colors.text }]}>{card.estimatedHours}h</Text>
                  </View>
                )}
                {card.actualHours && (
                  <View style={styles.timeItem}>
                    <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Actual</Text>
                    <Text style={[styles.timeValue, { color: colors.text }]}>{card.actualHours}h</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Metadata */}
          <View style={styles.detailsSection}>
            <Text style={[styles.detailsSectionTitle, { color: colors.textSecondary }]}>Activity</Text>
            <View style={styles.metadataGrid}>
              <View style={styles.metadataItem}>
                <Text style={styles.metadataIcon}>💬</Text>
                <Text style={[styles.metadataText, { color: colors.text }]}>
                  {card.comments || 0} comments
                </Text>
              </View>
              <View style={styles.metadataItem}>
                <Text style={styles.metadataIcon}>📎</Text>
                <Text style={[styles.metadataText, { color: colors.text }]}>
                  {card.attachments || 0} files
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderBoardTab = () => (
    <View style={{ flex: 1 }}>
      <KanbanBoard
        data={data}
        mode="full"
        showStats={true}
        onCardPress={handleCardPress}
        onCardMove={onCardMove}
      />
      {selectedCard && renderCardDetails()}
    </View>
  );

  const renderCardsTab = () => (
    <View style={{ flex: 1 }}>
      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search cards..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={[styles.searchClear, { color: colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Cards list */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.cardsListContent}>
        {filteredCards.map(({ card, column }) => {
          const isOverdue = isCardOverdue(card);
          return (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.cardListItem,
                { backgroundColor: colors.surface, borderColor: colors.border },
                isOverdue && { borderLeftColor: '#FF3B30', borderLeftWidth: 4 },
              ]}
              onPress={() => handleCardPress(card, column)}
            >
              <Text style={[styles.cardListTitle, { color: colors.text }]}>{card.title}</Text>
              <Text style={[styles.cardListColumn, { color: colors.textSecondary }]}>
                {column.title}
              </Text>
              {card.dueDate && (
                <Text style={[styles.cardListDue, { color: isOverdue ? '#FF3B30' : colors.textSecondary }]}>
                  📅 {formatDueDate(card.dueDate)}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderStatsTab = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.statsContent}>
      {/* Overview */}
      <View style={[styles.statsSection, { backgroundColor: colors.surface }]}>
        <Text style={[styles.statsSectionTitle, { color: colors.text }]}>Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={[styles.statCardValue, { color: colors.text }]}>{stats.totalCards}</Text>
            <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>Total Cards</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statCardValue, { color: '#34C759' }]}>{stats.completedCards}</Text>
            <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statCardValue, { color: '#007AFF' }]}>{stats.inProgressCards}</Text>
            <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>In Progress</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statCardValue, { color: '#FF3B30' }]}>{stats.blockedCards}</Text>
            <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>Blocked</Text>
          </View>
        </View>
      </View>

      {/* Completion Rate */}
      <View style={[styles.statsSection, { backgroundColor: colors.surface }]}>
        <Text style={[styles.statsSectionTitle, { color: colors.text }]}>Completion Rate</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressBarFill,
                { backgroundColor: colors.primary, width: `${stats.completionRate}%` },
              ]}
            />
          </View>
          <Text style={[styles.progressBarText, { color: colors.text }]}>
            {stats.completionRate.toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Column Distribution */}
      <View style={[styles.statsSection, { backgroundColor: colors.surface }]}>
        <Text style={[styles.statsSectionTitle, { color: colors.text }]}>Column Distribution</Text>
        {data.columns.map((column) => (
          <View key={column.id} style={styles.columnStat}>
            <View style={styles.columnStatHeader}>
              <Text style={[styles.columnStatTitle, { color: colors.text }]}>{column.title}</Text>
              <Text style={[styles.columnStatCount, { color: colors.textSecondary }]}>
                {column.cards.length} cards
              </Text>
            </View>
            <View style={[styles.columnStatBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.columnStatFill,
                  {
                    backgroundColor: column.color || colors.primary,
                    width: stats.totalCards > 0 ? `${(column.cards.length / stats.totalCards) * 100}%` : '0%',
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{data.title}</Text>
            {data.description && (
              <Text style={[styles.headerDescription, { color: colors.textSecondary }]}>
                {data.description}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={[styles.tabs, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'board' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('board')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'board' ? colors.primary : colors.textSecondary }]}>
              📋 Board
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'cards' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('cards')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'cards' ? colors.primary : colors.textSecondary }]}>
              📝 Cards
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'stats' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('stats')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'stats' ? colors.primary : colors.textSecondary }]}>
              📊 Stats
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'board' && renderBoardTab()}
        {activeTab === 'cards' && renderCardsTab()}
        {activeTab === 'stats' && renderStatsTab()}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerDescription: {
    fontSize: 14,
  },
  closeButton: {
    padding: 8,
    marginLeft: 12,
  },
  closeButtonText: {
    fontSize: 24,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardDetailsPanel: {
    borderTopWidth: 1,
    maxHeight: '50%',
  },
  cardDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
  },
  cardDetailsTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardDetailsColumn: {
    fontSize: 13,
    marginTop: 2,
  },
  closeDetailsButton: {
    padding: 4,
  },
  closeDetailsText: {
    fontSize: 20,
  },
  cardDetailsContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailsSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  detailsSectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  priorityBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  assigneesList: {
    gap: 12,
  },
  assigneeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  assigneeAvatarLarge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assigneeTextLarge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  assigneeName: {
    fontSize: 14,
    fontWeight: '500',
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  tagLargeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  checklistProgress: {
    gap: 8,
  },
  checklistBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  checklistFill: {
    height: '100%',
  },
  checklistText: {
    fontSize: 13,
    fontWeight: '500',
  },
  timeTracking: {
    flexDirection: 'row',
    gap: 24,
  },
  timeItem: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  metadataGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metadataIcon: {
    fontSize: 16,
  },
  metadataText: {
    fontSize: 13,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  searchClear: {
    fontSize: 16,
    paddingLeft: 8,
  },
  cardsListContent: {
    padding: 16,
    gap: 12,
  },
  cardListItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  cardListTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardListColumn: {
    fontSize: 13,
    marginBottom: 4,
  },
  cardListDue: {
    fontSize: 12,
  },
  statsContent: {
    padding: 16,
    gap: 16,
  },
  statsSection: {
    padding: 16,
    borderRadius: 12,
  },
  statsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
    padding: 16,
  },
  statCardValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  progressBar: {
    gap: 8,
  },
  progressBarBg: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  progressBarText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  columnStat: {
    marginBottom: 16,
  },
  columnStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  columnStatTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  columnStatCount: {
    fontSize: 13,
  },
  columnStatBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  columnStatFill: {
    height: '100%',
  },
});
