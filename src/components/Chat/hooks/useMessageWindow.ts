import { useState, useCallback, useRef } from 'react';
import type { Message } from '../types';

export interface PaginationState {
  // Window configuration
  windowSize: number;
  loadMoreThreshold: number;

  // Cursors for pagination
  oldestMessageId: string | null;
  newestMessageId: string | null;

  // Flags
  hasMoreOlder: boolean;
  hasMoreNewer: boolean;
  isLoadingOlder: boolean;
  isLoadingNewer: boolean;

  // Statistics
  totalMessageCount: number;
  currentWindowStart: number;
  currentWindowEnd: number;
}

export interface MessageWindowCallbacks {
  onLoadOlder?: (beforeId: string, limit: number) => Promise<Message[]>;
  onLoadNewer?: (afterId: string, limit: number) => Promise<Message[]>;
  onInitialLoad?: (limit: number) => Promise<{ messages: Message[]; totalCount: number }>;
}

export interface UseMessageWindowOptions extends MessageWindowCallbacks {
  windowSize?: number;
  loadMoreThreshold?: number;
  initialMessages?: Message[];
}

export interface UseMessageWindowReturn {
  messages: Message[];
  pagination: PaginationState;
  loadOlderMessages: () => Promise<void>;
  loadNewerMessages: () => Promise<void>;
  addMessage: (message: Message) => void;
  addMessages: (messages: Message[]) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  removeMessage: (messageId: string) => void;
  clearMessages: () => void;
  isNearTop: boolean;
  isNearBottom: boolean;
}

/**
 * Hook for managing a sliding window of messages with bi-directional pagination
 *
 * Features:
 * - Keeps only N messages in memory (windowSize)
 * - Loads older messages when scrolling up
 * - Loads newer messages when scrolling down
 * - Automatically releases messages outside the window
 * - Handles real-time message additions
 *
 * @example
 * const { messages, loadOlderMessages, addMessage } = useMessageWindow({
 *   windowSize: 200,
 *   onLoadOlder: async (beforeId, limit) => {
 *     const response = await fetch(`/api/messages?before=${beforeId}&limit=${limit}`);
 *     return response.json();
 *   }
 * });
 */
export function useMessageWindow(options: UseMessageWindowOptions): UseMessageWindowReturn {
  const {
    windowSize = 200,
    loadMoreThreshold = 20,
    initialMessages = [],
    onLoadOlder,
    onLoadNewer,
    onInitialLoad,
  } = options;

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [pagination, setPagination] = useState<PaginationState>({
    windowSize,
    loadMoreThreshold,
    oldestMessageId: initialMessages[0]?.id || null,
    newestMessageId: initialMessages[initialMessages.length - 1]?.id || null,
    hasMoreOlder: true,
    hasMoreNewer: false,
    isLoadingOlder: false,
    isLoadingNewer: false,
    totalMessageCount: initialMessages.length,
    currentWindowStart: 0,
    currentWindowEnd: initialMessages.length,
  });

  // Track scroll position for optimization
  const scrollPositionRef = useRef({ isNearTop: false, isNearBottom: true });

  /**
   * Load older messages (when scrolling up)
   */
  const loadOlderMessages = useCallback(async () => {
    if (!pagination.hasMoreOlder || pagination.isLoadingOlder || !onLoadOlder) {
      return;
    }

    const oldestId = pagination.oldestMessageId || messages[0]?.id;
    if (!oldestId) return;

    setPagination(prev => ({ ...prev, isLoadingOlder: true }));

    try {
      const olderMessages = await onLoadOlder(oldestId, windowSize);

      if (olderMessages.length === 0) {
        setPagination(prev => ({
          ...prev,
          isLoadingOlder: false,
          hasMoreOlder: false,
        }));
        return;
      }

      let trimmedMessages: Message[] = [];
      setMessages(prev => {
        // Combine older messages with current window
        const combined = [...olderMessages, ...prev];

        // If window size exceeded, trim from the end (newer messages)
        const shouldTrim = combined.length > windowSize;
        const trimmed = shouldTrim
          ? combined.slice(0, windowSize)
          : combined;

        console.log('[useMessageWindow] Loaded older messages:', {
          oldCount: prev.length,
          newCount: olderMessages.length,
          combinedCount: combined.length,
          trimmed: shouldTrim,
          finalCount: trimmed.length,
          willHaveMoreNewer: shouldTrim,
        });

        trimmedMessages = trimmed;
        return trimmed;
      });

      setPagination(prev => {
        const combined = olderMessages.length + messages.length;
        const hasMoreNewer = combined > windowSize || prev.hasMoreNewer;

        // Update newestMessageId to reflect the actual newest message in the window
        const newestMessageId = trimmedMessages.length > 0
          ? trimmedMessages[trimmedMessages.length - 1]?.id
          : prev.newestMessageId;

        console.log('[useMessageWindow] Updated pagination after loading older:', {
          hasMoreOlder: olderMessages.length === windowSize,
          hasMoreNewer,
          oldestMessageId: olderMessages[0]?.id,
          newestMessageId,
        });

        return {
          ...prev,
          isLoadingOlder: false,
          oldestMessageId: olderMessages[0]?.id || prev.oldestMessageId,
          newestMessageId,
          hasMoreOlder: olderMessages.length === windowSize,
          hasMoreNewer,
          currentWindowStart: Math.max(0, prev.currentWindowStart - olderMessages.length),
        };
      });
    } catch (error) {
      console.error('[useMessageWindow] Error loading older messages:', error);
      setPagination(prev => ({ ...prev, isLoadingOlder: false }));
    }
  }, [pagination, messages, onLoadOlder, windowSize]);

  /**
   * Load newer messages (when scrolling down)
   */
  const loadNewerMessages = useCallback(async () => {
    if (!pagination.hasMoreNewer || pagination.isLoadingNewer || !onLoadNewer) {
      return;
    }

    const newestId = pagination.newestMessageId || messages[messages.length - 1]?.id;
    if (!newestId) return;

    setPagination(prev => ({ ...prev, isLoadingNewer: true }));

    try {
      const newerMessages = await onLoadNewer(newestId, windowSize);

      if (newerMessages.length === 0) {
        setPagination(prev => ({
          ...prev,
          isLoadingNewer: false,
          hasMoreNewer: false,
        }));
        return;
      }

      let trimmedMessages: Message[] = [];
      setMessages(prev => {
        // Combine current window with newer messages
        const combined = [...prev, ...newerMessages];

        // If window size exceeded, trim from the beginning (older messages)
        const shouldTrim = combined.length > windowSize;
        const startIndex = shouldTrim ? combined.length - windowSize : 0;
        const trimmed = combined.slice(startIndex);

        console.log('[useMessageWindow] Loaded newer messages:', {
          oldCount: prev.length,
          newCount: newerMessages.length,
          combinedCount: combined.length,
          trimmed: shouldTrim,
          finalCount: trimmed.length,
          willHaveMoreOlder: shouldTrim,
        });

        trimmedMessages = trimmed;
        return trimmed;
      });

      setPagination(prev => {
        const combined = messages.length + newerMessages.length;
        const hasMoreOlder = combined > windowSize || prev.hasMoreOlder;

        // Update oldestMessageId to reflect the actual oldest message in the window
        const oldestMessageId = trimmedMessages.length > 0
          ? trimmedMessages[0]?.id
          : prev.oldestMessageId;

        console.log('[useMessageWindow] Updated pagination after loading newer:', {
          hasMoreNewer: newerMessages.length === windowSize,
          hasMoreOlder,
          oldestMessageId,
          newestMessageId: newerMessages[newerMessages.length - 1]?.id,
        });

        return {
          ...prev,
          isLoadingNewer: false,
          oldestMessageId,
          newestMessageId: newerMessages[newerMessages.length - 1]?.id || prev.newestMessageId,
          hasMoreNewer: newerMessages.length === windowSize,
          hasMoreOlder,
          currentWindowEnd: prev.currentWindowEnd + newerMessages.length,
        };
      });
    } catch (error) {
      console.error('[useMessageWindow] Error loading newer messages:', error);
      setPagination(prev => ({ ...prev, isLoadingNewer: false }));
    }
  }, [pagination, messages, onLoadNewer, windowSize]);

  /**
   * Add a single message (typically from WebSocket)
   */
  const addMessage = useCallback((newMessage: Message) => {
    setMessages(prev => {
      // Check for duplicate
      if (prev.some(msg => msg.id === newMessage.id)) {
        return prev;
      }

      const updated = [...prev, newMessage];

      // If window exceeded, trim from the beginning
      if (updated.length > windowSize) {
        const trimmed = updated.slice(updated.length - windowSize);

        setPagination(p => ({
          ...p,
          hasMoreOlder: true,
          oldestMessageId: trimmed[0]?.id || p.oldestMessageId,
          newestMessageId: newMessage.id,
        }));

        return trimmed;
      }

      setPagination(p => ({
        ...p,
        newestMessageId: newMessage.id,
      }));

      return updated;
    });
  }, [windowSize]);

  /**
   * Add multiple messages at once
   */
  const addMessages = useCallback((newMessages: Message[]) => {
    if (newMessages.length === 0) return;

    setMessages(prev => {
      // Filter out duplicates
      const uniqueNew = newMessages.filter(
        newMsg => !prev.some(msg => msg.id === newMsg.id)
      );

      if (uniqueNew.length === 0) return prev;

      const updated = [...prev, ...uniqueNew];

      // If window exceeded, trim from the beginning
      if (updated.length > windowSize) {
        const trimmed = updated.slice(updated.length - windowSize);

        setPagination(p => ({
          ...p,
          hasMoreOlder: true,
          oldestMessageId: trimmed[0]?.id || p.oldestMessageId,
          newestMessageId: trimmed[trimmed.length - 1]?.id || p.newestMessageId,
        }));

        return trimmed;
      }

      setPagination(p => ({
        ...p,
        newestMessageId: updated[updated.length - 1]?.id || p.newestMessageId,
      }));

      return updated;
    });
  }, [windowSize]);

  /**
   * Update an existing message
   */
  const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
    );
  }, []);

  /**
   * Remove a message
   */
  const removeMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setPagination(prev => ({
      ...prev,
      oldestMessageId: null,
      newestMessageId: null,
      hasMoreOlder: true,
      hasMoreNewer: false,
      currentWindowStart: 0,
      currentWindowEnd: 0,
    }));
  }, []);

  return {
    messages,
    pagination,
    loadOlderMessages,
    loadNewerMessages,
    addMessage,
    addMessages,
    updateMessage,
    removeMessage,
    clearMessages,
    isNearTop: scrollPositionRef.current.isNearTop,
    isNearBottom: scrollPositionRef.current.isNearBottom,
  };
}
