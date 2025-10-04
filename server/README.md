# Streaming Room Server

WebSocket server for coordinating multi-user video streaming sessions.

## Quick Start

```bash
# Install dependencies
cd server
npm install

# Start the server
npm start
```

The server will run on `ws://localhost:8080`

## Features

- **Real-time coordination** - Users across different devices join the same room
- **Participant management** - Track who's in the room and their streaming status
- **Auto-reconnect** - Clients automatically reconnect if disconnected
- **Room isolation** - Multiple rooms can run simultaneously
- **Chat messaging** - Users can send messages to everyone in the room

## Usage

### Starting the Server

```bash
node streaming-room-server.js
```

Or with auto-reload during development:

```bash
npm run dev
```

### Client Connection

Clients connect via WebSocket to `ws://localhost:8080` (or your server URL).

### Message Protocol

**Join Room:**
```json
{
  "type": "join-room",
  "roomId": "demo-room-1",
  "userId": "user-abc123",
  "userName": "User abc1"
}
```

**Start Streaming:**
```json
{
  "type": "start-streaming",
  "roomId": "demo-room-1",
  "userId": "user-abc123"
}
```

**Stop Streaming:**
```json
{
  "type": "stop-streaming",
  "roomId": "demo-room-1",
  "userId": "user-abc123"
}
```

**Send Chat Message:**
```json
{
  "type": "chat-message",
  "roomId": "demo-room-1",
  "userId": "user-abc123",
  "content": "Hello everyone!"
}
```

## Server Responses

The server broadcasts these events to room participants:

- `room-joined` - Sent to new user with current participants list
- `user-joined` - Broadcast when a user joins
- `user-left` - Broadcast when a user leaves
- `user-streaming-started` - Broadcast when a user starts streaming
- `user-streaming-stopped` - Broadcast when a user stops streaming
- `chat-message` - Broadcast chat messages to all participants

## Deployment

For production deployment:

1. Set the `PORT` environment variable
2. Use a process manager like PM2:
   ```bash
   pm2 start streaming-room-server.js
   ```
3. Configure your reverse proxy (nginx/Apache) for WebSocket support
4. Update client `WS_URL` to point to your server

## Architecture

- Each room maintains its own participant list
- Participants are tracked by userId
- Empty rooms are automatically cleaned up
- Keep-alive pings prevent connection timeouts
