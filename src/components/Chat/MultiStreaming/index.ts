/**
 * MultiStreamingChat - A complete multi-user video streaming chat solution
 *
 * This module exports all necessary components, hooks, and utilities for building
 * multi-user video chat applications with WebRTC support.
 *
 * @example
 * ```tsx
 * import { useWebRTC, RemoteVideoPlayer, LocalVideoPlayer } from '@yourorg/stash';
 *
 * // See MultiUserStreamingExample.tsx in examples/ for full implementation
 * ```
 */

// Hooks
export { useWebRTC } from './useWebRTC';
export { useWebRTCLiveKit } from './useWebRTCLiveKit';

// Components
export { RemoteVideoPlayer } from './RemoteVideoPlayer';
export { LocalVideoPlayer } from './LocalVideoPlayer';

// Types
export type {
  Participant,
  RoomInfo,
  MultiStreamingChatConfig,
  MultiStreamingChatProps,
  WSMessage,
  JoinRoomMessage,
  LeaveRoomMessage,
  StartStreamMessage,
  StopStreamMessage,
  ChatMessageWS,
  WebRTCSignal,
} from './types';

// Utilities
export {
  generateUserId,
  generateRoomId,
  getDefaultWebSocketURL,
  getDefaultLiveKitURL,
  parseRoomFromURL,
  generateRoomURL,
  copyToClipboard,
} from './utils';
