import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { usePaginatedList } from '../hooks/usePaginatedList';
import type { ChatPreview, ChatHistoryProps } from './types';
import { colors, spacing, borderRadius, shadows } from './styles';

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  userId,
  currentChatId,
  windowSize = 50,
  loadMoreThreshold = 10,
  showSearch = true,
  showCreateButton = true,
  emptyStateMessage = 'No chats yet. Start a conversation!',
  onChatSelect,
  onChatDelete,
  onChatArchive,
  onChatPin,
  onChatMute,
  onLoadBefore,
  onLoadAfter,
  onLoadInitial,
  onRefresh,
  onCreateNewChat,
  onChatsLoaded,
  renderChatItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const {
    items: chats,
    pagination,
    loadOlderItems,
    loadNewerItems,
    refreshItems,
  } = usePaginatedList<ChatPreview>({
    windowSize,
    loadMoreThreshold,
    getItemId: (chat) => chat.id,
    onLoadOlder: onLoadBefore,
    onLoadNewer: onLoadAfter,
    onLoadInitial: onLoadInitial
      ? async (limit: number) => {
          const result = await onLoadInitial(limit);
          return { items: result.chats, totalCount: result.totalCount };
        }
      : undefined,
  });

  // Load initial chats on mount
  useEffect(() => {
    if (onLoadInitial) {
      refreshItems();
    }
  }, []);

  // Notify when chats are loaded
  useEffect(() => {
    if (chats.length > 0 && onChatsLoaded) {
      onChatsLoaded(chats);
    }
  }, [chats, onChatsLoaded]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
      await refreshItems();
    } catch (error) {
      console.error('[ChatHistory] Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh, refreshItems]);

  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollFromTop = contentOffset.y;
    const scrollFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;

    if (scrollFromTop < 300 && pagination.hasMoreOlder && !pagination.isLoadingOlder) {
      loadOlderItems();
    }

    if (scrollFromBottom < 300 && pagination.hasMoreNewer && !pagination.isLoadingNewer) {
      loadNewerItems();
    }
  }, [pagination, loadOlderItems, loadNewerItems]);

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      chat.title.toLowerCase().includes(query) ||
      chat.lastMessage?.content.toLowerCase().includes(query) ||
      chat.participants.some((p) => p.name.toLowerCase().includes(query))
    );
  });

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const renderDefaultChatItem = (chat: ChatPreview, isSelected: boolean) => {
    const getChatIcon = () => {
      if (chat.type === 'ai') return '🤖';
      if (chat.type === 'group') return '👥';
      return '💬';
    };

    return (
      <TouchableOpacity
        style={[styles.chatItem, isSelected && styles.chatItemSelected]}
        onPress={() => onChatSelect(chat)}
        activeOpacity={0.7}
      >
        <View style={styles.chatIcon}>
          <Text style={styles.chatIconText}>{getChatIcon()}</Text>
          {chat.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle} numberOfLines={1}>
              {chat.title}
            </Text>
            {chat.lastMessage && (
              <Text style={styles.chatTime}>
                {formatTimestamp(chat.lastMessage.timestamp)}
              </Text>
            )}
          </View>

          {chat.lastMessage && (
            <Text style={styles.chatLastMessage} numberOfLines={2}>
              {chat.lastMessage.senderName}: {chat.lastMessage.content}
            </Text>
          )}

          <View style={styles.chatMeta}>
            {chat.isPinned && <Text style={styles.metaIcon}>📌</Text>}
            {chat.isMuted && <Text style={styles.metaIcon}>🔕</Text>}
            {chat.isArchived && <Text style={styles.metaIcon}>📦</Text>}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: ChatPreview }) => {
    const isSelected = item.id === currentChatId;
    if (renderChatItem) {
      return <View>{renderChatItem(item, isSelected)}</View>;
    }
    return renderDefaultChatItem(item, isSelected);
  };

  const ListHeaderComponent = () => (
    <>
      {showCreateButton && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={onCreateNewChat}
          activeOpacity={0.7}
        >
          <Text style={styles.createButtonIcon}>✏️</Text>
          <Text style={styles.createButtonText}>New Chat</Text>
        </TouchableOpacity>
      )}

      {showSearch && (
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search chats..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {pagination.isLoadingOlder && !refreshing && (
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </>
  );

  const ListFooterComponent = () => (
    <>
      {pagination.isLoadingNewer && (
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>💬</Text>
      <Text style={styles.emptyStateText}>{emptyStateMessage}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredChats}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={true}
        onScroll={handleScroll}
        scrollEventThrottle={400}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        initialNumToRender={20}
        windowSize={11}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.medium,
  },
  createButtonIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 4,
  },
  searchClear: {
    fontSize: 16,
    color: colors.textSecondary,
    paddingLeft: spacing.sm,
  },
  loadingIndicator: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  chatItem: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundTertiary,
    backgroundColor: colors.background,
  },
  chatItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  chatIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    position: 'relative',
  },
  chatIconText: {
    fontSize: 24,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: borderRadius.sm,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  unreadText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.background,
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  chatTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  chatLastMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  chatMeta: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  metaIcon: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: spacing.xl,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
