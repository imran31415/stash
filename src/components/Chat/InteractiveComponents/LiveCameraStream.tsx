import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { borderRadius, spacing } from './shared';

export interface LiveCameraStreamProps {
  mode?: 'mini' | 'full';
  maxHeight?: number;
  maxWidth?: number;
  onStreamStart?: () => void;
  onStreamStop?: () => void;
  onError?: (error: Error) => void;
  autoStart?: boolean;
  showControls?: boolean;
  enableFlip?: boolean;
}

const colors = {
  surface: {
    primary: '#FFFFFF',
    dark: '#111827',
  },
  border: {
    default: '#E5E7EB',
  },
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    inverse: '#FFFFFF',
  },
  accent: {
    500: '#3B82F6',
  },
  error: {
    500: '#EF4444',
  },
  success: {
    500: '#10B981',
  },
};

export const LiveCameraStream: React.FC<LiveCameraStreamProps> = ({
  mode = 'full',
  maxHeight,
  maxWidth,
  onStreamStart,
  onStreamStop,
  onError,
  autoStart = false,
  showControls = true,
  enableFlip = true,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const isMini = mode === 'mini';

  const [permission, requestPermission] = useCameraPermissions();
  const [isStreaming, setIsStreaming] = useState(false);
  const [facing, setFacing] = useState<CameraType>('front');
  const [isRecording, setIsRecording] = useState(false);
  const [webPermissionGranted, setWebPermissionGranted] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const defaultMiniWidth = Math.min(screenWidth - 32, 800);
  const containerWidth = maxWidth || (isMini ? defaultMiniWidth : screenWidth - 32);
  const containerHeight = maxHeight || (isMini ? 200 : 400);

  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    if (autoStart) {
      handleStartStream();
    }

    return () => {
      if (isWeb && streamRef.current) {
        (streamRef.current as any)?.getTracks()?.forEach((track: any) => track.stop());
      }
    };
  }, [autoStart]);

  const handleStartStreamWeb = async () => {
    try {
      const constraints = {
        video: {
          facingMode: facing === 'front' ? 'user' : 'environment',
          width: { ideal: containerWidth },
          height: { ideal: containerHeight },
        },
        audio: false,
      };

      const stream = await (navigator as any)?.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      setWebPermissionGranted(true);
      setIsStreaming(true);

      // Wait for next tick to ensure video element is rendered
      setTimeout(() => {
        if (videoRef.current && streamRef.current) {
          (videoRef.current as any).srcObject = streamRef.current;
          (videoRef.current as any).play().catch(() => {
            // Failed to play video
          });
        }
      }, 100);

      onStreamStart?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to access camera');
      onError?.(err);
      Alert.alert('Camera Error', err.message);
    }
  };

  const handleStartStreamNative = async () => {
    if (!permission) {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        const error = new Error('Camera permission not granted');
        onError?.(error);
        Alert.alert('Permission Required', 'Please grant camera permission to start streaming');
        return;
      }
    }

    if (!permission?.granted) {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        const error = new Error('Camera permission not granted');
        onError?.(error);
        Alert.alert('Permission Required', 'Please grant camera permission to start streaming');
        return;
      }
    }

    setIsStreaming(true);
    onStreamStart?.();
  };

  const handleStartStream = async () => {
    if (isWeb) {
      await handleStartStreamWeb();
    } else {
      await handleStartStreamNative();
    }
  };

  const handleStopStream = () => {
    if (isWeb && streamRef.current) {
      (streamRef.current as any)?.getTracks()?.forEach((track: any) => track.stop());
      if (videoRef.current) {
        (videoRef.current as any).srcObject = null;
      }
      streamRef.current = null;
    }

    setIsStreaming(false);
    setIsRecording(false);
    onStreamStop?.();
  };

  const handleFlipCamera = async () => {
    const newFacing: CameraType = facing === 'back' ? 'front' : 'back';
    setFacing(newFacing);

    if (isWeb && isStreaming) {
      handleStopStream();
      setTimeout(() => handleStartStream(), 100);
    }
  };

  const handleStartRecording = async () => {
    if (isRecording) return;

    try {
      setIsRecording(true);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Recording failed');
      onError?.(err);
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (!isRecording) return;

    try {
      setIsRecording(false);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Stop recording failed');
      onError?.(err);
    }
  };

  const renderPermissionRequest = () => (
    <View
      style={[
        styles.permissionContainer,
        {
          width: containerWidth,
          height: containerHeight,
          backgroundColor: colors.surface.dark,
          borderRadius: borderRadius.lg,
        },
      ]}
    >
      <Text style={styles.permissionIcon}>📹</Text>
      <Text style={styles.permissionTitle}>Camera Access Required</Text>
      <Text style={styles.permissionText}>
        Grant camera permission to start live streaming
      </Text>
      <TouchableOpacity
        style={styles.permissionButton}
        onPress={isWeb ? handleStartStream : requestPermission}
      >
        <Text style={styles.permissionButtonText}>Grant Permission</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStartScreen = () => (
    <View
      style={[
        styles.startContainer,
        {
          width: containerWidth,
          height: containerHeight,
          backgroundColor: colors.surface.dark,
          borderRadius: borderRadius.lg,
        },
      ]}
    >
      <Text style={styles.startIcon}>🎥</Text>
      <Text style={styles.startTitle}>Live Camera Stream</Text>
      <Text style={styles.startText}>Start streaming from your camera</Text>
      <TouchableOpacity style={styles.startButton} onPress={handleStartStream}>
        <Text style={styles.startButtonText}>▶ Start Stream</Text>
      </TouchableOpacity>
    </View>
  );

  if (!isWeb && !permission) {
    return renderPermissionRequest();
  }

  if (!isWeb && !permission?.granted) {
    return renderPermissionRequest();
  }

  if (!isStreaming) {
    return renderStartScreen();
  }

  return (
    <View style={[styles.container, isMini && styles.containerMini]}>
      <View
        style={[
          styles.cameraContainer,
          {
            width: containerWidth,
            height: containerHeight,
            borderRadius: borderRadius.lg,
          },
        ]}
      >
        <View style={styles.liveBadge}>
          <View style={styles.liveIndicator} />
          <Text style={styles.liveBadgeText}>LIVE</Text>
        </View>

        {isWeb ? (
          <View style={{ width: containerWidth, height: containerHeight }}>
            <video
              ref={(el: any) => {
                videoRef.current = el;
                if (el && streamRef.current) {
                  (el as any).srcObject = streamRef.current;
                }
              }}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                backgroundColor: colors.surface.dark,
                transform: facing === 'front' ? 'scaleX(-1)' : 'none',
              }}
            />
          </View>
        ) : (
          <CameraView
            style={[styles.camera, { width: containerWidth, height: containerHeight }]}
            facing={facing}
            mode="picture"
          />
        )}

        {showControls && (
          <View style={styles.controls}>
            <View style={styles.controlButtons}>
              {enableFlip && (
                <TouchableOpacity style={styles.controlButton} onPress={handleFlipCamera}>
                  <Text style={styles.controlButtonText}>🔄</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.recordButton,
                  isRecording && styles.recordButtonActive,
                ]}
                onPress={isRecording ? handleStopRecording : handleStartRecording}
              >
                <View style={[styles.recordDot, isRecording && styles.recordDotActive]} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.stopButton} onPress={handleStopStream}>
                <Text style={styles.stopButtonText}>■</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  containerMini: {
    borderRadius: borderRadius.base,
  },
  cameraContainer: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.surface.dark,
  },
  camera: {
    backgroundColor: colors.surface.dark,
  },
  liveBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.base,
    zIndex: 10,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.text.inverse,
    marginRight: 4,
  },
  liveBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: spacing.md,
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.sm,
  },
  controlButtonText: {
    fontSize: 24,
  },
  recordButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.sm,
  },
  recordButtonActive: {
    backgroundColor: colors.error[500],
  },
  recordDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error[500],
  },
  recordDotActive: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: colors.text.inverse,
  },
  stopButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.sm,
  },
  stopButtonText: {
    fontSize: 24,
    color: colors.text.inverse,
  },
  recordingIndicator: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.base,
    zIndex: 10,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error[500],
    marginRight: 6,
  },
  recordingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  permissionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  permissionIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.inverse,
    marginBottom: spacing.sm,
  },
  permissionText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  permissionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.accent[500],
    borderRadius: borderRadius.base,
  },
  permissionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  startContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  startIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  startTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.inverse,
    marginBottom: spacing.sm,
  },
  startText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  startButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.success[500],
    borderRadius: borderRadius.base,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.inverse,
  },
});

export default LiveCameraStream;
