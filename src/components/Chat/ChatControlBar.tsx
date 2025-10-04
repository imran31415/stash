import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  Clipboard,
} from 'react-native';
import type { ChatTheme, Message } from './types';

export interface ChatControlBarProps {
  theme?: ChatTheme;
  messages: Message[];
  onEnterPresentation?: () => void;
  onCopyHistory?: (json: string) => void;
  onToggleHistory?: () => void;
  showPresentationButton?: boolean;
  showCopyButton?: boolean;
  showHistoryButton?: boolean;
}

export const ChatControlBar: React.FC<ChatControlBarProps> = ({
  theme,
  messages,
  onEnterPresentation,
  onCopyHistory,
  onToggleHistory,
  showPresentationButton = true,
  showCopyButton = true,
  showHistoryButton = false,
}) => {
  const primaryColor = theme?.primaryColor || '#007AFF';
  const backgroundColor = theme?.backgroundColor || '#FFFFFF';
  const textColor = theme?.textColorOther || '#000000';

  const handleCopyHistory = () => {
    try {
      const json = JSON.stringify(messages, null, 2);

      // Use Clipboard API
      if (Platform.OS === 'web') {
        (navigator as any).clipboard?.writeText(json).then(() => {
          onCopyHistory?.(json);
          Alert.alert('Success', 'Chat history copied to clipboard');
        }).catch((err: any) => {
          console.error('Failed to copy:', err);
          Alert.alert('Error', 'Failed to copy chat history');
        });
      } else {
        Clipboard.setString(json);
        onCopyHistory?.(json);
        Alert.alert('Success', 'Chat history copied to clipboard');
      }
    } catch (error) {
      console.error('Error copying chat history:', error);
      Alert.alert('Error', 'Failed to copy chat history');
    }
  };

  const handleEnterPresentation = () => {
    if (messages.length === 0) {
      Alert.alert('No Messages', 'There are no messages to present');
      return;
    }
    onEnterPresentation?.();
  };

  return (
    <View style={[styles.container, { backgroundColor, borderBottomColor: theme?.borderColor || '#E5E5EA' }]}>
      <View style={styles.content}>
        <View style={styles.actions}>
          {showHistoryButton && onToggleHistory && (
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: primaryColor }]}
              onPress={onToggleHistory}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionIcon]}>💬</Text>
              <Text style={[styles.actionText, { color: primaryColor }]}>Chats</Text>
            </TouchableOpacity>
          )}

          {showPresentationButton && onEnterPresentation && (
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: primaryColor }]}
              onPress={handleEnterPresentation}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionIcon]}>👁️</Text>
              <Text style={[styles.actionText, { color: primaryColor }]}>Presentation</Text>
            </TouchableOpacity>
          )}

          {showCopyButton && (
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: primaryColor }]}
              onPress={handleCopyHistory}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionIcon]}>📋</Text>
              <Text style={[styles.actionText, { color: primaryColor }]}>Copy JSON</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
    }),
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: 'transparent',
  },
  actionIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
});
