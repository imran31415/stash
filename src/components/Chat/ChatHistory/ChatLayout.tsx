import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import { ChatHistorySidebar } from './ChatHistorySidebar';
import { ChatHistoryModal } from './ChatHistoryModal';
import type { ChatHistoryProps } from './types';
import { colors, spacing, shadows } from './styles';

export interface ChatLayoutProps {
  // Chat history props
  chatHistoryProps: Omit<ChatHistoryProps, 'onChatSelect'>;

  // Layout configuration
  sidebarWidth?: number;
  mobileBreakpoint?: number;
  defaultSidebarVisible?: boolean;
  defaultMobileVisible?: boolean;
  autoSelectFirstChat?: boolean;

  // Callbacks
  onChatSelect: (chatId: string) => void;
  onChatsLoaded?: (chats: any[]) => void;

  // Chat content
  children: React.ReactNode;

  // Menu button customization
  showMenuButton?: boolean;
  menuButtonPosition?: 'floating';
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({
  chatHistoryProps,
  sidebarWidth = 320,
  mobileBreakpoint = 768,
  defaultSidebarVisible = true,
  defaultMobileVisible = true,
  autoSelectFirstChat = false,
  onChatSelect,
  onChatsLoaded,
  children,
  showMenuButton = true,
  menuButtonPosition = 'floating',
}) => {
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  const [isSidebarVisible, setIsSidebarVisible] = useState(defaultSidebarVisible);
  const [isModalVisible, setIsModalVisible] = useState(defaultMobileVisible);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  // Detect window resize
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowWidth(window.width);
    });

    return () => subscription?.remove();
  }, []);

  // Determine if we should use mobile layout
  const isMobile = windowWidth < mobileBreakpoint;

  const handleChatSelect = (chat: any) => {
    onChatSelect(chat.id);

    // Close modal on mobile after selection
    if (isMobile) {
      setIsModalVisible(false);
    }
  };

  const handleChatsLoaded = (chats: any[]) => {
    // Call parent callback if provided
    if (onChatsLoaded) {
      onChatsLoaded(chats);
    }

    // Auto-select first chat if enabled and not already selected
    if (autoSelectFirstChat && !hasAutoSelected && chats.length > 0) {
      onChatSelect(chats[0].id);
      setHasAutoSelected(true);
    }
  };

  const toggleHistory = () => {
    if (isMobile) {
      setIsModalVisible(!isModalVisible);
    } else {
      setIsSidebarVisible(!isSidebarVisible);
    }
  };

  const renderMenuButton = () => {
    if (!showMenuButton) return null;

    // Only show floating button when sidebar/modal is closed
    const shouldShow = isMobile ? !isModalVisible : !isSidebarVisible;

    if (!shouldShow) return null;

    return (
      <TouchableOpacity
        style={styles.floatingMenuButton}
        onPress={toggleHistory}
        activeOpacity={0.7}
      >
        <Text style={styles.floatingMenuIcon}>☰</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Desktop: Sidebar */}
      {!isMobile && (
        <ChatHistorySidebar
          {...chatHistoryProps}
          isVisible={isSidebarVisible}
          onToggle={() => setIsSidebarVisible(!isSidebarVisible)}
          width={sidebarWidth}
          showToggleButton={true}
          onChatSelect={handleChatSelect}
          onChatsLoaded={handleChatsLoaded}
        />
      )}

      {/* Mobile: Modal */}
      {isMobile && (
        <ChatHistoryModal
          {...chatHistoryProps}
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          showCloseButton={true}
          autoCloseOnSelect={false}
          onChatSelect={handleChatSelect}
          onChatsLoaded={handleChatsLoaded}
        />
      )}

      {/* Main Chat Area */}
      <View style={styles.chatArea}>
        {children}
      </View>

      {/* Floating Menu Button */}
      {renderMenuButton()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.backgroundTertiary,
  },
  chatArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  floatingMenuButton: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    ...shadows.heavy,
  },
  floatingMenuIcon: {
    fontSize: 24,
    color: colors.background,
  },
});
