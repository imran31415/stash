/**
 * Global callback registry for streaming controls
 * This allows chart components to call callbacks even when they're rendered from serialized message data
 */

type StreamingCallback = (streaming: boolean) => void;

class StreamingCallbackRegistry {
  private callbacks = new Map<string, StreamingCallback>();

  register(id: string, callback: StreamingCallback): () => void {
    this.callbacks.set(id, callback);

    // Return unregister function
    return () => {
      this.callbacks.delete(id);
    };
  }

  get(id: string): StreamingCallback | undefined {
    return this.callbacks.get(id);
  }

  call(id: string, streaming: boolean): boolean {
    const callback = this.callbacks.get(id);
    if (callback) {
      callback(streaming);
      return true;
    }
    return false;
  }

  has(id: string): boolean {
    return this.callbacks.has(id);
  }
}

// Singleton instance
export const streamingCallbackRegistry = new StreamingCallbackRegistry();
