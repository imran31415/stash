# Chat Pagination Usage Guide

## Overview

The chat component now supports **sliding window pagination** for handling large message histories (100k+ messages) efficiently.

## Key Features

✅ **Memory Efficient**: Keeps only 200 messages in memory by default
✅ **Bi-directional Loading**: Load older messages (scroll up) and newer messages (scroll down)
✅ **Automatic Memory Release**: Removes messages outside the window
✅ **WebSocket Compatible**: Handles real-time messages while paginating
✅ **Optimized Rendering**: Uses FlatList optimizations for smooth scrolling

---

## Quick Start

### 1. Basic Usage

```typescript
import { ChatWithPagination } from './components/Chat/ChatWithPagination';

function MyChat() {
  const handleLoadBefore = async (chatId: string, beforeId: string, limit: number) => {
    const response = await fetch(
      `/api/chats/${chatId}/messages?before=${beforeId}&limit=${limit}`
    );
    return response.json();
  };

  const handleLoadAfter = async (chatId: string, afterId: string, limit: number) => {
    const response = await fetch(
      `/api/chats/${chatId}/messages?after=${afterId}&limit=${limit}`
    );
    return response.json();
  };

  const handleLoadInitial = async (chatId: string, limit: number) => {
    const response = await fetch(
      `/api/chats/${chatId}/messages?limit=${limit}`
    );
    return response.json();
  };

  return (
    <ChatWithPagination
      userId="user123"
      chatType="group"
      chatId="chat456"
      windowSize={200}
      loadMoreThreshold={20}
      onLoadMessagesBefore={handleLoadBefore}
      onLoadMessagesAfter={handleLoadAfter}
      onLoadInitialMessages={handleLoadInitial}
      onSendMessage={(msg) => console.log('Sent:', msg)}
      enableWebSocket={true}
      wsConfig={{ ... }}
    />
  );
}
```

---

## Configuration Options

### Window Size

Controls how many messages are kept in memory:

```typescript
<ChatWithPagination
  windowSize={200}  // Keep 200 messages in memory
/>
```

**Recommendations:**
- Small devices: 100-150 messages
- Large devices/tablets: 200-300 messages
- Desktop/web: 300-500 messages

### Load More Threshold

Controls when to trigger pagination (distance from edge):

```typescript
<ChatWithPagination
  loadMoreThreshold={20}  // Load when within 20 messages of edge
/>
```

**Recommendations:**
- Fast networks: 10-20 messages
- Slow networks: 30-50 messages

---

## API Implementation

### Backend Requirements

Your backend must support cursor-based pagination with these endpoints:

#### 1. Load Messages Before (Older)

```
GET /api/chats/:chatId/messages?before=<messageId>&limit=100
```

**SQL Query:**
```sql
SELECT * FROM messages
WHERE chat_id = ? AND id < ?
ORDER BY created_at DESC
LIMIT ?;
```

**Response:**
```json
{
  "messages": [
    {
      "id": "msg_100",
      "content": "Message 100",
      "timestamp": "2025-01-15T10:00:00Z",
      ...
    },
    ...
  ]
}
```

#### 2. Load Messages After (Newer)

```
GET /api/chats/:chatId/messages?after=<messageId>&limit=100
```

**SQL Query:**
```sql
SELECT * FROM messages
WHERE chat_id = ? AND id > ?
ORDER BY created_at ASC
LIMIT ?;
```

#### 3. Load Initial Messages (Most Recent)

```
GET /api/chats/:chatId/messages?limit=100
```

**SQL Query:**
```sql
SELECT * FROM messages
WHERE chat_id = ?
ORDER BY created_at DESC
LIMIT ?;
```

**Response:**
```json
{
  "messages": [...],
  "totalCount": 15420
}
```

---

## Hook Usage (Advanced)

You can use the `useMessageWindow` hook directly for custom implementations:

```typescript
import { useMessageWindow } from './components/Chat/hooks/useMessageWindow';

function CustomChat() {
  const {
    messages,
    pagination,
    loadOlderMessages,
    loadNewerMessages,
    addMessage,
    updateMessage,
  } = useMessageWindow({
    windowSize: 200,
    loadMoreThreshold: 20,
    onLoadOlder: async (beforeId, limit) => {
      // Fetch older messages
      const response = await fetch(`/api/messages?before=${beforeId}&limit=${limit}`);
      return response.json();
    },
    onLoadNewer: async (afterId, limit) => {
      // Fetch newer messages
      const response = await fetch(`/api/messages?after=${afterId}&limit=${limit}`);
      return response.json();
    },
  });

  // Render your custom UI
  return (
    <View>
      {pagination.isLoadingOlder && <ActivityIndicator />}

      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {pagination.isLoadingNewer && <ActivityIndicator />}

      <Button
        title="Load More"
        onPress={loadOlderMessages}
        disabled={!pagination.hasMoreOlder}
      />
    </View>
  );
}
```

### Hook API

#### Properties

```typescript
interface UseMessageWindowReturn {
  // State
  messages: Message[];
  pagination: PaginationState;
  isNearTop: boolean;
  isNearBottom: boolean;

  // Methods
  loadOlderMessages: () => Promise<void>;
  loadNewerMessages: () => Promise<void>;
  addMessage: (message: Message) => void;
  addMessages: (messages: Message[]) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  removeMessage: (messageId: string) => void;
  clearMessages: () => void;
}
```

#### Pagination State

```typescript
interface PaginationState {
  windowSize: number;
  loadMoreThreshold: number;
  oldestMessageId: string | null;
  newestMessageId: string | null;
  hasMoreOlder: boolean;
  hasMoreNewer: boolean;
  isLoadingOlder: boolean;
  isLoadingNewer: boolean;
  totalMessageCount: number;
  currentWindowStart: number;
  currentWindowEnd: number;
}
```

---

## WebSocket Integration

The pagination system works seamlessly with WebSocket:

```typescript
useEffect(() => {
  const ws = new WebSocket('ws://localhost:3000');

  ws.onmessage = (event) => {
    const newMessage = JSON.parse(event.data);

    // Add message to window (automatically handles trimming)
    addMessage(newMessage);
  };

  return () => ws.close();
}, []);
```

**Behavior:**
- New messages are added to the end of the window
- If window size is exceeded, oldest messages are removed
- `hasMoreOlder` flag is automatically set to `true`
- User can scroll up to load removed messages

---

## Performance Optimizations

### FlatList Configuration

The component uses optimized FlatList settings:

```typescript
<FlatList
  removeClippedSubviews={true}    // Unmount off-screen items
  maxToRenderPerBatch={10}        // Render 10 items per batch
  initialNumToRender={20}         // Initial render count
  windowSize={21}                 // Render 10 above/below viewport
  scrollEventThrottle={400}       // Throttle scroll events
/>
```

### Memoization

Message components should be memoized:

```typescript
const MemoizedChatMessage = React.memo(ChatMessage, (prev, next) => {
  return (
    prev.message.id === next.message.id &&
    prev.message.status === next.message.status
  );
});
```

---

## Migration from Old Chat Component

### Before (Unlimited Messages)

```typescript
<Chat
  userId="user123"
  chatType="group"
  messages={allMessages}  // All messages in memory
  onSendMessage={handleSend}
  onLoadMore={loadMore}   // Just appends to array
/>
```

### After (Sliding Window)

```typescript
<ChatWithPagination
  userId="user123"
  chatType="group"
  chatId="chat456"
  windowSize={200}
  onLoadMessagesBefore={async (chatId, beforeId, limit) => {
    const response = await fetch(
      `/api/chats/${chatId}/messages?before=${beforeId}&limit=${limit}`
    );
    return response.json();
  }}
  onLoadMessagesAfter={async (chatId, afterId, limit) => {
    const response = await fetch(
      `/api/chats/${chatId}/messages?after=${afterId}&limit=${limit}`
    );
    return response.json();
  }}
  onLoadInitialMessages={async (chatId, limit) => {
    const response = await fetch(
      `/api/chats/${chatId}/messages?limit=${limit}`
    );
    return response.json();
  }}
  onSendMessage={handleSend}
  enableWebSocket={true}
  wsConfig={{ ... }}
/>
```

---

## Testing

### Test Scenarios

1. **Load Initial Messages**
   - Should load most recent N messages
   - Should set `hasMoreOlder` to true

2. **Scroll Up (Load Older)**
   - Should trigger when within threshold
   - Should prepend older messages
   - Should trim newer messages if window exceeded

3. **Scroll Down (Load Newer)**
   - Should trigger when within threshold
   - Should append newer messages
   - Should trim older messages if window exceeded

4. **Real-time Messages**
   - Should add new messages to end
   - Should trim old messages if window exceeded
   - Should maintain scroll position

5. **Memory Release**
   - Should not hold references to trimmed messages
   - Should allow garbage collection

### Example Test

```typescript
describe('useMessageWindow', () => {
  it('should load older messages and trim newer ones', async () => {
    const { result } = renderHook(() => useMessageWindow({
      windowSize: 100,
      onLoadOlder: async () => generateMessages(100),
    }));

    // Add 100 messages
    act(() => {
      generateMessages(100).forEach(msg => result.current.addMessage(msg));
    });

    expect(result.current.messages.length).toBe(100);

    // Load 100 older messages
    await act(async () => {
      await result.current.loadOlderMessages();
    });

    // Should still have 100 messages (trimmed from end)
    expect(result.current.messages.length).toBe(100);
    expect(result.current.pagination.hasMoreNewer).toBe(true);
  });
});
```

---

## Troubleshooting

### Messages not loading

**Check:**
1. API endpoints return correct data format
2. Message IDs are unique and sequential
3. Network requests are succeeding

### Memory still growing

**Check:**
1. `windowSize` is properly configured
2. `removeClippedSubviews={true}` is set
3. No external references to old messages

### Scroll position jumps

**Check:**
1. Using stable `keyExtractor`
2. Not mutating message objects
3. Loading threshold is appropriate

---

## Best Practices

### 1. Use Stable IDs
```typescript
// Good
keyExtractor={(item) => item.id}

// Bad
keyExtractor={(item, index) => `${index}`}
```

### 2. Optimize Message Components
```typescript
// Memoize to prevent unnecessary re-renders
const ChatMessage = React.memo(({ message }) => {
  return <View>...</View>;
}, (prev, next) => prev.message.id === next.message.id);
```

### 3. Handle Loading States
```typescript
{pagination.isLoadingOlder && (
  <View style={styles.loader}>
    <ActivityIndicator />
    <Text>Loading older messages...</Text>
  </View>
)}
```

### 4. Provide Feedback
```typescript
{!pagination.hasMoreOlder && (
  <Text style={styles.info}>
    You've reached the beginning of the conversation
  </Text>
)}
```

---

## Example: Complete Implementation

See `/example/examples/IntegratedAIHumanChatExample.tsx` for a working example that can be extended with pagination.

To add pagination to the example:

1. Replace `Chat` with `ChatWithPagination`
2. Implement `onLoadMessagesBefore` and `onLoadMessagesAfter`
3. Configure `windowSize` (e.g., 50 for demo)
4. Test scrolling up/down to see pagination in action

---

## Summary

The sliding window pagination system provides:

✅ **Scalability**: Handle millions of messages
✅ **Performance**: 60 FPS scrolling even with large datasets
✅ **Memory Efficiency**: Constant memory usage regardless of history size
✅ **User Experience**: Seamless bi-directional loading
✅ **WebSocket Compatible**: Works with real-time messaging

For questions or issues, refer to `PAGINATION_ANALYSIS.md` for technical details.
