# Stash - React Native Expo Component Library

A modern, production-ready React Native Expo component library featuring an advanced chat system with WebSocket and HTTP support.

## Features

### 🎯 Advanced Chat Component
- **Dual-mode messaging**: WebSocket (real-time) + HTTP (fallback)
- **Multiple chat types**: User chats, Group chats, and AI chats
- **Real-time features**:
  - Live messaging via WebSocket
  - Typing indicators
  - Read receipts and message status
  - Connection status monitoring
  - Automatic reconnection with exponential backoff
- **Message types**: Text, images, files, and system messages
- **Fully customizable**: Themes, custom renderers, and callbacks
- **Production-ready**: Error handling, offline support, and performance optimized

### 📦 Components Included
- `Chat` - Main chat container with WebSocket/HTTP support
- `ChatMessage` - Individual message bubbles
- `ChatInput` - Message composition with typing indicators
- `TypingIndicator` - Animated typing status
- `ConnectionStatus` - Real-time connection state display
- `Button` - Basic button component (example)

## Installation

```bash
yarn add stash
# or
npm install stash
```

### Peer Dependencies
Make sure you have the following installed:
```bash
yarn add react react-native
```

## Usage

### Basic Chat Example

```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { Chat, Message } from 'stash';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSendMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  return (
    <View style={{ flex: 1 }}>
      <Chat
        userId="user-123"
        chatType="user"
        messages={messages}
        onSendMessage={handleSendMessage}
        placeholder="Type a message..."
      />
    </View>
  );
}
```

### Chat with WebSocket Support

```tsx
import { Chat } from 'stash';

<Chat
  userId="user-123"
  chatType="group"
  chatId="group-456"
  messages={messages}
  onSendMessage={handleSendMessage}

  // WebSocket configuration
  enableWebSocket={true}
  wsConfig={{
    baseUrl: 'wss://your-server.com',
    getAuthToken: async () => await getToken(),
    tenantId: 'tenant-1',
    projectId: 'project-1',
  }}

  // HTTP fallback configuration
  enableHTTP={true}
  httpConfig={{
    baseUrl: 'https://your-api.com/api',
    apiKey: 'your-api-key',
  }}

  // Features
  showConnectionStatus={true}
  showTypingIndicator={true}

  // Callbacks
  onMessagePress={(msg) => console.log('Message clicked:', msg)}
  onMessageLongPress={(msg) => console.log('Message long pressed:', msg)}
  onAvatarPress={(userId) => console.log('Avatar clicked:', userId)}
/>
```

### AI Chat Example

```tsx
import { Chat, ChatType } from 'stash';

<Chat
  userId="user-123"
  chatType="ai"
  messages={messages}
  onSendMessage={async (message) => {
    // Add user message
    setMessages(prev => [...prev, message]);

    // Simulate AI response
    const aiResponse = await callAIService(message.content);

    setMessages(prev => [...prev, {
      id: 'ai-' + Date.now(),
      type: 'text',
      content: aiResponse,
      sender: { id: 'ai', name: 'AI Assistant' },
      timestamp: new Date(),
      isOwn: false,
    }]);
  }}
  placeholder="Ask AI anything..."
/>
```

### Custom Theme

```tsx
import { Chat, ChatTheme } from 'stash';

const customTheme: ChatTheme = {
  primaryColor: '#6366f1',
  backgroundColor: '#f9fafb',
  messageBackgroundOwn: '#6366f1',
  messageBackgroundOther: '#e5e7eb',
  textColorOwn: '#ffffff',
  textColorOther: '#111827',
  inputBackgroundColor: '#ffffff',
  borderColor: '#d1d5db',
};

<Chat
  userId="user-123"
  chatType="user"
  messages={messages}
  onSendMessage={handleSendMessage}
  theme={customTheme}
/>
```

### Custom Message Rendering

```tsx
<Chat
  userId="user-123"
  chatType="user"
  messages={messages}
  onSendMessage={handleSendMessage}
  renderMessage={(message, index) => (
    <CustomMessageBubble message={message} />
  )}
  renderHeader={() => (
    <ChatHeader title="Support Chat" />
  )}
  renderEmptyState={() => (
    <EmptyState text="No messages yet" />
  )}
/>
```

## API Reference

### Chat Component Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `userId` | `string` | ✅ | Current user's ID |
| `chatType` | `'user' \| 'group' \| 'ai'` | ✅ | Type of chat |
| `messages` | `Message[]` | ✅ | Array of messages to display |
| `onSendMessage` | `(message: Message) => void` | ✅ | Callback when message is sent |
| `chatId` | `string` | ❌ | Optional chat/channel ID |
| `theme` | `ChatTheme` | ❌ | Custom theme configuration |
| `httpConfig` | `ChatServiceConfig` | ❌ | HTTP API configuration |
| `wsConfig` | `WebSocketConfig` | ❌ | WebSocket configuration |
| `enableWebSocket` | `boolean` | ❌ | Enable WebSocket (default: true) |
| `enableHTTP` | `boolean` | ❌ | Enable HTTP fallback (default: true) |
| `showConnectionStatus` | `boolean` | ❌ | Show connection indicator (default: true) |
| `showTypingIndicator` | `boolean` | ❌ | Show typing status (default: true) |
| `placeholder` | `string` | ❌ | Input placeholder text |
| `onLoadMore` | `() => void` | ❌ | Callback for pagination |
| `onMessagePress` | `(message: Message) => void` | ❌ | Message click handler |
| `onMessageLongPress` | `(message: Message) => void` | ❌ | Message long press handler |
| `onAvatarPress` | `(userId: string) => void` | ❌ | Avatar click handler |
| `renderMessage` | `(message: Message, index: number) => ReactNode` | ❌ | Custom message renderer |
| `renderHeader` | `() => ReactNode` | ❌ | Custom header renderer |
| `renderEmptyState` | `() => ReactNode` | ❌ | Custom empty state renderer |

### Message Type

```typescript
interface Message {
  id: string;
  type: 'text' | 'image' | 'file' | 'system';
  content: string;
  sender: User;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  isOwn?: boolean;
  replyTo?: Message;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    imageUrl?: string;
    [key: string]: any;
  };
}
```

### User Type

```typescript
interface User {
  id: string;
  name: string;
  avatar?: string;
}
```

## Services

### WebSocketChatService

Handles real-time WebSocket connections with automatic reconnection:

```typescript
import { WebSocketChatService, ConnectionState } from 'stash';

const wsService = new WebSocketChatService(
  'wss://your-server.com',
  async () => 'your-auth-token',
  'user-id',
  'tenant-id',
  'project-id'
);

// Listen for connection changes
wsService.onConnectionChange((state: ConnectionState) => {
  console.log('Connection state:', state);
});

// Listen for incoming messages
wsService.onMessage('chat.message.sent', (message) => {
  console.log('New message:', message);
});

// Connect
await wsService.connect();

// Send message
await wsService.sendMessage(message);

// Send typing indicator
wsService.sendTypingIndicator(true);

// Disconnect
wsService.disconnect();
```

### HTTPChatService

Fallback HTTP REST API service:

```typescript
import { HTTPChatService } from 'stash';

const httpService = new HTTPChatService({
  baseUrl: 'https://your-api.com/api',
  apiKey: 'your-api-key',
  timeout: 10000,
});

// Load messages
const response = await httpService.loadMessages('user-id', 50);

// Send message
await httpService.sendMessage('user-id', message);

// Save messages
await httpService.saveMessages('user-id', messages);

// Delete messages
await httpService.deleteMessages('user-id', ['msg-1', 'msg-2']);
```

## Development

### Setup

```bash
# Clone the repo
git clone <your-repo-url>

# Install dependencies
yarn install

# Build the library
yarn build
```

### Testing Locally

```bash
# Link the library
yarn link

# In your test project
yarn link stash
```

## Publishing

```bash
# Update version in package.json
# Then publish to npm
yarn publish
```

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
