import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Dimensions,
  Platform,
  SafeAreaView,
  Image,
  TextInput,
} from 'react-native';
import { useModalNavigation } from '../hooks';
import type { MediaDetailViewProps, MediaItem } from './Media.types';
import {
  formatFileSize,
  formatDuration,
  formatDimensions,
  getMediaTypeIcon,
  isGallery,
  getMediaArray,
  getMediaTitle,
  getMediaCaption,
  getMediaTypeColor,
  calculateFitDimensions,
  formatMetadataForDisplay,
  getAspectRatioLabel,
  calculateAspectRatio,
} from './Media.utils';

export const MediaDetailView: React.FC<MediaDetailViewProps> = ({
  visible,
  media,
  initialIndex = 0,
  onClose,
  onDownload,
  onShare,
  onMediaPress,
  showMetadata = true,
  enableZoom = true,
  backgroundColor,
}) => {
  const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
  const mediaArray = getMediaArray(media);

  // State
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'media' | 'details'>('media');

  // Handle cross-platform navigation
  useModalNavigation({ visible, onClose });

  // Current media item
  const currentMedia = mediaArray[currentIndex];

  // Navigation handlers
  const handlePrevious = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIndex);
    onMediaPress?.(mediaArray[newIndex], newIndex);
  };

  const handleNext = () => {
    const newIndex = Math.min(mediaArray.length - 1, currentIndex + 1);
    setCurrentIndex(newIndex);
    onMediaPress?.(mediaArray[newIndex], newIndex);
  };

  const handleThumbnailPress = (index: number) => {
    setCurrentIndex(index);
    onMediaPress?.(mediaArray[index], index);
  };

  // Filtered media for search
  const filteredMedia = useMemo(() => {
    if (!searchQuery.trim()) return mediaArray;

    const query = searchQuery.toLowerCase();
    return mediaArray.filter(
      (item, index) =>
        getMediaTitle(item).toLowerCase().includes(query) ||
        getMediaCaption(item)?.toLowerCase().includes(query) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
        (index + 1).toString().includes(query)
    );
  }, [mediaArray, searchQuery]);

  // Calculate dimensions
  const containerWidth = windowWidth;
  const containerHeight = windowHeight * 0.6;

  let mediaDimensions = {
    width: containerWidth,
    height: containerHeight,
  };

  if (currentMedia?.metadata?.width && currentMedia?.metadata?.height) {
    const fitted = calculateFitDimensions(
      currentMedia.metadata.width,
      currentMedia.metadata.height,
      containerWidth,
      containerHeight,
      'contain'
    );
    mediaDimensions = {
      width: fitted.width,
      height: fitted.height,
    };
  }

  const renderMediaContent = () => {
    if (!currentMedia) return null;

    const typeColor = getMediaTypeColor(currentMedia.type);

    return (
      <View
        style={[
          styles.mediaContainer,
          {
            backgroundColor: backgroundColor || '#000000',
            height: containerHeight,
          },
        ]}
      >
        {/* Image/GIF */}
        {(currentMedia.type === 'image' || currentMedia.type === 'gif') && (
          <Image
            source={{ uri: currentMedia.url }}
            style={[
              styles.mediaImage,
              {
                width: mediaDimensions.width,
                height: mediaDimensions.height,
              },
            ]}
            resizeMode="contain"
            accessibilityLabel={currentMedia.alt || getMediaTitle(currentMedia)}
          />
        )}

        {/* Video */}
        {currentMedia.type === 'video' && (
          <View style={styles.videoContainer}>
            <Image
              source={{ uri: currentMedia.thumbnailUrl || currentMedia.url }}
              style={[
                styles.mediaImage,
                {
                  width: mediaDimensions.width,
                  height: mediaDimensions.height,
                },
              ]}
              resizeMode="contain"
            />
            <TouchableOpacity style={styles.playButton}>
              <Text style={styles.playButtonText}>▶</Text>
            </TouchableOpacity>
            {currentMedia.metadata?.duration && (
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{formatDuration(currentMedia.metadata.duration)}</Text>
              </View>
            )}
          </View>
        )}

        {/* Audio */}
        {currentMedia.type === 'audio' && (
          <View style={styles.audioContainer}>
            <Text style={styles.audioIcon}>🎵</Text>
            <Text style={styles.audioTitle}>{getMediaTitle(currentMedia)}</Text>
            {currentMedia.metadata?.duration && (
              <Text style={styles.audioDuration}>{formatDuration(currentMedia.metadata.duration)}</Text>
            )}
            <View style={styles.audioControls}>
              <TouchableOpacity style={styles.audioControlButton}>
                <Text style={styles.audioControlIcon}>⏮</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.audioControlButton, styles.audioControlButtonPrimary]}>
                <Text style={styles.audioControlIcon}>▶</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.audioControlButton}>
                <Text style={styles.audioControlIcon}>⏭</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.audioProgress}>
              <View style={styles.audioProgressBar} />
            </View>
          </View>
        )}

        {/* Type Badge */}
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: typeColor.background, borderColor: typeColor.border },
          ]}
        >
          <Text style={styles.typeBadgeIcon}>{getMediaTypeIcon(currentMedia.type)}</Text>
          <Text style={[styles.typeBadgeText, { color: typeColor.text }]}>
            {currentMedia.type.toUpperCase()}
          </Text>
        </View>
      </View>
    );
  };

  const renderGalleryNavigation = () => {
    if (mediaArray.length <= 1) return null;

    return (
      <View style={styles.galleryNavigation}>
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
    );
  };

  const renderDetails = () => {
    if (!currentMedia) return null;

    const caption = getMediaCaption(currentMedia);
    const metadataItems = showMetadata ? formatMetadataForDisplay(currentMedia.metadata) : [];

    return (
      <View style={styles.detailsContainer}>
        {/* Title */}
        <View style={styles.detailsHeader}>
          <Text style={styles.detailsTitle}>{getMediaTitle(currentMedia)}</Text>
          {currentMedia.author && (
            <Text style={styles.detailsAuthor}>by {currentMedia.author}</Text>
          )}
        </View>

        {/* Caption */}
        {caption && (
          <View style={styles.captionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.captionText}>{caption}</Text>
          </View>
        )}

        {/* Metadata */}
        {showMetadata && metadataItems.length > 0 && (
          <View style={styles.metadataSection}>
            <Text style={styles.sectionTitle}>Metadata</Text>
            <View style={styles.metadataGrid}>
              {metadataItems.map((item, index) => (
                <View key={index} style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>{item.label}</Text>
                  <Text style={styles.metadataValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tags */}
        {currentMedia.tags && currentMedia.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {currentMedia.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Source & License */}
        {(currentMedia.source || currentMedia.license) && (
          <View style={styles.legalSection}>
            {currentMedia.source && (
              <View style={styles.legalItem}>
                <Text style={styles.legalLabel}>Source:</Text>
                <Text style={styles.legalValue}>{currentMedia.source}</Text>
              </View>
            )}
            {currentMedia.license && (
              <View style={styles.legalItem}>
                <Text style={styles.legalLabel}>License:</Text>
                <Text style={styles.legalValue}>{currentMedia.license}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderThumbnailGrid = () => {
    if (mediaArray.length <= 1) return null;

    return (
      <View style={styles.thumbnailSection}>
        {/* Search */}
        {mediaArray.length > 5 && (
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search media..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Thumbnail Grid */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailScroll}
          contentContainerStyle={styles.thumbnailContainer}
        >
          {filteredMedia.map((item, arrayIndex) => {
            const actualIndex = mediaArray.indexOf(item);
            const isActive = actualIndex === currentIndex;

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.thumbnail, isActive && styles.thumbnailActive]}
                onPress={() => handleThumbnailPress(actualIndex)}
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
                <View style={styles.thumbnailOverlay}>
                  <Text style={styles.thumbnailIndex}>{actualIndex + 1}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {currentMedia ? getMediaTitle(currentMedia) : 'Media'}
            </Text>
          </View>

          <View style={styles.headerRight}>
            {/* View Toggle */}
            <View style={styles.viewToggle}>
              <TouchableOpacity
                style={[styles.viewToggleButton, viewMode === 'media' && styles.viewToggleButtonActive]}
                onPress={() => setViewMode('media')}
              >
                <Text
                  style={[styles.viewToggleText, viewMode === 'media' && styles.viewToggleTextActive]}
                >
                  🖼️
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewToggleButton, viewMode === 'details' && styles.viewToggleButtonActive]}
                onPress={() => setViewMode('details')}
              >
                <Text
                  style={[styles.viewToggleText, viewMode === 'details' && styles.viewToggleTextActive]}
                >
                  ℹ️
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={true}
        >
          {viewMode === 'media' && (
            <>
              {renderMediaContent()}
              {renderGalleryNavigation()}
              {renderThumbnailGrid()}
            </>
          )}

          {viewMode === 'details' && renderDetails()}
        </ScrollView>

        {/* Footer Actions */}
        {(onDownload || onShare) && (
          <View style={styles.footer}>
            {onDownload && (
              <TouchableOpacity
                style={styles.footerButton}
                onPress={() => currentMedia && onDownload(currentMedia)}
                accessibilityLabel="Download"
                accessibilityRole="button"
              >
                <Text style={styles.footerButtonText}>⬇ Download</Text>
              </TouchableOpacity>
            )}
            {onShare && (
              <TouchableOpacity
                style={styles.footerButton}
                onPress={() => currentMedia && onShare(currentMedia)}
                accessibilityLabel="Share"
                accessibilityRole="button"
              >
                <Text style={styles.footerButtonText}>↗ Share</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6B7280',
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    padding: 2,
  },
  viewToggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  viewToggleButtonActive: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  viewToggleText: {
    fontSize: 16,
  },
  viewToggleTextActive: {
    opacity: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  mediaContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mediaImage: {
    backgroundColor: '#000000',
  },
  videoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    fontSize: 32,
    color: '#FFFFFF',
    marginLeft: 6,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  durationText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  audioContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 60,
  },
  audioIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  audioTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  audioDuration: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  audioControlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioControlButtonPrimary: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
  },
  audioControlIcon: {
    fontSize: 20,
    color: '#111827',
  },
  audioProgress: {
    width: '80%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  audioProgressBar: {
    width: '40%',
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  typeBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  typeBadgeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  galleryNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    backgroundColor: '#E5E7EB',
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  navButtonTextDisabled: {
    color: '#9CA3AF',
  },
  galleryIndicator: {
    marginHorizontal: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  galleryIndicatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  thumbnailSection: {
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#111827',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  thumbnailScroll: {
    paddingHorizontal: 16,
  },
  thumbnailContainer: {
    gap: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
    position: 'relative',
  },
  thumbnailActive: {
    borderColor: '#3B82F6',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailAudio: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailAudioIcon: {
    fontSize: 32,
  },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  thumbnailIndex: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  detailsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  detailsHeader: {
    marginBottom: 24,
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  detailsAuthor: {
    fontSize: 16,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  captionSection: {
    marginBottom: 24,
  },
  captionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  metadataSection: {
    marginBottom: 24,
  },
  metadataGrid: {
    gap: 16,
  },
  metadataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  metadataLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  metadataValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'right',
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E0F2FE',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0EA5E9',
  },
  tagText: {
    fontSize: 12,
    color: '#075985',
    fontWeight: '500',
  },
  legalSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legalItem: {
    marginBottom: 12,
  },
  legalLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  legalValue: {
    fontSize: 14,
    color: '#374151',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default MediaDetailView;
