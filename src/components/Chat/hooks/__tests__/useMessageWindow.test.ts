import { renderHook, act } from '@testing-library/react-native';
import { useMessageWindow } from '../useMessageWindow';
import type { Message } from '../../types';

describe('useMessageWindow', () => {
  const createMessage = (id: string, content: string = `Message ${id}`): Message => ({
    id,
    content,
    type: 'text',
    timestamp: new Date(),
    sender: { id: 'user-1', name: 'Test User' },
  });

  const createMessages = (count: number, startId: number = 0): Message[] => {
    return Array.from({ length: count }, (_, i) =>
      createMessage(`msg-${startId + i}`)
    );
  };

  describe('Initialization', () => {
    it('initializes with empty messages', () => {
      const { result } = renderHook(() => useMessageWindow({}));

      expect(result.current.messages).toEqual([]);
      expect(result.current.pagination.hasMoreOlder).toBe(true);
      expect(result.current.pagination.hasMoreNewer).toBe(false);
    });

    it('initializes with initial messages', () => {
      const initialMessages = createMessages(10);

      const { result } = renderHook(() =>
        useMessageWindow({ initialMessages })
      );

      expect(result.current.messages).toHaveLength(10);
      expect(result.current.pagination.oldestMessageId).toBe('msg-0');
      expect(result.current.pagination.newestMessageId).toBe('msg-9');
    });

    it('uses custom window size', () => {
      const { result } = renderHook(() =>
        useMessageWindow({ windowSize: 500 })
      );

      expect(result.current.pagination.windowSize).toBe(500);
    });
  });

  describe('Memory Management', () => {
    it('enforces window size limit when adding messages', () => {
      const windowSize = 200;
      const initialMessages = createMessages(windowSize);

      const { result } = renderHook(() =>
        useMessageWindow({ initialMessages, windowSize })
      );

      // Add 50 more messages
      act(() => {
        const newMessages = createMessages(50, windowSize);
        result.current.addMessages(newMessages);
      });

      // Should keep only windowSize messages
      expect(result.current.messages).toHaveLength(windowSize);
      // Oldest 50 should be removed
      expect(result.current.messages[0].id).toBe('msg-50');
      expect(result.current.messages[windowSize - 1].id).toBe('msg-249');
    });

    it('releases old messages when loading newer beyond window', async () => {
      const windowSize = 100;
      const initialMessages = createMessages(50, 0);

      const onLoadNewer = jest.fn().mockResolvedValue(createMessages(60, 50));

      const { result } = renderHook(() =>
        useMessageWindow({
          initialMessages,
          windowSize,
          onLoadNewer,
        })
      );

      // Manually set hasMoreNewer for testing
      act(() => {
        result.current.pagination.hasMoreNewer = true;
      });

      await act(async () => {
        await result.current.loadNewerMessages();
      });

      // Should trim to window size
      expect(result.current.messages).toHaveLength(windowSize);
      // Should keep most recent messages
      expect(result.current.messages[0].id).toBe('msg-10');
      expect(result.current.messages[windowSize - 1].id).toBe('msg-109');
    });

    it('prevents memory bloat with rapid message additions', () => {
      const windowSize = 100;
      const { result } = renderHook(() =>
        useMessageWindow({ windowSize })
      );

      act(() => {
        // Simulate rapid message flow (e.g., 500 messages)
        for (let i = 0; i < 500; i++) {
          result.current.addMessage(createMessage(`msg-${i}`));
        }
      });

      // Should maintain window size
      expect(result.current.messages).toHaveLength(windowSize);
      expect(result.current.messages[0].id).toBe('msg-400');
      expect(result.current.messages[windowSize - 1].id).toBe('msg-499');
    });
  });

  describe('Load Older Messages', () => {
    it('loads older messages successfully', async () => {
      const initialMessages = createMessages(20, 20);
      const onLoadOlder = jest.fn().mockResolvedValue(createMessages(20, 0));

      const { result } = renderHook(() =>
        useMessageWindow({
          initialMessages,
          onLoadOlder,
          windowSize: 100,
        })
      );

      await act(async () => {
        await result.current.loadOlderMessages();
      });

      expect(onLoadOlder).toHaveBeenCalledWith('msg-20', 100);
      expect(result.current.messages).toHaveLength(40);
      expect(result.current.messages[0].id).toBe('msg-0');
    });

    it('prevents concurrent loading', async () => {
      const onLoadOlder = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(createMessages(10, 0)), 100))
      );

      const { result } = renderHook(() =>
        useMessageWindow({
          initialMessages: createMessages(10, 10),
          onLoadOlder,
        })
      );

      // Start first load
      act(() => {
        result.current.loadOlderMessages();
      });

      expect(result.current.pagination.isLoadingOlder).toBe(true);

      // Attempt second load while first is in progress
      await act(async () => {
        await result.current.loadOlderMessages();
      });

      // Should only call once
      expect(onLoadOlder).toHaveBeenCalledTimes(1);
    });

    it('handles empty result (no more older messages)', async () => {
      const onLoadOlder = jest.fn().mockResolvedValue([]);

      const { result } = renderHook(() =>
        useMessageWindow({
          initialMessages: createMessages(10),
          onLoadOlder,
        })
      );

      await act(async () => {
        await result.current.loadOlderMessages();
      });

      expect(result.current.pagination.hasMoreOlder).toBe(false);
    });

    it('handles errors during load', async () => {
      const onLoadOlder = jest.fn().mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() =>
        useMessageWindow({
          initialMessages: createMessages(10),
          onLoadOlder,
        })
      );

      await act(async () => {
        await result.current.loadOlderMessages();
      });

      expect(result.current.pagination.isLoadingOlder).toBe(false);
      expect(result.current.messages).toHaveLength(10);
    });
  });

  describe('Message Operations', () => {
    it('adds a message', () => {
      const { result } = renderHook(() => useMessageWindow({}));

      act(() => {
        result.current.addMessage(createMessage('msg-1'));
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].id).toBe('msg-1');
    });

    it('prevents duplicate messages', () => {
      const initialMessages = createMessages(5);

      const { result } = renderHook(() =>
        useMessageWindow({ initialMessages })
      );

      act(() => {
        result.current.addMessage(createMessage('msg-0', 'Duplicate'));
      });

      expect(result.current.messages).toHaveLength(5);
    });

    it('updates a message', () => {
      const initialMessages = createMessages(5);

      const { result } = renderHook(() =>
        useMessageWindow({ initialMessages })
      );

      act(() => {
        result.current.updateMessage('msg-2', { content: 'Updated content' });
      });

      const updated = result.current.messages.find(m => m.id === 'msg-2');
      expect(updated?.content).toBe('Updated content');
    });

    it('removes a message', () => {
      const initialMessages = createMessages(5);

      const { result } = renderHook(() =>
        useMessageWindow({ initialMessages })
      );

      act(() => {
        result.current.removeMessage('msg-2');
      });

      expect(result.current.messages).toHaveLength(4);
      expect(result.current.messages.find(m => m.id === 'msg-2')).toBeUndefined();
    });

    it('clears all messages', () => {
      const initialMessages = createMessages(5);

      const { result } = renderHook(() =>
        useMessageWindow({ initialMessages })
      );

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.messages).toHaveLength(0);
      expect(result.current.pagination.oldestMessageId).toBeNull();
    });
  });

  describe('Performance', () => {
    it('handles 1000 message window efficiently', () => {
      const windowSize = 1000;
      const { result } = renderHook(() =>
        useMessageWindow({ windowSize })
      );

      const startTime = performance.now();

      act(() => {
        const messages = createMessages(1000);
        result.current.addMessages(messages);
      });

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(result.current.messages).toHaveLength(windowSize);
    });

    it('maintains performance with rapid additions', () => {
      const windowSize = 200;
      const { result } = renderHook(() =>
        useMessageWindow({ windowSize })
      );

      const startTime = performance.now();

      act(() => {
        // Simulate high-volume chat (500 messages)
        for (let i = 0; i < 500; i++) {
          result.current.addMessage(createMessage(`msg-${i}`));
        }
      });

      const endTime = performance.now();

      // Should complete quickly
      expect(endTime - startTime).toBeLessThan(300);
      expect(result.current.messages).toHaveLength(windowSize);
    });

    it('efficiently handles mixed operations', () => {
      const windowSize = 100;
      const { result } = renderHook(() =>
        useMessageWindow({ windowSize })
      );

      const startTime = performance.now();

      act(() => {
        // Add 150 messages
        for (let i = 0; i < 150; i++) {
          result.current.addMessage(createMessage(`msg-${i}`));
        }

        // Update 50 messages
        for (let i = 100; i < 150; i++) {
          result.current.updateMessage(`msg-${i}`, { content: 'Updated' });
        }

        // Remove 10 messages
        for (let i = 100; i < 110; i++) {
          result.current.removeMessage(`msg-${i}`);
        }
      });

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200);
    });
  });

  describe('Scroll Position Tracking', () => {
    it('tracks near top position', () => {
      const { result } = renderHook(() =>
        useMessageWindow({ initialMessages: createMessages(50) })
      );

      // Initially at bottom
      expect(result.current.isNearBottom).toBe(true);
      expect(result.current.isNearTop).toBe(false);
    });

    it('tracks near bottom position', () => {
      const { result } = renderHook(() =>
        useMessageWindow({ initialMessages: createMessages(50) })
      );

      expect(result.current.isNearBottom).toBe(true);
    });
  });

  describe('Memory Leak Prevention', () => {
    it('cleans up on unmount', () => {
      const { unmount } = renderHook(() =>
        useMessageWindow({ initialMessages: createMessages(100) })
      );

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });

    it('prevents updates after unmount', async () => {
      const onLoadOlder = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(createMessages(10)), 100))
      );

      const { result, unmount } = renderHook(() =>
        useMessageWindow({
          initialMessages: createMessages(10, 10),
          onLoadOlder,
        })
      );

      // Start async operation
      act(() => {
        result.current.loadOlderMessages();
      });

      // Unmount before completion
      unmount();

      // Should not cause errors
      await new Promise(resolve => setTimeout(resolve, 150));
    });
  });
});
