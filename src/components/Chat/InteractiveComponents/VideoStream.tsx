import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import type {
  VideoStreamProps,
  StreamState,
  StreamStatus,
  StreamQuality,
  StreamSource,
  LiveStreamStats,
  WebSocketStreamChunk,
} from './VideoStream.types';
import { borderRadius, spacing } from './shared';

const colors = {
  surface: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    dark: '#111827',
  },
  border: {
    default: '#E5E7EB',
    light: '#F3F4F6',
  },
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  accent: {
    500: '#3B82F6',
    600: '#2563EB',
  },
  error: {
    500: '#EF4444',
  },
  success: {
    500: '#10B981',
  },
};

export const VideoStream: React.FC<VideoStreamProps> = ({
  data,
  mode = 'full',
  maxHeight,
  maxWidth,
  onPlay,
  onPause,
  onEnded,
  onError,
  onProgress,
  onQualityChange,
  onExpandPress,
  onViewerCountChange,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const isMini = mode === 'mini';

  const videoRef = useRef<Video>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const chunksQueueRef = useRef<WebSocketStreamChunk[]>([]);

  const [streamState, setStreamState] = useState<StreamState>({
    status: 'idle',
    currentTime: 0,
    duration: data.metadata?.duration || 0,
    buffered: 0,
    volume: data.muted ? 0 : 1,
    quality: 'auto',
    availableQualities: ['auto', '1080p', '720p', '480p', '360p'],
  });

  const [liveStats, setLiveStats] = useState<LiveStreamStats | null>(
    data.type === 'live' ? {
      viewerCount: data.metadata?.viewerCount || 0,
      latency: 0,
      bitrate: data.metadata?.bitrate || 0,
      droppedFrames: 0,
      connectionQuality: 'good',
    } : null
  );

  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Calculate container dimensions
  const containerWidth = maxWidth || (isMini ? 350 : screenWidth - 32);
  const containerHeight = maxHeight || (isMini ? 200 : 400);

  // Get video source URL based on protocol
  const getVideoSourceUrl = (source: StreamSource): string => {
    switch (source.protocol) {
      case 'hls':
      case 'dash':
      case 'progressive':
        return source.url;
      case 'websocket':
        // For WebSocket, we'll create a blob URL
        return '';
      case 'webrtc':
        // For WebRTC, we'll handle separately
        return '';
      default:
        return '';
    }
  };

  const videoSourceUrl = getVideoSourceUrl(data.source);

  // Initialize WebSocket streaming
  useEffect(() => {
    if (data.source.protocol === 'websocket') {
      initializeWebSocketStream();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [data.source]);

  const initializeWebSocketStream = async () => {
    if (data.source.protocol !== 'websocket') return;

    try {
      setStreamState(prev => ({ ...prev, status: 'loading' }));

      const ws = new WebSocket(data.source.url);
      wsRef.current = ws;

      ws.binaryType = 'arraybuffer';

      ws.onopen = () => {
        setStreamState(prev => ({ ...prev, status: 'idle' }));
      };

      ws.onmessage = (event: any) => {
        if (event.data instanceof ArrayBuffer) {
          handleWebSocketChunk(event.data);
        }
      };

      ws.onerror = () => {
        const error = new Error('WebSocket streaming error');
        setError(error);
        setStreamState(prev => ({ ...prev, status: 'error', error }));
        onError?.(error);
      };

      ws.onclose = () => {
        if (streamState.status === 'playing') {
          setStreamState(prev => ({ ...prev, status: 'ended' }));
        }
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize WebSocket stream');
      setError(error);
      setStreamState(prev => ({ ...prev, status: 'error', error }));
      onError?.(error);
    }
  };

  const handleWebSocketChunk = (arrayBuffer: ArrayBuffer) => {
    // Queue the chunk for processing
    const chunk: WebSocketStreamChunk = {
      sequence: chunksQueueRef.current.length,
      timestamp: Date.now(),
      data: arrayBuffer,
    };
    chunksQueueRef.current.push(chunk);

    // Note: In React Native, WebSocket binary streaming would need a native module
    // or convert chunks to base64 and create a blob URL
    // This is a simplified implementation for demonstration
  };

  // Handle playback status updates
  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        const error = new Error(status.error);
        setError(error);
        setStreamState(prev => ({ ...prev, status: 'error', error }));
        onError?.(error);
      }
      return;
    }

    const newStatus: StreamStatus = status.isPlaying ? 'playing' :
                                    status.isBuffering ? 'buffering' :
                                    status.didJustFinish ? 'ended' : 'paused';

    setStreamState(prev => ({
      ...prev,
      status: newStatus,
      currentTime: status.positionMillis / 1000,
      duration: status.durationMillis ? status.durationMillis / 1000 : prev.duration,
      buffered: status.playableDurationMillis ? status.playableDurationMillis / 1000 : 0,
      volume: status.isMuted ? 0 : (status.volume || 1),
    }));

    onProgress?.({
      currentTime: status.positionMillis / 1000,
      duration: status.durationMillis ? status.durationMillis / 1000 : 0,
      buffered: status.playableDurationMillis ? status.playableDurationMillis / 1000 : 0,
    });

    if (status.isPlaying && !status.isBuffering) {
      onPlay?.();
    }
    if (!status.isPlaying && !status.isBuffering && !status.didJustFinish) {
      onPause?.();
    }
    if (status.didJustFinish) {
      onEnded?.();
    }
  };

  const handlePlayPause = async () => {
    if (!videoRef.current) return;

    try {
      if (streamState.status === 'playing') {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Playback error');
      setError(error);
      onError?.(error);
    }
  };

  const handleSeek = async (time: number) => {
    if (!videoRef.current || data.type === 'live') return;

    try {
      await videoRef.current.setPositionAsync(time * 1000);
    } catch (err) {
      // Failed to seek video
    }
  };

  const handleVolumeChange = async (volume: number) => {
    if (!videoRef.current) return;

    try {
      await videoRef.current.setVolumeAsync(volume);
      setStreamState(prev => ({ ...prev, volume }));
    } catch (err) {
      // Failed to change volume
    }
  };

  const handleQualityChange = (quality: StreamQuality) => {
    setStreamState(prev => ({ ...prev, quality }));
    onQualityChange?.(quality);
    // In a real implementation, you would switch the video source here
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const renderStreamBadge = () => {
    if (data.type !== 'live') return null;

    return (
      <View style={styles.liveBadge}>
        <View style={styles.liveIndicator} />
        <Text style={styles.liveBadgeText}>LIVE</Text>
      </View>
    );
  };

  const renderViewerCount = () => {
    if (!liveStats || !data.showViewerCount) return null;

    return (
      <View style={styles.viewerCount}>
        <Text style={styles.viewerCountText}>👁️ {liveStats.viewerCount.toLocaleString()}</Text>
      </View>
    );
  };

  const renderQualitySelector = () => {
    if (!data.showQualitySelector || isMini) return null;

    return (
      <View style={styles.qualitySelector}>
        {streamState.availableQualities.map((quality) => (
          <TouchableOpacity
            key={quality}
            style={[
              styles.qualityButton,
              streamState.quality === quality && styles.qualityButtonActive,
            ]}
            onPress={() => handleQualityChange(quality)}
          >
            <Text
              style={[
                styles.qualityButtonText,
                streamState.quality === quality && styles.qualityButtonTextActive,
              ]}
            >
              {quality.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderControls = () => {
    if (!data.controls || !showControls) return null;

    const progress = streamState.duration > 0 ? streamState.currentTime / streamState.duration : 0;
    const bufferedProgress = streamState.duration > 0 ? streamState.buffered / streamState.duration : 0;

    return (
      <View style={styles.controls}>
        {data.type !== 'live' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressBuffered, { width: `${bufferedProgress * 100}%` }]} />
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
          </View>
        )}

        <View style={styles.controlButtons}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handlePlayPause}
            disabled={streamState.status === 'loading' || streamState.status === 'error'}
          >
            {streamState.status === 'loading' || streamState.status === 'buffering' ? (
              <ActivityIndicator size="small" color={colors.text.inverse} />
            ) : (
              <Text style={styles.controlButtonText}>
                {streamState.status === 'playing' ? '⏸' : '▶'}
              </Text>
            )}
          </TouchableOpacity>

          {data.type !== 'live' && (
            <View style={styles.timeDisplay}>
              <Text style={styles.timeText}>
                {formatTime(streamState.currentTime)} / {formatTime(streamState.duration)}
              </Text>
            </View>
          )}

          {isMini && onExpandPress && (
            <TouchableOpacity style={styles.expandButton} onPress={onExpandPress}>
              <Text style={styles.expandButtonText}>⛶</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderMetadata = () => {
    if (!data.showMetadata || !data.metadata || isMini) return null;

    return (
      <View style={styles.metadata}>
        {data.metadata.title && (
          <Text style={styles.metadataTitle}>{data.metadata.title}</Text>
        )}
        {data.metadata.description && (
          <Text style={styles.metadataDescription} numberOfLines={2}>
            {data.metadata.description}
          </Text>
        )}
        {data.metadata.author && (
          <Text style={styles.metadataAuthor}>by {data.metadata.author}</Text>
        )}
      </View>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Failed to load stream</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
      </View>
    );
  };

  if (error && streamState.status === 'error') {
    return (
      <View
        style={[
          styles.container,
          {
            width: containerWidth,
            height: containerHeight,
            backgroundColor: colors.surface.dark,
            borderRadius: borderRadius.lg,
          },
        ]}
      >
        {renderError()}
      </View>
    );
  }

  return (
    <View style={[styles.container, isMini && styles.containerMini]}>
      {renderMetadata()}

      <View
        style={[
          styles.videoContainer,
          {
            width: containerWidth,
            height: containerHeight,
            backgroundColor: colors.surface.dark,
            borderRadius: borderRadius.lg,
          },
        ]}
      >
        {/* Video Player */}
        {videoSourceUrl && (
          <Video
            ref={videoRef}
            source={{ uri: videoSourceUrl }}
            style={[styles.video, { width: containerWidth, height: containerHeight }]}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={data.autoPlay}
            isLooping={data.loop}
            isMuted={data.muted}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            onLoadStart={() => setStreamState(prev => ({ ...prev, status: 'loading' }))}
            posterSource={data.poster ? { uri: data.poster } : undefined}
            usePoster={!!data.poster}
          />
        )}

        {/* Overlays */}
        {renderStreamBadge()}
        {renderViewerCount()}
        {renderQualitySelector()}
        {renderControls()}

        {/* Loading overlay */}
        {streamState.status === 'loading' && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.text.inverse} />
            <Text style={styles.loadingText}>Loading stream...</Text>
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
    borderRadius: borderRadius.md,
  },
  videoContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  video: {
    backgroundColor: colors.surface.dark,
  },
  metadata: {
    padding: spacing.md,
    backgroundColor: colors.surface.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  metadataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  metadataDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  metadataAuthor: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  liveBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.base,
    zIndex: 10,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.text.inverse,
    marginRight: spacing.xs,
  },
  liveBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  viewerCount: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.base,
    zIndex: 10,
  },
  viewerCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  qualitySelector: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: borderRadius.base,
    overflow: 'hidden',
    zIndex: 10,
  },
  qualityButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  qualityButtonActive: {
    backgroundColor: colors.accent[500],
  },
  qualityButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.tertiary,
  },
  qualityButtonTextActive: {
    color: colors.text.inverse,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  progressContainer: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    position: 'relative',
  },
  progressBuffered: {
    position: 'absolute',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 2,
  },
  progressFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: colors.accent[500],
    borderRadius: 2,
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  controlButtonText: {
    fontSize: 18,
    color: colors.text.inverse,
  },
  timeDisplay: {
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.inverse,
  },
  expandButton: {
    padding: spacing.sm,
  },
  expandButtonText: {
    fontSize: 18,
    color: colors.text.inverse,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.text.inverse,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  },
  errorMessage: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

export default VideoStream;
