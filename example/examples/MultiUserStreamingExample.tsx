import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { Chat } from '../../src/components/Chat';
import type { Message } from '../../src/components/Chat/types';
import { addMinutes } from 'date-fns';
import { useWebRTC } from './useWebRTC';
import { RemoteVideoPlayer } from './RemoteVideoPlayer';
import { LocalVideoPlayer } from './LocalVideoPlayer';

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

    // Local development - connect to mock server on port 8082
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'ws://localhost:8082/ws';
    }

    // Default fallback
    return `${protocol}//${hostname}:8082/ws`;
  }
  return 'ws://localhost:8082/ws';
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
  // Demo mode - works without backend server (falls back automatically if server unavailable)
  const [demoMode, setDemoMode] = useState(false);

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const reconnectAttempts = useRef(0);

  // Room state
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [currentRoomName, setCurrentRoomName] = useState('');
  const [availableRooms, setAvailableRooms] = useState<RoomInfo[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [myStreamActive, setMyStreamActive] = useState(false);
  const myStreamActiveRef = useRef(false); // Track streaming state for WebSocket handlers (avoid stale closures)

  // UI state
  const [userName, setUserName] = useState(`User${SESSION_USER_ID.slice(-4)}`);
  const [newRoomName, setNewRoomName] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);

  // WebRTC hooks
  const webrtc = useWebRTC({
    roomId: currentRoom,
    userId: SESSION_USER_ID,
    onRemoteStream: (userId, stream) => {
      console.log('[App] Received remote stream from:', userId);
      console.log('[App] Stream ID:', stream.id);
      console.log('[App] Stream tracks:', stream.getTracks().map(t => ({ kind: t.kind, id: t.id, enabled: t.enabled, readyState: t.readyState })));
      setRemoteStreams(prev => {
        const updated = new Map(prev).set(userId, stream);
        console.log('[App] Updated remoteStreams map, size:', updated.size);
        return updated;
      });
    },
    onRemoteStreamEnded: (userId) => {
      console.log('[App] Remote stream ended from:', userId);
      setRemoteStreams(prev => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
    },
    sendSignalingMessage: (message) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
      }
    },
  });

  // Sync myStreamActive state to ref (avoid stale closures in WebSocket handlers)
  useEffect(() => {
    myStreamActiveRef.current = myStreamActive;
  }, [myStreamActive]);

  // WebSocket connection
  useEffect(() => {
    if (demoMode) {
      // Demo mode - simulate connection
      setIsConnected(true);
      setConnectionStatus('Demo Mode (No Server Required)');
    } else {
      connectToServer();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [demoMode]);

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
          console.log('[WebSocket] Received message type:', message.type, 'full message:', message);

          switch (message.type) {
            case 'rooms-list':
              setAvailableRooms(message.rooms || []);
              break;

            case 'room-joined':
              console.log('[WebSocket] Joined room:', message.roomId);
              setCurrentRoom(message.roomId);
              setParticipants(message.participants.filter((p: Participant) => p.userId !== SESSION_USER_ID));
              initializeChatMessages(message.roomId);
              // Don't create offers here - wait for already-streaming users to send offers to us
              break;

            case 'user-joined':
              console.log('[WebSocket] User joined:', message.userName, 'userId:', message.userId);
              console.log('[WebSocket] My streaming state - myStreamActiveRef:', myStreamActiveRef.current, 'hasLocalStream:', !!localStreamRef.current);
              setParticipants(message.participants.filter((p: Participant) => p.userId !== SESSION_USER_ID));
              addSystemMessage(`${message.userName} joined the room`);

              // If I'm currently streaming, create an offer to the new user (use ref to avoid stale closure)
              if (myStreamActiveRef.current && localStreamRef.current) {
                console.log('[WebRTC] ✅ I am streaming, creating offer to newly joined user:', message.userId);
                webrtc.createOffer(message.userId);
              } else {
                console.log('[WebRTC] ❌ NOT creating offer - myStreamActiveRef:', myStreamActiveRef.current, 'localStream:', !!localStreamRef.current);
              }
              break;

            case 'user-left':
              console.log('[WebSocket] User left:', message.userId);
              setParticipants(message.participants.filter((p: Participant) => p.userId !== SESSION_USER_ID));
              const leftUser = participants.find(p => p.userId === message.userId);
              if (leftUser) {
                addSystemMessage(`${leftUser.userName} left the room`);
                // Clean up peer connection
                webrtc.removePeer(message.userId);
              }
              break;

            case 'user-streaming-started':
              console.log('[WebSocket] 🎬 User started streaming:', message.userId);
              console.log('[WebSocket] 🔍 My userId:', SESSION_USER_ID);
              console.log('[WebSocket] 🔍 Is it me?', message.userId === SESSION_USER_ID);
              setParticipants(message.participants.filter((p: Participant) => p.userId !== SESSION_USER_ID));
              const streamingUser = message.participants.find((p: Participant) => p.userId === message.userId);
              console.log('[WebSocket] 🔍 Found streamingUser:', streamingUser?.userId, streamingUser?.userName);
              if (streamingUser && streamingUser.userId !== SESSION_USER_ID) {
                addSystemMessage(`📹 ${streamingUser.userName} started streaming`);
                console.log('[WebSocket] 🔍 Checking if I should create offer - myStreamActive:', myStreamActiveRef.current, 'hasLocalStream:', !!localStreamRef.current);
                // If I'm currently streaming, create offer to the newly streaming user
                if (myStreamActiveRef.current && localStreamRef.current) {
                  console.log('[WebRTC] ✅ I am streaming, creating offer to newly streaming user:', message.userId);
                  webrtc.createOffer(message.userId);
                } else {
                  console.log('[WebRTC] ❌ I am not streaming, not creating offer');
                }
              } else {
                console.log('[WebSocket] ⏭️ Skipping offer creation - either no streamingUser found or it\'s me');
              }
              break;

            case 'user-streaming-stopped':
              console.log('[WebSocket] User stopped streaming:', message.userId);
              setParticipants(message.participants.filter((p: Participant) => p.userId !== SESSION_USER_ID));
              const stoppedUser = message.participants.find((p: Participant) => p.userId === message.userId);
              if (stoppedUser && stoppedUser.userId !== SESSION_USER_ID) {
                addSystemMessage(`⏹️ ${stoppedUser.userName} stopped streaming`);
                // Remove the peer connection since they're no longer streaming
                webrtc.removePeer(message.userId);
              }
              break;

            case 'chat-message':
              if (message.userId !== SESSION_USER_ID) {
                addChatMessage(message.userId, message.userName, message.content);
              }
              break;

            case 'pong':
              break;

            case 'webrtc-offer':
              console.log('[WebSocket] Received WebRTC offer from:', message.fromUserId);
              webrtc.handleOffer(message.fromUserId, message.offer);
              break;

            case 'webrtc-answer':
              console.log('[WebSocket] Received WebRTC answer from:', message.fromUserId);
              webrtc.handleAnswer(message.fromUserId, message.answer);
              break;

            case 'webrtc-ice-candidate':
              console.log('[WebSocket] Received ICE candidate from:', message.fromUserId);
              webrtc.handleIceCandidate(message.fromUserId, message.candidate);
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
        setCurrentRoom(null);

        // Limit reconnection attempts to prevent infinite loop
        if (reconnectAttempts.current < 3) {
          reconnectAttempts.current += 1;
          setConnectionStatus(`Reconnecting... (${reconnectAttempts.current}/3)`);

          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('[WebSocket] Attempting to reconnect...', reconnectAttempts.current);
            connectToServer();
          }, 3000);
        } else {
          setConnectionStatus('Cannot connect to server. Switching to Demo Mode.');
          setTimeout(() => {
            setDemoMode(true);
            reconnectAttempts.current = 0;
          }, 2000);
        }
      };
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      setConnectionStatus('Failed to connect');
    }
  };

  const createRoom = () => {
    if (!newRoomName.trim()) {
      console.log('[CreateRoom] Room name is empty');
      return;
    }

    if (!demoMode && (!isConnected || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)) {
      console.log('[CreateRoom] Not connected to server');
      return;
    }

    console.log('[CreateRoom] Creating room:', newRoomName);
    const roomId = generateRoomId();

    if (demoMode) {
      // Demo mode - simulate room creation
      setCurrentRoom(roomId);
      setCurrentRoomName(newRoomName);
      initializeChatMessages(roomId);
    } else {
      joinRoom(roomId, newRoomName);
    }

    setNewRoomName('');
  };

  const joinRoom = (roomId: string, roomName?: string) => {
    console.log('[JoinRoom] Attempting to join room:', roomId, roomName);
    console.log('[JoinRoom] WebSocket state:', wsRef.current?.readyState);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setCurrentRoomName(roomName || roomId);
      const message = {
        type: 'join-room',
        roomId,
        userId: SESSION_USER_ID,
        userName,
        roomName: roomName || roomId,
      };
      console.log('[JoinRoom] Sending message:', message);
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('[JoinRoom] WebSocket not ready:', {
        exists: !!wsRef.current,
        readyState: wsRef.current?.readyState,
        expectedState: WebSocket.OPEN,
      });
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

  const handleStreamStart = async () => {
    try {
      // Get user's camera/microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;
      webrtc.startStreaming(stream);

      if (demoMode) {
        setMyStreamActive(true);
        addSystemMessage('📹 You started streaming');
      } else if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // Notify server
        wsRef.current.send(JSON.stringify({
          type: 'start-streaming',
          roomId: currentRoom,
          userId: SESSION_USER_ID,
        }));
        setMyStreamActive(true);
        addSystemMessage('📹 You started streaming');

        // Create offers to users who are ALREADY streaming
        const alreadyStreamingUsers = participants.filter(p => p.isStreaming);
        console.log('[WebRTC] Started streaming. Found', alreadyStreamingUsers.length, 'already-streaming users');
        alreadyStreamingUsers.forEach(user => {
          console.log('[WebRTC] ✅ Creating offer to already-streaming user:', user.userId);
          webrtc.createOffer(user.userId);
        });
      }
    } catch (error) {
      console.error('[Stream] Error starting stream:', error);
      addSystemMessage('❌ Failed to access camera/microphone');
    }
  };

  const handleStreamStop = () => {
    // Stop local media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    webrtc.stopStreaming();

    if (demoMode) {
      setMyStreamActive(false);
      addSystemMessage('⏹️ You stopped streaming');
    } else if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
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

  const handleSendMessage = (message: Message) => {
    // Message is already created by Chat component, just add it to our state
    setChatMessages([...chatMessages, message]);

    // Send to server (if not in demo mode)
    if (!demoMode && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat-message',
        roomId: currentRoom,
        userId: SESSION_USER_ID,
        content: message.content,
      }));
    }

    setTimeout(() => {
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, status: 'delivered' as const } : msg
        )
      );
    }, 500);
  };

  // Render participant streams
  useEffect(() => {
    if (!currentRoom) return;

    const streamMessages: Message[] = [];

    // Add my stream
    if (myStreamActive && localStreamRef.current) {
      streamMessages.push({
        id: 'my-stream',
        content: `📹 **Your Camera** (${userName})`,
        sender: { id: SESSION_USER_ID, name: userName, avatar: '🎬' },
        timestamp: new Date(),
        status: 'delivered',
        isOwn: true,
        interactiveComponent: {
          type: 'custom',
          data: {
            stream: localStreamRef.current,
          },
          customRenderer: () => (
            <LocalVideoPlayer stream={localStreamRef.current!} />
          ),
        },
      });
    }

    // Add other participants' streams
    participants.forEach((participant) => {
      if (participant.isStreaming) {
        const remoteStream = remoteStreams.get(participant.userId);

        streamMessages.push({
          id: `stream-${participant.userId}`,
          content: remoteStream
            ? `🎥 **${participant.userName}** is live`
            : `🔴 **${participant.userName}** is streaming (connecting...)`,
          sender: { id: participant.userId, name: participant.userName, avatar: '📹' },
          timestamp: new Date(),
          status: 'delivered',
          isOwn: false,
          interactiveComponent: remoteStream ? {
            type: 'custom',
            data: {
              stream: remoteStream,
              userName: participant.userName,
            },
            customRenderer: () => (
              <RemoteVideoPlayer
                stream={remoteStream}
                userName={participant.userName}
              />
            ),
          } : undefined,
        });
      }
    });

    // Update messages with streams
    console.log('[RenderStreams] Rendering streams - participants:', participants.length, 'myStreamActive:', myStreamActive, 'remoteStreams:', remoteStreams.size);
    if (streamMessages.length > 0) {
      console.log('[RenderStreams] Adding', streamMessages.length, 'stream messages to chat');
      setChatMessages(prev => {
        // Remove old stream messages
        const withoutStreams = prev.filter(m => !m.id.startsWith('stream-') && m.id !== 'my-stream');
        // Add new stream messages at the beginning (after welcome messages)
        const welcomeMessages = withoutStreams.slice(0, 2);
        const chatMessages = withoutStreams.slice(2);
        return [...welcomeMessages, ...streamMessages, ...chatMessages];
      });
    }
  }, [participants, myStreamActive, currentRoom, remoteStreams, userName]);

  // Lobby view
  if (!currentRoom) {
    return (
      <View style={styles.lobbyContainer}>
        <View style={styles.lobbyHeader}>
          <Text style={styles.lobbyTitle}>🎥 Video Chat Rooms</Text>
          <Text style={styles.lobbySubtitle}>
            {demoMode ? '🟢 Demo Mode - No Server Required' : (isConnected ? '🟢 Connected' : `🔴 ${connectionStatus}`)}
          </Text>
          {!isConnected && !demoMode && (
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary, { marginTop: 12 }]}
              onPress={() => {
                setDemoMode(true);
                reconnectAttempts.current = 0;
              }}
            >
              <Text style={[styles.buttonText, { color: '#007AFF' }]}>
                Skip to Demo Mode →
              </Text>
            </TouchableOpacity>
          )}
          {demoMode && (
            <Text style={styles.demoNotice}>
              Running in demo mode. Create a room and test the live camera streaming!
            </Text>
          )}
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
  demoNotice: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 8,
    fontStyle: 'italic',
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
  buttonSecondary: {
    backgroundColor: '#F0F0F0',
    borderWidth: 2,
    borderColor: '#007AFF',
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
