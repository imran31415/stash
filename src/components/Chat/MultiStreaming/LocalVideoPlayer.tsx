/// <reference path="./webrtc.d.ts" />
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LocalVideoPlayerProps {
  stream: MediaStream;
}

export const LocalVideoPlayer: React.FC<LocalVideoPlayerProps> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log('[LocalVideoPlayer] Rendering with stream:', stream);
    console.log('[LocalVideoPlayer] Stream tracks:', stream?.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled })));

    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      console.log('[LocalVideoPlayer] Set srcObject on video element');
    }
  }, [stream]);

  return (
    <View style={styles.container}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted // Mute own audio to prevent feedback
        style={{
          width: '100%',
          height: 300,
          backgroundColor: '#000',
          borderRadius: 8,
          transform: 'scaleX(-1)', // Mirror effect for local video
        }}
      />
      <View style={styles.nameOverlay}>
        <Text style={styles.nameText}>You (Live)</Text>
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
    backgroundColor: 'rgba(220, 38, 38, 0.8)',
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
