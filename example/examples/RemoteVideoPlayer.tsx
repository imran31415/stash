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
    console.log('[RemoteVideoPlayer] Stream tracks:', stream?.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled })));

    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      console.log('[RemoteVideoPlayer] Set srcObject on video element for:', userName);
    }
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
