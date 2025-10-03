# Chat History Component Guide

## Overview

The **ChatHistory** system provides a paginated, memory-efficient list of chat conversations with responsive layouts:
- **Web**: Sidebar that can be toggled
- **Mobile/iOS**: Full-screen modal that slides up

## Architecture

```
┌─────────────────────────────────────────────────┐
│              ChatLayout (Smart)                  │
│  - Detects screen size                          │
│  - Switches between Sidebar/Modal               │
│  - Manages state and callbacks                  │
└─────────────────────────────────────────────────┘
            │                    │
            │                    │
   ┌────────▼──────────┐  ┌─────▼──────────┐
   │  Sidebar (Web)    │  │  Modal (iOS)   │
   │  - Fixed width    │  │  - Fullscreen  │
   │  - Toggle button  │  │  - Slide up    │
   └────────┬──────────┘  └─────┬──────────┘
            │                    │
            └──────────┬─────────┘
                       │
            ┌──────────▼──────────┐
            │   ChatHistory       │
            │  - Pagination       │
            │  - Search           │
            │  - List rendering   │
            └──────────┬──────────┘
                       │
            ┌──────────▼──────────┐
            │  usePaginatedList   │
            │  - Sliding window   │
            │  - Memory management│
            └─────────────────────┘
```

---

## Quick Start

### Basic Usage

```typescript
import { ChatLayout } from './components/Chat';

function MyApp() {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  return (
    <ChatLayout
      chatHistoryProps={{
        userId: 'user123',
        currentChatId: currentChatId || undefined,
        onChatSelect: (chat) => setCurrentChatId(chat.id),
        onLoadInitial: async (limit) => {
          const response = await fetch(`/api/chats?limit=${limit}`);
          const data = await response.json();
          return { chats: data.chats, totalCount: data.total };
        },
        onLoadBefore: async (beforeId, limit) => {
          const response = await fetch(`/api/chats?before=${beforeId}&limit=${limit}`);
          return response.json();
        },
      }}
      onChatSelect={(chatId) => setCurrentChatId(chatId)}
    >
      {/* Your chat content goes here */}
      {currentChatId ? (
        <Chat chatId={currentChatId} userId="user123" />
      ) : (
        <EmptyState message="Select a chat to start messaging" />
      )}
    </ChatLayout>
  );
}
```

---

## Components

### 1. ChatLayout (Recommended)

The smart wrapper that handles responsive behavior.

```typescript
<ChatLayout
  chatHistoryProps={{
    userId: 'user123',
    currentChatId: currentChatId,
    windowSize: 50,
    onChatSelect: handleChatSelect,
    onLoadInitial: loadChats,
    onLoadBefore: loadOlderChats,
  }}
  sidebarWidth={320}
  mobileBreakpoint={768}
  defaultSidebarVisible={true}
  onChatSelect={(chatId) => console.log('Selected:', chatId)}
  showMenuButton={true}
  menuButtonPosition="floating"
>
  <YourChatComponent />
</ChatLayout>
```

**Props:**
- `chatHistoryProps`: All ChatHistory props
- `sidebarWidth`: Width of sidebar on desktop (default: 320)
- `mobileBreakpoint`: Screen width to switch to mobile (default: 768)
- `defaultSidebarVisible`: Initial sidebar state (default: true)
- `onChatSelect`: Callback when chat is selected
- `showMenuButton`: Show toggle button (default: true)
- `menuButtonPosition`: 'header' | 'floating' (default: 'header')

### 2. ChatHistory (Core Component)

The core list component with pagination.

```typescript
<ChatHistory
  userId="user123"
  currentChatId={currentChatId}
  windowSize={50}
  loadMoreThreshold={10}
  showSearch={true}
  showCreateButton={true}
  onChatSelect={(chat) => console.log('Selected:', chat)}
  onLoadInitial={async (limit) => {
    const res = await fetch(`/api/chats?limit=${limit}`);
    return res.json();
  }}
  onLoadBefore={async (beforeId, limit) => {
    const res = await fetch(`/api/chats?before=${beforeId}&limit=${limit}`);
    return res.json();
  }}
/>
```

**Props:**
- `userId`: Current user ID
- `currentChatId`: Selected chat ID (optional)
- `windowSize`: Number of chats to keep in memory (default: 50)
- `loadMoreThreshold`: Distance from edge to trigger load (default: 10)
- `showSearch`: Show search bar (default: true)
- `showCreateButton`: Show "New Chat" button (default: true)
- `onChatSelect`: Required callback when chat is selected
- `onLoadInitial`: Load initial chats
- `onLoadBefore`: Load older chats (pagination)
- `onLoadAfter`: Load newer chats (pagination)
- `onCreateNewChat`: Callback for "New Chat" button
- `onRefresh`: Callback for pull-to-refresh

### 3. ChatHistorySidebar (Web Only)

Sidebar version for desktop/web.

```typescript
<ChatHistorySidebar
  userId="user123"
  isVisible={sidebarVisible}
  onToggle={() => setSidebarVisible(!sidebarVisible)}
  width={320}
  onChatSelect={handleChatSelect}
  onLoadInitial={loadChats}
/>
```

### 4. ChatHistoryModal (Mobile Only)

Modal version for mobile/iOS.

```typescript
<ChatHistoryModal
  userId="user123"
  isVisible={modalVisible}
  onClose={() => setModalVisible(false)}
  onChatSelect={handleChatSelect}
  onLoadInitial={loadChats}
/>
```

---

## Data Types

### ChatPreview

```typescript
interface ChatPreview {
  id: string;
  title: string;
  lastMessage?: {
    content: string;
    timestamp: Date;
    senderId: string;
    senderName: string;
  };
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  unreadCount: number;
  type: 'direct' | 'group' | 'ai';
  updatedAt: Date;
  createdAt: Date;
  isPinned?: boolean;
  isMuted?: boolean;
  isArchived?: boolean;
  metadata?: Record<string, any>;
}
```

---

## API Requirements

### Backend Endpoints

```typescript
// Load initial chats (most recent)
GET /api/chats?limit=50
Response: {
  chats: ChatPreview[],
  totalCount: number
}

// Load older chats (pagination)
GET /api/chats?before=<chatId>&limit=50
Response: ChatPreview[]

// Load newer chats (pagination)
GET /api/chats?after=<chatId>&limit=50
Response: ChatPreview[]
```

### SQL Queries

```sql
-- Initial load (most recent chats)
SELECT * FROM chats
WHERE user_id = ?
ORDER BY updated_at DESC
LIMIT ?;

-- Load older chats
SELECT * FROM chats
WHERE user_id = ? AND updated_at < (
  SELECT updated_at FROM chats WHERE id = ?
)
ORDER BY updated_at DESC
LIMIT ?;

-- Load newer chats
SELECT * FROM chats
WHERE user_id = ? AND updated_at > (
  SELECT updated_at FROM chats WHERE id = ?
)
ORDER BY updated_at ASC
LIMIT ?;
```

---

## Memory Management

The ChatHistory uses the **sliding window pattern** (same as chat messages):

### Configuration

```typescript
<ChatHistory
  windowSize={50}           // Keep 50 chats in memory
  loadMoreThreshold={10}    // Load when within 10 items of edge
/>
```

### Behavior

1. **Initial Load**: Loads most recent 50 chats
2. **Scroll to Top**: Loads 50 older chats, trims newer ones if window exceeded
3. **Scroll to Bottom**: Loads 50 newer chats, trims older ones if window exceeded
4. **Real-time Updates**: New chats append, old ones auto-trim

### Memory Usage

| Total Chats | Window Size | Memory Usage |
|------------|-------------|--------------|
| 1,000 | 50 | ~50KB |
| 10,000 | 50 | ~50KB |
| 100,000 | 50 | ~50KB |

Memory stays **constant** regardless of total chat count! 🎉

---

## Features

### 1. Search

```typescript
<ChatHistory
  showSearch={true}
  // Searches: title, last message, participant names
/>
```

### 2. Pull to Refresh

```typescript
<ChatHistory
  onRefresh={async () => {
    await refreshChatsFromAPI();
  }}
/>
```

### 3. Create New Chat

```typescript
<ChatHistory
  showCreateButton={true}
  onCreateNewChat={() => {
    navigation.navigate('NewChat');
  }}
/>
```

### 4. Chat Icons

Automatically shows icons based on chat type:
- Direct message: 💬
- Group chat: 👥
- AI chat: 🤖

### 5. Unread Badge

Shows unread count automatically:
- 1-99: Shows number
- 100+: Shows "99+"

### 6. Chat Metadata

Shows status icons:
- 📌 Pinned
- 🔕 Muted
- 📦 Archived

---

## Responsive Behavior

### Desktop/Web (≥768px)

- Sidebar on left side
- Toggle button to collapse/expand
- Chat content stays visible when sidebar is open
- Sidebar has fixed width (default: 320px)

### Mobile/Tablet (<768px)

- Full-screen modal
- Slides up from bottom
- Automatically closes when chat is selected
- Menu button to open

### Breakpoint Customization

```typescript
<ChatLayout
  mobileBreakpoint={1024}  // Use mobile layout below 1024px
/>
```

---

## Customization

### Custom Chat Item Renderer

```typescript
<ChatHistory
  renderChatItem={(chat, isSelected) => (
    <TouchableOpacity
      style={[styles.customItem, isSelected && styles.selected]}
      onPress={() => handleSelect(chat)}
    >
      <Text>{chat.title}</Text>
      <Text>{chat.unreadCount}</Text>
    </TouchableOpacity>
  )}
/>
```

### Custom Empty State

```typescript
<ChatHistory
  emptyStateMessage="You haven't started any conversations yet"
/>
```

### Custom Sidebar Width

```typescript
<ChatLayout
  sidebarWidth={400}  // Wider sidebar
/>
```

### Menu Button Position

```typescript
<ChatLayout
  menuButtonPosition="floating"  // Floating FAB-style button
  // or
  menuButtonPosition="header"    // Top-left corner button
/>
```

---

## Real-time Updates

### WebSocket Integration

```typescript
useEffect(() => {
  const ws = new WebSocket('ws://localhost:3000');

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'new_message') {
      // Update chat in history
      updateChatPreview({
        id: data.chatId,
        lastMessage: {
          content: data.message.content,
          timestamp: new Date(data.message.timestamp),
          senderId: data.message.senderId,
          senderName: data.message.senderName,
        },
        updatedAt: new Date(),
      });
    }
  };

  return () => ws.close();
}, []);
```

---

## Examples

### Example 1: Basic Setup

```typescript
import { ChatLayout, Chat } from './components/Chat';

function MyMessagingApp() {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  return (
    <ChatLayout
      chatHistoryProps={{
        userId: 'user123',
        currentChatId: currentChatId || undefined,
        onChatSelect: (chat) => setCurrentChatId(chat.id),
        onLoadInitial: async (limit) => {
          const res = await fetch(`/api/chats?limit=${limit}`);
          return res.json();
        },
      }}
      onChatSelect={(chatId) => setCurrentChatId(chatId)}
    >
      {currentChatId ? (
        <Chat chatId={currentChatId} userId="user123" />
      ) : (
        <View style={styles.emptyState}>
          <Text>Select a chat to start messaging</Text>
        </View>
      )}
    </ChatLayout>
  );
}
```

### Example 2: With Pagination

```typescript
<ChatLayout
  chatHistoryProps={{
    userId: 'user123',
    windowSize: 30,
    loadMoreThreshold: 5,
    onLoadInitial: async (limit) => {
      const res = await fetch(`/api/chats?limit=${limit}`);
      return res.json();
    },
    onLoadBefore: async (beforeId, limit) => {
      const res = await fetch(`/api/chats?before=${beforeId}&limit=${limit}`);
      return res.json();
    },
    onLoadAfter: async (afterId, limit) => {
      const res = await fetch(`/api/chats?after=${afterId}&limit=${limit}`);
      return res.json();
    },
    onChatSelect: handleChatSelect,
  }}
  onChatSelect={handleChatSelect}
>
  <Chat chatId={currentChatId} />
</ChatLayout>
```

### Example 3: Standalone Sidebar (Advanced)

```typescript
function CustomLayout() {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  return (
    <View style={{ flexDirection: 'row', flex: 1 }}>
      <ChatHistorySidebar
        userId="user123"
        isVisible={sidebarVisible}
        onToggle={() => setSidebarVisible(!sidebarVisible)}
        width={300}
        onChatSelect={handleChatSelect}
        onLoadInitial={loadChats}
      />
      <View style={{ flex: 1 }}>
        <Chat chatId={currentChatId} />
      </View>
    </View>
  );
}
```

---

## Performance Tips

### 1. Optimize Window Size

```typescript
// Mobile: smaller window
<ChatHistory windowSize={30} />

// Desktop: larger window
<ChatHistory windowSize={50} />
```

### 2. Debounce Search

```typescript
const debouncedSearch = useMemo(
  () => debounce(setSearchQuery, 300),
  []
);
```

### 3. Memoize Chat Items

```typescript
const MemoizedChatItem = React.memo(ChatItem, (prev, next) =>
  prev.chat.id === next.chat.id &&
  prev.chat.unreadCount === next.chat.unreadCount &&
  prev.isSelected === next.isSelected
);
```

---

## Troubleshooting

### Sidebar not showing on web

**Check:**
- `defaultSidebarVisible` prop
- Window width is ≥ `mobileBreakpoint`
- CSS/styles not hiding it

### Modal not closing on mobile

**Check:**
- `onClose` callback is provided
- Modal `isVisible` state is being updated
- Not preventing event propagation

### Chats not loading

**Check:**
- API endpoints return correct format
- `onLoadInitial` is implemented
- Network requests are succeeding

### Memory still growing

**Check:**
- `windowSize` is properly configured
- Not storing references to chats outside component
- `usePaginatedList` is being used correctly

---

## Summary

The ChatHistory system provides:

✅ **Memory Efficient**: Sliding window keeps memory constant
✅ **Responsive**: Automatic sidebar/modal switching
✅ **Feature Rich**: Search, create, refresh, pagination
✅ **Customizable**: Custom renderers, styling, behavior
✅ **Performant**: Optimized FlatList, memoization
✅ **Real-time**: WebSocket compatible

Perfect for messaging apps with thousands of conversations! 🚀
