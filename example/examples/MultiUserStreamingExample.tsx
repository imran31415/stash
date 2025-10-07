import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, TextInput, FlatList, ActivityIndicator, Modal, Pressable, Dimensions } from 'react-native';
import { Chat } from '../../src/components/Chat';
import type { Message } from '../../src/components/Chat/types';
import { addMinutes } from 'date-fns';
import { useWebRTC } from './useWebRTC';
import { useWebRTCLiveKit } from './useWebRTCLiveKit';
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

    // Local development - connect to mock server on port 4082
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'ws://localhost:4082/ws';
    }

    // Default fallback
    return `${protocol}//${hostname}:4082/ws`;
  }
  return 'ws://localhost:4082/ws';
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
  hasPassword?: boolean;
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

  // URL routing state
  const [urlRoomId, setUrlRoomId] = useState<string | null>(null);
  const [urlRoomPassword, setUrlRoomPassword] = useState<string | null>(null);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [currentRoomPassword, setCurrentRoomPassword] = useState<string | null>(null);
  const [showCopyLinkModal, setShowCopyLinkModal] = useState(false);

  // Media controls state
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  // UI state
  const [userName, setUserName] = useState(`User${SESSION_USER_ID.slice(-4)}`);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomPassword, setNewRoomPassword] = useState('');
  const [joinRoomPassword, setJoinRoomPassword] = useState('');
  const [selectedRoomToJoin, setSelectedRoomToJoin] = useState<RoomInfo | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);

  // SFU mode toggle (auto-switch based on participant count)
  // DISABLED FOR NOW - Keep using P2P mesh until we verify it works
  const [useSFU, setUseSFU] = useState(false);
  const SFU_THRESHOLD = 999; // Effectively disabled - was 10

  // Auto-detect LiveKit server URL
  const getLiveKitUrl = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

      // Production: use livekit subdomain
      if (hostname === 'stash.scalebase.io') {
        return 'wss://livekit.scalebase.io';
      }

      // Local development
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'ws://localhost:7880';
      }

      // Default fallback
      return `${protocol}//livekit.${hostname}`;
    }
    return 'ws://localhost:7880';
  };

  // Mesh WebRTC hooks (P2P) - only active when NOT using SFU
  const meshWebRTC = useWebRTC({
    roomId: !useSFU && currentRoom ? currentRoom : null,
    userId: SESSION_USER_ID,
    onRemoteStream: (userId, stream) => {
      if (!useSFU) {
        console.log('[App] [Mesh] Received remote stream from:', userId);
        console.log('[App] Stream ID:', stream.id);
        console.log('[App] Stream tracks:', stream.getTracks().map(t => ({ kind: t.kind, id: t.id, enabled: t.enabled, readyState: t.readyState })));
        setRemoteStreams(prev => {
          const updated = new Map(prev).set(userId, stream);
          console.log('[App] Updated remoteStreams map, size:', updated.size);
          return updated;
        });
      }
    },
    onRemoteStreamEnded: (userId) => {
      if (!useSFU) {
        console.log('[App] [Mesh] Remote stream ended from:', userId);
        setRemoteStreams(prev => {
          const next = new Map(prev);
          next.delete(userId);
          return next;
        });
      }
    },
    sendSignalingMessage: (message) => {
      if (!useSFU && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
      }
    },
  });

  // LiveKit SFU hooks - only active when using SFU
  const livekitWebRTC = useWebRTCLiveKit({
    roomId: useSFU && currentRoom ? currentRoom : null,
    userId: SESSION_USER_ID,
    userName,
    serverUrl: getLiveKitUrl(),
    onRemoteStream: (userId, stream) => {
      if (useSFU) {
        console.log('[App] [LiveKit] Received remote stream from:', userId);
        setRemoteStreams(prev => new Map(prev).set(userId, stream));
      }
    },
    onRemoteStreamEnded: (userId) => {
      if (useSFU) {
        console.log('[App] [LiveKit] Remote stream ended from:', userId);
        setRemoteStreams(prev => {
          const next = new Map(prev);
          next.delete(userId);
          return next;
        });
      }
    },
  });

  // Sync myStreamActive state to ref (avoid stale closures in WebSocket handlers)
  useEffect(() => {
    myStreamActiveRef.current = myStreamActive;
  }, [myStreamActive]);

  // Auto-switch to SFU mode when participant count exceeds threshold
  useEffect(() => {
    const totalParticipants = participants.length + 1; // +1 for current user
    const shouldUseSFU = totalParticipants >= SFU_THRESHOLD;

    if (shouldUseSFU !== useSFU) {
      console.log(`[Mode] Switching to ${shouldUseSFU ? 'SFU' : 'Mesh'} mode (${totalParticipants} participants)`);
      setUseSFU(shouldUseSFU);

      if (shouldUseSFU) {
        addSystemMessage(`🚀 Switched to SFU mode for better performance with ${totalParticipants} participants`);
      } else {
        addSystemMessage(`🔄 Switched back to P2P mode`);
      }
    }
  }, [participants.length]);

  // Read room ID and password from URL on mount (web only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const pathParts = url.pathname.split('/');
      // Check for /room/roomId pattern
      const roomIndex = pathParts.indexOf('room');
      if (roomIndex !== -1 && pathParts[roomIndex + 1]) {
        const roomId = pathParts[roomIndex + 1];
        const password = url.searchParams.get('p');
        console.log('[URL] Found room ID in URL:', roomId, password ? '(with password)' : '(no password)');
        setUrlRoomId(roomId);
        setUrlRoomPassword(password);
      }
    }
  }, []);

  // Auto-join room from URL when connected
  useEffect(() => {
    if (isConnected && urlRoomId && !currentRoom) {
      console.log('[URL] Auto-joining room from URL:', urlRoomId, urlRoomPassword ? '(with password)' : '(no password)');
      handleJoinRoom(urlRoomId, `Room ${urlRoomId}`, urlRoomPassword || undefined);
      setUrlRoomId(null); // Clear to prevent re-joining
      setUrlRoomPassword(null);
    }
  }, [isConnected, urlRoomId, urlRoomPassword, currentRoom]);

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
              console.log('[WebSocket] 🔍 DEBUG: Received participants from server:', JSON.stringify(message.participants));
              setCurrentRoom(message.roomId);
              const filteredParticipants = message.participants.filter((p: Participant) => p.userId !== SESSION_USER_ID);
              console.log('[WebSocket] 🔍 DEBUG: Filtered participants (excluding me):', JSON.stringify(filteredParticipants));
              setParticipants(filteredParticipants);
              initializeChatMessages(message.roomId);
              // Store the password used to join (for copy link functionality)
              if (message.roomId === currentRoom) {
                setCurrentRoomPassword(joinRoomPassword || newRoomPassword || null);
              }
              // Don't create offers here - wait for already-streaming users to send offers to us
              break;

            case 'user-joined':
              console.log('[WebSocket] User joined:', message.userName, 'userId:', message.userId);
              console.log('[WebSocket] My streaming state - myStreamActiveRef:', myStreamActiveRef.current, 'hasLocalStream:', !!localStreamRef.current);
              setParticipants(message.participants.filter((p: Participant) => p.userId !== SESSION_USER_ID));
              addSystemMessage(`${message.userName} joined the room`);

              // If I'm currently streaming, create an offer to the new user (use ref to avoid stale closure)
              if (myStreamActiveRef.current && localStreamRef.current && !useSFU) {
                console.log('[WebRTC] ✅ I am streaming, creating offer to newly joined user:', message.userId);
                meshWebRTC.createOffer(message.userId);
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
                if (!useSFU) {
                  meshWebRTC.removePeer(message.userId);
                }
              }
              break;

            case 'user-streaming-started':
              console.log('[WebSocket] 🎬 User started streaming:', message.userId);
              console.log('[WebSocket] 🔍 My userId:', SESSION_USER_ID);
              console.log('[WebSocket] 🔍 Is it me?', message.userId === SESSION_USER_ID);
              console.log('[WebSocket] 🔍 DEBUG: Received participants from server:', JSON.stringify(message.participants));
              const streamingFilteredParticipants = message.participants.filter((p: Participant) => p.userId !== SESSION_USER_ID);
              console.log('[WebSocket] 🔍 DEBUG: Filtered participants (excluding me):', JSON.stringify(streamingFilteredParticipants));
              setParticipants(streamingFilteredParticipants);
              const streamingUser = message.participants.find((p: Participant) => p.userId === message.userId);
              console.log('[WebSocket] 🔍 Found streamingUser:', streamingUser?.userId, streamingUser?.userName);

              // If it's me who started streaming, check for already-streaming users
              if (message.userId === SESSION_USER_ID) {
                console.log('[WebSocket] 🔍 It\'s me who started streaming, checking for already-streaming users');
                console.log('[WebSocket] 🔍 All participants:', JSON.stringify(message.participants));
                const alreadyStreamingUsers = message.participants.filter((p: Participant) =>
                  p.userId !== SESSION_USER_ID && p.isStreaming
                );
                console.log('[WebRTC] Found', alreadyStreamingUsers.length, 'already-streaming users:', JSON.stringify(alreadyStreamingUsers));

                if (alreadyStreamingUsers.length === 0) {
                  console.log('[WebRTC] ℹ️ No already-streaming users, nothing to do');
                }

                alreadyStreamingUsers.forEach(user => {
                  // Use polite/impolite pattern: lower userId creates the offer
                  const shouldCreateOffer = SESSION_USER_ID < user.userId;
                  console.log('[WebRTC] 🔍 Comparing userIds: my=' + SESSION_USER_ID + ' their=' + user.userId + ' shouldCreateOffer=' + shouldCreateOffer);
                  if (shouldCreateOffer && !useSFU) {
                    console.log('[WebRTC] ✅ I am polite peer, creating offer to already-streaming user:', user.userId);
                    console.log('[WebRTC] 🔍 Calling meshWebRTC.createOffer(' + user.userId + ')');
                    meshWebRTC.createOffer(user.userId);
                    console.log('[WebRTC] ✅ createOffer call completed for:', user.userId);
                  } else {
                    console.log('[WebRTC] ℹ️ I am impolite peer, waiting for offer from already-streaming user:', user.userId);
                  }
                });
              } else if (streamingUser && streamingUser.userId !== SESSION_USER_ID) {
                addSystemMessage(`📹 ${streamingUser.userName} started streaming`);

                // If I'm streaming, create offer to the new streamer (use polite/impolite pattern)
                // Lower userId creates the offer to avoid collision
                if (myStreamActiveRef.current && localStreamRef.current && !useSFU) {
                  const shouldCreateOffer = SESSION_USER_ID < message.userId;
                  if (shouldCreateOffer) {
                    console.log('[WebRTC] ✅ I am polite peer, creating offer to newly streaming user:', message.userId);
                    meshWebRTC.createOffer(message.userId);
                  } else {
                    console.log('[WebRTC] ℹ️ I am impolite peer, waiting for offer from:', message.userId);
                  }
                } else {
                  console.log('[WebRTC] ℹ️ I am not streaming, no need to create offer');
                }
              } else {
                console.log('[WebSocket] ⏭️ Skipping - either no streamingUser found or unexpected state');
              }
              break;

            case 'user-streaming-stopped':
              console.log('[WebSocket] User stopped streaming:', message.userId);
              setParticipants(message.participants.filter((p: Participant) => p.userId !== SESSION_USER_ID));
              const stoppedUser = message.participants.find((p: Participant) => p.userId === message.userId);
              if (stoppedUser && stoppedUser.userId !== SESSION_USER_ID) {
                addSystemMessage(`⏹️ ${stoppedUser.userName} stopped streaming`);
                // Remove the peer connection since they're no longer streaming
                if (!useSFU) {
                  meshWebRTC.removePeer(message.userId);
                }
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
              if (!useSFU) {
                meshWebRTC.handleOffer(message.fromUserId, message.offer);
              }
              break;

            case 'webrtc-answer':
              console.log('[WebSocket] Received WebRTC answer from:', message.fromUserId);
              if (!useSFU) {
                meshWebRTC.handleAnswer(message.fromUserId, message.answer);
              }
              break;

            case 'webrtc-ice-candidate':
              console.log('[WebSocket] Received ICE candidate from:', message.fromUserId);
              if (!useSFU) {
                meshWebRTC.handleIceCandidate(message.fromUserId, message.candidate);
              }
              break;

            case 'join-room-error':
              console.log('[WebSocket] Join room error:', message.error);
              if (message.error === 'incorrect-password') {
                // Show password prompt for the room
                setSelectedRoomToJoin({
                  roomId: message.roomId,
                  roomName: message.roomName || message.roomId,
                  participantCount: 0,
                  hasPassword: message.hasPassword
                });
                setPasswordError('Incorrect password. Please try again.');
                setJoinRoomPassword('');
              }
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

    console.log('[CreateRoom] Creating room:', newRoomName, newRoomPassword ? '(with password)' : '(no password)');
    const roomId = generateRoomId();

    if (demoMode) {
      // Demo mode - simulate room creation
      setCurrentRoom(roomId);
      setCurrentRoomName(newRoomName);
      initializeChatMessages(roomId);
      updateURLWithRoom(roomId);
    } else {
      handleJoinRoom(roomId, newRoomName, newRoomPassword);
    }

    setNewRoomName('');
    setNewRoomPassword('');
  };

  // Helper function to update URL with room ID
  const updateURLWithRoom = (roomId: string) => {
    if (typeof window !== 'undefined') {
      const newPath = `/room/${roomId}`;
      window.history.pushState({ roomId }, '', newPath);
      console.log('[URL] Updated URL to:', newPath);
    }
  };

  // Wrapper function for joining rooms that updates URL
  const handleJoinRoom = (roomId: string, roomName?: string, password?: string) => {
    // Store password for later use
    if (password) {
      setCurrentRoomPassword(password);
    }
    joinRoom(roomId, roomName, password);
    updateURLWithRoom(roomId);
  };

  const joinRoom = (roomId: string, roomName?: string, password?: string) => {
    console.log('[JoinRoom] Attempting to join room:', roomId, roomName, password ? '(with password)' : '(no password)');
    console.log('[JoinRoom] WebSocket state:', wsRef.current?.readyState);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setCurrentRoomName(roomName || roomId);
      const message = {
        type: 'join-room',
        roomId,
        userId: SESSION_USER_ID,
        userName,
        roomName: roomName || roomId,
        password: password || undefined,
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
    setCurrentRoomPassword(null);
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

      if (useSFU) {
        livekitWebRTC.startStreaming(stream);
      } else {
        meshWebRTC.startStreaming(stream);
      }

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
        // Note: We'll create offers when we receive the user-streaming-started message from server
        // This ensures we have the latest participant list with correct isStreaming flags
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

    if (useSFU) {
      livekitWebRTC.stopStreaming();
    } else {
      meshWebRTC.stopStreaming();
    }

    // Reset media toggle states
    setIsAudioEnabled(true);
    setIsVideoEnabled(true);

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

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        console.log('[Media] Audio toggled:', audioTrack.enabled ? 'ON' : 'OFF');
        addSystemMessage(audioTrack.enabled ? '🎤 Microphone unmuted' : '🔇 Microphone muted');
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        console.log('[Media] Video toggled:', videoTrack.enabled ? 'ON' : 'OFF');
        addSystemMessage(videoTrack.enabled ? '📹 Camera turned on' : '📷 Camera turned off');
      }
    }
  };

  const initializeChatMessages = (roomId: string) => {
    const welcomeMessages: Message[] = [
      {
        id: 'welcome',
        type: 'system',
        content: `🎉 Welcome to **${currentRoomName}**!`,
        sender: { id: 'system', name: 'System', avatar: '🤖' },
        timestamp: new Date(),
        status: 'delivered',
        isOwn: false,
      },
      {
        id: 'instructions',
        type: 'system',
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
      type: 'system',
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
      type: 'text',
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
        type: 'text',
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
          type: 'text',
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
        // Add new stream messages at the end (as most recent items)
        return [...withoutStreams, ...streamMessages];
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
          <TextInput
            style={[styles.input, { marginTop: 8 }]}
            value={newRoomPassword}
            onChangeText={setNewRoomPassword}
            placeholder="Password (optional)"
            placeholderTextColor="#999"
            secureTextEntry
          />
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
                  onPress={() => {
                    if (item.hasPassword) {
                      setSelectedRoomToJoin(item);
                    } else {
                      handleJoinRoom(item.roomId, item.roomName);
                    }
                  }}
                >
                  <View style={styles.roomInfo}>
                    <Text style={styles.roomName}>
                      🏠 {item.roomName || item.roomId} {item.hasPassword ? '🔒' : ''}
                    </Text>
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

        {/* Password prompt modal */}
        {selectedRoomToJoin && (
          <View style={styles.modalOverlay}>
            <View style={styles.passwordModal}>
              <Text style={styles.modalTitle}>🔒 Password Required</Text>
              <Text style={styles.modalSubtitle}>
                Enter password for {selectedRoomToJoin.roomName}
              </Text>
              {passwordError && (
                <Text style={styles.errorText}>{passwordError}</Text>
              )}
              <TextInput
                style={styles.input}
                value={joinRoomPassword}
                onChangeText={(text) => {
                  setJoinRoomPassword(text);
                  setPasswordError(null);
                }}
                placeholder="Enter password"
                placeholderTextColor="#999"
                secureTextEntry
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary, { flex: 1 }]}
                  onPress={() => {
                    setSelectedRoomToJoin(null);
                    setJoinRoomPassword('');
                    setPasswordError(null);
                  }}
                >
                  <Text style={[styles.buttonText, { color: '#666' }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary, { flex: 1 }, !joinRoomPassword.trim() && styles.buttonDisabled]}
                  onPress={() => {
                    handleJoinRoom(selectedRoomToJoin.roomId, selectedRoomToJoin.roomName, joinRoomPassword);
                    setSelectedRoomToJoin(null);
                    setJoinRoomPassword('');
                    setPasswordError(null);
                  }}
                  disabled={!joinRoomPassword.trim()}
                >
                  <Text style={styles.buttonText}>Join</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }

  // Function to copy room link to clipboard (without password)
  const copyRoomLink = () => {
    if (typeof window !== 'undefined' && currentRoom) {
      const roomURL = `${window.location.origin}/room/${currentRoom}`;
      navigator.clipboard.writeText(roomURL).then(() => {
        setShowCopiedMessage(true);
        setTimeout(() => setShowCopiedMessage(false), 2000);
        console.log('[URL] Copied room link (without password):', roomURL);
      }).catch(err => {
        console.error('[URL] Failed to copy room link:', err);
      });
    }
  };

  // Function to copy room link with password
  const copyRoomLinkWithPassword = () => {
    if (typeof window !== 'undefined' && currentRoom && currentRoomPassword) {
      const roomURL = `${window.location.origin}/room/${currentRoom}?p=${encodeURIComponent(currentRoomPassword)}`;
      navigator.clipboard.writeText(roomURL).then(() => {
        setShowCopiedMessage(true);
        setTimeout(() => setShowCopiedMessage(false), 2000);
        console.log('[URL] Copied room link (with password):', roomURL);
      }).catch(err => {
        console.error('[URL] Failed to copy room link with password:', err);
      });
    }
  };

  // Chat room view
  return (
    <View style={styles.container}>
      <View style={styles.roomControls}>
        <TouchableOpacity style={styles.leaveButton} onPress={leaveRoom}>
          <Text style={styles.leaveButtonText}>← Leave</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.copyLinkButton}
          onPress={() => currentRoomPassword ? setShowCopyLinkModal(true) : copyRoomLink()}
        >
          <Text style={styles.copyLinkButtonText}>
            {showCopiedMessage ? '✓' : '🔗'}
          </Text>
        </TouchableOpacity>

        {myStreamActive && (
          <>
            <TouchableOpacity
              style={[styles.mediaToggleButton, !isAudioEnabled && styles.mediaToggleButtonOff]}
              onPress={toggleAudio}
            >
              <Text style={styles.mediaToggleButtonText}>
                {isAudioEnabled ? '🎤' : '🔇'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mediaToggleButton, !isVideoEnabled && styles.mediaToggleButtonOff]}
              onPress={toggleVideo}
            >
              <Text style={styles.mediaToggleButtonText}>
                {isVideoEnabled ? '📹' : '📷'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={[
            styles.streamButton,
            myStreamActive ? styles.streamButtonActive : styles.streamButtonInactive
          ]}
          onPress={myStreamActive ? handleStreamStop : handleStreamStart}
        >
          <Text style={styles.streamButtonText}>
            {myStreamActive ? '⏹️' : '▶️'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Copy Link Modal */}
      <Modal
        visible={showCopyLinkModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCopyLinkModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCopyLinkModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Copy Room Link</Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                copyRoomLink();
                setShowCopyLinkModal(false);
              }}
            >
              <Text style={styles.modalOptionIcon}>🔗</Text>
              <View style={styles.modalOptionTextContainer}>
                <Text style={styles.modalOptionTitle}>Copy Link</Text>
                <Text style={styles.modalOptionDescription}>Share without password</Text>
              </View>
            </TouchableOpacity>

            {currentRoomPassword && (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  copyRoomLinkWithPassword();
                  setShowCopyLinkModal(false);
                }}
              >
                <Text style={styles.modalOptionIcon}>🔑</Text>
                <View style={styles.modalOptionTextContainer}>
                  <Text style={styles.modalOptionTitle}>Copy Link + Password</Text>
                  <Text style={styles.modalOptionDescription}>Share with auto-fill password</Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowCopyLinkModal(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <Chat
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        placeholder="Send a message..."
        currentUserId={SESSION_USER_ID}
        title={currentRoomName}
        subtitle={`${participants.length + 1} participant${participants.length !== 0 ? 's' : ''} • ${participants.filter(p => p.isStreaming).length + (myStreamActive ? 1 : 0)} streaming${useSFU ? ' • 🚀 SFU Mode' : ''}`}
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
    flexWrap: 'wrap',
    padding: 8,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    gap: 8,
    alignItems: 'center',
  },
  leaveButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    minWidth: 70,
  },
  leaveButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  copyLinkButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    minWidth: 40,
    alignItems: 'center',
  },
  copyLinkButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  mediaToggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaToggleButtonOff: {
    backgroundColor: '#FF3B30',
  },
  mediaToggleButtonText: {
    fontSize: 18,
  },
  streamButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 40,
  },
  streamButtonActive: {
    backgroundColor: '#FF3B30',
  },
  streamButtonInactive: {
    backgroundColor: '#34C759',
  },
  streamButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  passwordModal: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 12,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    marginBottom: 12,
  },
  modalOptionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  modalOptionTextContainer: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  modalOptionDescription: {
    fontSize: 13,
    color: '#666',
  },
  modalCancelButton: {
    padding: 14,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  modalCancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
});

export default MultiUserStreamingExample;
