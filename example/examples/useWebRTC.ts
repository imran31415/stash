import { useRef, useCallback, useEffect } from 'react';

export interface WebRTCPeer {
  userId: string;
  connection: RTCPeerConnection;
  stream: MediaStream | null;
}

interface UseWebRTCProps {
  roomId: string | null;
  userId: string;
  onRemoteStream: (userId: string, stream: MediaStream) => void;
  onRemoteStreamEnded: (userId: string) => void;
  sendSignalingMessage: (message: any) => void;
}

export function useWebRTC({
  roomId,
  userId,
  onRemoteStream,
  onRemoteStreamEnded,
  sendSignalingMessage,
}: UseWebRTCProps) {
  const peersRef = useRef<Map<string, WebRTCPeer>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);

  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  const createPeerConnection = useCallback((remoteUserId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local stream tracks if available
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('[WebRTC] Received remote track from:', remoteUserId, 'Track kind:', event.track.kind);
      if (event.streams && event.streams[0]) {
        console.log('[WebRTC] Stream has', event.streams[0].getTracks().length, 'tracks');
        onRemoteStream(remoteUserId, event.streams[0]);
      } else {
        console.warn('[WebRTC] No stream in track event');
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignalingMessage({
          type: 'webrtc-ice-candidate',
          roomId,
          fromUserId: userId,
          toUserId: remoteUserId,
          candidate: event.candidate,
        });
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Connection state with ${remoteUserId}:`, pc.connectionState);
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected' || pc.connectionState === 'closed') {
        onRemoteStreamEnded(remoteUserId);
      }
    };

    return pc;
  }, [roomId, userId, onRemoteStream, onRemoteStreamEnded, sendSignalingMessage]);

  const startStreaming = useCallback(async (stream: MediaStream) => {
    localStreamRef.current = stream;
    console.log('[WebRTC] Started streaming with local stream');

    // Add tracks to all existing peer connections
    peersRef.current.forEach((peer) => {
      stream.getTracks().forEach(track => {
        peer.connection.addTrack(track, stream);
      });
    });
  }, []);

  const stopStreaming = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Remove tracks from all peer connections
    peersRef.current.forEach((peer) => {
      peer.connection.getSenders().forEach(sender => {
        peer.connection.removeTrack(sender);
      });
    });

    console.log('[WebRTC] Stopped streaming');
  }, []);

  const createOffer = useCallback(async (remoteUserId: string) => {
    console.log('[WebRTC] Creating offer to:', remoteUserId);
    let peer = peersRef.current.get(remoteUserId);

    if (!peer) {
      console.log('[WebRTC] No existing peer, creating new connection');
      const pc = createPeerConnection(remoteUserId);
      peer = { userId: remoteUserId, connection: pc, stream: null };
      peersRef.current.set(remoteUserId, peer);
    } else {
      console.log('[WebRTC] Using existing peer connection');
    }

    try {
      const offer = await peer.connection.createOffer();
      await peer.connection.setLocalDescription(offer);

      console.log('[WebRTC] Sending offer to:', remoteUserId, 'roomId:', roomId);
      sendSignalingMessage({
        type: 'webrtc-offer',
        roomId,
        fromUserId: userId,
        toUserId: remoteUserId,
        offer: peer.connection.localDescription,
      });

      console.log('[WebRTC] Offer sent successfully to:', remoteUserId);
    } catch (error) {
      console.error('[WebRTC] Error creating offer:', error);
    }
  }, [roomId, userId, createPeerConnection, sendSignalingMessage]);

  const handleOffer = useCallback(async (fromUserId: string, offer: RTCSessionDescriptionInit) => {
    console.log('[WebRTC] Received offer from:', fromUserId);
    let peer = peersRef.current.get(fromUserId);

    if (!peer) {
      console.log('[WebRTC] No existing peer for offer, creating new connection');
      const pc = createPeerConnection(fromUserId);
      peer = { userId: fromUserId, connection: pc, stream: null };
      peersRef.current.set(fromUserId, peer);
    } else {
      console.log('[WebRTC] Using existing peer for offer');
    }

    try {
      console.log('[WebRTC] Setting remote description from:', fromUserId);
      await peer.connection.setRemoteDescription(new RTCSessionDescription(offer));

      console.log('[WebRTC] Creating answer for:', fromUserId);
      const answer = await peer.connection.createAnswer();
      await peer.connection.setLocalDescription(answer);

      console.log('[WebRTC] Sending answer to:', fromUserId);
      sendSignalingMessage({
        type: 'webrtc-answer',
        roomId,
        fromUserId: userId,
        toUserId: fromUserId,
        answer: peer.connection.localDescription,
      });

      console.log('[WebRTC] Answer sent successfully to:', fromUserId);
    } catch (error) {
      console.error('[WebRTC] Error handling offer:', error);
    }
  }, [roomId, userId, createPeerConnection, sendSignalingMessage]);

  const handleAnswer = useCallback(async (fromUserId: string, answer: RTCSessionDescriptionInit) => {
    console.log('[WebRTC] Received answer from:', fromUserId);
    const peer = peersRef.current.get(fromUserId);

    if (peer) {
      try {
        console.log('[WebRTC] Setting remote description (answer) from:', fromUserId);
        await peer.connection.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('[WebRTC] Answer handled successfully from:', fromUserId);
      } catch (error) {
        console.error('[WebRTC] Error handling answer:', error);
      }
    } else {
      console.warn('[WebRTC] Received answer from unknown peer:', fromUserId);
    }
  }, []);

  const handleIceCandidate = useCallback(async (fromUserId: string, candidate: RTCIceCandidateInit) => {
    const peer = peersRef.current.get(fromUserId);

    if (peer) {
      try {
        await peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('[WebRTC] Added ICE candidate from:', fromUserId);
      } catch (error) {
        console.error('[WebRTC] Error adding ICE candidate:', error);
      }
    }
  }, []);

  const removePeer = useCallback((remoteUserId: string) => {
    const peer = peersRef.current.get(remoteUserId);
    if (peer) {
      peer.connection.close();
      peersRef.current.delete(remoteUserId);
      onRemoteStreamEnded(remoteUserId);
      console.log('[WebRTC] Removed peer:', remoteUserId);
    }
  }, [onRemoteStreamEnded]);

  const cleanup = useCallback(() => {
    stopStreaming();
    peersRef.current.forEach((peer) => {
      peer.connection.close();
    });
    peersRef.current.clear();
    console.log('[WebRTC] Cleaned up all connections');
  }, [stopStreaming]);

  return {
    startStreaming,
    stopStreaming,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    removePeer,
    cleanup,
  };
}
