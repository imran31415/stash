import { useEffect, useCallback, useRef, useState } from 'react';
import { Room, RoomEvent, Track, RemoteTrack, RemoteParticipant, LocalParticipant } from 'livekit-client';

interface UseWebRTCLiveKitProps {
  roomId: string | null;
  userId: string;
  userName: string;
  onRemoteStream: (userId: string, stream: MediaStream) => void;
  onRemoteStreamEnded: (userId: string) => void;
  serverUrl: string;
}

export function useWebRTCLiveKit({
  roomId,
  userId,
  userName,
  onRemoteStream,
  onRemoteStreamEnded,
  serverUrl,
}: UseWebRTCLiveKitProps) {
  console.log('🚀🚀🚀 useWebRTCLiveKit HOOK INITIALIZED - LIVEKIT SFU MODE 🚀🚀🚀');

  const roomRef = useRef<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get LiveKit token from server
  const getToken = useCallback(async (roomName: string, userName: string, userId: string): Promise<string> => {
    try {
      const response = await fetch('http://localhost:4082/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, userName, userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to get LiveKit token');
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('[LiveKit] Error getting token:', error);
      throw error;
    }
  }, []);

  // Connect to LiveKit room
  const connect = useCallback(async (roomName: string) => {
    if (!roomName) return;

    try {
      console.log('[LiveKit] Connecting to room:', roomName);

      // Get token
      const token = await getToken(roomName, userName, userId);

      // Create room instance
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: {
            width: 1280,
            height: 720,
            frameRate: 30,
          },
        },
      });

      roomRef.current = room;

      // Set up event listeners
      room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
      room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
      room.on(RoomEvent.Disconnected, handleDisconnected);
      room.on(RoomEvent.Reconnecting, () => console.log('[LiveKit] Reconnecting...'));
      room.on(RoomEvent.Reconnected, () => console.log('[LiveKit] Reconnected!'));

      // Connect to room
      await room.connect(serverUrl, token);

      console.log('[LiveKit] Connected to room:', roomName);
      console.log('[LiveKit] Local participant:', room.localParticipant.identity);
      setIsConnected(true);
      setError(null);

      // Subscribe to existing tracks
      room.remoteParticipants.forEach((participant) => {
        participant.trackPublications.forEach((publication) => {
          if (publication.track) {
            handleTrackSubscribed(publication.track, publication, participant);
          }
        });
      });

    } catch (err) {
      console.error('[LiveKit] Connection error:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
      setIsConnected(false);
    }
  }, [getToken, userName, userId, serverUrl]);

  // Handle track subscribed
  const handleTrackSubscribed = useCallback(
    (track: RemoteTrack, publication: any, participant: RemoteParticipant) => {
      console.log('[LiveKit] Track subscribed:', {
        participant: participant.identity,
        trackKind: track.kind,
        trackSid: track.sid,
      });

      if (track.kind === Track.Kind.Video || track.kind === Track.Kind.Audio) {
        const stream = new MediaStream([track.mediaStreamTrack]);
        onRemoteStream(participant.identity, stream);
      }
    },
    [onRemoteStream]
  );

  // Handle track unsubscribed
  const handleTrackUnsubscribed = useCallback(
    (track: RemoteTrack, publication: any, participant: RemoteParticipant) => {
      console.log('[LiveKit] Track unsubscribed:', {
        participant: participant.identity,
        trackKind: track.kind,
      });

      if (track.kind === Track.Kind.Video) {
        onRemoteStreamEnded(participant.identity);
      }
    },
    [onRemoteStreamEnded]
  );

  // Handle participant connected
  const handleParticipantConnected = useCallback((participant: RemoteParticipant) => {
    console.log('[LiveKit] Participant connected:', participant.identity);
  }, []);

  // Handle participant disconnected
  const handleParticipantDisconnected = useCallback(
    (participant: RemoteParticipant) => {
      console.log('[LiveKit] Participant disconnected:', participant.identity);
      onRemoteStreamEnded(participant.identity);
    },
    [onRemoteStreamEnded]
  );

  // Handle disconnected
  const handleDisconnected = useCallback(() => {
    console.log('[LiveKit] Disconnected from room');
    setIsConnected(false);
  }, []);

  // Start streaming local camera/mic
  const startStreaming = useCallback(async (stream: MediaStream) => {
    const room = roomRef.current;
    if (!room) {
      console.error('[LiveKit] No room connected');
      return;
    }

    try {
      console.log('[LiveKit] Publishing local tracks');

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      if (videoTrack) {
        await room.localParticipant.publishTrack(videoTrack, {
          name: 'camera',
          simulcast: true, // Enable simulcast for better quality adaptation
        });
        console.log('[LiveKit] Published video track');
      }

      if (audioTrack) {
        await room.localParticipant.publishTrack(audioTrack, {
          name: 'microphone',
        });
        console.log('[LiveKit] Published audio track');
      }
    } catch (err) {
      console.error('[LiveKit] Error publishing tracks:', err);
    }
  }, []);

  // Stop streaming
  const stopStreaming = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;

    try {
      console.log('[LiveKit] Unpublishing tracks');

      const tracks = room.localParticipant.trackPublications;
      tracks.forEach((publication) => {
        if (publication.track) {
          room.localParticipant.unpublishTrack(publication.track);
        }
      });

      console.log('[LiveKit] Tracks unpublished');
    } catch (err) {
      console.error('[LiveKit] Error unpublishing tracks:', err);
    }
  }, []);

  // Disconnect from room
  const disconnect = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;

    try {
      console.log('[LiveKit] Disconnecting from room');
      await room.disconnect();
      roomRef.current = null;
      setIsConnected(false);
    } catch (err) {
      console.error('[LiveKit] Error disconnecting:', err);
    }
  }, []);

  // Connect when roomId changes
  useEffect(() => {
    if (roomId) {
      connect(roomId);
    }

    return () => {
      disconnect();
    };
  }, [roomId]);

  return {
    isConnected,
    error,
    startStreaming,
    stopStreaming,
    disconnect,
    room: roomRef.current,
  };
}
