import type { StreamQuality, LiveStreamStats, RTCIceServerCompat } from './VideoStream.types';

/**
 * Calculate connection quality based on various metrics
 */
export const calculateConnectionQuality = (
  bitrate: number,
  latency: number,
  droppedFrames: number
): LiveStreamStats['connectionQuality'] => {
  // Bitrate thresholds (kbps)
  const EXCELLENT_BITRATE = 5000;
  const GOOD_BITRATE = 2500;
  const FAIR_BITRATE = 1000;

  // Latency thresholds (ms)
  const EXCELLENT_LATENCY = 100;
  const GOOD_LATENCY = 300;
  const FAIR_LATENCY = 500;

  // Dropped frames threshold
  const MAX_DROPPED_FRAMES = 10;

  if (
    bitrate >= EXCELLENT_BITRATE &&
    latency <= EXCELLENT_LATENCY &&
    droppedFrames < MAX_DROPPED_FRAMES / 4
  ) {
    return 'excellent';
  }

  if (
    bitrate >= GOOD_BITRATE &&
    latency <= GOOD_LATENCY &&
    droppedFrames < MAX_DROPPED_FRAMES / 2
  ) {
    return 'good';
  }

  if (
    bitrate >= FAIR_BITRATE &&
    latency <= FAIR_LATENCY &&
    droppedFrames < MAX_DROPPED_FRAMES
  ) {
    return 'fair';
  }

  return 'poor';
};

/**
 * Get quality bitrate mapping
 */
export const getQualityBitrate = (quality: StreamQuality): number => {
  const bitrateMap: Record<StreamQuality, number> = {
    'auto': 0, // Auto will be determined dynamically
    '1080p': 5000,
    '720p': 2500,
    '480p': 1000,
    '360p': 600,
    '240p': 400,
  };

  return bitrateMap[quality] || 0;
};

/**
 * Get quality resolution mapping
 */
export const getQualityResolution = (quality: StreamQuality): { width: number; height: number } | null => {
  const resolutionMap: Record<StreamQuality, { width: number; height: number } | null> = {
    'auto': null,
    '1080p': { width: 1920, height: 1080 },
    '720p': { width: 1280, height: 720 },
    '480p': { width: 854, height: 480 },
    '360p': { width: 640, height: 360 },
    '240p': { width: 426, height: 240 },
  };

  return resolutionMap[quality];
};

/**
 * Determine optimal quality based on network conditions
 */
export const getOptimalQuality = (
  availableBitrate: number,
  availableQualities: StreamQuality[]
): StreamQuality => {
  // Remove 'auto' from consideration
  const qualities = availableQualities.filter(q => q !== 'auto');

  // Find the highest quality that fits within available bitrate
  for (const quality of qualities) {
    const requiredBitrate = getQualityBitrate(quality);
    if (availableBitrate >= requiredBitrate * 1.2) { // 20% buffer
      return quality;
    }
  }

  // Default to lowest quality if network is poor
  return qualities[qualities.length - 1] || '360p';
};

/**
 * Format bitrate for display
 */
export const formatBitrate = (bitrate: number): string => {
  if (bitrate >= 1000) {
    return `${(bitrate / 1000).toFixed(1)} Mbps`;
  }
  return `${bitrate} kbps`;
};

/**
 * Format latency for display
 */
export const formatLatency = (latency: number): string => {
  return `${latency}ms`;
};

/**
 * Parse HLS manifest to extract available qualities
 */
export const parseHLSManifest = (manifestText: string): StreamQuality[] => {
  const qualities: StreamQuality[] = ['auto'];
  const lines = manifestText.split('\n');

  for (const line of lines) {
    if (line.includes('RESOLUTION')) {
      const match = line.match(/RESOLUTION=(\d+)x(\d+)/);
      if (match) {
        const height = parseInt(match[2], 10);
        if (height >= 1080) qualities.push('1080p');
        else if (height >= 720) qualities.push('720p');
        else if (height >= 480) qualities.push('480p');
        else if (height >= 360) qualities.push('360p');
        else if (height >= 240) qualities.push('240p');
      }
    }
  }

  return [...new Set(qualities)]; // Remove duplicates
};

/**
 * Create WebRTC peer connection configuration
 */
export const createPeerConnectionConfig = (
  iceServers?: RTCIceServerCompat[]
): any => {
  return {
    iceServers: iceServers || [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
    iceCandidatePoolSize: 10,
  };
};

/**
 * Estimate available bandwidth (simplified implementation)
 */
export const estimateBandwidth = async (): Promise<number> => {
  // This is a simplified estimation
  // In production, you'd use Network Information API or actual measurements
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection && 'downlink' in connection) {
      // downlink is in Mbps, convert to kbps
      return connection.downlink * 1000;
    }
  }

  // Default conservative estimate
  return 2500; // 2.5 Mbps
};

/**
 * Check if HLS is supported
 * Note: In React Native, this would be handled by the Video component
 */
export const isHLSSupported = (): boolean => {
  // expo-av supports HLS natively
  return true;
};

/**
 * Check if MediaSource is supported (for DASH and WebSocket streaming)
 * Note: In React Native, native modules would be needed
 */
export const isMediaSourceSupported = (): boolean => {
  // MediaSource API is not available in React Native
  return false;
};

/**
 * Check if WebRTC is supported
 * Note: In React Native, use react-native-webrtc
 */
export const isWebRTCSupported = (): boolean => {
  // Would require react-native-webrtc package
  return false;
};

/**
 * Calculate aspect ratio from dimensions
 */
export const calculateAspectRatio = (width: number, height: number): string => {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  const ratioWidth = width / divisor;
  const ratioHeight = height / divisor;

  // Common aspect ratios
  if (ratioWidth === 16 && ratioHeight === 9) return '16:9';
  if (ratioWidth === 4 && ratioHeight === 3) return '4:3';
  if (ratioWidth === 1 && ratioHeight === 1) return '1:1';
  if (ratioWidth === 21 && ratioHeight === 9) return '21:9';

  return `${ratioWidth}:${ratioHeight}`;
};

/**
 * Validate stream URL format
 */
export const validateStreamUrl = (url: string, protocol: string): boolean => {
  try {
    new URL(url);

    switch (protocol) {
      case 'hls':
        return url.endsWith('.m3u8') || url.includes('.m3u8?');
      case 'dash':
        return url.endsWith('.mpd') || url.includes('.mpd?');
      case 'websocket':
        return url.startsWith('ws://') || url.startsWith('wss://');
      case 'webrtc':
        return url.startsWith('ws://') || url.startsWith('wss://') || url.startsWith('http');
      case 'progressive':
        return url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('.mp4?') || url.includes('.webm?');
      default:
        return false;
    }
  } catch {
    return false;
  }
};
