import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { ChatGroup } from './types';
import { useChatHistoryColors, spacing, borderRadius } from './styles';

export interface ChatGroupHeaderProps {
  group: ChatGroup;
  chatCount: number;
  unreadCount?: number;
  onToggle: () => void;
}

export const ChatGroupHeader: React.FC<ChatGroupHeaderProps> = ({
  group,
  chatCount,
  unreadCount = 0,
  onToggle,
}) => {
  const colors = useChatHistoryColors();
  const isCollapsed = group.collapsed ?? false;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.border }]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Chevron icon */}
        <Text style={[styles.chevron, { color: colors.textSecondary }]}>
          {isCollapsed ? '›' : '⌄'}
        </Text>

        {/* Group icon (optional) */}
        {group.icon && (
          <Text style={styles.icon}>{group.icon}</Text>
        )}

        {/* Group title */}
        <Text style={[styles.title, { color: colors.textSecondary }]}>{group.title}</Text>

        {/* Chat count */}
        <Text style={[styles.count, { color: colors.textTertiary }]}>({chatCount})</Text>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: colors.primary, borderRadius: colors.full }]}>
            <Text style={styles.unreadText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    fontSize: 16,
    marginRight: spacing.sm,
    fontWeight: '600',
  },
  icon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  count: {
    fontSize: 12,
    marginLeft: spacing.xs,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
