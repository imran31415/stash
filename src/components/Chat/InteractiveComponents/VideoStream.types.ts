export type StreamType = 'live' | 'vod' | 'webrtc';
export type StreamProtocol = 'hls' | 'dash' | 'websocket' | 'webrtc' | 'progressive';
export type StreamQuality = 'auto' | '1080p' | '720p' | '480p' | '360p' | '240p';
export type StreamStatus = 'idle' | 'loading' | 'buffering' | 'playing' | 'paused' | 'ended' | 'error';

export interface StreamMetadata {
  title?: string;
  description?: string;
  duration?: number; // in seconds, undefined for live streams
  resolution?: string; // e.g., "1920x1080"
  bitrate?: number; // in kbps
  frameRate?: number;
  codec?: string;
  author?: string;
  thumbnail?: string;
  startTime?: Date; // for live streams
  endTime?: Date; // for live streams
  viewerCount?: number; // for live streams
}

export interface HLSConfig {
  url: string;
  protocol: 'hls';
  qualities?: StreamQuality[];
  defaultQuality?: StreamQuality;
  enableAdaptiveBitrate?: boolean;
}

export interface DASHConfig {
  url: string;
  protocol: 'dash';
  qualities?: StreamQuality[];
  defaultQuality?: StreamQuality;
  enableAdaptiveBitrate?: boolean;
}

export interface WebSocketStreamConfig {
  url: string;
  protocol: 'websocket';
  reconnectAttempts?: number;
  bufferSize?: number; // in seconds
  codec?: string;
}

// Note: RTCIceServer would come from react-native-webrtc in production
export interface RTCIceServerCompat {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface WebRTCConfig {
  signalingUrl: string;
  protocol: 'webrtc';
  iceServers?: RTCIceServerCompat[];
  peerId?: string;
  codec?: string;
}

export interface ProgressiveConfig {
  url: string;
  protocol: 'progressive';
}

export type StreamSource = HLSConfig | DASHConfig | WebSocketStreamConfig | WebRTCConfig | ProgressiveConfig;

export interface VideoStreamData {
  id: string;
  type: StreamType;
  source: StreamSource;
  metadata?: StreamMetadata;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  showMetadata?: boolean;
  showQualitySelector?: boolean;
  showViewerCount?: boolean; // for live streams
  enableChat?: boolean; // for live streams
  enableReactions?: boolean; // for live streams
  poster?: string; // thumbnail before play
  aspectRatio?: string; // e.g., "16:9", "4:3", "1:1"
}

export interface VideoStreamProps {
  data: VideoStreamData;
  mode?: 'mini' | 'full';
  maxHeight?: number;
  maxWidth?: number;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: { currentTime: number; duration: number; buffered: number }) => void;
  onQualityChange?: (quality: StreamQuality) => void;
  onExpandPress?: () => void;
  onViewerCountChange?: (count: number) => void;
  onReaction?: (reaction: string) => void;
  onChatMessage?: (message: string) => void;
}

export interface VideoStreamDetailViewProps {
  visible: boolean;
  data: VideoStreamData;
  onClose: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: Error) => void;
  showMetadata?: boolean;
  enablePictureInPicture?: boolean;
}

export interface StreamState {
  status: StreamStatus;
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  quality: StreamQuality;
  availableQualities: StreamQuality[];
  error?: Error;
}

export interface StreamControlsProps {
  status: StreamStatus;
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  quality: StreamQuality;
  availableQualities: StreamQuality[];
  showQualitySelector?: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onQualityChange: (quality: StreamQuality) => void;
  onFullscreen?: () => void;
  isLive?: boolean;
}

export interface LiveStreamStats {
  viewerCount: number;
  latency: number; // in milliseconds
  bitrate: number; // in kbps
  droppedFrames: number;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface WebSocketStreamChunk {
  sequence: number;
  timestamp: number;
  data: ArrayBuffer;
  duration?: number;
  isKeyframe?: boolean;
}
