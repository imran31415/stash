import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { Chat } from '../../src/components/Chat';
import type { Message } from '../../src/components/Chat/types';
import { addMinutes } from 'date-fns';

/**
 * MultiUserStreamingExample - Real multi-user video chat room with lobby
 * Features:
 * - Room lobby with create/join functionality
 * - Real-time participant list
 * - Multi-user camera streaming
 * - In-chat stream activation
 */

// Auto-detect WebSocket URL based on environment
const getWebSocketURL = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

    // Production: stash.scalebase.io
    if (hostname === 'stash.scalebase.io') {
      return 'wss://stash.scalebase.io/ws';
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
const generateRoomId = () => `room-${Math.random().toString(36).substr(2, 6)}`;
const SESSION_USER_ID = generateUserId();

interface Participant {
  userId: string;
  userName: string;
  isStreaming: boolean;
}

interface RoomInfo {
  roomId: string;
  roomName: string;
  participantCount: number;
}

const MultiUserStreamingExample: React.FC = () => {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  // Room state
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [currentRoomName, setCurrentRoomName] = useState('');
  const [availableRooms, setAvailableRooms] = useState<RoomInfo[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [myStreamActive, setMyStreamActive] = useState(false);

  // UI state
  const [userName, setUserName] = useState(`User${SESSION_USER_ID.slice(-4)}`);
  const [newRoomName, setNewRoomName] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);

  // WebSocket connection
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

        // Request available rooms list
        ws.send(JSON.stringify({ type: 'list-rooms' }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('[WebSocket] Received:', message);

          switch (message.type) {
            case 'rooms-list':
              setAvailableRooms(message.rooms || []);
              break;

            case 'room-joined':
              console.log('[WebSocket] Joined room:', message.roomId);
              setCurrentRoom(message.roomId);
              setParticipants(message.participants.filter((p: Participant) => p.userId !== SESSION_USER_ID));
              initializeChatMessages(message.roomId);
              break;

            case 'user-joined':
              console.log('[WebSocket] User joined:', message.userName);
              setParticipants(message.participants.filter((p: Participant) => p.userId !== SESSION_USER_ID));
              addSystemMessage(`${message.userName} joined the room`);
              break;

            case 'user-left':
              console.log('[WebSocket] User left:', message.userId);
              setParticipants(message.participants.filter((p: Participant) => p.userId !== SESSION_USER_ID));
              const leftUser = participants.find(p => p.userId === message.userId);
              if (leftUser) {
                addSystemMessage(`${leftUser.userName} left the room`);
              }
              break;

            case 'user-streaming-started':
              console.log('[WebSocket] User started streaming:', message.userId);
              setParticipants(message.participants.filter((p: Participant) => p.userId !== SESSION_USER_ID));
              const streamingUser = message.participants.find((p: Participant) => p.userId === message.userId);
              if (streamingUser && streamingUser.userId !== SESSION_USER_ID) {
                addSystemMessage(`📹 ${streamingUser.userName} started streaming`);
              }
              break;

            case 'user-streaming-stopped':
              console.log('[WebSocket] User stopped streaming:', message.userId);
              setParticipants(message.participants.filter((p: Participant) => p.userId !== SESSION_USER_ID));
              const stoppedUser = message.participants.find((p: Participant) => p.userId === message.userId);
              if (stoppedUser && stoppedUser.userId !== SESSION_USER_ID) {
                addSystemMessage(`⏹️ ${stoppedUser.userName} stopped streaming`);
              }
              break;

            case 'chat-message':
              if (message.userId !== SESSION_USER_ID) {
                addChatMessage(message.userId, message.userName, message.content);
              }
              break;

            case 'pong':
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
        setCurrentRoom(null);

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

  const createRoom = () => {
    if (!newRoomName.trim()) return;

    const roomId = generateRoomId();
    joinRoom(roomId, newRoomName);
    setNewRoomName('');
  };

  const joinRoom = (roomId: string, roomName?: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setCurrentRoomName(roomName || roomId);
      wsRef.current.send(JSON.stringify({
        type: 'join-room',
        roomId,
        userId: SESSION_USER_ID,
        userName,
        roomName: roomName || roomId,
      }));
    }
  };

  const leaveRoom = () => {
    if (myStreamActive) {
      handleStreamStop();
    }
    setCurrentRoom(null);
    setCurrentRoomName('');
    setParticipants([]);
    setChatMessages([]);
    setMyStreamActive(false);

    // Request updated rooms list
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'list-rooms' }));
    }
  };

  const handleStreamStart = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'start-streaming',
        roomId: currentRoom,
        userId: SESSION_USER_ID,
      }));
      setMyStreamActive(true);
      addSystemMessage('📹 You started streaming');
    }
  };

  const handleStreamStop = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'stop-streaming',
        roomId: currentRoom,
        userId: SESSION_USER_ID,
      }));
      setMyStreamActive(false);
      addSystemMessage('⏹️ You stopped streaming');
    }
  };

  const initializeChatMessages = (roomId: string) => {
    const welcomeMessages: Message[] = [
      {
        id: 'welcome',
        content: `🎉 Welcome to **${currentRoomName}**!`,
        sender: { id: 'system', name: 'System', avatar: '🤖' },
        timestamp: new Date(),
        status: 'delivered',
        isOwn: false,
      },
      {
        id: 'instructions',
        content: '**How to stream:**\n\n1️⃣ Click "Start My Stream" below to activate your camera\n2️⃣ Other participants will see your stream automatically\n3️⃣ You can chat with everyone in the room\n4️⃣ Click "Stop Stream" when you\'re done',
        sender: { id: 'system', name: 'System', avatar: '📋' },
        timestamp: new Date(),
        status: 'delivered',
        isOwn: false,
      },
    ];
    setChatMessages(welcomeMessages);
  };

  const addSystemMessage = (content: string) => {
    const msg: Message = {
      id: `system-${Date.now()}`,
      content,
      sender: { id: 'system', name: 'System', avatar: '📢' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: false,
    };
    setChatMessages(prev => [...prev, msg]);
  };

  const addChatMessage = (userId: string, userName: string, content: string) => {
    const msg: Message = {
      id: `chat-${Date.now()}`,
      content,
      sender: { id: userId, name: userName, avatar: '👤' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: false,
    };
    setChatMessages(prev => [...prev, msg]);
  };

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      sender: { id: SESSION_USER_ID, name: userName, avatar: '👤' },
      timestamp: new Date(),
      status: 'sending',
      isOwn: true,
    };
    setChatMessages([...chatMessages, newMessage]);

    // Send to server
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat-message',
        roomId: currentRoom,
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

  // Render participant streams
  useEffect(() => {
    if (!currentRoom) return;

    const streamMessages: Message[] = [];

    // Add my stream
    if (myStreamActive) {
      streamMessages.push({
        id: 'my-stream',
        content: `📹 **Your Camera** (${userName})`,
        sender: { id: SESSION_USER_ID, name: userName, avatar: '🎬' },
        timestamp: new Date(),
        status: 'delivered',
        isOwn: true,
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
      });
    }

    // Add other participants' streams
    participants.forEach((participant) => {
      if (participant.isStreaming) {
        streamMessages.push({
          id: `stream-${participant.userId}`,
          content: `🔴 **${participant.userName}** is streaming`,
          sender: { id: participant.userId, name: participant.userName, avatar: '👤' },
          timestamp: new Date(),
          status: 'delivered',
          isOwn: false,
          interactiveComponent: {
            type: 'live-camera-stream',
            data: {
              mode: 'full',
              autoStart: false,
              showControls: false,
              enableFlip: false,
            },
          },
        });
      }
    });

    // Update messages with streams
    if (streamMessages.length > 0) {
      setChatMessages(prev => {
        // Remove old stream messages
        const withoutStreams = prev.filter(m => !m.id.startsWith('stream-') && m.id !== 'my-stream');
        // Add new stream messages at the beginning (after welcome messages)
        const welcomeMessages = withoutStreams.slice(0, 2);
        const chatMessages = withoutStreams.slice(2);
        return [...welcomeMessages, ...streamMessages, ...chatMessages];
      });
    }
  }, [participants, myStreamActive, currentRoom]);

  // Lobby view
  if (!currentRoom) {
    return (
      <View style={styles.lobbyContainer}>
        <View style={styles.lobbyHeader}>
          <Text style={styles.lobbyTitle}>🎥 Video Chat Rooms</Text>
          <Text style={styles.lobbySubtitle}>
            {isConnected ? '🟢 Connected' : `🔴 ${connectionStatus}`}
          </Text>
        </View>

        {/* User name input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Name</Text>
          <TextInput
            style={styles.input}
            value={userName}
            onChangeText={setUserName}
            placeholder="Enter your name"
            placeholderTextColor="#999"
          />
        </View>

        {/* Create new room */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Create New Room</Text>
          <View style={styles.createRoomRow}>
            <TextInput
              style={[styles.input, styles.inputFlex]}
              value={newRoomName}
              onChangeText={setNewRoomName}
              placeholder="Room name (e.g., Team Meeting)"
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, !newRoomName.trim() && styles.buttonDisabled]}
              onPress={createRoom}
              disabled={!newRoomName.trim()}
            >
              <Text style={styles.buttonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Available rooms */}
        <View style={[styles.section, styles.sectionFlex]}>
          <Text style={styles.sectionTitle}>
            Available Rooms ({availableRooms.length})
          </Text>
          {!isConnected ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>{connectionStatus}</Text>
            </View>
          ) : availableRooms.length === 0 ? (
            <View style={styles.centerContent}>
              <Text style={styles.emptyText}>No active rooms</Text>
              <Text style={styles.emptySubtext}>Create one to get started!</Text>
            </View>
          ) : (
            <FlatList
              data={availableRooms}
              keyExtractor={(item) => item.roomId}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.roomCard}
                  onPress={() => joinRoom(item.roomId, item.roomName)}
                >
                  <View style={styles.roomInfo}>
                    <Text style={styles.roomName}>🏠 {item.roomName || item.roomId}</Text>
                    <Text style={styles.roomParticipants}>
                      👥 {item.participantCount} {item.participantCount === 1 ? 'person' : 'people'}
                    </Text>
                  </View>
                  <Text style={styles.joinButton}>Join →</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    );
  }

  // Chat room view
  return (
    <View style={styles.container}>
      <View style={styles.roomControls}>
        <TouchableOpacity style={styles.leaveButton} onPress={leaveRoom}>
          <Text style={styles.leaveButtonText}>← Leave Room</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.streamButton,
            myStreamActive ? styles.streamButtonActive : styles.streamButtonInactive
          ]}
          onPress={myStreamActive ? handleStreamStop : handleStreamStart}
        >
          <Text style={styles.streamButtonText}>
            {myStreamActive ? '⏹️ Stop My Stream' : '▶️ Start My Stream'}
          </Text>
        </TouchableOpacity>
      </View>

      <Chat
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        placeholder="Send a message..."
        currentUserId={SESSION_USER_ID}
        title={currentRoomName}
        subtitle={`${participants.length + 1} participant${participants.length !== 0 ? 's' : ''} • ${participants.filter(p => p.isStreaming).length + (myStreamActive ? 1 : 0)} streaming`}
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
  lobbyContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 20,
  },
  lobbyHeader: {
    marginBottom: 24,
  },
  lobbyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  lobbySubtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionFlex: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  inputFlex: {
    flex: 1,
  },
  createRoomRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonDisabled: {
    backgroundColor: '#CCC',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  roomCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  roomParticipants: {
    fontSize: 14,
    color: '#666',
  },
  joinButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  roomControls: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    gap: 12,
  },
  leaveButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  leaveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  streamButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  streamButtonActive: {
    backgroundColor: '#FF3B30',
  },
  streamButtonInactive: {
    backgroundColor: '#34C759',
  },
  streamButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default MultiUserStreamingExample;
