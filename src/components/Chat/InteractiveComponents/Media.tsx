import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
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

const borderRadius = {
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
};

const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
};

const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
  },
  fontWeight: {
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

const shadows = {
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
};

export const Media: React.FC<MediaProps> = ({
  media,
  mode = 'full',
  maxHeight,
  maxWidth,
  onMediaPress,
  onExpandPress,
  onDownload,
  onShare,
  showMetadata = false,
  showCaption = true,
  aspectRatio = 'original',
  fit = 'contain',
  backgroundColor,
  borderRadius: customBorderRadius,
  gallery,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const isMini = mode === 'mini';
  const isMediaGallery = isGallery(media);
  const mediaArray = getMediaArray(media);

  // Gallery state
  const [currentIndex, setCurrentIndex] = useState(gallery?.initialIndex || 0);

  // Calculate container dimensions
  const containerWidth = maxWidth || (isMini ? screenWidth - 32 : screenWidth - 32);
  const containerHeight = maxHeight || (isMini ? 200 : 400);

  // Current media item
  const currentMedia = mediaArray[currentIndex];

  const handleMediaPress = () => {
    onMediaPress?.(currentMedia, currentIndex);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(mediaArray.length - 1, prev + 1));
  };

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
        fit
      );
      imageDimensions = {
        width: fitted.width,
        height: fitted.height,
      };
    }

    return (
      <TouchableOpacity
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
        onPress={handleMediaPress}
        activeOpacity={0.9}
        accessibilityLabel={`${item.type}: ${getMediaTitle(item)}`}
        accessibilityRole="button"
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
            resizeMode={fit}
            accessibilityLabel={item.alt || getMediaTitle(item)}
          />
        )}

        {/* Video Placeholder */}
        {item.type === 'video' && (
          <View style={styles.videoPlaceholder}>
            <Image
              source={{ uri: item.thumbnailUrl || item.url }}
              style={[
                styles.image,
                {
                  width: imageDimensions.width,
                  height: imageDimensions.height,
                },
              ]}
              resizeMode={fit}
            />
            <View style={styles.playButton}>
              <Text style={styles.playButtonText}>▶</Text>
            </View>
            {item.metadata?.duration && (
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{formatDuration(item.metadata.duration)}</Text>
              </View>
            )}
          </View>
        )}

        {/* Audio Placeholder */}
        {item.type === 'audio' && (
          <View style={[styles.audioPlaceholder, { width: containerWidth, height: containerHeight }]}>
            <Text style={styles.audioIcon}>🎵</Text>
            <Text style={styles.audioTitle}>{getMediaTitle(item)}</Text>
            {item.metadata?.duration && (
              <Text style={styles.audioDuration}>{formatDuration(item.metadata.duration)}</Text>
            )}
            <View style={styles.audioControls}>
              <TouchableOpacity style={styles.audioControlButton}>
                <Text style={styles.audioControlIcon}>▶</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Expand button for mini mode */}
        {isMini && onExpandPress && (
          <TouchableOpacity
            style={styles.expandButton}
            onPress={onExpandPress}
            accessibilityLabel="Expand media"
            accessibilityRole="button"
          >
            <Text style={styles.expandButtonText}>⛶</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
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

  return (
    <View style={[styles.container, isMini && styles.containerMini]}>
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
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
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
    marginTop: spacing[1],
  },
  mediaContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  typeBadge: {
    position: 'absolute',
    top: spacing[2],
    left: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.base,
    borderWidth: 1,
    zIndex: 10,
    ...shadows.xs,
  },
  typeBadgeIcon: {
    fontSize: typography.fontSize.sm,
    marginRight: spacing[1],
  },
  typeBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  image: {
    backgroundColor: colors.surface.secondary,
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
  durationBadge: {
    position: 'absolute',
    bottom: spacing[2],
    right: spacing[2],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
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
    marginBottom: spacing[3],
  },
  audioTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
    paddingHorizontal: spacing[4],
    marginBottom: spacing[2],
  },
  audioDuration: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[4],
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
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
  expandButton: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    padding: spacing[2],
    borderRadius: borderRadius.base,
    backgroundColor: colors.accent[500],
  },
  expandButtonText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.inverse,
  },
  captionContainer: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
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
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.surface.secondary,
  },
  metadataTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  metadataItem: {
    flex: 1,
    minWidth: 120,
  },
  metadataLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing[1],
  },
  metadataValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  galleryControls: {
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  galleryNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
    marginBottom: spacing[2],
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
    marginHorizontal: spacing[4],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    backgroundColor: colors.surface.secondary,
    borderRadius: borderRadius.base,
  },
  galleryIndicatorText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  thumbnailScroll: {
    paddingHorizontal: spacing[4],
  },
  thumbnailContainer: {
    gap: spacing[2],
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
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
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
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  tag: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    backgroundColor: colors.surface.secondary,
    borderRadius: borderRadius.base,
    marginRight: spacing[2],
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
