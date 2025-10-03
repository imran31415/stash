# Stash Example App

This is a demo application showcasing the Stash React Native component library with working examples of User Chat, Group Chat, and AI Chat.

## Quick Start

### 1. Install Server Dependencies

```bash
cd server
yarn install
```

### 2. Start Mock Server

```bash
cd server
yarn start
```

The mock server will run on:
- **HTTP API**: http://localhost:8082/api
- **WebSocket**: ws://localhost:8082/ws

### 3. Install Example App Dependencies

In a new terminal:

```bash
cd example
yarn install
```

### 4. Start Example App

For web (runs on port 8083):
```bash
yarn web
```

For iOS:
```bash
yarn ios
```

For Android:
```bash
yarn android
```

## Features Demonstrated

### 👤 User Chat
- 1-on-1 messaging
- Real-time WebSocket connection
- Typing indicators
- Message status (sent/delivered/read)
- HTTP fallback when WebSocket unavailable

### 👥 Group Chat
- Multi-user conversations
- Live typing indicators from multiple users
- Group message delivery
- Connection status display

### 🤖 AI Chat
- AI assistant responses
- Custom purple theme
- Simulated AI thinking/responses
- WebSocket streaming (demo)

## Architecture

The example app demonstrates:

1. **WebSocket Integration** - Real-time messaging with auto-reconnection
2. **HTTP Fallback** - Automatic fallback when WebSocket unavailable
3. **Mock Server** - Simulates production backend with WebSocket + REST API
4. **Multiple Chat Types** - User, Group, and AI chat examples
5. **Custom Themes** - Different styling for each chat type

## Mock Server

The mock server (`server/mock-server.js`) provides:

- WebSocket server with connection management
- REST API endpoints for message CRUD
- Simulated AI responses
- Typing indicator broadcasting
- Message persistence (in-memory)

### Endpoints

**WebSocket:**
- `ws://localhost:8082/ws`

**HTTP API:**
- `GET /api/chat/messages?userId={id}&limit={n}` - Load messages
- `POST /api/chat/messages` - Save messages
- `DELETE /api/chat/messages` - Delete messages
- `POST /api/chat/send` - Send message (fallback)
- `GET /health` - Server health check

## Customization

You can customize the examples by modifying:

- `examples/UserChatExample.tsx` - User chat configuration
- `examples/GroupChatExample.tsx` - Group chat configuration
- `examples/AIChatExample.tsx` - AI chat configuration and theme

## Testing WebSocket Fallback

To test HTTP fallback:

1. Stop the mock server
2. Send a message in the app
3. The app will automatically use HTTP API
4. Restart the server to resume WebSocket connection

## Production Usage

To use in your production app:

1. Replace mock server URLs with your production backend:
   ```typescript
   wsConfig={{
     baseUrl: 'wss://your-production-server.com',
     getAuthToken: () => getYourAuthToken(),
   }}

   httpConfig={{
     baseUrl: 'https://your-api.com/api',
     apiKey: 'your-api-key',
   }}
   ```

2. Implement proper authentication token management
3. Add error handling and user feedback
4. Configure message persistence
5. Add analytics and monitoring

## Troubleshooting

**Port 8082 already in use:**
```bash
# Find and kill process
lsof -ti:8082 | xargs kill -9
```

**Port 8083 already in use:**
```bash
# Edit package.json and change port
"web": "expo start --web --port 8084"
```

**WebSocket not connecting:**
- Check mock server is running
- Verify firewall settings
- Check browser console for errors
- Ensure correct WebSocket URL (ws:// not wss://)

## License

MIT
