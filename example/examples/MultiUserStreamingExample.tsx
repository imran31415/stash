import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Chat } from '../../src/components/Chat';
import type { Message } from '../../src/components/Chat/types';
import { addMinutes } from 'date-fns';

/**
 * MultiUserStreamingExample - Real multi-user video chat room
 * Connects to WebSocket server for true cross-device streaming
 *
 * To use:
 * 1. Start the server: cd server && node streaming-room-server.js
 * 2. Open this page on multiple devices/browsers
 * 3. Everyone can join the same room and stream!
 */

const ROOM_ID = 'demo-room-1';

// Auto-detect WebSocket URL based on environment
const getWebSocketURL = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

    // Production: stash.scalebase.io
    if (hostname === 'stash.scalebase.io') {
      return 'wss://stash.scalebase.io/ws'; // WebSocket endpoint on your production server
    }

    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'ws://localhost:9001';
    }

    // Default fallback
    return `${protocol}//${hostname}:9001`;
  }
  return 'ws://localhost:9001';
};

const WS_URL = getWebSocketURL();

// Generate a random user ID for this session
const generateUserId = () => `user-${Math.random().toString(36).substr(2, 9)}`;
const SESSION_USER_ID = generateUserId();
const SESSION_USER_NAME = `User ${SESSION_USER_ID.slice(-4)}`;

interface Participant {
  userId: string;
  userName: string;
  isStreaming: boolean;
}

const MultiUserStreamingExample: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  // WebSocket connection management
  useEffect(() => {
    connectToServer();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectToServer = () => {
    try {
      setConnectionStatus('Connecting to server...');
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected to server');
        setIsConnected(true);
        setConnectionStatus('Connected');

        // Join the room
        ws.send(JSON.stringify({
          type: 'join-room',
          roomId: ROOM_ID,
          userId: SESSION_USER_ID,
          userName: SESSION_USER_NAME,
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('[WebSocket] Received:', message);

          switch (message.type) {
            case 'room-joined':
              console.log('[WebSocket] Joined room with participants:', message.participants);
              setParticipants(message.participants.filter((p: Participant) => p.userId !== SESSION_USER_ID));
              break;

            case 'user-joined':
              console.log('[WebSocket] User joined:', message.userName);
              setParticipants(message.participants.filter((p: Participant) => p.userId !== SESSION_USER_ID));
              break;

            case 'user-left':
              console.log('[WebSocket] User left:', message.userId);
              setParticipants(message.participants.filter((p: Participant) => p.userId !== SESSION_USER_ID));
              break;

            case 'user-streaming-started':
              console.log('[WebSocket] User started streaming:', message.userId);
              setParticipants(message.participants.filter((p: Participant) => p.userId !== SESSION_USER_ID));
              break;

            case 'user-streaming-stopped':
              console.log('[WebSocket] User stopped streaming:', message.userId);
              setParticipants(message.participants.filter((p: Participant) => p.userId !== SESSION_USER_ID));
              break;

            case 'chat-message':
              console.log('[WebSocket] Chat message:', message);
              // Handle chat messages if needed
              break;

            case 'pong':
              // Keep-alive response
              break;

            default:
              console.log('[WebSocket] Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        setConnectionStatus('Connection error');
      };

      ws.onclose = () => {
        console.log('[WebSocket] Disconnected');
        setIsConnected(false);
        setConnectionStatus('Disconnected - Reconnecting...');

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[WebSocket] Attempting to reconnect...');
          connectToServer();
        }, 3000);
      };
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      setConnectionStatus('Failed to connect');
    }
  };

  const handleStreamStart = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'start-streaming',
        roomId: ROOM_ID,
        userId: SESSION_USER_ID,
      }));
    }
  };

  const handleStreamStop = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'stop-streaming',
        roomId: ROOM_ID,
        userId: SESSION_USER_ID,
      }));
    }
  };

  const initialMessages: Message[] = [
    {
      id: 'msg-welcome',
      content: `🎥 **Multi-User Video Chat Room**\n\nWelcome, **${SESSION_USER_NAME}**! You're connected to **${ROOM_ID}**.\n\n${isConnected ? '✅ Server connected' : '⚠️ ' + connectionStatus}`,
      sender: { id: 'system', name: 'System', avatar: '🤖' },
      timestamp: addMinutes(new Date(), -15),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'msg-instructions',
      content: '**How to use:**\n\n1️⃣ **Start the server**: `cd server && node streaming-room-server.js`\n2️⃣ **Open on multiple devices** - Share this URL with friends\n3️⃣ **Start streaming** - Click start on your camera below\n4️⃣ **See others** - Their streams will appear automatically\n\n💡 Everyone connects to the same room in real-time!',
      sender: { id: 'system', name: 'System', avatar: '📋' },
      timestamp: addMinutes(new Date(), -12),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'msg-your-stream',
      content: `👤 **Your Camera** (${SESSION_USER_NAME})`,
      sender: { id: 'system', name: 'System', avatar: '🎬' },
      timestamp: addMinutes(new Date(), -10),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'live-camera-stream',
        data: {
          mode: 'full',
          autoStart: false,
          showControls: true,
          enableFlip: true,
        },
        onAction: (action: string) => {
          if (action === 'stream-start') {
            handleStreamStart();
          } else if (action === 'stream-stop') {
            handleStreamStop();
          }
        },
      },
    },
  ];

  const [chatMessages, setChatMessages] = useState<Message[]>(initialMessages);

  // Update messages when participants change or connection status changes
  useEffect(() => {
    const statusMessage: Message = {
      id: 'msg-status',
      content: `📊 **Room Status**\n\n${isConnected ? '✅' : '❌'} Server: ${connectionStatus}\n👥 Participants: ${participants.length + 1} (You + ${participants.length} ${participants.length === 1 ? 'other' : 'others'})\n🔴 Streaming: ${participants.filter(p => p.isStreaming).length}`,
      sender: { id: 'system', name: 'System', avatar: '📊' },
      timestamp: addMinutes(new Date(), -8),
      status: 'delivered',
      isOwn: false,
    };

    const participantMessages: Message[] = participants.map((participant, index) => ({
      id: `participant-${participant.userId}`,
      content: `${participant.isStreaming ? '🔴' : '⚫'} **${participant.userName}** ${participant.isStreaming ? '(Streaming LIVE)' : '(Not streaming)'}`,
      sender: { id: participant.userId, name: participant.userName, avatar: '👤' },
      timestamp: addMinutes(new Date(), -5 + index),
      status: 'delivered' as const,
      isOwn: false,
      interactiveComponent: participant.isStreaming ? {
        type: 'live-camera-stream',
        data: {
          mode: 'full',
          autoStart: false,
          showControls: false,
          enableFlip: false,
        },
      } : undefined,
    }));

    const helpMessage: Message = participants.length === 0 ? {
      id: 'msg-help',
      content: '⏳ **Waiting for others to join...**\n\nShare this page with friends or open it on another device!\n\nServer URL: `ws://localhost:9001`\nRoom ID: `demo-room-1`',
      sender: { id: 'system', name: 'System', avatar: '⏳' },
      timestamp: addMinutes(new Date(), -2),
      status: 'delivered',
      isOwn: false,
    } : {
      id: 'msg-help',
      content: `✨ **${participants.length} ${participants.length === 1 ? 'person has' : 'people have'} joined!**\n\nClick "Start Stream" above to share your camera with everyone in the room.`,
      sender: { id: 'system', name: 'System', avatar: '✨' },
      timestamp: addMinutes(new Date(), -2),
      status: 'delivered',
      isOwn: false,
    };

    setChatMessages([
      ...initialMessages,
      statusMessage,
      helpMessage,
      ...participantMessages,
    ]);
  }, [participants, isConnected, connectionStatus]);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      sender: { id: SESSION_USER_ID, name: SESSION_USER_NAME, avatar: '👤' },
      timestamp: new Date(),
      status: 'sending',
      isOwn: true,
    };
    setChatMessages([...chatMessages, newMessage]);

    // Send to server
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat-message',
        roomId: ROOM_ID,
        userId: SESSION_USER_ID,
        content,
      }));
    }

    setTimeout(() => {
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: 'delivered' as const } : msg
        )
      );
    }, 500);
  };

  return (
    <View style={styles.container}>
      <Chat
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        placeholder="Send a message to the room..."
        currentUserId={SESSION_USER_ID}
        title="Multi-User Streaming Room"
        subtitle={`${isConnected ? '🟢' : '🔴'} ${participants.length + 1} participant${participants.length !== 0 ? 's' : ''} • ${SESSION_USER_NAME}`}
        showTypingIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
});

export default MultiUserStreamingExample;
