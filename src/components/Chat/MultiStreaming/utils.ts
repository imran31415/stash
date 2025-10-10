/// <reference path="./webrtc.d.ts" />

/**
 * Generate a random user ID
 */
export const generateUserId = (): string => {
  return `user-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate a random room ID
 */
export const generateRoomId = (): string => {
  return `room-${Math.random().toString(36).substr(2, 6)}`;
};

/**
 * Get WebSocket URL based on environment
 * This is a default implementation that can be overridden via config
 */
export const getDefaultWebSocketURL = (): string => {
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

/**
 * Get LiveKit URL based on environment
 * This is a default implementation that can be overridden via config
 */
export const getDefaultLiveKitURL = (): string => {
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

/**
 * Parse URL parameters for room ID and password
 */
export const parseRoomFromURL = (): { roomId: string | null; password: string | null } => {
  if (typeof window === 'undefined') {
    return { roomId: null, password: null };
  }

  const url = new URL(window.location.href);
  const pathParts = url.pathname.split('/');

  // Check if URL is in format /room/{roomId}
  const roomIndex = pathParts.indexOf('room');
  const roomId = roomIndex >= 0 && pathParts[roomIndex + 1] ? pathParts[roomIndex + 1] : null;

  // Check for password in query params
  const password = url.searchParams.get('p');

  return { roomId, password };
};

/**
 * Generate room URL for sharing
 */
export const generateRoomURL = (roomId: string, password?: string): string => {
  if (typeof window === 'undefined') {
    return `room/${roomId}`;
  }

  const baseURL = `${window.location.origin}/room/${roomId}`;
  return password ? `${baseURL}?p=${encodeURIComponent(password)}` : baseURL;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (typeof window === 'undefined' || !navigator.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
};
