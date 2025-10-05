import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePaginatedList } from '../usePaginatedList';

interface TestItem {
  id: string;
  text: string;
}

describe('usePaginatedList', () => {
  const getItemId = (item: TestItem) => item.id;

  const createTestItems = (count: number, startId: number = 0): TestItem[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `item-${startId + i}`,
      text: `Item ${startId + i}`,
    }));
  };

  describe('Initialization', () => {
    it('initializes with empty items', () => {
      const { result } = renderHook(() =>
        usePaginatedList({ getItemId })
      );

      expect(result.current.items).toEqual([]);
      expect(result.current.pagination.hasMoreOlder).toBe(true);
      expect(result.current.pagination.hasMoreNewer).toBe(false);
    });

    it('initializes with initial items', () => {
      const initialItems = createTestItems(5);

      const { result } = renderHook(() =>
        usePaginatedList({ getItemId, initialItems })
      );

      expect(result.current.items).toHaveLength(5);
      expect(result.current.pagination.oldestItemId).toBe('item-0');
      expect(result.current.pagination.newestItemId).toBe('item-4');
    });

    it('respects custom window size', () => {
      const { result } = renderHook(() =>
        usePaginatedList({ getItemId, windowSize: 100 })
      );

      expect(result.current.pagination.windowSize).toBe(100);
    });
  });

  describe('Memory Management - Window Size Enforcement', () => {
    it('trims items when adding beyond window size', () => {
      const windowSize = 10;
      const initialItems = createTestItems(windowSize);

      const { result } = renderHook(() =>
        usePaginatedList({ getItemId, initialItems, windowSize })
      );

      // Add one more item
      act(() => {
        result.current.addItem({ id: 'item-10', text: 'Item 10' });
      });

      // Should keep only windowSize items
      expect(result.current.items).toHaveLength(windowSize);
      // Oldest item should be removed
      expect(result.current.items[0].id).toBe('item-1');
      expect(result.current.items[windowSize - 1].id).toBe('item-10');
    });

    it('trims items when loading older items beyond window', async () => {
      const windowSize = 50;
      const initialItems = createTestItems(30, 30);

      const onLoadOlder = jest.fn().mockResolvedValue(createTestItems(30, 0));

      const { result } = renderHook(() =>
        usePaginatedList({ getItemId, initialItems, windowSize, onLoadOlder })
      );

      await act(async () => {
        await result.current.loadOlderItems();
      });

      // Should trim to window size
      expect(result.current.items).toHaveLength(windowSize);
      expect(result.current.pagination.hasMoreNewer).toBe(true);
    });

    it('handles large batch additions efficiently', () => {
      const windowSize = 50;
      const { result } = renderHook(() =>
        usePaginatedList({ getItemId, windowSize })
      );

      const largeItemSet = createTestItems(200);

      act(() => {
        result.current.addItems(largeItemSet);
      });

      // Should keep only last windowSize items
      expect(result.current.items).toHaveLength(windowSize);
      expect(result.current.items[0].id).toBe('item-150');
      expect(result.current.items[windowSize - 1].id).toBe('item-199');
      expect(result.current.pagination.hasMoreOlder).toBe(true);
    });
  });

  describe('Pagination - Load Older', () => {
    it('loads older items successfully', async () => {
      const initialItems = createTestItems(10, 10);
      const onLoadOlder = jest.fn().mockResolvedValue(createTestItems(10, 0));

      const { result } = renderHook(() =>
        usePaginatedList({ getItemId, initialItems, onLoadOlder, windowSize: 50 })
      );

      await act(async () => {
        await result.current.loadOlderItems();
      });

      expect(onLoadOlder).toHaveBeenCalledWith('item-10', 50);
      expect(result.current.items).toHaveLength(20);
      expect(result.current.items[0].id).toBe('item-0');
    });

    it('prevents concurrent loading of older items', async () => {
      const onLoadOlder = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(createTestItems(10, 0)), 100))
      );

      const { result } = renderHook(() =>
        usePaginatedList({
          getItemId,
          initialItems: createTestItems(10, 10),
          onLoadOlder,
        })
      );

      // Start loading
      act(() => {
        result.current.loadOlderItems();
      });

      expect(result.current.pagination.isLoadingOlder).toBe(true);

      // Try to load again while loading
      await act(async () => {
        await result.current.loadOlderItems();
      });

      // Should only call once
      expect(onLoadOlder).toHaveBeenCalledTimes(1);
    });

    it('sets hasMoreOlder to false when no items returned', async () => {
      const onLoadOlder = jest.fn().mockResolvedValue([]);

      const { result } = renderHook(() =>
        usePaginatedList({
          getItemId,
          initialItems: createTestItems(10),
          onLoadOlder,
        })
      );

      await act(async () => {
        await result.current.loadOlderItems();
      });

      expect(result.current.pagination.hasMoreOlder).toBe(false);
    });

    it('handles load older errors gracefully', async () => {
      const onLoadOlder = jest.fn().mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() =>
        usePaginatedList({
          getItemId,
          initialItems: createTestItems(10),
          onLoadOlder,
        })
      );

      await act(async () => {
        await result.current.loadOlderItems();
      });

      expect(result.current.pagination.isLoadingOlder).toBe(false);
      // Items should remain unchanged
      expect(result.current.items).toHaveLength(10);
    });
  });

  describe('Pagination - Load Newer', () => {
    it('loads newer items successfully', async () => {
      const initialItems = createTestItems(10, 0);
      const onLoadNewer = jest.fn().mockResolvedValue(createTestItems(10, 10));

      const { result } = renderHook(() =>
        usePaginatedList({
          getItemId,
          initialItems,
          onLoadNewer,
          windowSize: 50,
        })
      );

      // Set hasMoreNewer to true
      act(() => {
        result.current.pagination.hasMoreNewer = true;
      });

      await act(async () => {
        await result.current.loadNewerItems();
      });

      expect(onLoadNewer).toHaveBeenCalledWith('item-9', 50);
      expect(result.current.items).toHaveLength(20);
      expect(result.current.items[result.current.items.length - 1].id).toBe('item-19');
    });

    it('prevents concurrent loading of newer items', async () => {
      const onLoadNewer = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(createTestItems(10, 10)), 100))
      );

      const { result } = renderHook(() =>
        usePaginatedList({
          getItemId,
          initialItems: createTestItems(10, 0),
          onLoadNewer,
        })
      );

      // Set hasMoreNewer to enable loading
      act(() => {
        result.current.pagination.hasMoreNewer = true;
      });

      // Start loading
      act(() => {
        result.current.loadNewerItems();
      });

      // Try to load again while loading
      await act(async () => {
        await result.current.loadNewerItems();
      });

      // Should only call once
      expect(onLoadNewer).toHaveBeenCalledTimes(1);
    });
  });

  describe('Item Operations', () => {
    it('adds a single item', () => {
      const { result } = renderHook(() =>
        usePaginatedList({ getItemId })
      );

      act(() => {
        result.current.addItem({ id: 'item-1', text: 'Item 1' });
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].id).toBe('item-1');
    });

    it('prevents duplicate items when adding', () => {
      const initialItems = createTestItems(5);

      const { result } = renderHook(() =>
        usePaginatedList({ getItemId, initialItems })
      );

      act(() => {
        result.current.addItem({ id: 'item-0', text: 'Duplicate' });
      });

      expect(result.current.items).toHaveLength(5);
    });

    it('updates an existing item', () => {
      const initialItems = createTestItems(5);

      const { result } = renderHook(() =>
        usePaginatedList({ getItemId, initialItems })
      );

      act(() => {
        result.current.updateItem('item-2', { text: 'Updated Item 2' });
      });

      const updatedItem = result.current.items.find(i => i.id === 'item-2');
      expect(updatedItem?.text).toBe('Updated Item 2');
    });

    it('removes an item', () => {
      const initialItems = createTestItems(5);

      const { result } = renderHook(() =>
        usePaginatedList({ getItemId, initialItems })
      );

      act(() => {
        result.current.removeItem('item-2');
      });

      expect(result.current.items).toHaveLength(4);
      expect(result.current.items.find(i => i.id === 'item-2')).toBeUndefined();
    });

    it('clears all items', () => {
      const initialItems = createTestItems(5);

      const { result } = renderHook(() =>
        usePaginatedList({ getItemId, initialItems })
      );

      act(() => {
        result.current.clearItems();
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.pagination.oldestItemId).toBeNull();
      expect(result.current.pagination.newestItemId).toBeNull();
    });
  });

  describe('Performance - Large Datasets', () => {
    it('handles 1000 item additions efficiently', () => {
      const windowSize = 100;
      const { result } = renderHook(() =>
        usePaginatedList({ getItemId, windowSize })
      );

      const startTime = performance.now();

      act(() => {
        const items = createTestItems(1000);
        result.current.addItems(items);
      });

      const endTime = performance.now();

      // Should complete in reasonable time (< 100ms)
      expect(endTime - startTime).toBeLessThan(100);

      // Should maintain window size
      expect(result.current.items).toHaveLength(windowSize);
    });

    it('maintains performance with repeated operations', () => {
      const windowSize = 50;
      const { result } = renderHook(() =>
        usePaginatedList({ getItemId, windowSize })
      );

      const startTime = performance.now();

      act(() => {
        // Simulate 100 message additions
        for (let i = 0; i < 100; i++) {
          result.current.addItem({ id: `item-${i}`, text: `Item ${i}` });
        }
      });

      const endTime = performance.now();

      // Should complete quickly even with many operations
      expect(endTime - startTime).toBeLessThan(200);
      expect(result.current.items).toHaveLength(windowSize);
    });
  });

  describe('Refresh', () => {
    it('refreshes items with initial load', async () => {
      const onLoadInitial = jest.fn().mockResolvedValue({
        items: createTestItems(20),
        totalCount: 100,
      });

      const { result } = renderHook(() =>
        usePaginatedList({
          getItemId,
          initialItems: createTestItems(5, 50),
          onLoadInitial,
        })
      );

      await act(async () => {
        await result.current.refreshItems();
      });

      expect(onLoadInitial).toHaveBeenCalled();
      expect(result.current.items).toHaveLength(20);
      expect(result.current.pagination.totalItemCount).toBe(100);
      expect(result.current.items[0].id).toBe('item-0');
    });
  });
});
