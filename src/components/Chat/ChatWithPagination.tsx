import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TouchableOpacity,
  InteractionManager,
} from 'react-native';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { ConnectionStatus } from './ConnectionStatus';
import { WebSocketChatService, ConnectionState } from './WebSocketChatService';
import { HTTPChatService } from './HTTPChatService';
import { Message, ChatType, TypingIndicator as TypingIndicatorType, ChatTheme } from './types';
import { useMessageWindow } from './hooks/useMessageWindow';

export interface ChatWithPaginationProps {
  userId: string;
  chatType: ChatType;
  chatId?: string;
  theme?: ChatTheme;

  // Pagination configuration
  windowSize?: number;
  loadMoreThreshold?: number;

  // Pagination callbacks
  onLoadMessagesBefore?: (chatId: string, beforeMessageId: string, limit: number) => Promise<Message[]>;
  onLoadMessagesAfter?: (chatId: string, afterMessageId: string, limit: number) => Promise<Message[]>;
  onLoadInitialMessages?: (chatId: string, limit: number) => Promise<{ messages: Message[]; totalCount: number }>;

  onSendMessage: (message: Message) => void;
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
}

export const ChatWithPagination: React.FC<ChatWithPaginationProps> = ({
  userId,
  chatType,
  chatId = 'default',
  theme,
  windowSize = 200,
  loadMoreThreshold = 20,
  onLoadMessagesBefore,
  onLoadMessagesAfter,
  onLoadInitialMessages,
  onSendMessage,
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
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [typingUsers, setTypingUsers] = useState<TypingIndicatorType[]>([]);

  const flatListRef = useRef<FlatList>(null);
  const wsServiceRef = useRef<WebSocketChatService | null>(null);
  const httpServiceRef = useRef<HTTPChatService | null>(null);

  // Use the message window hook for pagination
  const {
    messages,
    pagination,
    loadOlderMessages,
    loadNewerMessages,
    addMessage,
    addMessages,
    updateMessage,
  } = useMessageWindow({
    windowSize,
    loadMoreThreshold,
    onLoadOlder: onLoadMessagesBefore
      ? (beforeId, limit) => onLoadMessagesBefore(chatId, beforeId, limit)
      : undefined,
    onLoadNewer: onLoadMessagesAfter
      ? (afterId, limit) => onLoadMessagesAfter(chatId, afterId, limit)
      : undefined,
  });

  // Track if this is the first load to enable auto-scroll
  const isFirstLoadRef = useRef(true);
  const hasLoadedInitialRef = useRef(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isLoadingLatest, setIsLoadingLatest] = useState(false);

  // Load initial messages
  useEffect(() => {
    const loadInitial = async () => {
      if (onLoadInitialMessages && !hasLoadedInitialRef.current) {
        setIsLoading(true);
        try {
          const { messages: initialMessages } = await onLoadInitialMessages(chatId, windowSize);
          addMessages(initialMessages); // Use addMessages for batch addition
          hasLoadedInitialRef.current = true;
        } catch (error) {
          console.error('[ChatWithPagination] Error loading initial messages:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]); // addMessages and windowSize are stable from useMessageWindow

  // WebSocket event handlers (defined before useEffect to avoid hoisting issues)
  const handleWsIncomingMessage = useCallback((wsMessage: any) => {
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
      addMessage(newMessage);
    }
  }, [userId, addMessage]);

  const handleTypingStart = useCallback((wsMessage: any) => {
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
  }, [userId]);

  const handleTypingStop = useCallback((wsMessage: any) => {
    if (!wsMessage.data) return;
    setTypingUsers(prev => prev.filter(u => u.userId !== wsMessage.data.user_id));
  }, []);

  // Initialize services
  useEffect(() => {
    // Cleanup function for proper service lifecycle
    return () => {
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
        wsServiceRef.current = null;
      }
      if (httpServiceRef.current) {
        httpServiceRef.current = null;
      }
    };
  }, []); // Only run on mount/unmount

  // Setup WebSocket connection
  useEffect(() => {
    if (enableWebSocket && wsConfig) {
      // Disconnect existing connection if any
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
      }

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
  }, [enableWebSocket, wsConfig, userId, handleWsIncomingMessage, handleTypingStart, handleTypingStop]);

  // Setup HTTP service
  useEffect(() => {
    if (enableHTTP && httpConfig) {
      httpServiceRef.current = new HTTPChatService(httpConfig);
    } else {
      httpServiceRef.current = null;
    }
  }, [enableHTTP, httpConfig]);

  const scrollToBottom = useCallback((animated: boolean = true) => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated });
    }, 100);
  }, []);

  const handleSend = useCallback(async (messageText: string) => {
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

    // Clear input immediately for better UX
    setInputText('');

    addMessage(newMessage);
    onSendMessage(newMessage);

    try {
      // Send via WebSocket if available
      if (wsServiceRef.current?.isConnected()) {
        await wsServiceRef.current.sendMessage(newMessage);
        updateMessage(newMessage.id, { status: 'sent' });
      }
      // Fallback to HTTP
      else if (httpServiceRef.current) {
        const response = await httpServiceRef.current.sendMessage(userId, newMessage);
        if (response.success) {
          updateMessage(newMessage.id, { status: 'sent' });
        } else {
          updateMessage(newMessage.id, { status: 'failed' });
        }
      }
    } catch (error) {
      console.error('[ChatWithPagination] Error sending message:', error);
      updateMessage(newMessage.id, { status: 'failed' });
    }

    scrollToBottom();
  }, [userId, addMessage, updateMessage, onSendMessage, scrollToBottom]);

  const handleTyping = useCallback((isTyping: boolean) => {
    if (wsServiceRef.current?.isConnected()) {
      wsServiceRef.current.sendTypingIndicator(isTyping);
    }
  }, []);

  // Handle content size change - only auto-scroll on first load or when sending messages
  const handleContentSizeChange = useCallback(() => {
    if (isFirstLoadRef.current && messages.length > 0) {
      scrollToBottom(false); // Don't animate on first load
      isFirstLoadRef.current = false;
    }
  }, [messages.length]);

  // Handle scroll events for pagination
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

    const scrollFromTop = contentOffset.y;
    const scrollFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;

    // Show scroll-to-bottom button if not near bottom and there are newer messages
    const isNearBottom = scrollFromBottom < 100;
    setShowScrollToBottom(!isNearBottom && pagination.hasMoreNewer);

    // Load older messages when scrolling near the top (increased threshold for earlier load)
    if (scrollFromTop < 800 && pagination.hasMoreOlder && !pagination.isLoadingOlder) {
      console.log('[ChatWithPagination] Triggering load older messages', {
        scrollFromTop,
        hasMoreOlder: pagination.hasMoreOlder,
        isLoadingOlder: pagination.isLoadingOlder,
      });
      loadOlderMessages();
    }

    // Load newer messages when scrolling near the bottom (increased threshold for earlier load)
    if (scrollFromBottom < 800 && pagination.hasMoreNewer && !pagination.isLoadingNewer) {
      console.log('[ChatWithPagination] Triggering load newer messages', {
        scrollFromBottom,
        hasMoreNewer: pagination.hasMoreNewer,
        isLoadingNewer: pagination.isLoadingNewer,
      });
      loadNewerMessages();
    }
  }, [pagination, loadOlderMessages, loadNewerMessages]);

  // Scroll to latest messages (reload from end for instant jump)
  const scrollToLatest = useCallback(async () => {
    setShowScrollToBottom(false);

    if (pagination.hasMoreNewer && onLoadInitialMessages) {
      // Reload from the end for instant smooth jump
      setIsLoadingLatest(true);
      try {
        const { messages: latestMessages } = await onLoadInitialMessages(chatId, windowSize);

        // Replace messages in one batch for smooth transition
        addMessages(latestMessages);

        // Wait for interactions to complete before scrolling
        InteractionManager.runAfterInteractions(() => {
          scrollToBottom(false);
          setIsLoadingLatest(false);
        });
      } catch (error) {
        console.error('[ChatWithPagination] Error loading latest messages:', error);
        setIsLoadingLatest(false);
      }
    } else {
      // Already have latest, just scroll
      scrollToBottom(true);
    }
  }, [pagination.hasMoreNewer, onLoadInitialMessages, chatId, windowSize, addMessages]);

  const renderMessageItem = useCallback(({ item, index }: { item: Message; index: number }) => {
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
  }, [renderMessage, theme, onMessagePress, onMessageLongPress, onAvatarPress]);

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
      {pagination.isLoadingOlder && (
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="small" color={theme?.primaryColor || '#007AFF'} />
          <Text style={styles.loadingText}>Loading older messages...</Text>
        </View>
      )}
    </>
  );

  const ListFooterComponent = () => (
    <>
      {pagination.isLoadingNewer && (
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="small" color={theme?.primaryColor || '#007AFF'} />
          <Text style={styles.loadingText}>Loading newer messages...</Text>
        </View>
      )}
      {showTypingIndicator && typingUsers.length > 0 && (
        <TypingIndicator users={typingUsers} />
      )}
    </>
  );

  return (
    <View style={[styles.container, style]}>
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
          showsVerticalScrollIndicator={true}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListHeaderComponent={ListHeaderComponent}
          ListFooterComponent={ListFooterComponent}
          ListEmptyComponent={isLoading ? null : (renderEmptyState || defaultEmptyState)}
          onContentSizeChange={handleContentSizeChange}
          // Maintain scroll position when prepending messages (loading older)
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
          // Memory and performance optimization
          removeClippedSubviews={Platform.OS === 'android'}
          maxToRenderPerBatch={5}
          initialNumToRender={15}
          windowSize={10}
          updateCellsBatchingPeriod={50}
          // Faster reflow
          legacyImplementation={false}
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

      {/* Scroll to Latest Button */}
      {showScrollToBottom && !isLoadingLatest && (
        <TouchableOpacity
          style={styles.scrollToBottomButton}
          onPress={scrollToLatest}
          activeOpacity={0.8}
        >
          <Text style={styles.scrollToBottomText}>↓</Text>
          {pagination.hasMoreNewer && (
            <Text style={styles.scrollToBottomSubtext}>Latest</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Loading Overlay */}
      {isLoadingLatest && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme?.primaryColor || '#007AFF'} />
          <Text style={styles.loadingOverlayText}>Loading latest messages...</Text>
        </View>
      )}

      {/* Pagination Info (for debugging) */}
      {__DEV__ && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            Range: {pagination.oldestMessageId || 'N/A'} → {pagination.newestMessageId || 'N/A'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    paddingVertical: 8,
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
  loadingIndicator: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 8,
  },
  scrollToBottomButton: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    backgroundColor: '#007AFF',
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  scrollToBottomText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scrollToBottomSubtext: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: -4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  loadingOverlayText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  debugInfo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 4,
    zIndex: 1100,
  },
  debugText: {
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
