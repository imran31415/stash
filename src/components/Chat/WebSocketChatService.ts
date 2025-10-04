import { Message } from './types';

export type WSMessageType = 'subscribe' | 'unsubscribe' | 'command' | 'event' | 'ping' | 'pong' | 'error';
export type WSEventAction = 'chat.message.sent' | 'chat.streaming' | 'user.joined' | 'user.left' | 'typing.start' | 'typing.stop';

export interface WSMessage {
  id?: string;
  type: WSMessageType;
  action?: WSEventAction;
  tenant_id?: string;
  project_id?: string;
  user_id?: string;
  data?: any;
  error?: string;
  timestamp?: string;
}

export enum ConnectionState {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Reconnecting = 'reconnecting',
  Error = 'error'
}

export class WebSocketChatService {
  private ws: WebSocket | null = null;
  private connectionState: ConnectionState = ConnectionState.Disconnected;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<WSEventAction, Function[]> = new Map();
  private connectionHandlers: Function[] = [];
  private errorHandlers: Function[] = [];
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(
    private baseUrl: string,
    private getAuthToken: () => Promise<string | null>,
    private userId?: string,
    private tenantId?: string,
    private projectId?: string
  ) {}

  async connect(): Promise<void> {
    if (this.connectionState === ConnectionState.Connected ||
        this.connectionState === ConnectionState.Connecting) {
      return;
    }

    this.connectionState = ConnectionState.Connecting;
    this.notifyConnectionHandlers();

    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const wsUrl = `${this.baseUrl}/ws?token=${encodeURIComponent(token)}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = this.handleOpen.bind(this) as any;
      this.ws.onmessage = this.handleMessage.bind(this) as any;
      this.ws.onclose = this.handleClose.bind(this) as any;
      this.ws.onerror = this.handleError.bind(this) as any;

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.connectionState = ConnectionState.Error;
      this.notifyConnectionHandlers();
      this.notifyErrorHandlers(error);
    }
  }

  disconnect(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionState = ConnectionState.Disconnected;
    this.notifyConnectionHandlers();
  }

  async sendMessage(message: Message): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('WebSocket not connected');
    }

    const wsMessage: WSMessage = {
      type: 'command',
      action: 'chat.message.sent',
      tenant_id: this.tenantId,
      project_id: this.projectId,
      user_id: this.userId,
      data: {
        id: message.id,
        message: message.content,
        content: message.content,
        type: message.type,
        timestamp: message.timestamp.toISOString(),
        sender_id: message.sender.id,
        sender_name: message.sender.name,
      }
    };

    this.send(wsMessage);
  }

  sendTypingIndicator(isTyping: boolean): void {
    if (!this.isConnected()) return;

    const wsMessage: WSMessage = {
      type: 'command',
      action: isTyping ? 'typing.start' : 'typing.stop',
      tenant_id: this.tenantId,
      project_id: this.projectId,
      user_id: this.userId,
      data: {
        user_id: this.userId,
      }
    };

    this.send(wsMessage);
  }

  async subscribe(): Promise<void> {
    if (!this.isConnected()) {
      await this.connect();
    }

    const subscribeMessage: WSMessage = {
      type: 'subscribe',
      data: {
        tenant_id: this.tenantId,
        project_id: this.projectId,
        events: ['chat.message.sent', 'chat.streaming', 'user.joined', 'user.left', 'typing.start', 'typing.stop']
      }
    };

    this.send(subscribeMessage);
  }

  onMessage(action: WSEventAction, handler: Function): void {
    if (!this.messageHandlers.has(action)) {
      this.messageHandlers.set(action, []);
    }
    this.messageHandlers.get(action)!.push(handler);
  }

  onConnectionChange(handler: (state: ConnectionState) => void): void {
    this.connectionHandlers.push(handler);
  }

  onError(handler: (error: any) => void): void {
    this.errorHandlers.push(handler);
  }

  isConnected(): boolean {
    return this.connectionState === ConnectionState.Connected &&
           this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  private handleOpen(): void {
    console.log('✅ WebSocket connected');
    this.connectionState = ConnectionState.Connected;
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;

    this.subscribe();
    this.notifyConnectionHandlers();

    // Start ping interval
    this.pingInterval = setInterval(() => this.ping(), 30000);
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = event.data.toString();
      const messages = data.trim().split('\n').filter((line: string) => line.trim());

      for (const messageStr of messages) {
        try {
          const message: WSMessage = JSON.parse(messageStr);

          if (message.type === 'event' && message.action) {
            this.notifyMessageHandlers(message.action, message);
          } else if (message.type === 'pong') {
            console.log('🏓 Pong received');
          } else if (message.type === 'error') {
            console.error('WebSocket error:', message.error);
            this.notifyErrorHandlers(new Error(message.error));
          }
        } catch (parseError) {
          console.error('Failed to parse WebSocket message:', parseError);
        }
      }
    } catch (error) {
      console.error('Failed to handle WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('🔌 WebSocket disconnected:', event.code, event.reason);

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    this.connectionState = ConnectionState.Disconnected;
    this.ws = null;
    this.notifyConnectionHandlers();

    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.attemptReconnect();
    }
  }

  private handleError(error: Event): void {
    console.error('WebSocket error:', error);
    this.connectionState = ConnectionState.Error;
    this.notifyConnectionHandlers();
    this.notifyErrorHandlers(error);
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    this.connectionState = ConnectionState.Reconnecting;
    this.notifyConnectionHandlers();

    console.log(`🔄 Reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectDelay}ms`);

    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay);

    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
  }

  private send(message: WSMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }
    this.ws.send(JSON.stringify(message));
  }

  private ping(): void {
    if (this.isConnected()) {
      const pingMessage: WSMessage = { type: 'ping' };
      this.send(pingMessage);
    }
  }

  private notifyMessageHandlers(action: WSEventAction, message: WSMessage): void {
    const handlers = this.messageHandlers.get(action) || [];
    handlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error(`Error in message handler for ${action}:`, error);
      }
    });
  }

  private notifyConnectionHandlers(): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(this.connectionState);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }

  private notifyErrorHandlers(error: any): void {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (error) {
        console.error('Error in error handler:', error);
      }
    });
  }
}
