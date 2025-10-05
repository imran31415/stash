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
      // STUN servers for NAT traversal
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      // Your dedicated TURN server
      {
        urls: 'turn:209.38.172.46:3478',
        username: 'stash',
        credential: 'stashTurn2024!',
      },
      {
        urls: 'turn:209.38.172.46:3478?transport=tcp',
        username: 'stash',
        credential: 'stashTurn2024!',
      },
      // Backup free TURN server (in case your server is down)
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
    ],
    iceCandidatePoolSize: 10,
    iceTransportPolicy: 'all' as RTCIceTransportPolicy,
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
      console.log('[WebRTC] 🎥 ontrack event fired!');
      console.log('[WebRTC] Remote user:', remoteUserId);
      console.log('[WebRTC] Track kind:', event.track.kind);
      console.log('[WebRTC] Track ID:', event.track.id);
      console.log('[WebRTC] Track enabled:', event.track.enabled);
      console.log('[WebRTC] Track readyState:', event.track.readyState);
      console.log('[WebRTC] Track muted:', event.track.muted);
      console.log('[WebRTC] Event streams:', event.streams);
      console.log('[WebRTC] Event streams length:', event.streams?.length);

      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];
        console.log('[WebRTC] ✅ Stream received!');
        console.log('[WebRTC] Stream ID:', stream.id);
        console.log('[WebRTC] Stream active:', stream.active);
        console.log('[WebRTC] Stream tracks:', stream.getTracks().length);
        console.log('[WebRTC] Stream track details:', stream.getTracks().map(t => ({
          kind: t.kind,
          id: t.id,
          enabled: t.enabled,
          readyState: t.readyState,
          muted: t.muted
        })));
        console.log('[WebRTC] Calling onRemoteStream callback for:', remoteUserId);
        onRemoteStream(remoteUserId, stream);
      } else {
        console.warn('[WebRTC] ❌ No stream in track event!');
        console.warn('[WebRTC] event.streams:', event.streams);
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

    // Handle ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log(`[WebRTC] 🧊 ICE connection state with ${remoteUserId}:`, pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed') {
        console.error(`[WebRTC] ❌ ICE connection failed with ${remoteUserId}`);
        console.error('[WebRTC] This usually means NAT/firewall issues or missing TURN server');
        // Try to restart ICE
        console.log('[WebRTC] Attempting ICE restart...');
        pc.restartIce();
      } else if (pc.iceConnectionState === 'disconnected') {
        console.warn(`[WebRTC] ⚠️ ICE connection disconnected with ${remoteUserId}`);
      } else if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        console.log(`[WebRTC] ✅ ICE connection established with ${remoteUserId}`);
      }
    };

    // Handle ICE gathering state
    pc.onicegatheringstatechange = () => {
      console.log(`[WebRTC] ICE gathering state with ${remoteUserId}:`, pc.iceGatheringState);
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Connection state with ${remoteUserId}:`, pc.connectionState);
      console.log(`[WebRTC] ICE connection state:`, pc.iceConnectionState);
      console.log(`[WebRTC] ICE gathering state:`, pc.iceGatheringState);
      console.log(`[WebRTC] Signaling state:`, pc.signalingState);

      if (pc.connectionState === 'failed') {
        console.error(`[WebRTC] ❌ Connection failed with ${remoteUserId}`);
        console.error('[WebRTC] Attempting to restart ICE...');

        // Try to recover by restarting ICE
        if (pc.iceConnectionState !== 'closed') {
          pc.restartIce();
        }
      } else if (pc.connectionState === 'disconnected') {
        console.warn(`[WebRTC] ⚠️ Connection disconnected with ${remoteUserId}`);
        // Give it some time to reconnect before ending the stream
        setTimeout(() => {
          if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
            console.log('[WebRTC] Connection still disconnected after timeout, ending stream');
            onRemoteStreamEnded(remoteUserId);
          }
        }, 5000); // 5 second grace period
      } else if (pc.connectionState === 'closed') {
        console.log(`[WebRTC] Connection closed with ${remoteUserId}`);
        onRemoteStreamEnded(remoteUserId);
      } else if (pc.connectionState === 'connected') {
        console.log(`[WebRTC] ✅ Connection established with ${remoteUserId}`);
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
    console.log('[WebRTC] 📤 Creating offer to:', remoteUserId);
    let peer = peersRef.current.get(remoteUserId);

    if (!peer) {
      console.log('[WebRTC] No existing peer, creating new connection');
      const pc = createPeerConnection(remoteUserId);
      peer = { userId: remoteUserId, connection: pc, stream: null };
      peersRef.current.set(remoteUserId, peer);
      console.log('[WebRTC] Peer connection created, total peers:', peersRef.current.size);
    } else {
      console.log('[WebRTC] Using existing peer connection');
    }

    console.log('[WebRTC] Peer connection state:', peer.connection.connectionState);
    console.log('[WebRTC] Peer connection signaling state:', peer.connection.signalingState);
    console.log('[WebRTC] Peer connection senders:', peer.connection.getSenders().length);
    console.log('[WebRTC] Peer connection transceivers:', peer.connection.getTransceivers().length);

    try {
      // Create offer with proper configuration for localhost testing
      const offerOptions: RTCOfferOptions = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      };

      const offer = await peer.connection.createOffer(offerOptions);
      await peer.connection.setLocalDescription(offer);

      console.log('[WebRTC] ✅ Offer created successfully');
      console.log('[WebRTC] Offer SDP type:', offer.type);
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
      console.error('[WebRTC] ❌ Error creating offer:', error);
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
      console.log('[WebRTC] Existing peer signaling state:', peer.connection.signalingState);

      // Handle offer collision (both peers sent offers at same time)
      if (peer.connection.signalingState === 'have-local-offer') {
        console.log('[WebRTC] ⚠️ Offer collision detected!');
        // Use polite/impolite pattern - lower userId is polite and rolls back
        const isPolite = userId < fromUserId;
        console.log('[WebRTC] I am', isPolite ? 'polite' : 'impolite');

        if (isPolite) {
          console.log('[WebRTC] Rolling back my offer to accept remote offer');
          // Rollback our offer by setting remote first
          await peer.connection.setLocalDescription({ type: 'rollback' });
        } else {
          console.log('[WebRTC] Ignoring remote offer, keeping my offer');
          return; // Impolite peer ignores the collision
        }
      }
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
      console.error('[WebRTC] Signaling state:', peer?.connection.signalingState);
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
