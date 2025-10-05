import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Audio } from 'expo-av';
import type { MediaProps, MediaItem } from './Media.types';
import {
  formatFileSize,
  formatDuration,
  formatDimensions,
  getMediaTypeIcon,
  isGallery,
  getMediaArray,
  getMediaTitle,
  getMediaCaption,
  truncateText,
  getMediaTypeColor,
  calculateFitDimensions,
} from './Media.utils';
import {
  borderRadius,
  spacing,
  typography,
  shadows,
  useResponsiveMode,
} from './shared';

// Media-specific colors that aren't in shared tokens
const colors = {
  surface: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    glass: 'rgba(255, 255, 255, 0.9)',
  },
  border: {
    default: '#E5E7EB',
    light: '#F3F4F6',
    medium: '#D1D5DB',
  },
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  accent: {
    500: '#3B82F6',
  },
};

export const Media: React.FC<MediaProps> = ({
  media,
  mode = 'full',
  maxHeight,
  maxWidth,
  onMediaPress,
  onExpandPress,
  onExpand,
  onDownload,
  onShare,
  onAction,
  showMetadata = false,
  showCaption = true,
  aspectRatio = 'original',
  fit = 'contain',
  backgroundColor,
  borderRadius: customBorderRadius,
  gallery,
}) => {
  // Use onExpand if provided, otherwise fall back to onExpandPress
  const handleExpand = onExpand || onExpandPress;
  const screenWidth = Dimensions.get('window').width;
  const isMini = mode === 'mini';
  const isMediaGallery = isGallery(media);
  const mediaArray = getMediaArray(media);

  // Gallery state
  const [currentIndex, setCurrentIndex] = useState(gallery?.initialIndex || 0);

  // Video/Audio playback state
  const videoRef = useRef<Video>(null);
  const audioRef = useRef<Audio.Sound | null>(null);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioPosition, setAudioPosition] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  // Track actual container width via onLayout
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && !maxWidth && width !== measuredWidth) {
      setMeasuredWidth(width);
    }
  };

  // Calculate container dimensions - use measured width when available
  const containerWidth = maxWidth || measuredWidth || (isMini ? Math.min(screenWidth - 32, 800) : screenWidth - 32);
  const containerHeight = maxHeight || (isMini ? 200 : 400);

  // Current media item
  const currentMedia = mediaArray[currentIndex];

  const handleMediaPress = () => {
    onMediaPress?.(currentMedia, currentIndex);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = async () => {
    // Stop any audio playback when navigating
    if ((htmlAudioRef.current as any)) {
      (htmlAudioRef.current as any).pause();
      (htmlAudioRef.current as any).src = '';
      (htmlAudioRef.current as any) = null;
    }
    if (audioRef.current) {
      await (audioRef.current as any)?.stopAsync();
      await (audioRef.current as any)?.unloadAsync();
      audioRef.current = null;
    }
    setCurrentIndex((prev) => Math.min(mediaArray.length - 1, prev + 1));
    setIsPlaying(false);
    setAudioPosition(0);
  };

  const handlePlayPause = async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await videoRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      // Failed to play/pause video
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setIsLoading(false);
    }
  };

  // Audio playback handlers - Platform-specific implementation
  const handleAudioPlayPause = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web: Use HTML5 Audio
        if (!(htmlAudioRef.current as any)) {
          setIsLoading(true);
          const audio = new (global as any).Audio(currentMedia.url);
          (htmlAudioRef.current as any) = audio;

          // Set up event listeners
          audio.addEventListener('loadedmetadata', () => {
            setAudioDuration(audio.duration * 1000);
            setIsLoading(false);
          });

          audio.addEventListener('timeupdate', () => {
            setAudioPosition(audio.currentTime * 1000);
          });

          audio.addEventListener('ended', (e: any) => {
            setIsPlaying(false);
            setAudioPosition(0);
            audio.currentTime = 0;
          });

          audio.addEventListener('error', () => {
            // Audio playback error
            setIsLoading(false);
          });

          // Start playing
          await audio.play();
          setIsPlaying(true);
          setIsLoading(false);
        } else {
          // Toggle play/pause
          if ((htmlAudioRef.current as any).paused) {
            await (htmlAudioRef.current as any).play();
            setIsPlaying(true);
          } else {
            (htmlAudioRef.current as any).pause();
            setIsPlaying(false);
          }
        }
      } else {
        // Native: Use expo-av
        if (!audioRef.current) {
          setIsLoading(true);

          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
          });

          const { sound } = await Audio.Sound.createAsync(
            { uri: currentMedia.url },
            { shouldPlay: true },
            onAudioPlaybackStatusUpdate
          );
          audioRef.current = sound;
          setIsPlaying(true);
          setIsLoading(false);
        } else {
          const status = await (audioRef.current as any)?.getStatusAsync();
          if (status.isLoaded) {
            if (status.isPlaying) {
              await (audioRef.current as any)?.pauseAsync();
              setIsPlaying(false);
            } else {
              await (audioRef.current as any)?.playAsync();
              setIsPlaying(true);
            }
          }
        }
      }
    } catch (error) {
      // Failed to play/pause audio
      setIsLoading(false);
    }
  };

  const onAudioPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setAudioPosition(status.positionMillis || 0);
      setAudioDuration(status.durationMillis || 0);
      setIsLoading(false);

      if (status.didJustFinish && !status.isLooping) {
        setIsPlaying(false);
        setAudioPosition(0);
      }
    }
  };

  const handleAudioSeek = async (position: number) => {
    try {
      if (Platform.OS === 'web') {
        if ((htmlAudioRef.current as any)) {
          (htmlAudioRef.current as any).currentTime = position / 1000;
          setAudioPosition(position);
        }
      } else {
        if (audioRef.current) {
          await (audioRef.current as any)?.setPositionAsync(position);
          setAudioPosition(position);
        }
      }
    } catch (error) {
      // Failed to seek audio
    }
  };

  // Cleanup audio on unmount or when media changes
  React.useEffect(() => {
    return () => {
      // Cleanup HTML audio
      if ((htmlAudioRef.current as any)) {
        (htmlAudioRef.current as any).pause();
        (htmlAudioRef.current as any).src = '';
        (htmlAudioRef.current as any) = null;
      }
      // Cleanup expo-av audio
      if (audioRef.current) {
        (audioRef.current as any)?.unloadAsync();
      }
    };
  }, []);

  React.useEffect(() => {
    // Cleanup audio when media changes
    const cleanup = async () => {
      // Cleanup HTML audio
      if ((htmlAudioRef.current as any)) {
        (htmlAudioRef.current as any).pause();
        (htmlAudioRef.current as any).src = '';
        (htmlAudioRef.current as any) = null;
      }
      // Cleanup expo-av audio
      if (audioRef.current) {
        await (audioRef.current as any)?.stopAsync();
        await (audioRef.current as any)?.unloadAsync();
        audioRef.current = null;
      }
      setIsPlaying(false);
      setAudioPosition(0);
      setAudioDuration(0);
    };
    cleanup();
  }, [currentIndex]);

  const renderMediaContent = (item: MediaItem, index: number) => {
    const typeColor = getMediaTypeColor(item.type);

    // Calculate dimensions based on metadata
    let imageDimensions = {
      width: containerWidth,
      height: containerHeight,
    };

    if (item.metadata?.width && item.metadata?.height) {
      const fitted = calculateFitDimensions(
        item.metadata.width,
        item.metadata.height,
        containerWidth,
        containerHeight,
        fit === 'scale-down' ? 'contain' : fit
      );
      imageDimensions = {
        width: fitted.width,
        height: fitted.height,
      };
    }

    // For audio and video, we don't want the outer container to be clickable
    // since they have their own play controls
    const isInteractiveMedia = item.type === 'audio' || item.type === 'video';
    const ContainerComponent = isInteractiveMedia ? View : TouchableOpacity;
    const containerProps = isInteractiveMedia ? {} : {
      onPress: handleMediaPress,
      activeOpacity: 0.9,
      accessibilityRole: 'button' as const,
    };

    return (
      <ContainerComponent
        key={item.id}
        style={[
          styles.mediaContainer,
          {
            width: containerWidth,
            height: containerHeight,
            backgroundColor: backgroundColor || colors.surface.secondary,
            borderRadius: customBorderRadius || borderRadius.lg,
          },
        ]}
        accessibilityLabel={`${item.type}: ${getMediaTitle(item)}`}
        {...containerProps}
      >
        {/* Media Type Badge */}
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: typeColor.background, borderColor: typeColor.border },
          ]}
        >
          <Text style={[styles.typeBadgeIcon]}>{getMediaTypeIcon(item.type)}</Text>
          <Text style={[styles.typeBadgeText, { color: typeColor.text }]}>
            {item.type.toUpperCase()}
          </Text>
        </View>

        {/* Image/GIF */}
        {(item.type === 'image' || item.type === 'gif') && (
          <Image
            source={{ uri: item.url }}
            style={[
              styles.image,
              {
                width: imageDimensions.width,
                height: imageDimensions.height,
              },
            ]}
            resizeMode={fit === 'scale-down' ? 'contain' : fit as any}
            accessibilityLabel={item.alt || getMediaTitle(item)}
          />
        )}

        {/* Video Player */}
        {item.type === 'video' && (
          <View style={styles.videoPlaceholder}>
            <Video
              ref={videoRef}
              source={{ uri: item.url }}
              style={[
                styles.video,
                {
                  width: imageDimensions.width,
                  height: imageDimensions.height,
                },
              ]}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls={false}
              isLooping={item.loop || false}
              isMuted={item.isMuted || false}
              shouldPlay={false}
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
              onLoadStart={() => setIsLoading(true)}
              onLoad={() => setIsLoading(false)}
            />

            {/* Play/Pause Button Overlay */}
            {!isPlaying && (
              <TouchableOpacity
                style={styles.playButton}
                onPress={handlePlayPause}
                activeOpacity={0.7}
              >
                <Text style={styles.playButtonText}>▶</Text>
              </TouchableOpacity>
            )}

            {/* Pause button when playing */}
            {isPlaying && (
              <TouchableOpacity
                style={styles.pauseButton}
                onPress={handlePlayPause}
                activeOpacity={0.7}
              >
                <Text style={styles.pauseButtonText}>⏸</Text>
              </TouchableOpacity>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
            )}

            {/* Duration badge */}
            {item.metadata?.duration && !isPlaying && (
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{formatDuration(item.metadata.duration)}</Text>
              </View>
            )}
          </View>
        )}

        {/* Audio Player */}
        {item.type === 'audio' && (
          <View style={[styles.audioPlaceholder, { width: containerWidth, height: containerHeight }]}>
            {/* Audio Icon */}
            <Text style={styles.audioIcon}>🎵</Text>

            {/* Title */}
            <Text style={styles.audioTitle} numberOfLines={2}>
              {getMediaTitle(item)}
            </Text>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <Text style={styles.timeText}>
                {formatDuration((audioPosition || 0) / 1000)}
              </Text>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: audioDuration > 0
                        ? `${(audioPosition / audioDuration) * 100}%`
                        : '0%',
                    },
                  ]}
                />
                <TouchableOpacity
                  style={[
                    styles.progressBarThumb,
                    {
                      left: audioDuration > 0
                        ? `${(audioPosition / audioDuration) * 100}%`
                        : '0%',
                    },
                  ]}
                  onPress={(e) => {
                    // Calculate seek position based on press location
                    const trackWidth = containerWidth - 120; // Account for padding
                    const pressX = e.nativeEvent.locationX;
                    const seekPosition = (pressX / trackWidth) * audioDuration;
                    handleAudioSeek(seekPosition);
                  }}
                />
              </View>
              <Text style={styles.timeText}>
                {formatDuration((audioDuration || item.metadata?.duration || 0) / 1000)}
              </Text>
            </View>

            {/* Playback Controls */}
            <View style={styles.audioControls}>
              <TouchableOpacity
                style={styles.audioControlButton}
                onPress={handleAudioPlayPause}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.audioControlIcon}>{isPlaying ? '⏸' : '▶'}</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Metadata display */}
            {item.metadata?.format && (
              <Text style={styles.audioFormat}>{item.metadata.format.toUpperCase()}</Text>
            )}
          </View>
        )}

        {/* Expand button for mini mode */}
        {isMini && handleExpand && (
          <TouchableOpacity
            style={styles.expandButton}
            onPress={handleExpand}
            accessibilityLabel="Expand media"
          >
            <Text style={styles.expandButtonText}>👁️ Expand</Text>
          </TouchableOpacity>
        )}
      </ContainerComponent>
    );
  };

  const renderCaption = () => {
    if (!showCaption || !currentMedia) return null;

    const caption = getMediaCaption(currentMedia);
    if (!caption) return null;

    return (
      <View style={styles.captionContainer}>
        <Text style={[styles.captionText, isMini && styles.captionTextMini]} numberOfLines={isMini ? 2 : undefined}>
          {caption}
        </Text>
      </View>
    );
  };

  const renderMetadata = () => {
    if (!showMetadata || !currentMedia?.metadata || isMini) return null;

    return (
      <View style={styles.metadataContainer}>
        <Text style={styles.metadataTitle}>Details</Text>
        <View style={styles.metadataGrid}>
          {/* Dimensions */}
          {currentMedia.metadata.width && currentMedia.metadata.height && (
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Dimensions</Text>
              <Text style={styles.metadataValue}>
                {formatDimensions(currentMedia.metadata.width, currentMedia.metadata.height)}
              </Text>
            </View>
          )}

          {/* File Size */}
          {currentMedia.metadata.fileSize && (
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Size</Text>
              <Text style={styles.metadataValue}>{formatFileSize(currentMedia.metadata.fileSize)}</Text>
            </View>
          )}

          {/* Duration */}
          {currentMedia.metadata.duration && (
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Duration</Text>
              <Text style={styles.metadataValue}>{formatDuration(currentMedia.metadata.duration)}</Text>
            </View>
          )}

          {/* Format */}
          {currentMedia.metadata.format && (
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Format</Text>
              <Text style={styles.metadataValue}>{currentMedia.metadata.format.toUpperCase()}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderGalleryControls = () => {
    if (!isMediaGallery || mediaArray.length <= 1) return null;

    return (
      <View style={styles.galleryControls}>
        {/* Navigation Arrows */}
        <View style={styles.galleryNav}>
          <TouchableOpacity
            style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
            onPress={handlePrevious}
            disabled={currentIndex === 0}
            accessibilityLabel="Previous media"
            accessibilityRole="button"
          >
            <Text style={[styles.navButtonText, currentIndex === 0 && styles.navButtonTextDisabled]}>‹</Text>
          </TouchableOpacity>

          <View style={styles.galleryIndicator}>
            <Text style={styles.galleryIndicatorText}>
              {currentIndex + 1} / {mediaArray.length}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.navButton,
              currentIndex === mediaArray.length - 1 && styles.navButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={currentIndex === mediaArray.length - 1}
            accessibilityLabel="Next media"
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.navButtonText,
                currentIndex === mediaArray.length - 1 && styles.navButtonTextDisabled,
              ]}
            >
              ›
            </Text>
          </TouchableOpacity>
        </View>

        {/* Thumbnails */}
        {gallery?.showThumbnails && !isMini && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailScroll}
            contentContainerStyle={styles.thumbnailContainer}
          >
            {mediaArray.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.thumbnail,
                  index === currentIndex && styles.thumbnailActive,
                ]}
                onPress={() => setCurrentIndex(index)}
                accessibilityLabel={`View ${getMediaTitle(item)}`}
                accessibilityRole="button"
              >
                {(item.type === 'image' || item.type === 'gif' || item.type === 'video') && (
                  <Image
                    source={{ uri: item.thumbnailUrl || item.url }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                )}
                {item.type === 'audio' && (
                  <View style={styles.thumbnailAudio}>
                    <Text style={styles.thumbnailAudioIcon}>🎵</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderActions = () => {
    if (isMini || (!onDownload && !onShare)) return null;

    return (
      <View style={styles.actionsContainer}>
        {onDownload && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDownload(currentMedia)}
            accessibilityLabel="Download"
            accessibilityRole="button"
          >
            <Text style={styles.actionButtonText}>⬇ Download</Text>
          </TouchableOpacity>
        )}
        {onShare && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onShare(currentMedia)}
            accessibilityLabel="Share"
            accessibilityRole="button"
          >
            <Text style={styles.actionButtonText}>↗ Share</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Early return if no media data
  if (!currentMedia) {
    return (
      <View style={[
        styles.container,
        isMini && styles.containerMini,
        { width: '100%', maxWidth: isMini ? 800 : undefined, alignSelf: 'stretch' }
      ]}>
        <View style={[
          styles.mediaContainer,
          {
            width: containerWidth,
            height: containerHeight,
            backgroundColor: backgroundColor || colors.surface.secondary,
            borderRadius: customBorderRadius || borderRadius.lg,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}>
          <Text style={[styles.subtitle, { color: colors.text.tertiary }]}>
            Media not available
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        isMini && styles.containerMini,
        { width: '100%', maxWidth: isMini ? 800 : undefined, alignSelf: 'stretch' }
      ]}
      onLayout={handleLayout}
    >
      {/* Header with title */}
      {!isMini && currentMedia && (
        <View style={styles.header}>
          <Text style={styles.title}>{getMediaTitle(currentMedia)}</Text>
          {currentMedia.author && (
            <Text style={styles.subtitle}>by {currentMedia.author}</Text>
          )}
        </View>
      )}

      {/* Media Content */}
      {renderMediaContent(currentMedia, currentIndex)}

      {/* Gallery Controls */}
      {renderGalleryControls()}

      {/* Caption */}
      {renderCaption()}

      {/* Metadata */}
      {renderMetadata()}

      {/* Actions */}
      {renderActions()}

      {/* Tags */}
      {!isMini && currentMedia?.tags && currentMedia.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {currentMedia.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  containerMini: {
    borderRadius: borderRadius.md,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    backgroundColor: colors.surface.secondary,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  mediaContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  typeBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    zIndex: 10,
    ...shadows.sm,
  },
  typeBadgeIcon: {
    fontSize: typography.fontSize.sm,
    marginRight: spacing.xs,
  },
  typeBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  image: {
    backgroundColor: colors.surface.secondary,
  },
  video: {
    backgroundColor: '#000000',
  },
  videoPlaceholder: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    fontSize: 24,
    color: colors.text.inverse,
    marginLeft: 4,
  },
  pauseButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseButtonText: {
    fontSize: 18,
    color: colors.text.inverse,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  durationText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.semibold,
  },
  audioPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.secondary,
  },
  audioIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  audioTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  audioDuration: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  audioControlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.accent[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioControlIcon: {
    fontSize: 20,
    color: colors.text.inverse,
    marginLeft: 4,
  },
  audioFormat: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.md,
    gap: spacing.sm,
  },
  timeText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    minWidth: 40,
  },
  progressBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border.medium,
    borderRadius: 2,
    position: 'relative',
    overflow: 'visible',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent[500],
    borderRadius: 2,
  },
  progressBarThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accent[500],
    top: -6,
    marginLeft: -8,
    borderWidth: 2,
    borderColor: colors.surface.primary,
    ...shadows.sm,
  },
  expandButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.base,
    backgroundColor: colors.accent[500],
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
  captionContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  captionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  captionTextMini: {
    fontSize: typography.fontSize.xs,
  },
  metadataContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.surface.secondary,
  },
  metadataTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metadataItem: {
    flex: 1,
    minWidth: 120,
  },
  metadataLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  metadataValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  galleryControls: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  galleryNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    backgroundColor: colors.border.light,
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 24,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.bold,
  },
  navButtonTextDisabled: {
    color: colors.text.tertiary,
  },
  galleryIndicator: {
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface.secondary,
    borderRadius: borderRadius.base,
  },
  galleryIndicatorText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  thumbnailScroll: {
    paddingHorizontal: spacing.lg,
  },
  thumbnailContainer: {
    gap: spacing.sm,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.base,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: colors.accent[500],
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailAudio: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailAudioIcon: {
    fontSize: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accent[500],
    borderRadius: borderRadius.base,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
  tagsContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface.secondary,
    borderRadius: borderRadius.base,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  tagText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
});

export default Media;
