import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChatHistory } from './ChatHistory';
import type { ChatHistoryProps } from './types';
import { colors, spacing, shadows, sharedStyles } from './styles';

export interface ChatHistorySidebarProps extends ChatHistoryProps {
  isVisible: boolean;
  onToggle: () => void;
  width?: number;
  showToggleButton?: boolean;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  isVisible,
  onToggle,
  width = 320,
  showToggleButton = true,
  ...chatHistoryProps
}) => {
  if (!isVisible) {
    return showToggleButton ? (
      <TouchableOpacity style={styles.toggleButtonCollapsed} onPress={onToggle}>
        <Text style={styles.toggleIcon}>☰</Text>
      </TouchableOpacity>
    ) : null;
  }

  return (
    <View style={[styles.sidebar, { width }]}>
      {/* Header */}
      <View style={sharedStyles.header}>
        <Text style={sharedStyles.headerTitle}>Chats</Text>
        {showToggleButton && (
          <TouchableOpacity style={sharedStyles.closeButton} onPress={onToggle}>
            <Text style={sharedStyles.closeIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Chat History */}
      <ChatHistory {...chatHistoryProps} />
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: colors.background,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    ...shadows.sidebar,
  },
  toggleButtonCollapsed: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    ...shadows.medium,
  },
  toggleIcon: {
    fontSize: 18,
    color: colors.background,
  },
});
