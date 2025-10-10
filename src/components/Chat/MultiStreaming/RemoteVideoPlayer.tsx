/// <reference path="./webrtc.d.ts" />
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface RemoteVideoPlayerProps {
  stream: MediaStream;
  userName: string;
}

export const RemoteVideoPlayer: React.FC<RemoteVideoPlayerProps> = ({ stream, userName }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log('[RemoteVideoPlayer] Rendering for:', userName, 'with stream:', stream);
    console.log('[RemoteVideoPlayer] Stream ID:', stream?.id);
    console.log('[RemoteVideoPlayer] Stream active:', stream?.active);
    console.log('[RemoteVideoPlayer] Stream tracks:', stream?.getTracks().map(t => ({
      kind: t.kind,
      id: t.id,
      enabled: t.enabled,
      readyState: t.readyState,
      muted: t.muted
    })));

    const videoElement = videoRef.current;
    if (videoElement && stream) {
      console.log('[RemoteVideoPlayer] Setting srcObject for:', userName);

      // Set properties before assigning stream
      videoElement.muted = false; // Remote video should NOT be muted
      videoElement.autoplay = true;
      videoElement.playsInline = true;

      videoElement.srcObject = stream;

      // Listen for track unmute events
      stream.getTracks().forEach(track => {
        track.onunmute = () => {
          console.log('[RemoteVideoPlayer] Track unmuted:', track.kind, 'for:', userName);
          // Try to play again when track is unmuted
          if (videoElement.readyState >= 2) {
            videoElement.play().catch(err => {
              console.error('[RemoteVideoPlayer] Error playing after unmute:', err);
            });
          }
        };

        track.onmute = () => {
          console.log('[RemoteVideoPlayer] Track muted:', track.kind, 'for:', userName);
        };

        track.onended = () => {
          console.log('[RemoteVideoPlayer] Track ended:', track.kind, 'for:', userName);
        };

        console.log('[RemoteVideoPlayer] Track settings:', track.kind, {
          muted: track.muted,
          enabled: track.enabled,
          readyState: track.readyState
        });
      });

      // Ensure video plays (handle autoplay restrictions)
      const playVideo = async () => {
        try {
          console.log('[RemoteVideoPlayer] Attempting to play video for:', userName);
          console.log('[RemoteVideoPlayer] Video readyState:', videoElement.readyState);
          await videoElement.play();
          console.log('[RemoteVideoPlayer] ✅ Video playing for:', userName);
        } catch (error) {
          console.error('[RemoteVideoPlayer] ❌ Error playing video for:', userName, error);
        }
      };

      // Add event listeners
      videoElement.onloadedmetadata = () => {
        console.log('[RemoteVideoPlayer] Video metadata loaded for:', userName);
        console.log('[RemoteVideoPlayer] Video dimensions:', videoElement.videoWidth, 'x', videoElement.videoHeight);
        playVideo();
      };

      videoElement.onloadeddata = () => {
        console.log('[RemoteVideoPlayer] Video data loaded for:', userName);
        playVideo();
      };

      videoElement.onplay = () => {
        console.log('[RemoteVideoPlayer] Video started playing for:', userName);
      };

      videoElement.onplaying = () => {
        console.log('[RemoteVideoPlayer] Video is actually playing for:', userName);
      };

      videoElement.onerror = (e) => {
        console.error('[RemoteVideoPlayer] Video error for:', userName, e);
      };

      videoElement.oncanplay = () => {
        console.log('[RemoteVideoPlayer] Video can play for:', userName);
        playVideo();
      };

      // If metadata already loaded, play immediately
      if (videoElement.readyState >= 2) {
        console.log('[RemoteVideoPlayer] Metadata already loaded, playing immediately');
        playVideo();
      }
    }

    return () => {
      if (videoElement) {
        videoElement.onloadedmetadata = null;
        videoElement.onloadeddata = null;
        videoElement.onplay = null;
        videoElement.onplaying = null;
        videoElement.onerror = null;
        videoElement.oncanplay = null;
      }
      if (stream) {
        stream.getTracks().forEach(track => {
          track.onunmute = null;
          track.onmute = null;
          track.onended = null;
        });
      }
    };
  }, [stream, userName]);

  return (
    <View style={styles.container}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: '100%',
          height: 300,
          backgroundColor: '#000',
          borderRadius: 8,
        }}
      />
      <View style={styles.nameOverlay}>
        <Text style={styles.nameText}>{userName}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    marginVertical: 8,
  },
  nameOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  nameText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
