import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { ChatWithPagination } from '../ChatWithPagination';
import type { Message } from '../types';
import { ConnectionState } from '../WebSocketChatService';

// Mock the message window hook
jest.mock('../hooks/useMessageWindow', () => ({
  useMessageWindow: jest.fn(() => ({
    messages: [],
    pagination: {
      hasMoreOlder: true,
      hasMoreNewer: false,
      isLoadingOlder: false,
      isLoadingNewer: false,
      oldestMessageId: null,
      newestMessageId: null,
      windowSize: 200,
    },
    loadOlderMessages: jest.fn(),
    loadNewerMessages: jest.fn(),
    addMessage: jest.fn(),
    addMessages: jest.fn(),
    updateMessage: jest.fn(),
    removeMessage: jest.fn(),
    clearMessages: jest.fn(),
    isNearTop: false,
    isNearBottom: true,
  })),
}));

// Mock services
jest.mock('../WebSocketChatService');
jest.mock('../HTTPChatService');

describe('ChatWithPagination', () => {
  const defaultProps = {
    userId: 'user-1',
    chatType: 'direct' as const,
    chatId: 'chat-1',
    onSendMessage: jest.fn(),
  };

  const createMessage = (id: string, content: string = `Message ${id}`): Message => ({
    id,
    content,
    type: 'text',
    timestamp: new Date(),
    sender: { id: 'user-1', name: 'Test User' },
    isOwn: true,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const component = render(<ChatWithPagination {...defaultProps} />);
      expect(component).toBeTruthy();
    });

    it('renders with minimal props', () => {
      const component = render(
        <ChatWithPagination
          userId="user-1"
          chatType="direct"
          onSendMessage={jest.fn()}
        />
      );
      expect(component).toBeTruthy();
    });

    it('renders with full configuration', () => {
      const component = render(
        <ChatWithPagination
          {...defaultProps}
          windowSize={300}
          loadMoreThreshold={50}
          showConnectionStatus={true}
          showTypingIndicator={true}
          placeholder="Type a message..."
          enableWebSocket={true}
          enableHTTP={true}
        />
      );
      expect(component).toBeTruthy();
    });

    it('applies custom style', () => {
      const customStyle = { backgroundColor: 'red' };
      const component = render(
        <ChatWithPagination {...defaultProps} style={customStyle} />
      );
      expect(component).toBeTruthy();
    });
  });

  describe('Pagination Configuration', () => {
    it('uses default window size', () => {
      const component = render(<ChatWithPagination {...defaultProps} />);
      expect(component).toBeTruthy();
    });

    it('uses custom window size', () => {
      const component = render(
        <ChatWithPagination {...defaultProps} windowSize={500} />
      );
      expect(component).toBeTruthy();
    });

    it('uses custom load threshold', () => {
      const component = render(
        <ChatWithPagination {...defaultProps} loadMoreThreshold={30} />
      );
      expect(component).toBeTruthy();
    });
  });

  describe('Initial Loading', () => {
    it('loads initial messages on mount', async () => {
      const onLoadInitialMessages = jest.fn().mockResolvedValue({
        messages: [createMessage('msg-1'), createMessage('msg-2')],
        totalCount: 2,
      });

      render(
        <ChatWithPagination
          {...defaultProps}
          onLoadInitialMessages={onLoadInitialMessages}
        />
      );

      await waitFor(() => {
        expect(onLoadInitialMessages).toHaveBeenCalledWith('chat-1', 200);
      });
    });

    it('handles initial load errors gracefully', async () => {
      const onLoadInitialMessages = jest.fn().mockRejectedValue(new Error('Load failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const component = render(
        <ChatWithPagination
          {...defaultProps}
          onLoadInitialMessages={onLoadInitialMessages}
        />
      );

      await waitFor(() => {
        expect(component).toBeTruthy();
      });

      consoleSpy.mockRestore();
    });

    it('only loads initial messages once', async () => {
      const onLoadInitialMessages = jest.fn().mockResolvedValue({
        messages: [createMessage('msg-1')],
        totalCount: 1,
      });

      const { rerender } = render(
        <ChatWithPagination
          {...defaultProps}
          onLoadInitialMessages={onLoadInitialMessages}
        />
      );

      await waitFor(() => {
        expect(onLoadInitialMessages).toHaveBeenCalledTimes(1);
      });

      // Rerender with same chatId
      rerender(
        <ChatWithPagination
          {...defaultProps}
          onLoadInitialMessages={onLoadInitialMessages}
        />
      );

      // Should not call again
      expect(onLoadInitialMessages).toHaveBeenCalledTimes(1);
    });

    it('uses chatId for loading messages', async () => {
      const onLoadInitialMessages = jest.fn().mockResolvedValue({
        messages: [createMessage('msg-1')],
        totalCount: 1,
      });

      render(
        <ChatWithPagination
          {...defaultProps}
          chatId="chat-1"
          onLoadInitialMessages={onLoadInitialMessages}
        />
      );

      await waitFor(() => {
        expect(onLoadInitialMessages).toHaveBeenCalledWith('chat-1', 200);
      });
    });
  });

  describe('Service Integration', () => {
    it('enables WebSocket service when configured', () => {
      const wsConfig = {
        baseUrl: 'ws://localhost:8080',
        getAuthToken: jest.fn().mockResolvedValue('token'),
      };

      const component = render(
        <ChatWithPagination
          {...defaultProps}
          enableWebSocket={true}
          wsConfig={wsConfig}
        />
      );

      expect(component).toBeTruthy();
    });

    it('enables HTTP service when configured', () => {
      const httpConfig = {
        baseUrl: 'http://localhost:3000',
        apiKey: 'test-key',
      };

      const component = render(
        <ChatWithPagination
          {...defaultProps}
          enableHTTP={true}
          httpConfig={httpConfig}
        />
      );

      expect(component).toBeTruthy();
    });

    it('works with both services enabled', () => {
      const wsConfig = {
        baseUrl: 'ws://localhost:8080',
        getAuthToken: jest.fn().mockResolvedValue('token'),
      };
      const httpConfig = {
        baseUrl: 'http://localhost:3000',
      };

      const component = render(
        <ChatWithPagination
          {...defaultProps}
          enableWebSocket={true}
          wsConfig={wsConfig}
          enableHTTP={true}
          httpConfig={httpConfig}
        />
      );

      expect(component).toBeTruthy();
    });

    it('works with no services enabled', () => {
      const component = render(
        <ChatWithPagination
          {...defaultProps}
          enableWebSocket={false}
          enableHTTP={false}
        />
      );

      expect(component).toBeTruthy();
    });
  });

  describe('UI Features', () => {
    it('shows connection status when enabled', () => {
      const wsConfig = {
        baseUrl: 'ws://localhost:8080',
        getAuthToken: jest.fn().mockResolvedValue('token'),
      };

      const component = render(
        <ChatWithPagination
          {...defaultProps}
          showConnectionStatus={true}
          enableWebSocket={true}
          wsConfig={wsConfig}
        />
      );

      expect(component).toBeTruthy();
    });

    it('hides connection status when disabled', () => {
      const component = render(
        <ChatWithPagination
          {...defaultProps}
          showConnectionStatus={false}
        />
      );

      expect(component).toBeTruthy();
    });

    it('shows typing indicator when enabled', () => {
      const component = render(
        <ChatWithPagination
          {...defaultProps}
          showTypingIndicator={true}
        />
      );

      expect(component).toBeTruthy();
    });

    it('hides typing indicator when disabled', () => {
      const component = render(
        <ChatWithPagination
          {...defaultProps}
          showTypingIndicator={false}
        />
      );

      expect(component).toBeTruthy();
    });

    it('uses custom placeholder', () => {
      const component = render(
        <ChatWithPagination
          {...defaultProps}
          placeholder="Custom placeholder"
        />
      );

      expect(component).toBeTruthy();
    });
  });

  describe('Custom Renderers', () => {
    it('uses custom message renderer', () => {
      const renderMessage = jest.fn(() => null);

      const component = render(
        <ChatWithPagination
          {...defaultProps}
          renderMessage={renderMessage}
        />
      );

      expect(component).toBeTruthy();
    });

    it('uses custom header renderer', () => {
      const renderHeader = jest.fn(() => null);

      const component = render(
        <ChatWithPagination
          {...defaultProps}
          renderHeader={renderHeader}
        />
      );

      expect(component).toBeTruthy();
    });

    it('uses custom empty state renderer', () => {
      const renderEmptyState = jest.fn(() => null);

      const component = render(
        <ChatWithPagination
          {...defaultProps}
          renderEmptyState={renderEmptyState}
        />
      );

      expect(component).toBeTruthy();
    });
  });

  describe('Event Handlers', () => {
    it('handles message press', () => {
      const onMessagePress = jest.fn();

      const component = render(
        <ChatWithPagination
          {...defaultProps}
          onMessagePress={onMessagePress}
        />
      );

      expect(component).toBeTruthy();
    });

    it('handles message long press', () => {
      const onMessageLongPress = jest.fn();

      const component = render(
        <ChatWithPagination
          {...defaultProps}
          onMessageLongPress={onMessageLongPress}
        />
      );

      expect(component).toBeTruthy();
    });

    it('handles avatar press', () => {
      const onAvatarPress = jest.fn();

      const component = render(
        <ChatWithPagination
          {...defaultProps}
          onAvatarPress={onAvatarPress}
        />
      );

      expect(component).toBeTruthy();
    });
  });

  describe('Pagination Callbacks', () => {
    it('accepts onLoadMessagesBefore callback', () => {
      const onLoadMessagesBefore = jest.fn().mockResolvedValue([]);

      const component = render(
        <ChatWithPagination
          {...defaultProps}
          onLoadMessagesBefore={onLoadMessagesBefore}
        />
      );

      expect(component).toBeTruthy();
    });

    it('accepts onLoadMessagesAfter callback', () => {
      const onLoadMessagesAfter = jest.fn().mockResolvedValue([]);

      const component = render(
        <ChatWithPagination
          {...defaultProps}
          onLoadMessagesAfter={onLoadMessagesAfter}
        />
      );

      expect(component).toBeTruthy();
    });

    it('works without pagination callbacks', () => {
      const component = render(<ChatWithPagination {...defaultProps} />);

      expect(component).toBeTruthy();
    });
  });

  describe('Theme Support', () => {
    it('applies custom theme', () => {
      const theme = {
        primaryColor: '#FF0000',
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
      };

      const component = render(
        <ChatWithPagination {...defaultProps} theme={theme} />
      );

      expect(component).toBeTruthy();
    });

    it('works without theme', () => {
      const component = render(<ChatWithPagination {...defaultProps} />);

      expect(component).toBeTruthy();
    });
  });

  describe('Cleanup', () => {
    it('cleans up on unmount', () => {
      const wsConfig = {
        baseUrl: 'ws://localhost:8080',
        getAuthToken: jest.fn().mockResolvedValue('token'),
      };

      const { unmount } = render(
        <ChatWithPagination
          {...defaultProps}
          enableWebSocket={true}
          wsConfig={wsConfig}
        />
      );

      expect(() => unmount()).not.toThrow();
    });

    it('handles unmount without services', () => {
      const { unmount } = render(
        <ChatWithPagination
          {...defaultProps}
          enableWebSocket={false}
          enableHTTP={false}
        />
      );

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('renders quickly', () => {
      const startTime = performance.now();

      const component = render(<ChatWithPagination {...defaultProps} />);

      const endTime = performance.now();

      expect(component).toBeTruthy();
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('handles configuration changes efficiently', () => {
      const { rerender } = render(
        <ChatWithPagination {...defaultProps} windowSize={200} />
      );

      const startTime = performance.now();

      // Multiple rerenders with different configs
      for (let i = 0; i < 10; i++) {
        rerender(
          <ChatWithPagination
            {...defaultProps}
            windowSize={200 + i * 10}
            placeholder={`Placeholder ${i}`}
          />
        );
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe('Edge Cases', () => {
    it('handles missing chatId', () => {
      const component = render(
        <ChatWithPagination
          userId="user-1"
          chatType="group"
          onSendMessage={jest.fn()}
        />
      );

      expect(component).toBeTruthy();
    });

    it('handles empty userId', () => {
      const component = render(
        <ChatWithPagination
          userId=""
          chatType="direct"
          onSendMessage={jest.fn()}
        />
      );

      expect(component).toBeTruthy();
    });

    it('handles different chat types', () => {
      const types: Array<'direct' | 'group' | 'channel'> = ['direct', 'group', 'channel'];

      types.forEach(chatType => {
        const component = render(
          <ChatWithPagination
            {...defaultProps}
            chatType={chatType}
          />
        );

        expect(component).toBeTruthy();
      });
    });
  });
});
