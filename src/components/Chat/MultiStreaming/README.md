# MultiStreamingChat

A reusable multi-user video streaming chat component with WebRTC support.

## Features

- 🎥 Multi-user video streaming (P2P mesh or SFU via LiveKit)
- 💬 Real-time chat messaging
- 🔐 Optional room password protection
- 📱 Mobile-responsive controls
- 🎤 Audio/video toggle controls
- 🔗 Room link sharing with password support
- 🌐 Web and React Native support

## Installation

The component is included in the `@yourorg/stash` package.

```typescript
import { MultiStreamingChat } from '@yourorg/stash';
```

## Quick Start

### Basic Usage (P2P Mode)

```typescript
import { MultiStreamingChat } from '@yourorg/stash';

function App() {
  return (
    <MultiStreamingChat
      wsUrl="ws://localhost:4082/ws"
      userId="user-123"
      userName="John Doe"
    />
  );
}
```

### With LiveKit SFU

```typescript
<MultiStreamingChat
  wsUrl="ws://localhost:4082/ws"
  liveKitUrl="wss://livekit.yourserver.com"
  userId="user-123"
  userName="John Doe"
  useSFU={true}
/>
```

### With Callbacks

```typescript
<MultiStreamingChat
  wsUrl="ws://localhost:4082/ws"
  userId="user-123"
  userName="John Doe"
  onRoomJoin={(roomId, roomName) => console.log('Joined room:', roomId)}
  onRoomLeave={() => console.log('Left room')}
  onStreamStart={() => console.log('Started streaming')}
  onStreamStop={() => console.log('Stopped streaming')}
  onError={(error) => console.error('Error:', error)}
/>
```

## Configuration

### MultiStreamingChatConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `wsUrl` | `string` | Yes | WebSocket server URL for signaling |
| `userId` | `string` | Yes | Current user ID |
| `userName` | `string` | No | Current user name (defaults to User-XXXX) |
| `liveKitUrl` | `string` | No | LiveKit server URL for SFU mode |
| `useSFU` | `boolean` | No | Enable SFU mode (default: false) |
| `sfuThreshold` | `number` | No | Auto-switch to SFU at N participants (default: 999) |
| `demoMode` | `boolean` | No | Enable demo mode without backend (default: false) |
| `initialRoomId` | `string` | No | Room to auto-join on mount |
| `initialRoomPassword` | `string` | No | Password for initial room |
| `onRoomJoin` | `function` | No | Called when user joins a room |
| `onRoomLeave` | `function` | No | Called when user leaves a room |
| `onStreamStart` | `function` | No | Called when user starts streaming |
| `onStreamStop` | `function` | No | Called when user stops streaming |
| `onError` | `function` | No | Called on errors |
| `onParticipantJoin` | `function` | No | Called when participant joins |
| `onParticipantLeave` | `function` | No | Called when participant leaves |

## Backend Requirements

The component requires a WebSocket signaling server that implements the following message types:

### Client → Server Messages

```typescript
// Join a room
{
  type: 'join-room',
  roomId: string,
  userId: string,
  userName: string,
  password?: string
}

// Leave a room
{
  type: 'leave-room',
  roomId: string,
  userId: string
}

// Start streaming
{
  type: 'start-stream',
  roomId: string,
  userId: string
}

// Stop streaming
{
  type: 'stop-stream',
  roomId: string,
  userId: string
}

// Send chat message
{
  type: 'chat-message',
  roomId: string,
  userId: string,
  userName: string,
  content: string,
  timestamp: string
}

// WebRTC signaling
{
  type: 'webrtc-offer' | 'webrtc-answer' | 'webrtc-ice-candidate',
  fromUserId: string,
  toUserId: string,
  sdp?: RTCSessionDescriptionInit,
  candidate?: RTCIceCandidateInit
}
```

### Server → Client Messages

```typescript
// Room joined successfully
{
  type: 'room-joined',
  roomId: string,
  participants: Array<{userId: string, userName: string, isStreaming: boolean}>
}

// Room join failed
{
  type: 'room-join-failed',
  error: string
}

// Participant joined
{
  type: 'participant-joined',
  userId: string,
  userName: string
}

// Participant left
{
  type: 'participant-left',
  userId: string
}

// Stream started
{
  type: 'stream-started',
  userId: string
}

// Stream stopped
{
  type: 'stream-stopped',
  userId: string
}

// Incoming chat message
{
  type: 'chat-message',
  userId: string,
  userName: string,
  content: string,
  timestamp: string
}

// WebRTC signaling (forwarded to target user)
{
  type: 'webrtc-offer' | 'webrtc-answer' | 'webrtc-ice-candidate',
  fromUserId: string,
  toUserId: string,
  sdp?: RTCSessionDescriptionInit,
  candidate?: RTCIceCandidateInit
}
```

## Example Server

See `/example/server/` for a reference WebSocket signaling server implementation.

## Architecture

### P2P Mode (Default)
- Uses WebRTC mesh networking
- Each peer connects directly to every other peer
- Recommended for ≤5 participants
- No media server required

### SFU Mode (LiveKit)
- Uses Selective Forwarding Unit via LiveKit
- All media routed through central server
- Recommended for >5 participants
- Requires LiveKit server deployment

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with limited simultaneous streams

## License

MIT
