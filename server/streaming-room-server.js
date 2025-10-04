/**
 * WebSocket Streaming Room Server
 * Coordinates multi-user video streaming sessions
 *
 * Run with: node server/streaming-room-server.js
 */

const WebSocket = require('ws');
const http = require('http');

const PORT = process.env.PORT || 9001;

// Create HTTP server
const server = http.createServer((req, res) => {
  // Set CORS headers for production
  const allowedOrigins = [
    'http://localhost:8081',
    'http://localhost:19006',
    'https://stash.scalebase.io',
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Streaming Room Server Running\n');
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients and their info
const clients = new Map();
const rooms = new Map();

// Broadcast to all clients in a room
function broadcastToRoom(roomId, message, excludeClient = null) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.participants.forEach((participant) => {
    if (participant.ws !== excludeClient && participant.ws.readyState === WebSocket.OPEN) {
      participant.ws.send(JSON.stringify(message));
    }
  });
}

// Get room participants list
function getRoomParticipants(roomId) {
  const room = rooms.get(roomId);
  if (!room) return [];

  return Array.from(room.participants.values()).map(p => ({
    userId: p.userId,
    userName: p.userName,
    isStreaming: p.isStreaming,
  }));
}

wss.on('connection', (ws) => {
  console.log('New client connected');
  let currentUserId = null;
  let currentRoomId = null;

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Received message:', message);

      switch (message.type) {
        case 'join-room': {
          const { roomId, userId, userName } = message;
          currentUserId = userId;
          currentRoomId = roomId;

          // Create room if it doesn't exist
          if (!rooms.has(roomId)) {
            rooms.set(roomId, {
              roomId,
              participants: new Map(),
              createdAt: Date.now(),
            });
          }

          const room = rooms.get(roomId);

          // Add participant to room
          room.participants.set(userId, {
            userId,
            userName,
            ws,
            isStreaming: false,
            joinedAt: Date.now(),
          });

          console.log(`User ${userName} (${userId}) joined room ${roomId}`);

          // Send current participants to new user
          ws.send(JSON.stringify({
            type: 'room-joined',
            roomId,
            userId,
            participants: getRoomParticipants(roomId),
          }));

          // Notify other participants
          broadcastToRoom(roomId, {
            type: 'user-joined',
            userId,
            userName,
            participants: getRoomParticipants(roomId),
          }, ws);

          break;
        }

        case 'start-streaming': {
          const { roomId, userId } = message;
          const room = rooms.get(roomId);

          if (room && room.participants.has(userId)) {
            const participant = room.participants.get(userId);
            participant.isStreaming = true;

            console.log(`User ${participant.userName} started streaming in room ${roomId}`);

            // Notify all participants
            broadcastToRoom(roomId, {
              type: 'user-streaming-started',
              userId,
              participants: getRoomParticipants(roomId),
            });
          }
          break;
        }

        case 'stop-streaming': {
          const { roomId, userId } = message;
          const room = rooms.get(roomId);

          if (room && room.participants.has(userId)) {
            const participant = room.participants.get(userId);
            participant.isStreaming = false;

            console.log(`User ${participant.userName} stopped streaming in room ${roomId}`);

            // Notify all participants
            broadcastToRoom(roomId, {
              type: 'user-streaming-stopped',
              userId,
              participants: getRoomParticipants(roomId),
            });
          }
          break;
        }

        case 'chat-message': {
          const { roomId, userId, content } = message;
          const room = rooms.get(roomId);

          if (room && room.participants.has(userId)) {
            const participant = room.participants.get(userId);

            console.log(`Chat message in room ${roomId} from ${participant.userName}: ${content}`);

            // Broadcast to all participants including sender
            broadcastToRoom(roomId, {
              type: 'chat-message',
              userId,
              userName: participant.userName,
              content,
              timestamp: Date.now(),
            });

            // Also send to sender
            ws.send(JSON.stringify({
              type: 'chat-message',
              userId,
              userName: participant.userName,
              content,
              timestamp: Date.now(),
            }));
          }
          break;
        }

        case 'ping': {
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
        }

        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');

    if (currentRoomId && currentUserId) {
      const room = rooms.get(currentRoomId);

      if (room && room.participants.has(currentUserId)) {
        const participant = room.participants.get(currentUserId);
        console.log(`User ${participant.userName} left room ${currentRoomId}`);

        // Remove participant
        room.participants.delete(currentUserId);

        // Notify other participants
        broadcastToRoom(currentRoomId, {
          type: 'user-left',
          userId: currentUserId,
          participants: getRoomParticipants(currentRoomId),
        });

        // Clean up empty rooms
        if (room.participants.size === 0) {
          rooms.delete(currentRoomId);
          console.log(`Room ${currentRoomId} deleted (empty)`);
        }
      }
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Keep-alive ping
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  });
}, 30000);

server.listen(PORT, () => {
  console.log(`🎥 Streaming Room Server running on port ${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
});
