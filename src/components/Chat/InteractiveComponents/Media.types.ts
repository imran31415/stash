export type MediaType = 'image' | 'gif' | 'video' | 'audio';

export type ImageFormat = 'jpeg' | 'jpg' | 'png' | 'gif' | 'webp' | 'svg' | 'bmp';

export type VideoFormat = 'mp4' | 'webm' | 'ogg' | 'mov' | 'avi';

export type AudioFormat = 'mp3' | 'wav' | 'ogg' | 'aac' | 'm4a';

export interface MediaMetadata {
  // Common metadata
  fileName?: string;
  fileSize?: number; // in bytes
  mimeType?: string;
  format?: string;
  createdAt?: Date;
  modifiedAt?: Date;

  // Image/Video specific
  width?: number;
  height?: number;
  aspectRatio?: number;

  // Video/Audio specific
  duration?: number; // in seconds
  bitrate?: number; // in kbps

  // Image specific
  colorSpace?: string;
  colorDepth?: number;
  hasAlpha?: boolean;

  // Video specific
  frameRate?: number;
  codec?: string;

  // Location/Camera metadata
  location?: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  camera?: {
    make?: string;
    model?: string;
    lens?: string;
    focalLength?: number;
    aperture?: number;
    iso?: number;
    shutterSpeed?: string;
    flash?: boolean;
  };

  // Custom metadata
  [key: string]: any;
}

export interface MediaItem {
  id: string;
  type: MediaType;
  url: string; // Primary media URL
  thumbnailUrl?: string; // Thumbnail for videos/large images
  title?: string;
  caption?: string;
  summary?: string;
  description?: string;
  metadata?: MediaMetadata;
  tags?: string[];
  author?: string;
  source?: string;
  license?: string;
  alt?: string; // Accessibility text
  isAnimated?: boolean; // For GIFs
  isMuted?: boolean; // For videos/audio
  autoPlay?: boolean; // For videos/GIFs
  loop?: boolean; // For videos/GIFs/audio
}

export interface MediaProps {
  media: MediaItem | MediaItem[]; // Single item or gallery
  mode?: 'mini' | 'full'; // Display mode
  maxHeight?: number; // Maximum height for the media
  maxWidth?: number; // Maximum width for the media
  onMediaPress?: (media: MediaItem, index?: number) => void;
  onExpandPress?: () => void; // Called when user wants to expand from mini to full
  onExpand?: () => void; // Alias for onExpandPress
  onDownload?: (media: MediaItem) => void;
  onShare?: (media: MediaItem) => void;
  onAction?: (action: string, data: any) => void; // Generic action handler
  showMetadata?: boolean; // Show metadata in full mode
  showCaption?: boolean; // Show caption/summary
  showControls?: boolean; // Show media controls (play/pause for video)
  enableZoom?: boolean; // Enable pinch-to-zoom
  enableFullscreen?: boolean; // Enable fullscreen mode
  aspectRatio?: 'original' | 'square' | '16:9' | '4:3' | '1:1';
  fit?: 'cover' | 'contain' | 'fill' | 'scale-down'; // How to fit the media
  backgroundColor?: string; // Background color for media container
  borderRadius?: number;
  gallery?: {
    showThumbnails?: boolean;
    enableSwipe?: boolean;
    showIndicators?: boolean;
    initialIndex?: number;
  };
}

export interface MediaDetailViewProps {
  visible: boolean;
  media: MediaItem | MediaItem[]; // Single item or gallery
  initialIndex?: number; // For gallery mode
  onClose: () => void;
  onDownload?: (media: MediaItem) => void;
  onShare?: (media: MediaItem) => void;
  onMediaPress?: (media: MediaItem, index: number) => void;
  showMetadata?: boolean;
  enableZoom?: boolean;
  backgroundColor?: string;
}

export interface MediaDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface MediaGalleryState {
  currentIndex: number;
  isZoomed: boolean;
  zoomScale: number;
  showControls: boolean;
  isPlaying: boolean;
}
