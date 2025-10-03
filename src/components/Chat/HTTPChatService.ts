import { Message } from './types';

export interface ChatServiceConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

export interface ChatApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class HTTPChatService {
  private config: ChatServiceConfig;

  constructor(config: ChatServiceConfig) {
    this.config = {
      timeout: 10000,
      ...config,
    };
  }

  async saveMessages(
    userId: string,
    messages: Message[]
  ): Promise<ChatApiResponse<void>> {
    try {
      const response = await fetch(`${this.config.baseUrl}/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {}),
        },
        body: JSON.stringify({ userId, messages }),
        signal: AbortSignal.timeout(this.config.timeout!),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving messages:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error saving messages',
      };
    }
  }

  async loadMessages(
    userId: string,
    limit: number = 50
  ): Promise<ChatApiResponse<Message[]>> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/chat/messages?userId=${userId}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {}),
          },
          signal: AbortSignal.timeout(this.config.timeout!),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      const messages = Array.isArray(data) ? data : (data.messages || []);

      // Convert timestamp strings to Date objects
      const parsedMessages = messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));

      return {
        success: true,
        data: parsedMessages,
      };
    } catch (error) {
      console.error('Error loading messages:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error loading messages',
      };
    }
  }

  async deleteMessages(
    userId: string,
    messageIds: string[]
  ): Promise<ChatApiResponse<void>> {
    try {
      const response = await fetch(`${this.config.baseUrl}/chat/messages`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {}),
        },
        body: JSON.stringify({ userId, messageIds }),
        signal: AbortSignal.timeout(this.config.timeout!),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting messages:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error deleting messages',
      };
    }
  }

  async sendMessage(
    userId: string,
    message: Message
  ): Promise<ChatApiResponse<Message>> {
    try {
      const response = await fetch(`${this.config.baseUrl}/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {}),
        },
        body: JSON.stringify({ userId, message }),
        signal: AbortSignal.timeout(this.config.timeout!),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          ...data,
          timestamp: new Date(data.timestamp),
        },
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending message',
      };
    }
  }
}
