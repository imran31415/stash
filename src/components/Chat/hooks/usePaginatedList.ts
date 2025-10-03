import { useState, useCallback, useRef } from 'react';

export interface PaginatedListState {
  windowSize: number;
  loadMoreThreshold: number;
  oldestItemId: string | null;
  newestItemId: string | null;
  hasMoreOlder: boolean;
  hasMoreNewer: boolean;
  isLoadingOlder: boolean;
  isLoadingNewer: boolean;
  totalItemCount: number;
  currentWindowStart: number;
  currentWindowEnd: number;
}

export interface PaginatedListCallbacks<T> {
  onLoadOlder?: (beforeId: string, limit: number) => Promise<T[]>;
  onLoadNewer?: (afterId: string, limit: number) => Promise<T[]>;
  onLoadInitial?: (limit: number) => Promise<{ items: T[]; totalCount: number }>;
}

export interface UsePaginatedListOptions<T> extends PaginatedListCallbacks<T> {
  windowSize?: number;
  loadMoreThreshold?: number;
  initialItems?: T[];
  getItemId: (item: T) => string;
}

export interface UsePaginatedListReturn<T> {
  items: T[];
  pagination: PaginatedListState;
  loadOlderItems: () => Promise<void>;
  loadNewerItems: () => Promise<void>;
  addItem: (item: T) => void;
  addItems: (items: T[]) => void;
  updateItem: (itemId: string, updates: Partial<T>) => void;
  removeItem: (itemId: string) => void;
  clearItems: () => void;
  refreshItems: () => Promise<void>;
}

/**
 * Generic hook for managing paginated lists with sliding window
 *
 * Similar to useMessageWindow but works with any type of item
 *
 * @example
 * const { items, loadOlderItems } = usePaginatedList({
 *   windowSize: 50,
 *   getItemId: (chat) => chat.id,
 *   onLoadOlder: async (beforeId, limit) => {
 *     const response = await fetch(`/api/chats?before=${beforeId}&limit=${limit}`);
 *     return response.json();
 *   }
 * });
 */
export function usePaginatedList<T>(
  options: UsePaginatedListOptions<T>
): UsePaginatedListReturn<T> {
  const {
    windowSize = 50,
    loadMoreThreshold = 10,
    initialItems,
    getItemId,
    onLoadOlder,
    onLoadNewer,
    onLoadInitial,
  } = options;

  const safeInitialItems = initialItems || [];

  const [items, setItems] = useState<T[]>(safeInitialItems);
  const [pagination, setPagination] = useState<PaginatedListState>({
    windowSize,
    loadMoreThreshold,
    oldestItemId: safeInitialItems[0] ? getItemId(safeInitialItems[0]) : null,
    newestItemId: safeInitialItems[safeInitialItems.length - 1] ? getItemId(safeInitialItems[safeInitialItems.length - 1]) : null,
    hasMoreOlder: true,
    hasMoreNewer: false,
    isLoadingOlder: false,
    isLoadingNewer: false,
    totalItemCount: safeInitialItems.length,
    currentWindowStart: 0,
    currentWindowEnd: safeInitialItems.length,
  });

  const isLoadingRef = useRef({ older: false, newer: false });

  /**
   * Load older items (when scrolling to top)
   */
  const loadOlderItems = useCallback(async () => {
    if (!pagination.hasMoreOlder || isLoadingRef.current.older || !onLoadOlder) {
      return;
    }

    const oldestId = pagination.oldestItemId || (items[0] ? getItemId(items[0]) : null);
    if (!oldestId) return;

    isLoadingRef.current.older = true;
    setPagination(prev => ({ ...prev, isLoadingOlder: true }));

    try {
      const olderItems = await onLoadOlder(oldestId, windowSize);

      if (olderItems.length === 0) {
        setPagination(prev => ({
          ...prev,
          isLoadingOlder: false,
          hasMoreOlder: false,
        }));
        isLoadingRef.current.older = false;
        return;
      }

      setItems(prev => {
        const combined = [...olderItems, ...prev];
        const shouldTrim = combined.length > windowSize;
        const trimmed = shouldTrim ? combined.slice(0, windowSize) : combined;
        return trimmed;
      });

      setPagination(prev => ({
        ...prev,
        isLoadingOlder: false,
        oldestItemId: getItemId(olderItems[0]),
        hasMoreOlder: olderItems.length === windowSize,
        hasMoreNewer: prev.hasMoreNewer || (olderItems.length + items.length > windowSize),
        currentWindowStart: Math.max(0, prev.currentWindowStart - olderItems.length),
      }));
    } catch (error) {
      console.error('[usePaginatedList] Error loading older items:', error);
      setPagination(prev => ({ ...prev, isLoadingOlder: false }));
    } finally {
      isLoadingRef.current.older = false;
    }
  }, [pagination, items, onLoadOlder, windowSize, getItemId]);

  /**
   * Load newer items (when scrolling to bottom)
   */
  const loadNewerItems = useCallback(async () => {
    if (!pagination.hasMoreNewer || isLoadingRef.current.newer || !onLoadNewer) {
      return;
    }

    const newestId = pagination.newestItemId || (items[items.length - 1] ? getItemId(items[items.length - 1]) : null);
    if (!newestId) return;

    isLoadingRef.current.newer = true;
    setPagination(prev => ({ ...prev, isLoadingNewer: true }));

    try {
      const newerItems = await onLoadNewer(newestId, windowSize);

      if (newerItems.length === 0) {
        setPagination(prev => ({
          ...prev,
          isLoadingNewer: false,
          hasMoreNewer: false,
        }));
        isLoadingRef.current.newer = false;
        return;
      }

      setItems(prev => {
        const combined = [...prev, ...newerItems];
        const shouldTrim = combined.length > windowSize;
        const startIndex = shouldTrim ? combined.length - windowSize : 0;
        const trimmed = combined.slice(startIndex);
        return trimmed;
      });

      setPagination(prev => ({
        ...prev,
        isLoadingNewer: false,
        newestItemId: getItemId(newerItems[newerItems.length - 1]),
        hasMoreNewer: newerItems.length === windowSize,
        hasMoreOlder: prev.hasMoreOlder || (items.length + newerItems.length > windowSize),
        currentWindowEnd: prev.currentWindowEnd + newerItems.length,
      }));
    } catch (error) {
      console.error('[usePaginatedList] Error loading newer items:', error);
      setPagination(prev => ({ ...prev, isLoadingNewer: false }));
    } finally {
      isLoadingRef.current.newer = false;
    }
  }, [pagination, items, onLoadNewer, windowSize, getItemId]);

  /**
   * Add a single item
   */
  const addItem = useCallback((newItem: T) => {
    setItems(prev => {
      const itemId = getItemId(newItem);
      if (prev.some(item => getItemId(item) === itemId)) {
        return prev;
      }

      const updated = [...prev, newItem];

      if (updated.length > windowSize) {
        const trimmed = updated.slice(updated.length - windowSize);
        setPagination(p => ({
          ...p,
          hasMoreOlder: true,
          oldestItemId: getItemId(trimmed[0]),
          newestItemId: itemId,
        }));
        return trimmed;
      }

      setPagination(p => ({
        ...p,
        newestItemId: itemId,
      }));

      return updated;
    });
  }, [windowSize, getItemId]);

  /**
   * Add multiple items
   */
  const addItems = useCallback((newItems: T[]) => {
    if (newItems.length === 0) return;

    setItems(prev => {
      const uniqueNew = newItems.filter(
        newItem => !prev.some(item => getItemId(item) === getItemId(newItem))
      );

      if (uniqueNew.length === 0) return prev;

      const updated = [...prev, ...uniqueNew];

      if (updated.length > windowSize) {
        const trimmed = updated.slice(updated.length - windowSize);
        setPagination(p => ({
          ...p,
          hasMoreOlder: true,
          oldestItemId: getItemId(trimmed[0]),
          newestItemId: getItemId(trimmed[trimmed.length - 1]),
        }));
        return trimmed;
      }

      setPagination(p => ({
        ...p,
        newestItemId: getItemId(updated[updated.length - 1]),
      }));

      return updated;
    });
  }, [windowSize, getItemId]);

  /**
   * Update an existing item
   */
  const updateItem = useCallback((itemId: string, updates: Partial<T>) => {
    setItems(prev =>
      prev.map(item =>
        getItemId(item) === itemId ? { ...item, ...updates } : item
      )
    );
  }, [getItemId]);

  /**
   * Remove an item
   */
  const removeItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => getItemId(item) !== itemId));
  }, [getItemId]);

  /**
   * Clear all items
   */
  const clearItems = useCallback(() => {
    setItems([]);
    setPagination(prev => ({
      ...prev,
      oldestItemId: null,
      newestItemId: null,
      hasMoreOlder: true,
      hasMoreNewer: false,
      currentWindowStart: 0,
      currentWindowEnd: 0,
    }));
  }, []);

  /**
   * Refresh items (reload initial)
   */
  const refreshItems = useCallback(async () => {
    if (!onLoadInitial) return;

    setPagination(prev => ({ ...prev, isLoadingOlder: true }));

    try {
      const { items: freshItems, totalCount } = await onLoadInitial(windowSize);
      setItems(freshItems);
      setPagination(prev => ({
        ...prev,
        isLoadingOlder: false,
        oldestItemId: freshItems[0] ? getItemId(freshItems[0]) : null,
        newestItemId: freshItems[freshItems.length - 1] ? getItemId(freshItems[freshItems.length - 1]) : null,
        hasMoreOlder: freshItems.length >= windowSize,
        hasMoreNewer: false,
        totalItemCount: totalCount,
        currentWindowStart: 0,
        currentWindowEnd: freshItems.length,
      }));
    } catch (error) {
      console.error('[usePaginatedList] Error refreshing items:', error);
      setPagination(prev => ({ ...prev, isLoadingOlder: false }));
    }
  }, [onLoadInitial, windowSize, getItemId]);

  return {
    items,
    pagination,
    loadOlderItems,
    loadNewerItems,
    addItem,
    addItems,
    updateItem,
    removeItem,
    clearItems,
    refreshItems,
  };
}
