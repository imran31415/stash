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
  console.log('🚀🚀🚀 useWebRTC HOOK INITIALIZED - CODE VERSION 6.0 - POLITE PEER FIX 🚀🚀🚀');
  const peersRef = useRef<Map<string, WebRTCPeer>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const candidateStatsRef = useRef<Map<string, { host: number; srflx: number; relay: number }>>(new Map());

  const ICE_SERVERS = {
    iceServers: [
      // Google STUN for discovering public IP
      { urls: 'stun:stun.l.google.com:19302' },

      // Your dedicated TURN server (PRIMARY - handles NAT traversal)
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
    ],
    iceCandidatePoolSize: 10,
    iceTransportPolicy: 'all' as RTCIceTransportPolicy,
    bundlePolicy: 'max-bundle' as RTCBundlePolicy,
    rtcpMuxPolicy: 'require' as RTCRtcpMuxPolicy,
  };

  const createPeerConnection = useCallback((remoteUserId: string): RTCPeerConnection => {
    console.log('[WebRTC] 🔧🔧🔧 Creating new peer connection for:', remoteUserId, '(VERSION 2.0)');
    console.log('[WebRTC] ICE servers configured:', ICE_SERVERS.iceServers.length, 'servers');
    console.log('[WebRTC] ICE servers:', ICE_SERVERS.iceServers.map(s => typeof s.urls === 'string' ? s.urls : s.urls[0]));

    const pc = new RTCPeerConnection(ICE_SERVERS);
    console.log('[WebRTC] RTCPeerConnection object created successfully');

    // Add local stream tracks if available
    if (localStreamRef.current) {
      const tracks = localStreamRef.current.getTracks();
      console.log('[WebRTC] ✅ Adding', tracks.length, 'local tracks to peer connection for:', remoteUserId);
      tracks.forEach(track => {
        console.log('[WebRTC]   - Adding track:', track.kind, track.id, 'enabled:', track.enabled, 'readyState:', track.readyState);
        const sender = pc.addTrack(track, localStreamRef.current!);
        console.log('[WebRTC]   - Track added, sender:', sender.track?.id);
      });
      console.log('[WebRTC] Total senders after adding tracks:', pc.getSenders().length);
    } else {
      console.log('[WebRTC] ⚠️ No local stream available when creating peer connection for:', remoteUserId);
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
    console.log('[WebRTC] 🎯 Setting up onicecandidate handler for:', remoteUserId);
    pc.onicecandidate = (event) => {
      console.log('[WebRTC] 🎯🎯 onicecandidate event fired for:', remoteUserId, 'candidate:', event.candidate);
      if (event.candidate) {
        const candidateType = event.candidate.type || 'unknown';

        // Track candidate statistics
        const stats = candidateStatsRef.current.get(remoteUserId) || { host: 0, srflx: 0, relay: 0 };
        if (candidateType === 'host') stats.host++;
        else if (candidateType === 'srflx') stats.srflx++;
        else if (candidateType === 'relay') stats.relay++;
        candidateStatsRef.current.set(remoteUserId, stats);

        console.log('[WebRTC] 🧊 Generated ICE candidate for', remoteUserId);
        console.log('[WebRTC]   Type:', candidateType, '(host:', stats.host, 'srflx:', stats.srflx, 'relay:', stats.relay + ')');
        console.log('[WebRTC]   Protocol:', event.candidate.protocol);
        console.log('[WebRTC]   Address:', event.candidate.address || 'N/A');
        console.log('[WebRTC]   Port:', event.candidate.port);
        console.log('[WebRTC]   Priority:', event.candidate.priority);
        console.log('[WebRTC]   Full candidate string:', event.candidate.candidate);

        sendSignalingMessage({
          type: 'webrtc-ice-candidate',
          roomId,
          fromUserId: userId,
          toUserId: remoteUserId,
          candidate: event.candidate,
        });
      } else {
        const stats = candidateStatsRef.current.get(remoteUserId) || { host: 0, srflx: 0, relay: 0 };
        console.log('[WebRTC] ✅ ICE gathering complete for:', remoteUserId);
        console.log('[WebRTC]   Final candidate count - host:', stats.host, 'srflx:', stats.srflx, 'relay:', stats.relay);

        if (stats.relay === 0) {
          console.warn('[WebRTC] ⚠️ WARNING: No TURN relay candidates generated! Connection may fail on restrictive networks.');
          console.warn('[WebRTC] ⚠️ This usually means TURN servers are not responding or are misconfigured.');
        }
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
      // Create offer with proper configuration
      const offerOptions: RTCOfferOptions = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      };

      console.log('[WebRTC] Creating offer with options:', offerOptions);
      const offer = await peer.connection.createOffer(offerOptions);

      console.log('[WebRTC] Offer created, setting as local description');
      console.log('[WebRTC] Offer SDP preview:', offer.sdp?.substring(0, 200) + '...');

      await peer.connection.setLocalDescription(offer);

      console.log('[WebRTC] ✅ Offer created and set as local description');
      console.log('[WebRTC] Offer SDP type:', offer.type);
      console.log('[WebRTC] Local description type:', peer.connection.localDescription?.type);
      console.log('[WebRTC] Signaling state after setLocalDescription:', peer.connection.signalingState);
      console.log('[WebRTC] Sending offer to:', remoteUserId, 'roomId:', roomId);

      const offerToSend = peer.connection.localDescription;
      console.log('[WebRTC] Offer to send - type:', offerToSend?.type, 'sdp length:', offerToSend?.sdp?.length);

      sendSignalingMessage({
        type: 'webrtc-offer',
        roomId,
        fromUserId: userId,
        toUserId: remoteUserId,
        offer: offerToSend,
      });

      console.log('[WebRTC] ✅ Offer sent successfully to:', remoteUserId);
    } catch (error) {
      console.error('[WebRTC] ❌ Error creating offer:', error);
      console.error('[WebRTC] Error stack:', (error as Error).stack);
    }
  }, [roomId, userId, createPeerConnection, sendSignalingMessage]);

  const processPendingCandidates = useCallback(async (remoteUserId: string, peerConnection: RTCPeerConnection) => {
    const pending = pendingCandidatesRef.current.get(remoteUserId);
    if (pending && pending.length > 0) {
      console.log('[WebRTC] 📦 Processing', pending.length, 'pending ICE candidates for:', remoteUserId);
      for (const candidate of pending) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('[WebRTC] ✅ Added pending ICE candidate');
        } catch (error) {
          console.error('[WebRTC] ❌ Error adding pending ICE candidate:', error);
        }
      }
      pendingCandidatesRef.current.delete(remoteUserId);
      console.log('[WebRTC] ✅ All pending candidates processed for:', remoteUserId);
    }
  }, []);

  const handleOffer = useCallback(async (fromUserId: string, offer: RTCSessionDescriptionInit) => {
    console.log('[WebRTC] 📨 Received offer from:', fromUserId);
    console.log('[WebRTC] 📨 Offer type:', offer.type);
    console.log('[WebRTC] 📨 Offer SDP length:', offer.sdp?.length);
    console.log('[WebRTC] 📨 Do I have local stream?', !!localStreamRef.current);
    let peer = peersRef.current.get(fromUserId);

    if (!peer) {
      console.log('[WebRTC] No existing peer for offer, creating new connection');
      const pc = createPeerConnection(fromUserId);
      peer = { userId: fromUserId, connection: pc, stream: null };
      peersRef.current.set(fromUserId, peer);
    } else {
      console.log('[WebRTC] Using existing peer for offer');
      console.log('[WebRTC] Existing peer signaling state:', peer.connection.signalingState);

      // Handle offer collision using perfect negotiation pattern
      if (peer.connection.signalingState !== 'stable') {
        console.log('[WebRTC] ⚠️ Signaling state not stable, handling collision');
        console.log('[WebRTC] Current signaling state:', peer.connection.signalingState);

        // Use polite/impolite pattern - lower userId is polite
        const isPolite = userId < fromUserId;
        console.log('[WebRTC] Politeness check: myUserId=' + userId + ' < remoteUserId=' + fromUserId + ' = ' + isPolite);
        console.log('[WebRTC] I am', isPolite ? 'polite' : 'impolite');

        if (!isPolite) {
          // Impolite peer: ignore the incoming offer, let our offer proceed
          console.log('[WebRTC] 🚫 Ignoring remote offer (impolite peer) - my offer takes precedence');
          return;
        }

        // Polite peer: rollback local offer and accept remote
        console.log('[WebRTC] 🔄 Rolling back to accept remote offer (polite peer)');
        try {
          // Only rollback if we're in have-local-offer state
          if (peer.connection.signalingState === 'have-local-offer') {
            await peer.connection.setLocalDescription({ type: 'rollback' } as RTCSessionDescriptionInit);
            console.log('[WebRTC] ✅ Rollback successful, signaling state:', peer.connection.signalingState);
          } else {
            console.log('[WebRTC] ℹ️ No need to rollback, signaling state:', peer.connection.signalingState);
          }
        } catch (error) {
          console.error('[WebRTC] ❌ Rollback failed:', error);
          // Recreate peer connection on rollback failure
          console.log('[WebRTC] 🔧 Recreating peer connection after rollback failure');
          peer.connection.close();
          const pc = createPeerConnection(fromUserId);
          peer = { userId: fromUserId, connection: pc, stream: null };
          peersRef.current.set(fromUserId, peer);
          console.log('[WebRTC] ✅ Recreated peer connection');
        }
      }
    }

    try {
      console.log('[WebRTC] Setting remote description (offer) from:', fromUserId);
      console.log('[WebRTC] Offer SDP preview:', offer.sdp?.substring(0, 200) + '...');
      console.log('[WebRTC] Current signaling state before setRemoteDescription:', peer.connection.signalingState);

      await peer.connection.setRemoteDescription(new RTCSessionDescription(offer));

      console.log('[WebRTC] ✅ Remote description (offer) set successfully');
      console.log('[WebRTC] New signaling state:', peer.connection.signalingState);
      console.log('[WebRTC] Remote description type:', peer.connection.remoteDescription?.type);
      console.log('[WebRTC] Number of transceivers:', peer.connection.getTransceivers().length);
      peer.connection.getTransceivers().forEach((transceiver, index) => {
        console.log(`[WebRTC] Transceiver ${index}:`, {
          direction: transceiver.direction,
          currentDirection: transceiver.currentDirection,
          mid: transceiver.mid,
        });
      });

      // Process any pending ICE candidates now that remote description is set
      await processPendingCandidates(fromUserId, peer.connection);

      console.log('[WebRTC] Creating answer for:', fromUserId);
      const answerOptions: RTCAnswerOptions = {};
      const answer = await peer.connection.createAnswer(answerOptions);

      console.log('[WebRTC] Answer created, setting as local description');
      console.log('[WebRTC] Answer SDP preview:', answer.sdp?.substring(0, 200) + '...');

      await peer.connection.setLocalDescription(answer);

      console.log('[WebRTC] ✅ Answer set as local description');
      console.log('[WebRTC] Signaling state after setLocalDescription:', peer.connection.signalingState);
      console.log('[WebRTC] Local description type:', peer.connection.localDescription?.type);

      const answerToSend = peer.connection.localDescription;
      console.log('[WebRTC] Answer to send - type:', answerToSend?.type, 'sdp length:', answerToSend?.sdp?.length);

      console.log('[WebRTC] 📤 Sending answer to:', fromUserId);
      sendSignalingMessage({
        type: 'webrtc-answer',
        roomId,
        fromUserId: userId,
        toUserId: fromUserId,
        answer: answerToSend,
      });

      console.log('[WebRTC] ✅ Answer sent successfully to:', fromUserId);
    } catch (error) {
      console.error('[WebRTC] ❌ Error handling offer:', error);
      console.error('[WebRTC] Error stack:', (error as Error).stack);
      console.error('[WebRTC] Signaling state:', peer?.connection.signalingState);
      console.error('[WebRTC] Connection state:', peer?.connection.connectionState);
    }
  }, [roomId, userId, createPeerConnection, sendSignalingMessage, processPendingCandidates]);

  const handleAnswer = useCallback(async (fromUserId: string, answer: RTCSessionDescriptionInit) => {
    console.log('[WebRTC] 📨 Received answer from:', fromUserId);
    const peer = peersRef.current.get(fromUserId);

    if (peer) {
      try {
        console.log('[WebRTC] Current signaling state:', peer.connection.signalingState);
        console.log('[WebRTC] Setting remote description (answer) from:', fromUserId);
        await peer.connection.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('[WebRTC] ✅ Answer handled successfully from:', fromUserId);
        console.log('[WebRTC] New signaling state:', peer.connection.signalingState);
        console.log('[WebRTC] Connection state:', peer.connection.connectionState);
        console.log('[WebRTC] ICE connection state:', peer.connection.iceConnectionState);

        // Process any pending ICE candidates now that remote description is set
        await processPendingCandidates(fromUserId, peer.connection);
      } catch (error) {
        console.error('[WebRTC] ❌ Error handling answer:', error);
        console.error('[WebRTC] Answer signaling state was:', peer.connection.signalingState);
      }
    } else {
      console.warn('[WebRTC] ⚠️ Received answer from unknown peer:', fromUserId);
      console.warn('[WebRTC] Current peers:', Array.from(peersRef.current.keys()));
    }
  }, [processPendingCandidates]);

  const handleIceCandidate = useCallback(async (fromUserId: string, candidate: RTCIceCandidateInit) => {
    console.log('[WebRTC] 📥 Received ICE candidate from:', fromUserId);
    console.log('[WebRTC]   Candidate string:', candidate.candidate);

    const peer = peersRef.current.get(fromUserId);

    if (peer) {
      try {
        // Check if remote description is set
        if (peer.connection.remoteDescription) {
          console.log('[WebRTC] Adding ICE candidate (remote description is set)');
          await peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('[WebRTC] ✅ Successfully added ICE candidate from:', fromUserId);
        } else {
          // Queue the candidate to be added after remote description is set
          console.log('[WebRTC] 📦 Queuing ICE candidate from:', fromUserId, '(remote description not set yet)');
          const pending = pendingCandidatesRef.current.get(fromUserId) || [];
          pending.push(candidate);
          pendingCandidatesRef.current.set(fromUserId, pending);
          console.log('[WebRTC] Total pending candidates for', fromUserId + ':', pending.length);
        }
      } catch (error) {
        console.error('[WebRTC] ❌ Error adding ICE candidate from:', fromUserId);
        console.error('[WebRTC] Error details:', error);
        console.error('[WebRTC] Signaling state:', peer.connection.signalingState);
        console.error('[WebRTC] ICE connection state:', peer.connection.iceConnectionState);
      }
    } else {
      console.warn('[WebRTC] ⚠️ Received ICE candidate from unknown peer:', fromUserId);
      console.warn('[WebRTC] Known peers:', Array.from(peersRef.current.keys()));
      // Queue it anyway in case the peer connection is created later
      const pending = pendingCandidatesRef.current.get(fromUserId) || [];
      pending.push(candidate);
      pendingCandidatesRef.current.set(fromUserId, pending);
      console.log('[WebRTC] Queued ICE candidate for future peer:', fromUserId, '(total queued:', pending.length + ')');
    }
  }, []);

  const removePeer = useCallback((remoteUserId: string) => {
    const peer = peersRef.current.get(remoteUserId);
    if (peer) {
      peer.connection.close();
      peersRef.current.delete(remoteUserId);
      pendingCandidatesRef.current.delete(remoteUserId);
      candidateStatsRef.current.delete(remoteUserId);
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
    pendingCandidatesRef.current.clear();
    candidateStatsRef.current.clear();
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
