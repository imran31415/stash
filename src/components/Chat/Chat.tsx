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
} from 'react-native';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { ConnectionStatus } from './ConnectionStatus';
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
}) => {
  const [messages, setMessages] = useState<Message[]>(externalMessages);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [typingUsers, setTypingUsers] = useState<TypingIndicatorType[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const flatListRef = useRef<FlatList>(null);
  const wsServiceRef = useRef<WebSocketChatService | null>(null);
  const httpServiceRef = useRef<HTTPChatService | null>(null);

  // Sync external messages
  useEffect(() => {
    setMessages(externalMessages);
  }, [externalMessages]);

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

    scrollToBottom();
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

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
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
      onPresentationComplete?.();
    }
  };

  const handlePreviousMessage = () => {
    if (currentMessageIndex > 0) {
      setCurrentMessageIndex(prev => prev - 1);
    }
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

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNextMessage();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePreviousMessage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
        <View style={styles.presentationTopBar}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <View style={styles.presentationHeader}>
            <Text style={styles.presentationCounter}>
              {currentMessageIndex + 1} of {messages.length}
            </Text>
            {onExitPresentation && (
              <TouchableOpacity
                style={styles.exitPresentationButton}
                onPress={onExitPresentation}
                activeOpacity={0.7}
              >
                <Text style={styles.exitPresentationText}>Exit Presentation</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

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
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
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
    paddingHorizontal: 20,
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
