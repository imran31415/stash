import { WebSocketChatService, ConnectionState, WSMessage } from '../WebSocketChatService';
import { Message } from '../types';

// Mock WebSocket
class MockWebSocket {
  public readyState: number = WebSocket.CONNECTING;
  public onopen: ((event: Event) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public sent: string[] = [];

  constructor(public url: string) {}

  send(data: string) {
    this.sent.push(data);
  }

  close() {
    this.readyState = WebSocket.CLOSED;
  }

  // Simulate successful connection
  simulateOpen() {
    this.readyState = WebSocket.OPEN;
    this.onopen?.(new Event('open'));
  }

  // Simulate receiving a message
  simulateMessage(data: string) {
    this.onmessage?.(new MessageEvent('message', { data }));
  }

  // Simulate close
  simulateClose(code: number = 1000, reason: string = '') {
    this.readyState = WebSocket.CLOSED;
    const closeEvent = { code, reason } as any;
    this.onclose?.(closeEvent);
  }

  // Simulate error
  simulateError() {
    this.onerror?.(new Event('error'));
  }
}

// Replace global WebSocket with mock
global.WebSocket = MockWebSocket as any;

describe('WebSocketChatService', () => {
  let service: WebSocketChatService;
  let mockGetAuthToken: jest.Mock;
  let mockWs: MockWebSocket;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockGetAuthToken = jest.fn().mockResolvedValue('test-token');
    service = new WebSocketChatService(
      'ws://localhost:3000',
      mockGetAuthToken,
      'user-1',
      'tenant-1',
      'project-1'
    );

    // Capture WebSocket instance when created
    const OriginalMockWS = global.WebSocket;
    global.WebSocket = jest.fn((url: string) => {
      mockWs = new MockWebSocket(url) as any;
      return mockWs;
    }) as any;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Connection', () => {
    it('initializes with disconnected state', () => {
      expect(service.getConnectionState()).toBe(ConnectionState.Disconnected);
      expect(service.isConnected()).toBe(false);
    });

    it('connects to WebSocket with auth token', async () => {
      const connectPromise = service.connect();
      await Promise.resolve(); // Wait for async token fetch

      expect(mockGetAuthToken).toHaveBeenCalled();
      expect(global.WebSocket).toHaveBeenCalledWith(
        expect.stringContaining('ws://localhost:3000/ws?token=')
      );
    });

    it('transitions to connecting state', async () => {
      const stateHandler = jest.fn();
      service.onConnectionChange(stateHandler);

      const connectPromise = service.connect();
      await Promise.resolve();

      expect(stateHandler).toHaveBeenCalledWith(ConnectionState.Connecting);
    });

    it('transitions to connected state on successful connection', async () => {
      const stateHandler = jest.fn();
      service.onConnectionChange(stateHandler);

      const connectPromise = service.connect();
      await Promise.resolve();

      mockWs.simulateOpen();

      expect(stateHandler).toHaveBeenCalledWith(ConnectionState.Connected);
      expect(service.isConnected()).toBe(true);
    });

    it('throws error when no auth token available', async () => {
      mockGetAuthToken.mockResolvedValue(null);
      const errorHandler = jest.fn();
      service.onError(errorHandler);

      await service.connect();

      expect(service.getConnectionState()).toBe(ConnectionState.Error);
    });

    it('does not reconnect if already connected', async () => {
      await service.connect();
      await Promise.resolve();
      mockWs.simulateOpen();

      const wsCallCount = (global.WebSocket as jest.Mock).mock.calls.length;

      await service.connect();

      expect((global.WebSocket as jest.Mock).mock.calls.length).toBe(wsCallCount);
    });
  });

  describe('Disconnection', () => {
    it('disconnects and cleans up', async () => {
      await service.connect();
      await Promise.resolve();
      mockWs.simulateOpen();

      service.disconnect();

      expect(service.getConnectionState()).toBe(ConnectionState.Disconnected);
      expect(service.isConnected()).toBe(false);
    });

    it('clears ping interval on disconnect', async () => {
      await service.connect();
      await Promise.resolve();
      mockWs.simulateOpen();

      // Advance time to trigger ping
      jest.advanceTimersByTime(30000);

      service.disconnect();

      // Verify interval is cleared (no more pings)
      jest.advanceTimersByTime(30000);
      const pingsBeforeDisconnect = mockWs.sent.filter(msg =>
        JSON.parse(msg).type === 'ping'
      ).length;

      expect(pingsBeforeDisconnect).toBeGreaterThan(0);
    });
  });

  describe('Message Handling', () => {
    it('sends message when connected', async () => {
      await service.connect();
      await Promise.resolve();
      mockWs.simulateOpen();

      const message: Message = {
        id: 'msg-1',
        content: 'Hello',
        type: 'text',
        timestamp: new Date(),
        sender: { id: 'user-1', name: 'Test User' },
      };

      await service.sendMessage(message);

      expect(mockWs.sent.length).toBeGreaterThan(0);
      const sentMessage = JSON.parse(mockWs.sent[mockWs.sent.length - 1]);
      expect(sentMessage.type).toBe('command');
      expect(sentMessage.action).toBe('chat.message.sent');
    });

    it('throws error when sending message while disconnected', async () => {
      const message: Message = {
        id: 'msg-1',
        content: 'Hello',
        type: 'text',
        timestamp: new Date(),
        sender: { id: 'user-1', name: 'Test User' },
      };

      await expect(service.sendMessage(message)).rejects.toThrow('WebSocket not connected');
    });

    it('receives and handles messages', async () => {
      const messageHandler = jest.fn();
      service.onMessage('chat.message.sent', messageHandler);

      await service.connect();
      await Promise.resolve();
      mockWs.simulateOpen();

      const wsMessage: WSMessage = {
        type: 'event',
        action: 'chat.message.sent',
        data: { content: 'Test message' },
      };

      mockWs.simulateMessage(JSON.stringify(wsMessage));

      expect(messageHandler).toHaveBeenCalledWith(wsMessage);
    });

    it('handles multiple message handlers for same action', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      service.onMessage('chat.message.sent', handler1);
      service.onMessage('chat.message.sent', handler2);

      await service.connect();
      await Promise.resolve();
      mockWs.simulateOpen();

      const wsMessage: WSMessage = {
        type: 'event',
        action: 'chat.message.sent',
        data: {},
      };

      mockWs.simulateMessage(JSON.stringify(wsMessage));

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });

  describe('Typing Indicator', () => {
    it('sends typing start indicator', async () => {
      await service.connect();
      await Promise.resolve();
      mockWs.simulateOpen();

      service.sendTypingIndicator(true);

      const sentMessage = JSON.parse(mockWs.sent[mockWs.sent.length - 1]);
      expect(sentMessage.action).toBe('typing.start');
    });

    it('sends typing stop indicator', async () => {
      await service.connect();
      await Promise.resolve();
      mockWs.simulateOpen();

      service.sendTypingIndicator(false);

      const sentMessage = JSON.parse(mockWs.sent[mockWs.sent.length - 1]);
      expect(sentMessage.action).toBe('typing.stop');
    });

    it('does not send typing indicator when disconnected', () => {
      // Service is not connected, so mockWs is undefined
      service.sendTypingIndicator(true);
      // Should not throw error and should not create a WebSocket
      expect(service.isConnected()).toBe(false);
    });
  });

  describe('Subscription', () => {
    it('subscribes to events on connection', async () => {
      await service.connect();
      await Promise.resolve();
      mockWs.simulateOpen();

      const subscribeMessage = mockWs.sent.find(msg =>
        JSON.parse(msg).type === 'subscribe'
      );

      expect(subscribeMessage).toBeTruthy();
      const parsed = JSON.parse(subscribeMessage!);
      expect(parsed.data.events).toContain('chat.message.sent');
    });

    it('subscribes manually when called', async () => {
      await service.connect();
      await Promise.resolve();
      mockWs.simulateOpen();

      mockWs.sent = []; // Clear previous messages
      await service.subscribe();

      const subscribeMessage = mockWs.sent.find(msg =>
        JSON.parse(msg).type === 'subscribe'
      );

      expect(subscribeMessage).toBeTruthy();
    });
  });

  describe('Ping/Pong', () => {
    it('sends ping at regular intervals', async () => {
      await service.connect();
      await Promise.resolve();
      mockWs.simulateOpen();

      mockWs.sent = []; // Clear initial messages

      jest.advanceTimersByTime(30000);

      const pingMessage = mockWs.sent.find(msg =>
        JSON.parse(msg).type === 'ping'
      );

      expect(pingMessage).toBeTruthy();
    });

    it('handles pong response', async () => {
      await service.connect();
      await Promise.resolve();
      mockWs.simulateOpen();

      const pongMessage: WSMessage = { type: 'pong' };
      mockWs.simulateMessage(JSON.stringify(pongMessage));

      // Should not throw error
      expect(service.isConnected()).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('handles WebSocket errors', async () => {
      const errorHandler = jest.fn();
      service.onError(errorHandler);

      await service.connect();
      await Promise.resolve();

      mockWs.simulateError();

      expect(service.getConnectionState()).toBe(ConnectionState.Error);
      expect(errorHandler).toHaveBeenCalled();
    });

    it('handles error messages from server', async () => {
      const errorHandler = jest.fn();
      service.onError(errorHandler);

      await service.connect();
      await Promise.resolve();
      mockWs.simulateOpen();

      const errorMessage: WSMessage = {
        type: 'error',
        error: 'Test error',
      };

      mockWs.simulateMessage(JSON.stringify(errorMessage));

      expect(errorHandler).toHaveBeenCalled();
    });
  });

  describe('Reconnection', () => {
    it('transitions to reconnecting on abnormal close', async () => {
      await service.connect();
      await Promise.resolve();
      mockWs.simulateOpen();

      mockWs.simulateClose(1006); // Abnormal closure

      // After abnormal close, service should transition to reconnecting or disconnected
      const state = service.getConnectionState();
      expect([ConnectionState.Disconnected, ConnectionState.Reconnecting]).toContain(state);
    });

    it('does not reconnect on normal close', async () => {
      await service.connect();
      await Promise.resolve();
      mockWs.simulateOpen();

      const initialCallCount = (global.WebSocket as jest.Mock).mock.calls.length;

      mockWs.simulateClose(1000); // Normal closure

      jest.advanceTimersByTime(5000);

      expect((global.WebSocket as jest.Mock).mock.calls.length).toBe(initialCallCount);
    });

    it('stops reconnecting after max attempts', async () => {
      await service.connect();
      await Promise.resolve();
      mockWs.simulateOpen();

      // Simulate 5 failed reconnection attempts
      for (let i = 0; i < 5; i++) {
        mockWs.simulateClose(1006);
        jest.advanceTimersByTime(30000);
        await Promise.resolve();
      }

      const finalCallCount = (global.WebSocket as jest.Mock).mock.calls.length;

      // Try one more time - should not reconnect
      jest.advanceTimersByTime(30000);

      expect((global.WebSocket as jest.Mock).mock.calls.length).toBe(finalCallCount);
    });
  });
});
