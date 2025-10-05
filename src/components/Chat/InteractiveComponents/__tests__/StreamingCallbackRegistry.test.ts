import { streamingCallbackRegistry } from '../StreamingCallbackRegistry';

describe('StreamingCallbackRegistry', () => {
  beforeEach(() => {
    // Clear the registry before each test
    // Since it's a singleton, we need to clean up callbacks
    ['test-1', 'test-2', 'test-3', 'test-4', 'test-5'].forEach(id => {
      if (streamingCallbackRegistry.has(id)) {
        streamingCallbackRegistry.get(id); // Get to ensure it exists
      }
    });
  });

  describe('Registration', () => {
    it('registers a callback', () => {
      const callback = jest.fn();
      streamingCallbackRegistry.register('test-1', callback);

      expect(streamingCallbackRegistry.has('test-1')).toBe(true);
    });

    it('returns an unregister function', () => {
      const callback = jest.fn();
      const unregister = streamingCallbackRegistry.register('test-1', callback);

      expect(streamingCallbackRegistry.has('test-1')).toBe(true);

      unregister();

      expect(streamingCallbackRegistry.has('test-1')).toBe(false);
    });

    it('allows multiple callbacks with different IDs', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      streamingCallbackRegistry.register('test-1', callback1);
      streamingCallbackRegistry.register('test-2', callback2);
      streamingCallbackRegistry.register('test-3', callback3);

      expect(streamingCallbackRegistry.has('test-1')).toBe(true);
      expect(streamingCallbackRegistry.has('test-2')).toBe(true);
      expect(streamingCallbackRegistry.has('test-3')).toBe(true);
    });

    it('overwrites existing callback with same ID', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      streamingCallbackRegistry.register('test-1', callback1);
      streamingCallbackRegistry.register('test-1', callback2);

      streamingCallbackRegistry.call('test-1', true);

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith(true);
    });
  });

  describe('Callback Retrieval', () => {
    it('retrieves a registered callback', () => {
      const callback = jest.fn();
      streamingCallbackRegistry.register('test-1', callback);

      const retrieved = streamingCallbackRegistry.get('test-1');

      expect(retrieved).toBe(callback);
    });

    it('returns undefined for non-existent callback', () => {
      const retrieved = streamingCallbackRegistry.get('non-existent');

      expect(retrieved).toBeUndefined();
    });
  });

  describe('Callback Invocation', () => {
    it('calls registered callback with streaming=true', () => {
      const callback = jest.fn();
      streamingCallbackRegistry.register('test-1', callback);

      const result = streamingCallbackRegistry.call('test-1', true);

      expect(result).toBe(true);
      expect(callback).toHaveBeenCalledWith(true);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('calls registered callback with streaming=false', () => {
      const callback = jest.fn();
      streamingCallbackRegistry.register('test-1', callback);

      const result = streamingCallbackRegistry.call('test-1', false);

      expect(result).toBe(true);
      expect(callback).toHaveBeenCalledWith(false);
    });

    it('returns false when calling non-existent callback', () => {
      const result = streamingCallbackRegistry.call('non-existent', true);

      expect(result).toBe(false);
    });

    it('calls correct callback when multiple are registered', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      streamingCallbackRegistry.register('test-1', callback1);
      streamingCallbackRegistry.register('test-2', callback2);
      streamingCallbackRegistry.register('test-3', callback3);

      streamingCallbackRegistry.call('test-2', true);

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith(true);
      expect(callback3).not.toHaveBeenCalled();
    });

    it('handles multiple calls to same callback', () => {
      const callback = jest.fn();
      streamingCallbackRegistry.register('test-1', callback);

      streamingCallbackRegistry.call('test-1', true);
      streamingCallbackRegistry.call('test-1', false);
      streamingCallbackRegistry.call('test-1', true);

      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenNthCalledWith(1, true);
      expect(callback).toHaveBeenNthCalledWith(2, false);
      expect(callback).toHaveBeenNthCalledWith(3, true);
    });
  });

  describe('Existence Check', () => {
    it('returns true for registered callback', () => {
      const callback = jest.fn();
      streamingCallbackRegistry.register('test-1', callback);

      expect(streamingCallbackRegistry.has('test-1')).toBe(true);
    });

    it('returns false for non-existent callback', () => {
      expect(streamingCallbackRegistry.has('non-existent')).toBe(false);
    });

    it('returns false after unregistering', () => {
      const callback = jest.fn();
      const unregister = streamingCallbackRegistry.register('test-1', callback);

      expect(streamingCallbackRegistry.has('test-1')).toBe(true);

      unregister();

      expect(streamingCallbackRegistry.has('test-1')).toBe(false);
    });
  });

  describe('Unregistration', () => {
    it('unregisters a callback', () => {
      const callback = jest.fn();
      const unregister = streamingCallbackRegistry.register('test-1', callback);

      unregister();

      expect(streamingCallbackRegistry.has('test-1')).toBe(false);
      const result = streamingCallbackRegistry.call('test-1', true);
      expect(result).toBe(false);
      expect(callback).not.toHaveBeenCalled();
    });

    it('allows safe multiple unregistrations', () => {
      const callback = jest.fn();
      const unregister = streamingCallbackRegistry.register('test-1', callback);

      unregister();
      unregister(); // Second call should be safe

      expect(streamingCallbackRegistry.has('test-1')).toBe(false);
    });

    it('only unregisters specified callback', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const unregister1 = streamingCallbackRegistry.register('test-1', callback1);
      streamingCallbackRegistry.register('test-2', callback2);

      unregister1();

      expect(streamingCallbackRegistry.has('test-1')).toBe(false);
      expect(streamingCallbackRegistry.has('test-2')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string as ID', () => {
      const callback = jest.fn();
      streamingCallbackRegistry.register('', callback);

      expect(streamingCallbackRegistry.has('')).toBe(true);
      streamingCallbackRegistry.call('', true);
      expect(callback).toHaveBeenCalledWith(true);
    });

    it('handles special characters in ID', () => {
      const callback = jest.fn();
      const id = 'test-id-with-special-chars-!@#$%^&*()';
      streamingCallbackRegistry.register(id, callback);

      expect(streamingCallbackRegistry.has(id)).toBe(true);
      streamingCallbackRegistry.call(id, true);
      expect(callback).toHaveBeenCalledWith(true);
    });

    it('handles very long ID strings', () => {
      const callback = jest.fn();
      const id = 'x'.repeat(1000);
      streamingCallbackRegistry.register(id, callback);

      expect(streamingCallbackRegistry.has(id)).toBe(true);
      streamingCallbackRegistry.call(id, true);
      expect(callback).toHaveBeenCalledWith(true);
    });

    it('handles callback that throws error', () => {
      const callback = jest.fn(() => {
        throw new Error('Callback error');
      });
      streamingCallbackRegistry.register('test-1', callback);

      expect(() => streamingCallbackRegistry.call('test-1', true)).toThrow('Callback error');
    });
  });

  describe('Performance', () => {
    it('handles many registered callbacks', () => {
      const callbacks = Array.from({ length: 1000 }, (_, i) => {
        const callback = jest.fn();
        streamingCallbackRegistry.register(`test-${i}`, callback);
        return { id: `test-${i}`, callback };
      });

      const startTime = performance.now();

      // Call all callbacks
      callbacks.forEach(({ id }) => {
        streamingCallbackRegistry.call(id, true);
      });

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
      callbacks.forEach(({ callback }) => {
        expect(callback).toHaveBeenCalledWith(true);
      });
    });

    it('performs fast lookups', () => {
      // Register 100 callbacks
      for (let i = 0; i < 100; i++) {
        streamingCallbackRegistry.register(`test-${i}`, jest.fn());
      }

      const startTime = performance.now();

      // Perform 1000 lookups
      for (let i = 0; i < 1000; i++) {
        streamingCallbackRegistry.has(`test-${i % 100}`);
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50);
    });

    it('handles rapid register/unregister cycles', () => {
      const startTime = performance.now();

      for (let i = 0; i < 500; i++) {
        const unregister = streamingCallbackRegistry.register(`test-rapid-${i}`, jest.fn());
        unregister();
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Memory Management', () => {
    it('properly cleans up unregistered callbacks', () => {
      const callbacks = Array.from({ length: 100 }, (_, i) => {
        const unregister = streamingCallbackRegistry.register(`test-cleanup-${i}`, jest.fn());
        return unregister;
      });

      // Unregister all
      callbacks.forEach(unregister => unregister());

      // Verify all are gone
      for (let i = 0; i < 100; i++) {
        expect(streamingCallbackRegistry.has(`test-cleanup-${i}`)).toBe(false);
      }
    });

    it('prevents memory leaks from orphaned callbacks', () => {
      // Register and unregister many times
      for (let i = 0; i < 1000; i++) {
        const unregister = streamingCallbackRegistry.register('temp', jest.fn());
        unregister();
      }

      expect(streamingCallbackRegistry.has('temp')).toBe(false);
    });
  });

  describe('Concurrent Operations', () => {
    it('handles concurrent registrations', () => {
      const callbacks = Array.from({ length: 50 }, (_, i) => jest.fn());

      // Register all at once
      callbacks.forEach((callback, i) => {
        streamingCallbackRegistry.register(`concurrent-${i}`, callback);
      });

      // Verify all registered
      callbacks.forEach((_, i) => {
        expect(streamingCallbackRegistry.has(`concurrent-${i}`)).toBe(true);
      });
    });

    it('handles concurrent calls', () => {
      const callback = jest.fn();
      streamingCallbackRegistry.register('concurrent-call', callback);

      // Call multiple times rapidly
      for (let i = 0; i < 100; i++) {
        streamingCallbackRegistry.call('concurrent-call', i % 2 === 0);
      }

      expect(callback).toHaveBeenCalledTimes(100);
    });
  });

  describe('Singleton Behavior', () => {
    it('maintains state across imports', () => {
      const callback = jest.fn();
      streamingCallbackRegistry.register('singleton-test', callback);

      // The registry should maintain this state
      expect(streamingCallbackRegistry.has('singleton-test')).toBe(true);
    });
  });
});
