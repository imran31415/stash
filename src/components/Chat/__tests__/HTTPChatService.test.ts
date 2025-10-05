import { HTTPChatService } from '../HTTPChatService';
import { Message } from '../types';

// Mock fetch
global.fetch = jest.fn();

describe('HTTPChatService', () => {
  let service: HTTPChatService;
  const mockBaseUrl = 'https://api.example.com';
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    jest.clearAllMocks();
    service = new HTTPChatService({
      baseUrl: mockBaseUrl,
      apiKey: mockApiKey,
      timeout: 5000,
    });
  });

  const mockMessage: Message = {
    id: 'msg-1',
    content: 'Test message',
    type: 'text',
    timestamp: new Date('2024-01-01T00:00:00Z'),
    sender: { id: 'user-1', name: 'Test User' },
  };

  describe('Constructor', () => {
    it('initializes with config', () => {
      expect(service).toBeTruthy();
    });

    it('sets default timeout if not provided', () => {
      const serviceWithoutTimeout = new HTTPChatService({
        baseUrl: mockBaseUrl,
      });
      expect(serviceWithoutTimeout).toBeTruthy();
    });
  });

  describe('saveMessages', () => {
    it('successfully saves messages', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const result = await service.saveMessages('user-1', [mockMessage]);

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/chat/messages`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockApiKey}`,
          }),
        })
      );
    });

    it('handles save error response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Invalid data' }),
      });

      const result = await service.saveMessages('user-1', [mockMessage]);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid data');
    });

    it('handles network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await service.saveMessages('user-1', [mockMessage]);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('includes Authorization header when apiKey is provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await service.saveMessages('user-1', [mockMessage]);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockApiKey}`,
          }),
        })
      );
    });

    it('omits Authorization header when apiKey is not provided', async () => {
      const serviceWithoutKey = new HTTPChatService({ baseUrl: mockBaseUrl });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await serviceWithoutKey.saveMessages('user-1', [mockMessage]);

      const callHeaders = (global.fetch as jest.Mock).mock.calls[0][1].headers;
      expect(callHeaders['Authorization']).toBeUndefined();
    });
  });

  describe('loadMessages', () => {
    it('successfully loads messages', async () => {
      const mockMessages = [
        { ...mockMessage, timestamp: '2024-01-01T00:00:00Z' },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockMessages,
      });

      const result = await service.loadMessages('user-1', 50);

      expect(result.success).toBe(true);
      expect(result.data).toBeTruthy();
      expect(result.data![0].timestamp).toBeInstanceOf(Date);
    });

    it('uses default limit of 50', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      await service.loadMessages('user-1');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=50'),
        expect.any(Object)
      );
    });

    it('handles messages wrapped in object', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          messages: [{ ...mockMessage, timestamp: '2024-01-01T00:00:00Z' }],
        }),
      });

      const result = await service.loadMessages('user-1');

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(1);
    });

    it('handles load error response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'User not found' }),
      });

      const result = await service.loadMessages('user-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });

    it('handles network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await service.loadMessages('user-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('converts timestamp strings to Date objects', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [
          { ...mockMessage, timestamp: '2024-01-01T00:00:00Z' },
        ],
      });

      const result = await service.loadMessages('user-1');

      expect(result.success).toBe(true);
      expect(result.data![0].timestamp).toBeInstanceOf(Date);
      expect(result.data![0].timestamp.getTime()).toBe(
        new Date('2024-01-01T00:00:00Z').getTime()
      );
    });
  });

  describe('deleteMessages', () => {
    it('successfully deletes messages', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const result = await service.deleteMessages('user-1', ['msg-1', 'msg-2']);

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/chat/messages`,
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({
            userId: 'user-1',
            messageIds: ['msg-1', 'msg-2'],
          }),
        })
      );
    });

    it('handles delete error response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({ message: 'Access denied' }),
      });

      const result = await service.deleteMessages('user-1', ['msg-1']);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Access denied');
    });

    it('handles network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await service.deleteMessages('user-1', ['msg-1']);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('sendMessage', () => {
    it('successfully sends a message', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ ...mockMessage, timestamp: '2024-01-01T00:00:00Z' }),
      });

      const result = await service.sendMessage('user-1', mockMessage);

      expect(result.success).toBe(true);
      expect(result.data).toBeTruthy();
      expect(result.data!.timestamp).toBeInstanceOf(Date);
    });

    it('sends POST request with correct data', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockMessage,
      });

      await service.sendMessage('user-1', mockMessage);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/chat/send`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ userId: 'user-1', message: mockMessage }),
        })
      );
    });

    it('handles send error response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Server error' }),
      });

      const result = await service.sendMessage('user-1', mockMessage);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Server error');
    });

    it('handles network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await service.sendMessage('user-1', mockMessage);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('converts timestamp string to Date object in response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ ...mockMessage, timestamp: '2024-01-01T00:00:00Z' }),
      });

      const result = await service.sendMessage('user-1', mockMessage);

      expect(result.success).toBe(true);
      expect(result.data!.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Error Handling', () => {
    it('handles HTTP error with invalid JSON response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const result = await service.saveMessages('user-1', [mockMessage]);

      expect(result.success).toBe(false);
      expect(result.error).toContain('HTTP 500');
    });

    it('handles non-Error exceptions', async () => {
      (global.fetch as jest.Mock).mockRejectedValue('String error');

      const result = await service.saveMessages('user-1', [mockMessage]);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error saving messages');
    });
  });
});
