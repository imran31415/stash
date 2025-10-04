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
  menuButtonPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
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
  menuButtonPosition = 'bottom-right',
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

    // Get position style based on menuButtonPosition
    const positionStyle = {
      'bottom-right': styles.positionBottomRight,
      'bottom-left': styles.positionBottomLeft,
      'top-right': styles.positionTopRight,
      'top-left': styles.positionTopLeft,
    }[menuButtonPosition];

    return (
      <TouchableOpacity
        style={[styles.floatingMenuButton, positionStyle]}
        onPress={toggleHistory}
        activeOpacity={0.8}
      >
        <Text style={styles.floatingMenuIcon}>💬</Text>
        <Text style={styles.floatingMenuLabel}>Chats</Text>
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
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<any>, {
              onToggleHistory: toggleHistory,
              showHistoryButton: !isSidebarVisible || (isMobile && !isModalVisible),
            })
          : children
        }
      </View>

      {/* Floating Menu Button - hide it now since we have the button in control bar */}
      {false && renderMenuButton()}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 28,
    backgroundColor: colors.primary,
    zIndex: 1000,
    ...shadows.heavy,
  },
  positionBottomRight: {
    bottom: 80, // Higher position to avoid chat input
    right: spacing.xl,
  },
  positionBottomLeft: {
    bottom: 80, // Higher position to avoid chat input
    left: spacing.xl,
  },
  positionTopRight: {
    top: spacing.xl,
    right: spacing.xl,
  },
  positionTopLeft: {
    top: spacing.xl,
    left: spacing.xl,
  },
  floatingMenuIcon: {
    fontSize: 20,
  },
  floatingMenuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
