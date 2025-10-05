const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

app.use(cors());
app.use(express.json());

// In-memory storage
const messages = new Map(); // userId -> messages[]
const connections = new Map(); // userId -> ws connection
const rooms = new Map(); // roomId -> { roomName, participants: Set<{userId, userName, ws, isStreaming}> }

// AI responses for demo
const AI_RESPONSES = [
  "That's interesting! Tell me more about that.",
  "I understand. How can I help you with that?",
  "Great question! Let me think about that for a moment.",
  "Based on what you've told me, I'd suggest considering the following approaches.",
  "I see what you mean. Here's what I think about that situation.",
];

const getRandomAIResponse = () => {
  return AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
};

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('🔗 New WebSocket connection');
  let userId = null;

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('📨 Received:', message);

      switch (message.type) {
        case 'subscribe':
          // Store connection
          userId = message.data?.user_id || 'anonymous';
          connections.set(userId, ws);
          console.log(`✅ User ${userId} subscribed`);

          // Send acknowledgment
          ws.send(JSON.stringify({
            type: 'event',
            action: 'subscribed',
            data: { success: true }
          }));
          break;

        case 'command':
          if (message.action === 'chat.message.sent') {
            handleChatMessage(message, ws);
          } else if (message.action === 'typing.start' || message.action === 'typing.stop') {
            // Broadcast typing indicator to other users
            broadcastTyping(message, ws);
          }
          break;

        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;

        case 'list-rooms':
          handleListRooms(ws);
          break;

        case 'join-room':
          handleJoinRoom(message, ws);
          break;

        case 'leave-room':
          handleLeaveRoom(message, ws);
          break;

        case 'start-streaming':
          handleStartStreaming(message, ws);
          break;

        case 'stop-streaming':
          handleStopStreaming(message, ws);
          break;

        case 'chat-message':
          handleRoomChatMessage(message, ws);
          break;

        case 'webrtc-offer':
          handleWebRTCOffer(message, ws);
          break;

        case 'webrtc-answer':
          handleWebRTCAnswer(message, ws);
          break;

        case 'webrtc-ice-candidate':
          handleWebRTCIceCandidate(message, ws);
          break;
      }
    } catch (error) {
      console.error('❌ Error handling message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message
      }));
    }
  });

  ws.on('close', () => {
    console.log('🔌 WebSocket disconnected');
    if (userId) {
      connections.delete(userId);

      // Remove user from all rooms
      rooms.forEach((room, roomId) => {
        const participant = Array.from(room.participants).find(p => p.userId === userId);
        if (participant) {
          room.participants.delete(participant);
          console.log(`👋 User ${userId} removed from room ${roomId} on disconnect`);

          const participantsList = Array.from(room.participants).map(p => ({
            userId: p.userId,
            userName: p.userName,
            isStreaming: p.isStreaming
          }));

          // Notify remaining participants
          room.participants.forEach(p => {
            if (p.ws.readyState === WebSocket.OPEN) {
              p.ws.send(JSON.stringify({
                type: 'user-left',
                roomId,
                userId,
                participants: participantsList
              }));
            }
          });

          // Delete room if empty
          if (room.participants.size === 0) {
            rooms.delete(roomId);
            console.log(`🗑️ Deleted empty room: ${roomId}`);
          }
        }
      });
    }
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });
});

function handleChatMessage(message, senderWs) {
  const userId = message.user_id || message.data?.sender_id || 'anonymous';
  const messageData = message.data;

  // Store message
  if (!messages.has(userId)) {
    messages.set(userId, []);
  }

  const userMessage = {
    id: messageData.id,
    type: messageData.type || 'text',
    content: messageData.message || messageData.content,
    sender_id: userId,
    sender_name: 'User',
    timestamp: new Date().toISOString(),
  };

  messages.get(userId).push(userMessage);

  // Echo message back to sender
  senderWs.send(JSON.stringify({
    type: 'event',
    action: 'chat.message.sent',
    data: userMessage
  }));

  // Simulate AI response after a delay
  if (messageData.ai_request) {
    setTimeout(() => {
      const aiResponse = {
        id: `ai-${Date.now()}`,
        type: 'text',
        content: getRandomAIResponse(),
        sender_id: 'ai',
        sender_name: 'AI Assistant',
        timestamp: new Date().toISOString(),
      };

      messages.get(userId).push(aiResponse);

      // Send AI response
      senderWs.send(JSON.stringify({
        type: 'event',
        action: 'chat.message.sent',
        data: aiResponse
      }));
    }, 1000 + Math.random() * 2000);
  }
}

function broadcastTyping(message, senderWs) {
  const typingData = {
    type: 'event',
    action: message.action,
    data: message.data
  };

  // Broadcast to all connected clients except sender
  connections.forEach((ws) => {
    if (ws !== senderWs && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(typingData));
    }
  });
}

// Video streaming room handlers

function handleListRooms(ws) {
  const roomsList = Array.from(rooms.entries()).map(([roomId, room]) => ({
    roomId,
    roomName: room.roomName,
    participantCount: room.participants.size
  }));

  ws.send(JSON.stringify({
    type: 'rooms-list',
    rooms: roomsList
  }));
  console.log(`📋 Sent rooms list: ${roomsList.length} rooms`);
}

function handleJoinRoom(message, ws) {
  const { roomId, userId, userName, roomName } = message;

  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      roomName: roomName || roomId,
      participants: new Set()
    });
    console.log(`🏠 Created new room: ${roomName || roomId}`);
  }

  const room = rooms.get(roomId);
  const participant = { userId, userName, ws, isStreaming: false };
  room.participants.add(participant);

  const participantsList = Array.from(room.participants).map(p => ({
    userId: p.userId,
    userName: p.userName,
    isStreaming: p.isStreaming
  }));

  // Send room-joined to the user
  ws.send(JSON.stringify({
    type: 'room-joined',
    roomId,
    roomName: room.roomName,
    participants: participantsList
  }));

  // Broadcast user-joined to other participants
  room.participants.forEach(p => {
    if (p.ws !== ws && p.ws.readyState === WebSocket.OPEN) {
      p.ws.send(JSON.stringify({
        type: 'user-joined',
        roomId,
        userId,
        userName,
        participants: participantsList
      }));
    }
  });

  console.log(`👤 ${userName} joined room ${roomName || roomId} (${room.participants.size} participants)`);
}

function handleLeaveRoom(message, ws) {
  const { roomId, userId } = message;

  if (!rooms.has(roomId)) return;

  const room = rooms.get(roomId);
  const participant = Array.from(room.participants).find(p => p.userId === userId);

  if (participant) {
    room.participants.delete(participant);

    const participantsList = Array.from(room.participants).map(p => ({
      userId: p.userId,
      userName: p.userName,
      isStreaming: p.isStreaming
    }));

    // Broadcast user-left to remaining participants
    room.participants.forEach(p => {
      if (p.ws.readyState === WebSocket.OPEN) {
        p.ws.send(JSON.stringify({
          type: 'user-left',
          roomId,
          userId,
          participants: participantsList
        }));
      }
    });

    // Delete room if empty
    if (room.participants.size === 0) {
      rooms.delete(roomId);
      console.log(`🗑️ Deleted empty room: ${roomId}`);
    }

    console.log(`👋 User ${userId} left room ${roomId}`);
  }
}

function handleStartStreaming(message, ws) {
  const { roomId, userId } = message;

  if (!rooms.has(roomId)) return;

  const room = rooms.get(roomId);
  const participant = Array.from(room.participants).find(p => p.userId === userId);

  if (participant) {
    participant.isStreaming = true;

    const participantsList = Array.from(room.participants).map(p => ({
      userId: p.userId,
      userName: p.userName,
      isStreaming: p.isStreaming
    }));

    // Broadcast streaming-started to all participants
    room.participants.forEach(p => {
      if (p.ws.readyState === WebSocket.OPEN) {
        p.ws.send(JSON.stringify({
          type: 'user-streaming-started',
          roomId,
          userId,
          participants: participantsList
        }));
      }
    });

    console.log(`📹 User ${userId} started streaming in room ${roomId}`);
  }
}

function handleStopStreaming(message, ws) {
  const { roomId, userId } = message;

  if (!rooms.has(roomId)) return;

  const room = rooms.get(roomId);
  const participant = Array.from(room.participants).find(p => p.userId === userId);

  if (participant) {
    participant.isStreaming = false;

    const participantsList = Array.from(room.participants).map(p => ({
      userId: p.userId,
      userName: p.userName,
      isStreaming: p.isStreaming
    }));

    // Broadcast streaming-stopped to all participants
    room.participants.forEach(p => {
      if (p.ws.readyState === WebSocket.OPEN) {
        p.ws.send(JSON.stringify({
          type: 'user-streaming-stopped',
          roomId,
          userId,
          participants: participantsList
        }));
      }
    });

    console.log(`⏹️ User ${userId} stopped streaming in room ${roomId}`);
  }
}

function handleRoomChatMessage(message, ws) {
  const { roomId, userId, content } = message;

  if (!rooms.has(roomId)) return;

  const room = rooms.get(roomId);
  const sender = Array.from(room.participants).find(p => p.userId === userId);

  if (sender) {
    // Broadcast message to all participants in room
    room.participants.forEach(p => {
      if (p.ws.readyState === WebSocket.OPEN) {
        p.ws.send(JSON.stringify({
          type: 'chat-message',
          roomId,
          userId,
          userName: sender.userName,
          content
        }));
      }
    });

    console.log(`💬 Chat message in room ${roomId} from ${sender.userName}: ${content}`);
  }
}

// WebRTC signaling handlers

function handleWebRTCOffer(message, ws) {
  const { roomId, fromUserId, toUserId, offer } = message;

  if (!rooms.has(roomId)) return;

  const room = rooms.get(roomId);
  const targetParticipant = Array.from(room.participants).find(p => p.userId === toUserId);

  if (targetParticipant && targetParticipant.ws.readyState === WebSocket.OPEN) {
    targetParticipant.ws.send(JSON.stringify({
      type: 'webrtc-offer',
      roomId,
      fromUserId,
      offer
    }));
    console.log(`📡 Relayed WebRTC offer from ${fromUserId} to ${toUserId}`);
  }
}

function handleWebRTCAnswer(message, ws) {
  const { roomId, fromUserId, toUserId, answer } = message;

  if (!rooms.has(roomId)) return;

  const room = rooms.get(roomId);
  const targetParticipant = Array.from(room.participants).find(p => p.userId === toUserId);

  if (targetParticipant && targetParticipant.ws.readyState === WebSocket.OPEN) {
    targetParticipant.ws.send(JSON.stringify({
      type: 'webrtc-answer',
      roomId,
      fromUserId,
      answer
    }));
    console.log(`📡 Relayed WebRTC answer from ${fromUserId} to ${toUserId}`);
  }
}

function handleWebRTCIceCandidate(message, ws) {
  const { roomId, fromUserId, toUserId, candidate } = message;

  if (!rooms.has(roomId)) return;

  const room = rooms.get(roomId);
  const targetParticipant = Array.from(room.participants).find(p => p.userId === toUserId);

  if (targetParticipant && targetParticipant.ws.readyState === WebSocket.OPEN) {
    targetParticipant.ws.send(JSON.stringify({
      type: 'webrtc-ice-candidate',
      roomId,
      fromUserId,
      candidate
    }));
    console.log(`📡 Relayed ICE candidate from ${fromUserId} to ${toUserId}`);
  }
}

// HTTP API endpoints

// Load messages
app.get('/api/chat/messages', (req, res) => {
  const { userId, limit = 50 } = req.query;
  const userMessages = messages.get(userId) || [];
  const limitedMessages = userMessages.slice(-parseInt(limit));

  console.log(`📥 Loading ${limitedMessages.length} messages for user ${userId}`);
  res.json(limitedMessages);
});

// Save messages
app.post('/api/chat/messages', (req, res) => {
  const { userId, messages: newMessages } = req.body;

  if (!messages.has(userId)) {
    messages.set(userId, []);
  }

  messages.get(userId).push(...newMessages);
  console.log(`💾 Saved ${newMessages.length} messages for user ${userId}`);

  res.json({ success: true });
});

// Delete messages
app.delete('/api/chat/messages', (req, res) => {
  const { userId, messageIds } = req.body;

  if (messages.has(userId)) {
    const userMessages = messages.get(userId);
    const filtered = userMessages.filter(msg => !messageIds.includes(msg.id));
    messages.set(userId, filtered);
    console.log(`🗑️ Deleted ${messageIds.length} messages for user ${userId}`);
  }

  res.json({ success: true });
});

// Send message (HTTP fallback)
app.post('/api/chat/send', async (req, res) => {
  const { userId, message: messageData } = req.body;

  if (!messages.has(userId)) {
    messages.set(userId, []);
  }

  const newMessage = {
    id: messageData.id,
    type: messageData.type || 'text',
    content: messageData.content,
    sender_id: userId,
    sender_name: 'User',
    timestamp: new Date().toISOString(),
  };

  messages.get(userId).push(newMessage);
  console.log(`📤 Message sent via HTTP for user ${userId}`);

  // Simulate AI response
  setTimeout(() => {
    const aiResponse = {
      id: `ai-${Date.now()}`,
      type: 'text',
      content: getRandomAIResponse(),
      sender_id: 'ai',
      sender_name: 'AI Assistant',
      timestamp: new Date().toISOString(),
    };

    messages.get(userId).push(aiResponse);
  }, 1000);

  res.json(newMessage);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    connections: connections.size,
    totalMessages: Array.from(messages.values()).reduce((sum, msgs) => sum + msgs.length, 0)
  });
});

const PORT = 8082;
server.listen(PORT, () => {
  console.log(`🚀 Mock server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket available at ws://localhost:${PORT}/ws`);
  console.log(`📡 HTTP API available at http://localhost:${PORT}/api`);
});
