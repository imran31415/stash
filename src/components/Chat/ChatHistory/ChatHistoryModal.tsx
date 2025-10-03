import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useModalNavigation } from '../hooks';
import { ChatHistory } from './ChatHistory';
import type { ChatHistoryProps } from './types';
import { colors, sharedStyles } from './styles';

export interface ChatHistoryModalProps extends ChatHistoryProps {
  isVisible: boolean;
  onClose: () => void;
  showCloseButton?: boolean;
  autoCloseOnSelect?: boolean;
}

export const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({
  isVisible,
  onClose,
  showCloseButton = true,
  autoCloseOnSelect = true,
  ...chatHistoryProps
}) => {
  // Handle cross-platform navigation (back button, escape key, browser navigation)
  useModalNavigation({ visible: isVisible, onClose });

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={sharedStyles.header}>
          <Text style={sharedStyles.headerTitle}>Chats</Text>
          {showCloseButton && (
            <TouchableOpacity style={sharedStyles.closeButton} onPress={onClose}>
              <Text style={sharedStyles.closeIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Chat History */}
        <ChatHistory
          {...chatHistoryProps}
          onChatSelect={(chat) => {
            chatHistoryProps.onChatSelect(chat);
            if (autoCloseOnSelect) {
              onClose();
            }
          }}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
