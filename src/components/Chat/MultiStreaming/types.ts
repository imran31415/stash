/// <reference path="./webrtc.d.ts" />
import type { Message } from '../types';

export interface Participant {
  userId: string;
  userName: string;
  isStreaming: boolean;
}

export interface RoomInfo {
  roomId: string;
  roomName: string;
  participantCount: number;
  hasPassword?: boolean;
}

export interface MultiStreamingChatConfig {
  /**
   * WebSocket server URL for signaling
   * @example 'ws://localhost:4082/ws' or 'wss://yourserver.com/ws'
   */
  wsUrl: string;

  /**
   * LiveKit server URL (optional, for SFU mode)
   * @example 'wss://livekit.yourserver.com'
   */
  liveKitUrl?: string;

  /**
   * Current user ID
   */
  userId: string;

  /**
   * Current user name (optional, defaults to User-XXXX)
   */
  userName?: string;

  /**
   * Enable SFU mode via LiveKit (default: false)
   * When false, uses P2P mesh networking
   */
  useSFU?: boolean;

  /**
   * Threshold for auto-switching to SFU mode based on participant count
   * Default: 999 (effectively disabled)
   */
  sfuThreshold?: number;

  /**
   * Enable demo mode (works without backend server)
   * Default: false
   */
  demoMode?: boolean;

  /**
   * Initial room to join (optional)
   */
  initialRoomId?: string;

  /**
   * Initial room password (optional)
   */
  initialRoomPassword?: string;

  /**
   * Custom styles for the component (not yet implemented)
   */
  styles?: Record<string, any>;

  /**
   * Callbacks
   */
  onRoomJoin?: (roomId: string, roomName: string) => void;
  onRoomLeave?: () => void;
  onStreamStart?: () => void;
  onStreamStop?: () => void;
  onError?: (error: Error) => void;
  onParticipantJoin?: (participant: Participant) => void;
  onParticipantLeave?: (userId: string) => void;
}

export interface MultiStreamingChatProps extends MultiStreamingChatConfig {
  /**
   * Initial messages to display in chat (optional)
   */
  initialMessages?: Message[];

  /**
   * Placeholder text for message input
   */
  placeholder?: string;

  /**
   * Show/hide typing indicator
   */
  showTypingIndicator?: boolean;
}

// WebSocket message types
export interface WSMessage {
  type: string;
  [key: string]: any;
}

export interface JoinRoomMessage extends WSMessage {
  type: 'join-room';
  roomId: string;
  userId: string;
  userName: string;
  password?: string;
}

export interface LeaveRoomMessage extends WSMessage {
  type: 'leave-room';
  roomId: string;
  userId: string;
}

export interface StartStreamMessage extends WSMessage {
  type: 'start-stream';
  roomId: string;
  userId: string;
}

export interface StopStreamMessage extends WSMessage {
  type: 'stop-stream';
  roomId: string;
  userId: string;
}

export interface ChatMessageWS extends WSMessage {
  type: 'chat-message';
  roomId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
}

export interface WebRTCSignal extends WSMessage {
  type: 'webrtc-offer' | 'webrtc-answer' | 'webrtc-ice-candidate';
  fromUserId: string;
  toUserId: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}
