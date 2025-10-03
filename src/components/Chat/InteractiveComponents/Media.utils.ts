import type { MediaItem, MediaType, MediaMetadata, MediaDimensions } from './Media.types';

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return 'Unknown size';
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format duration in human-readable format (for video/audio)
 */
export const formatDuration = (seconds?: number): string => {
  if (!seconds) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format dimensions as a string
 */
export const formatDimensions = (width?: number, height?: number): string => {
  if (!width || !height) return 'Unknown';
  return `${width} × ${height}`;
};

/**
 * Calculate aspect ratio from width and height
 */
export const calculateAspectRatio = (width?: number, height?: number): number | undefined => {
  if (!width || !height || height === 0) return undefined;
  return width / height;
};

/**
 * Get aspect ratio as a common string representation
 */
export const getAspectRatioLabel = (aspectRatio?: number): string => {
  if (!aspectRatio) return 'Unknown';

  // Common aspect ratios
  const commonRatios: { [key: string]: number } = {
    '1:1': 1.0,
    '4:3': 1.333,
    '3:2': 1.5,
    '16:10': 1.6,
    '16:9': 1.778,
    '21:9': 2.333,
  };

  // Find closest match
  let closest = '1:1';
  let minDiff = Math.abs(aspectRatio - 1.0);

  Object.entries(commonRatios).forEach(([label, ratio]) => {
    const diff = Math.abs(aspectRatio - ratio);
    if (diff < minDiff) {
      minDiff = diff;
      closest = label;
    }
  });

  // If difference is small, return the common ratio
  if (minDiff < 0.05) {
    return closest;
  }

  // Otherwise return the calculated ratio
  return aspectRatio.toFixed(2);
};

/**
 * Determine media type from URL or MIME type
 */
export const determineMediaType = (url: string, mimeType?: string): MediaType => {
  if (mimeType) {
    if (mimeType.startsWith('image/')) {
      return mimeType === 'image/gif' ? 'gif' : 'image';
    }
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
  }

  // Fallback to URL extension
  const extension = url.split('.').pop()?.toLowerCase();

  if (!extension) return 'image'; // Default

  const imageExts = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'bmp'];
  const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
  const audioExts = ['mp3', 'wav', 'ogg', 'aac', 'm4a'];

  if (extension === 'gif') return 'gif';
  if (imageExts.includes(extension)) return 'image';
  if (videoExts.includes(extension)) return 'video';
  if (audioExts.includes(extension)) return 'audio';

  return 'image'; // Default
};

/**
 * Calculate dimensions that fit within a container while maintaining aspect ratio
 */
export const calculateFitDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
  fit: 'cover' | 'contain' | 'fill' = 'contain'
): MediaDimensions => {
  if (fit === 'fill') {
    return {
      width: maxWidth,
      height: maxHeight,
      aspectRatio: maxWidth / maxHeight,
    };
  }

  const aspectRatio = originalWidth / originalHeight;
  const containerAspect = maxWidth / maxHeight;

  let width: number;
  let height: number;

  if (fit === 'contain') {
    if (aspectRatio > containerAspect) {
      // Width is the limiting factor
      width = maxWidth;
      height = maxWidth / aspectRatio;
    } else {
      // Height is the limiting factor
      height = maxHeight;
      width = maxHeight * aspectRatio;
    }
  } else {
    // cover
    if (aspectRatio > containerAspect) {
      // Height is the limiting factor
      height = maxHeight;
      width = maxHeight * aspectRatio;
    } else {
      // Width is the limiting factor
      width = maxWidth;
      height = maxWidth / aspectRatio;
    }
  }

  return {
    width,
    height,
    aspectRatio,
  };
};

/**
 * Get icon/emoji for media type
 */
export const getMediaTypeIcon = (type: MediaType): string => {
  switch (type) {
    case 'image':
      return '🖼️';
    case 'gif':
      return '🎞️';
    case 'video':
      return '🎥';
    case 'audio':
      return '🎵';
    default:
      return '📄';
  }
};

/**
 * Check if media item is a gallery (array of items)
 */
export const isGallery = (media: MediaItem | MediaItem[]): media is MediaItem[] => {
  return Array.isArray(media);
};

/**
 * Get media items as an array (handles single item or array)
 */
export const getMediaArray = (media: MediaItem | MediaItem[]): MediaItem[] => {
  return Array.isArray(media) ? media : [media];
};

/**
 * Format metadata for display
 */
export const formatMetadataForDisplay = (metadata?: MediaMetadata): Array<{ label: string; value: string }> => {
  if (!metadata) return [];

  const items: Array<{ label: string; value: string }> = [];

  // File info
  if (metadata.fileName) {
    items.push({ label: 'File Name', value: metadata.fileName });
  }
  if (metadata.fileSize) {
    items.push({ label: 'File Size', value: formatFileSize(metadata.fileSize) });
  }
  if (metadata.mimeType) {
    items.push({ label: 'Type', value: metadata.mimeType });
  }

  // Dimensions
  if (metadata.width && metadata.height) {
    items.push({ label: 'Dimensions', value: formatDimensions(metadata.width, metadata.height) });
    const aspectRatio = calculateAspectRatio(metadata.width, metadata.height);
    if (aspectRatio) {
      items.push({ label: 'Aspect Ratio', value: getAspectRatioLabel(aspectRatio) });
    }
  }

  // Duration (for video/audio)
  if (metadata.duration) {
    items.push({ label: 'Duration', value: formatDuration(metadata.duration) });
  }

  // Frame rate (for video)
  if (metadata.frameRate) {
    items.push({ label: 'Frame Rate', value: `${metadata.frameRate} fps` });
  }

  // Bitrate (for video/audio)
  if (metadata.bitrate) {
    items.push({ label: 'Bitrate', value: `${metadata.bitrate} kbps` });
  }

  // Color info
  if (metadata.colorSpace) {
    items.push({ label: 'Color Space', value: metadata.colorSpace });
  }
  if (metadata.colorDepth) {
    items.push({ label: 'Color Depth', value: `${metadata.colorDepth} bit` });
  }

  // Camera info
  if (metadata.camera) {
    const { make, model, lens, focalLength, aperture, iso, shutterSpeed } = metadata.camera;
    if (make || model) {
      items.push({ label: 'Camera', value: [make, model].filter(Boolean).join(' ') });
    }
    if (lens) {
      items.push({ label: 'Lens', value: lens });
    }
    if (focalLength) {
      items.push({ label: 'Focal Length', value: `${focalLength}mm` });
    }
    if (aperture) {
      items.push({ label: 'Aperture', value: `f/${aperture}` });
    }
    if (iso) {
      items.push({ label: 'ISO', value: `${iso}` });
    }
    if (shutterSpeed) {
      items.push({ label: 'Shutter Speed', value: shutterSpeed });
    }
  }

  // Location
  if (metadata.location) {
    items.push({
      label: 'Location',
      value: `${metadata.location.latitude.toFixed(6)}, ${metadata.location.longitude.toFixed(6)}`,
    });
  }

  // Dates
  if (metadata.createdAt) {
    items.push({ label: 'Created', value: new Date(metadata.createdAt).toLocaleString() });
  }
  if (metadata.modifiedAt) {
    items.push({ label: 'Modified', value: new Date(metadata.modifiedAt).toLocaleString() });
  }

  return items;
};

/**
 * Generate a thumbnail URL from a video URL (placeholder logic)
 */
export const generateThumbnailUrl = (videoUrl: string): string => {
  // In a real implementation, this would generate or fetch a thumbnail
  // For now, return the video URL itself
  return videoUrl;
};

/**
 * Check if URL is a valid media URL
 */
export const isValidMediaUrl = (url?: string): boolean => {
  if (!url) return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get display title for media item
 */
export const getMediaTitle = (media: MediaItem): string => {
  return media.title || media.metadata?.fileName || 'Untitled Media';
};

/**
 * Get display caption for media item
 */
export const getMediaCaption = (media: MediaItem): string | undefined => {
  return media.caption || media.summary || media.description;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

/**
 * Get color for media type
 */
export const getMediaTypeColor = (type: MediaType): { background: string; border: string; text: string } => {
  switch (type) {
    case 'image':
      return {
        background: '#E0F2FE',
        border: '#0EA5E9',
        text: '#075985',
      };
    case 'gif':
      return {
        background: '#FCE7F3',
        border: '#EC4899',
        text: '#9F1239',
      };
    case 'video':
      return {
        background: '#DBEAFE',
        border: '#3B82F6',
        text: '#1E40AF',
      };
    case 'audio':
      return {
        background: '#E9D5FF',
        border: '#A855F7',
        text: '#6B21A8',
      };
    default:
      return {
        background: '#F3F4F6',
        border: '#9CA3AF',
        text: '#4B5563',
      };
  }
};
