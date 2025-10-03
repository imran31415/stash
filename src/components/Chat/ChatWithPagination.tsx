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

  // Load initial messages
  useEffect(() => {
    const loadInitial = async () => {
      if (onLoadInitialMessages) {
        setIsLoading(true);
        try {
          const { messages: initialMessages } = await onLoadInitialMessages(chatId, windowSize);
          initialMessages.forEach(msg => addMessage(msg));
        } catch (error) {
          console.error('Error loading initial messages:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadInitial();
  }, [chatId]);

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
      console.error('Error sending message:', error);
      updateMessage(newMessage.id, { status: 'failed' });
    }

    scrollToBottom();
  };

  const handleTyping = (isTyping: boolean) => {
    if (wsServiceRef.current?.isConnected()) {
      wsServiceRef.current.sendTypingIndicator(isTyping);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Handle scroll events for pagination
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

    const scrollFromTop = contentOffset.y;
    const scrollFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;

    // Load older messages when scrolling near the top
    if (scrollFromTop < 500 && pagination.hasMoreOlder && !pagination.isLoadingOlder) {
      loadOlderMessages();
    }

    // Load newer messages when scrolling near the bottom
    if (scrollFromBottom < 500 && pagination.hasMoreNewer && !pagination.isLoadingNewer) {
      loadNewerMessages();
    }
  }, [pagination, loadOlderMessages, loadNewerMessages]);

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
          scrollEventThrottle={400}
          ListHeaderComponent={ListHeaderComponent}
          ListFooterComponent={ListFooterComponent}
          ListEmptyComponent={isLoading ? null : (renderEmptyState || defaultEmptyState)}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
          // Memory optimization
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          initialNumToRender={20}
          windowSize={21}
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

      {/* Pagination Info (for debugging) */}
      {__DEV__ && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            Window: {messages.length}/{windowSize} | Older: {pagination.hasMoreOlder ? '✓' : '✗'} | Newer: {pagination.hasMoreNewer ? '✓' : '✗'}
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
  debugInfo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 4,
    zIndex: 1000,
  },
  debugText: {
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
