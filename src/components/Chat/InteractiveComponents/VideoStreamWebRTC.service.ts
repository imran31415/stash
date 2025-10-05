import type { WebRTCConfig } from './VideoStream.types';
import { createPeerConnectionConfig } from './VideoStream.utils';

/**
 * Type definitions for WebRTC
 * These are placeholder types until react-native-webrtc is installed
 * In production, import from: import { RTCPeerConnection, MediaStream, etc } from 'react-native-webrtc'
 */
export type RTCPeerConnectionState = 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed';

export interface RTCIceCandidate {
  candidate: string;
  sdpMLineIndex: number | null;
  sdpMid: string | null;
}

export interface RTCSessionDescription {
  type: 'offer' | 'answer' | 'pranswer' | 'rollback';
  sdp: string;
}

export interface MediaStreamTrack {
  id: string;
  kind: 'audio' | 'video';
  enabled: boolean;
  stop: () => void;
}

export interface MediaStream {
  id: string;
  active: boolean;
  getTracks: () => MediaStreamTrack[];
  getAudioTracks: () => MediaStreamTrack[];
  getVideoTracks: () => MediaStreamTrack[];
}

export interface RTCStatsReport {
  forEach: (callback: (value: any, key: string) => void) => void;
}

export interface RTCPeerConnection {
  connectionState: RTCPeerConnectionState;
  addTrack: (track: MediaStreamTrack, stream: MediaStream) => void;
  createOffer: () => Promise<RTCSessionDescription>;
  createAnswer: () => Promise<RTCSessionDescription>;
  setLocalDescription: (description: RTCSessionDescription) => Promise<void>;
  setRemoteDescription: (description: RTCSessionDescription) => Promise<void>;
  addIceCandidate: (candidate: RTCIceCandidate) => Promise<void>;
  getStats: () => Promise<RTCStatsReport>;
  close: () => void;
  onicecandidate: ((event: { candidate: RTCIceCandidate | null }) => void) | null;
  ontrack: ((event: { streams: MediaStream[] }) => void) | null;
  onconnectionstatechange: (() => void) | null;
}

export class VideoStreamWebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private signalingWs: WebSocket | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;
  private onConnectionStateChangeCallback: ((state: RTCPeerConnectionState) => void) | null = null;

  constructor(private config: WebRTCConfig) {}

  /**
   * Initialize WebRTC connection as a viewer (receiver)
   */
  async initializeAsViewer(): Promise<void> {
    try {
      // Note: In production, you would install react-native-webrtc:
      // npm install react-native-webrtc
      // import { RTCPeerConnection } from 'react-native-webrtc';

      throw new Error('WebRTC not available. Install react-native-webrtc package for WebRTC support.');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to initialize WebRTC');
      this.onErrorCallback?.(err);
      throw err;
    }
  }

  /**
   * Initialize WebRTC connection as a broadcaster (sender)
   */
  async initializeAsBroadcaster(stream: MediaStream): Promise<void> {
    try {
      throw new Error('WebRTC not available. Install react-native-webrtc package for WebRTC support.');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to initialize WebRTC broadcaster');
      this.onErrorCallback?.(err);
      throw err;
    }
  }

  /**
   * Connect to signaling server
   */
  private async connectToSignaling(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.signalingWs = new WebSocket(this.config.signalingUrl);

        this.signalingWs.onopen = () => {
          console.log('[WebRTC] Connected to signaling server');
          resolve();
        };

        this.signalingWs.onmessage = async (event) => {
          try {
            const message = JSON.parse(event.data);
            await this.handleSignalingMessage(message);
          } catch (err) {
            console.error('[WebRTC] Error handling signaling message:', err);
          }
        };

        this.signalingWs.onerror = (error) => {
          console.error('[WebRTC] Signaling error:', error);
          reject(new Error('Signaling connection error'));
        };

        this.signalingWs.onclose = () => {
          console.log('[WebRTC] Signaling connection closed');
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Set up peer connection event handlers
   */
  private setupPeerConnectionHandlers(): void {
    if (!this.peerConnection) return;

    // ICE candidate event
    this.peerConnection.onicecandidate = (event: any) => {
      if (event.candidate) {
        this.sendSignalingMessage({
          type: 'ice-candidate',
          candidate: event.candidate,
          peerId: this.config.peerId,
        });
      }
    };

    // Track event (receiving remote stream)
    this.peerConnection.ontrack = (event: any) => {
      console.log('[WebRTC] Received remote track:', event.track.kind);
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.onRemoteStreamCallback?.(event.streams[0]);
      }
    };

    // Connection state change
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      if (state) {
        console.log('[WebRTC] Connection state:', state);
        this.onConnectionStateChangeCallback?.(state);

        if (state === 'failed' || state === 'disconnected') {
          this.onErrorCallback?.(new Error(`Connection ${state}`));
        }
      }
    };

    // Connection state change
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      console.log('[WebRTC] Connection state:', state);

      if (state === 'failed') {
        this.onErrorCallback?.(new Error('Connection failed'));
      }
    };
  }

  /**
   * Handle signaling messages
   */
  private async handleSignalingMessage(message: any): Promise<void> {
    if (!this.peerConnection) return;

    switch (message.type) {
      case 'offer':
        // Received offer from broadcaster (we are viewer)
        // Note: In production with react-native-webrtc:
        // await this.peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
        console.log('[WebRTC] Received offer (WebRTC not available)');
        break;

      case 'answer':
        // Received answer from viewer (we are broadcaster)
        // Note: In production with react-native-webrtc:
        // await this.peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer));
        console.log('[WebRTC] Received answer (WebRTC not available)');
        break;

      case 'ice-candidate':
        // Received ICE candidate
        // Note: In production with react-native-webrtc:
        // await this.peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
        console.log('[WebRTC] Received ICE candidate (WebRTC not available)');
        break;

      case 'viewer-joined':
        // A viewer joined (we are broadcaster, create offer)
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        this.sendSignalingMessage({
          type: 'offer',
          offer: offer,
          peerId: this.config.peerId,
          targetPeerId: message.peerId,
        });
        break;

      case 'error':
        this.onErrorCallback?.(new Error(message.error || 'Signaling error'));
        break;

      default:
        console.log('[WebRTC] Unknown signaling message type:', message.type);
    }
  }

  /**
   * Send signaling message
   */
  private sendSignalingMessage(message: any): void {
    if (this.signalingWs && this.signalingWs.readyState === WebSocket.OPEN) {
      this.signalingWs.send(JSON.stringify(message));
    }
  }

  /**
   * Get remote stream
   */
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Get peer connection
   */
  getPeerConnection(): RTCPeerConnection | null {
    return this.peerConnection;
  }

  /**
   * Get connection stats
   */
  async getStats(): Promise<RTCStatsReport | null> {
    if (!this.peerConnection) return null;
    return await this.peerConnection.getStats();
  }

  /**
   * Set callback for remote stream
   */
  onRemoteStream(callback: (stream: MediaStream) => void): void {
    this.onRemoteStreamCallback = callback;
  }

  /**
   * Set callback for errors
   */
  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Set callback for connection state changes
   */
  onConnectionStateChange(callback: (state: RTCPeerConnectionState) => void): void {
    this.onConnectionStateChangeCallback = callback;
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Close signaling connection
    if (this.signalingWs) {
      this.signalingWs.close();
      this.signalingWs = null;
    }

    // Stop local stream tracks
    if (this.localStream) {
      // Note: In production with react-native-webrtc, getTracks() is available
      // this.localStream.getTracks().forEach((track: any) => track.stop());
      this.localStream = null;
    }

    this.remoteStream = null;
  }
}
