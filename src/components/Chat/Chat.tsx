import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { ConnectionStatus } from './ConnectionStatus';
import { ChatControlBar } from './ChatControlBar';
import { PresentationCompletionDialog } from './PresentationCompletionDialog';
import { WebSocketChatService, ConnectionState } from './WebSocketChatService';
import { HTTPChatService } from './HTTPChatService';
import { Message, ChatType, TypingIndicator as TypingIndicatorType, ChatTheme } from './types';

export interface ChatProps {
  userId: string;
  chatType: ChatType;
  chatId?: string;
  theme?: ChatTheme;
  messages: Message[];
  onSendMessage: (message: Message) => void;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  showConnectionStatus?: boolean;
  showTypingIndicator?: boolean;
  httpConfig?: {
    baseUrl: string;
    apiKey?: string;
  };
  wsConfig?: {
    baseUrl: string;
    getAuthToken: () => Promise<string | null>;
    tenantId?: string;
    projectId?: string;
  };
  enableWebSocket?: boolean;
  enableHTTP?: boolean;
  placeholder?: string;
  renderMessage?: (message: Message, index: number) => React.ReactNode;
  renderHeader?: () => React.ReactNode;
  renderEmptyState?: () => React.ReactNode;
  onMessagePress?: (message: Message) => void;
  onMessageLongPress?: (message: Message) => void;
  onAvatarPress?: (userId: string) => void;
  style?: any;
  presentationMode?: boolean; // Display messages one at a time like stories
  onPresentationComplete?: () => void; // Called when reaching the end in presentation mode
  onExitPresentation?: () => void; // Called when user exits presentation mode
  onEnterPresentation?: () => void; // Called when user wants to enter presentation mode
  onCopyHistory?: (json: string) => void; // Called when chat history is copied
  onToggleHistory?: () => void; // Called when user wants to toggle chat history sidebar
  showControlBar?: boolean; // Show the control bar with actions (default: true in non-presentation mode)
  showHistoryButton?: boolean; // Show the history/chats button in control bar (default: false)
  initialScrollPosition?: 'top' | 'bottom'; // Initial scroll position when messages load (default: 'bottom')
}

export const Chat: React.FC<ChatProps> = ({
  userId,
  chatType,
  chatId,
  theme,
  messages: externalMessages,
  onSendMessage,
  onLoadMore,
  isLoadingMore = false,
  showConnectionStatus = true,
  showTypingIndicator = true,
  httpConfig,
  wsConfig,
  enableWebSocket = true,
  enableHTTP = true,
  placeholder,
  renderMessage,
  renderHeader,
  renderEmptyState,
  onMessagePress,
  onMessageLongPress,
  onAvatarPress,
  style,
  presentationMode = false,
  onPresentationComplete,
  onExitPresentation,
  onEnterPresentation,
  onCopyHistory,
  onToggleHistory,
  showControlBar = true,
  showHistoryButton = false,
  initialScrollPosition = 'bottom',
}) => {
  const [messages, setMessages] = useState<Message[]>(externalMessages);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [typingUsers, setTypingUsers] = useState<TypingIndicatorType[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const wsServiceRef = useRef<WebSocketChatService | null>(null);
  const httpServiceRef = useRef<HTTPChatService | null>(null);
  const isNearBottomRef = useRef(true); // Track if user is scrolled to bottom
  const previousMessageCountRef = useRef(externalMessages.length);
  const wasPresentationModeRef = useRef(presentationMode);
  const dimOpacity = useRef(new Animated.Value(0)).current;
  const hasInitialScrolledRef = useRef(false);

  // Sync external messages
  useEffect(() => {
    setMessages(externalMessages);
  }, [externalMessages]);

  // Reset scroll tracker when chatId changes
  useEffect(() => {
    hasInitialScrolledRef.current = false;
  }, [chatId]);

  // Handle initial scroll position
  useEffect(() => {
    if (externalMessages.length > 0 && !hasInitialScrolledRef.current) {
      hasInitialScrolledRef.current = true;

      setTimeout(() => {
        if (initialScrollPosition === 'top') {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
        } else {
          flatListRef.current?.scrollToEnd({ animated: false });
        }
      }, 100);
    }
  }, [externalMessages.length, initialScrollPosition]);

  // Track presentation mode changes and animate dimming effect
  useEffect(() => {
    wasPresentationModeRef.current = presentationMode;

    // Animate dimming effect when entering/exiting presentation
    Animated.timing(dimOpacity, {
      toValue: presentationMode ? 0.6 : 0,
      duration: 400,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [presentationMode, dimOpacity]);

  // Auto-scroll on new messages (only if user is near bottom)
  useEffect(() => {
    const currentCount = externalMessages.length;
    const previousCount = previousMessageCountRef.current;

    // Only auto-scroll if:
    // 1. Message count increased (new message added)
    // 2. Not just exiting presentation mode
    if (currentCount > previousCount && !(!presentationMode && wasPresentationModeRef.current)) {
      scrollToBottom(false); // Don't force, respect user's scroll position
    }

    previousMessageCountRef.current = currentCount;
  }, [externalMessages.length, presentationMode]);

  // Initialize services
  useEffect(() => {
    if (enableHTTP && httpConfig) {
      httpServiceRef.current = new HTTPChatService(httpConfig);
    }

    if (enableWebSocket && wsConfig) {
      wsServiceRef.current = new WebSocketChatService(
        wsConfig.baseUrl,
        wsConfig.getAuthToken,
        userId,
        wsConfig.tenantId,
        wsConfig.projectId
      );

      // Set up event handlers
      wsServiceRef.current.onMessage('chat.message.sent', handleWsIncomingMessage);
      wsServiceRef.current.onMessage('typing.start', handleTypingStart);
      wsServiceRef.current.onMessage('typing.stop', handleTypingStop);
      wsServiceRef.current.onConnectionChange(setConnectionState);

      // Connect
      wsServiceRef.current.connect();
    }

    return () => {
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
      }
    };
  }, [enableWebSocket, enableHTTP, userId]);

  const handleWsIncomingMessage = (wsMessage: any) => {
    if (!wsMessage.data) return;

    const messageData = wsMessage.data;

    // Skip own messages
    if (messageData.sender_id === userId || messageData.user_id === userId) {
      return;
    }

    const newMessage: Message = {
      id: messageData.id || `ws-${Date.now()}`,
      type: messageData.type || 'text',
      content: messageData.message || messageData.content || '',
      sender: {
        id: messageData.sender_id || messageData.user_id || 'unknown',
        name: messageData.sender_name || 'User',
        avatar: messageData.sender_avatar,
      },
      timestamp: messageData.timestamp ? new Date(messageData.timestamp) : new Date(),
      status: 'delivered',
      isOwn: false,
    };

    if (newMessage.content.trim()) {
      setMessages(prev => {
        if (prev.some(msg => msg.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
    }
  };

  const handleTypingStart = (wsMessage: any) => {
    if (!wsMessage.data || wsMessage.data.user_id === userId) return;

    const typingUser: TypingIndicatorType = {
      userId: wsMessage.data.user_id,
      userName: wsMessage.data.user_name || 'User',
    };

    setTypingUsers(prev => {
      if (prev.some(u => u.userId === typingUser.userId)) {
        return prev;
      }
      return [...prev, typingUser];
    });
  };

  const handleTypingStop = (wsMessage: any) => {
    if (!wsMessage.data) return;

    setTypingUsers(prev => prev.filter(u => u.userId !== wsMessage.data.user_id));
  };

  const handleSend = async (messageText: string) => {
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'text',
      content: messageText,
      sender: {
        id: userId,
        name: 'You',
      },
      timestamp: new Date(),
      status: 'sending',
      isOwn: true,
    };

    setMessages(prev => [...prev, newMessage]);
    onSendMessage(newMessage);

    try {
      // Send via WebSocket if available
      if (wsServiceRef.current?.isConnected()) {
        await wsServiceRef.current.sendMessage(newMessage);
        updateMessageStatus(newMessage.id, 'sent');
      }
      // Fallback to HTTP
      else if (httpServiceRef.current) {
        const response = await httpServiceRef.current.sendMessage(userId, newMessage);
        if (response.success) {
          updateMessageStatus(newMessage.id, 'sent');
        } else {
          updateMessageStatus(newMessage.id, 'failed');
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      updateMessageStatus(newMessage.id, 'failed');
    }

    // Force scroll to bottom when user sends a message
    scrollToBottom(true);
  };

  const updateMessageStatus = (messageId: string, status: Message['status']) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, status } : msg
    ));
  };

  const handleTyping = (isTyping: boolean) => {
    if (wsServiceRef.current?.isConnected()) {
      wsServiceRef.current.sendTypingIndicator(isTyping);
    }
  };

  const scrollToBottom = (force = false) => {
    // Only auto-scroll if forced or if user is near the bottom
    if (force || isNearBottomRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    // Consider "near bottom" if within 100 pixels of the bottom
    isNearBottomRef.current = distanceFromBottom < 100;
  };

  const renderMessageItem = ({ item, index }: { item: Message; index: number }) => {
    // Safety check: if item is undefined or null, return null
    if (!item) {
      return null;
    }

    if (renderMessage) {
      return <View>{renderMessage(item, index)}</View>;
    }

    return (
      <ChatMessage
        message={item}
        theme={theme}
        showAvatar={!item.isOwn}
        showTimestamp={true}
        onPress={onMessagePress}
        onLongPress={onMessageLongPress}
        onAvatarPress={onAvatarPress}
      />
    );
  };

  const defaultEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No messages yet. Start the conversation!</Text>
    </View>
  );

  const ListHeaderComponent = () => (
    <>
      {renderHeader && renderHeader()}
      {showConnectionStatus && enableWebSocket && (
        <ConnectionStatus connectionState={connectionState} />
      )}
    </>
  );

  const ListFooterComponent = () => (
    <>
      {showTypingIndicator && typingUsers.length > 0 && (
        <TypingIndicator users={typingUsers} />
      )}
      {isLoadingMore && (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" color={theme?.primaryColor || '#007AFF'} />
        </View>
      )}
    </>
  );

  // Presentation mode navigation
  const handleNextMessage = () => {
    if (currentMessageIndex < messages.length - 1) {
      setCurrentMessageIndex(prev => prev + 1);
    } else {
      setShowCompletionDialog(true);
      onPresentationComplete?.();
    }
  };

  const handlePreviousMessage = () => {
    if (currentMessageIndex > 0) {
      setCurrentMessageIndex(prev => prev - 1);
    }
  };

  const handleRestartPresentation = () => {
    setShowCompletionDialog(false);
    setCurrentMessageIndex(0);
  };

  const handleExitPresentation = () => {
    setShowCompletionDialog(false);
    onExitPresentation?.();
  };

  const handleKeyPress = (event: any) => {
    if (!presentationMode) return;

    if (event.key === 'ArrowRight' || event.key === ' ') {
      event.preventDefault();
      handleNextMessage();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      handlePreviousMessage();
    }
  };

  // Keyboard navigation for presentation mode
  useEffect(() => {
    if (!presentationMode || Platform.OS !== 'web') return;

    const handleKeyDown = (e: any) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNextMessage();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePreviousMessage();
      }
    };

    const win = global as any;
    if (typeof win !== 'undefined' && win.addEventListener) {
      win.addEventListener('keydown', handleKeyDown);
      return () => win.removeEventListener('keydown', handleKeyDown);
    }
  }, [presentationMode, currentMessageIndex, messages.length]);

  // Presentation mode view
  if (presentationMode && messages.length > 0) {
    const currentMessage = messages[currentMessageIndex];

    // Safety check: if currentMessage is undefined, reset to first message
    if (!currentMessage) {
      setCurrentMessageIndex(0);
      return null;
    }

    const progress = ((currentMessageIndex + 1) / messages.length) * 100;
    const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

    return (
      <View style={[styles.container, style]}>
        {/* Progress indicators */}
        {!isFullscreen && (
          <View style={styles.presentationTopBar}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <View style={styles.presentationHeader}>
              <Text style={styles.presentationCounter}>
                {currentMessageIndex + 1} of {messages.length}
              </Text>
              <View style={styles.presentationHeaderButtons}>
                <TouchableOpacity
                  style={styles.fullscreenButton}
                  onPress={() => setIsFullscreen(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.fullscreenButtonText}>⛶</Text>
                </TouchableOpacity>
                {onExitPresentation && (
                  <TouchableOpacity
                    style={styles.exitPresentationButton}
                    onPress={onExitPresentation}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.exitPresentationText}>Exit</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Fullscreen exit button */}
        {isFullscreen && (
          <TouchableOpacity
            style={styles.exitFullscreenButton}
            onPress={() => setIsFullscreen(false)}
            activeOpacity={0.7}
          >
            <Text style={styles.exitFullscreenText}>⛶ Exit Fullscreen</Text>
          </TouchableOpacity>
        )}

        {/* Current message - scrollable with max width for readability */}
        <ScrollView
          style={styles.presentationScroll}
          contentContainerStyle={styles.presentationScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.presentationMessageContainer}>
            <View style={styles.presentationMessageWrapper}>
              {renderMessage ? (
                renderMessage(currentMessage, currentMessageIndex)
              ) : (
                <ChatMessage
                  message={currentMessage}
                  theme={theme}
                  showAvatar={!currentMessage.isOwn}
                  showTimestamp={false}
                  onPress={onMessagePress}
                  onLongPress={onMessageLongPress}
                  onAvatarPress={onAvatarPress}
                  presentationMode={true}
                />
              )}
            </View>
          </View>
        </ScrollView>

        {/* Navigation controls at bottom */}
        {!isFullscreen && (
          <View style={styles.presentationBottomBar}>
          {isMobile ? (
            // Mobile: tap hints
            <View style={styles.navigationHint}>
              <View style={styles.navigationHintIcon}>
                <Text style={styles.navigationHintIconText}>‹</Text>
              </View>
              <Text style={styles.navigationHintText}>Tap to navigate</Text>
              <View style={styles.navigationHintIcon}>
                <Text style={styles.navigationHintIconText}>›</Text>
              </View>
            </View>
          ) : (
            // Desktop: visible buttons
            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={[
                  styles.navigationButton,
                  currentMessageIndex === 0 && styles.navigationButtonDisabled,
                ]}
                onPress={handlePreviousMessage}
                disabled={currentMessageIndex === 0}
                activeOpacity={0.7}
              >
                <Text style={styles.navigationButtonText}>‹ Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.navigationButton,
                  currentMessageIndex === messages.length - 1 && styles.navigationButtonComplete,
                ]}
                onPress={handleNextMessage}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.navigationButtonText,
                  currentMessageIndex === messages.length - 1 && styles.navigationButtonCompleteText,
                ]}>
                  {currentMessageIndex === messages.length - 1 ? 'Complete ✓' : 'Next ›'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          </View>
        )}

        {/* Invisible tap areas for navigation - only on edges for mobile */}
        {isMobile && (
          <View style={styles.presentationControls}>
            <View
              style={styles.presentationTapArea}
              onTouchEnd={handlePreviousMessage}
            />
            <View style={styles.presentationTapAreaSpacer} />
            <View
              style={styles.presentationTapArea}
              onTouchEnd={handleNextMessage}
            />
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Dimming overlay when entering presentation mode */}
      <Animated.View
        style={[
          styles.dimOverlay,
          { opacity: dimOpacity },
        ]}
        pointerEvents="none"
      />

      {/* Control Bar - only show when not in presentation mode */}
      {!presentationMode && showControlBar && (
        <ChatControlBar
          theme={theme}
          messages={messages}
          onEnterPresentation={onEnterPresentation}
          onCopyHistory={onCopyHistory}
          onToggleHistory={onToggleHistory}
          showPresentationButton={!!onEnterPresentation}
          showCopyButton={true}
          showHistoryButton={showHistoryButton}
        />
      )}

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={ListHeaderComponent}
          ListFooterComponent={ListFooterComponent}
          ListEmptyComponent={renderEmptyState || defaultEmptyState}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          removeClippedSubviews={false}
        />

        <ChatInput
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
          placeholder={placeholder || `Message in ${chatType} chat...`}
          disabled={isLoading}
          loading={isLoading}
          onTyping={showTypingIndicator ? handleTyping : undefined}
        />
      </KeyboardAvoidingView>

      {/* Presentation Completion Dialog */}
      <PresentationCompletionDialog
        visible={showCompletionDialog}
        theme={theme}
        onExitPresentation={handleExitPresentation}
        onRestartPresentation={handleRestartPresentation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 999,
  },
  keyboardAvoid: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  messagesContent: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 80,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  // Presentation mode styles
  presentationTopBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  progressBar: {
    height: 2,
    backgroundColor: '#E5E5EA',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  presentationHeader: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  presentationCounter: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  presentationHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fullscreenButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F2F2F7',
  },
  fullscreenButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  exitPresentationButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F2F2F7',
  },
  exitPresentationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  exitFullscreenButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
  },
  exitFullscreenText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  presentationScroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  presentationScrollContent: {
    flexGrow: 1,
    paddingVertical: 24,
  },
  presentationMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 16,
  },
  presentationMessageWrapper: {
    width: '100%',
  },
  presentationControls: {
    flexDirection: 'row',
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    bottom: 70,
    pointerEvents: 'box-none',
  },
  presentationTapArea: {
    width: 80,
  },
  presentationTapAreaSpacer: {
    flex: 1,
    pointerEvents: 'none',
  },
  presentationBottomBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  navigationButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    minWidth: 120,
    alignItems: 'center',
  },
  navigationButtonDisabled: {
    opacity: 0.4,
  },
  navigationButtonComplete: {
    backgroundColor: '#007AFF',
  },
  navigationButtonText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
  navigationButtonCompleteText: {
    color: '#FFFFFF',
  },
  navigationHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  navigationHintIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationHintIconText: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: '300',
  },
  navigationHintText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
});
