import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { VideoStream } from './VideoStream';
import type { VideoStreamDetailViewProps } from './VideoStream.types';

const colors = {
  surface: {
    primary: '#FFFFFF',
    dark: '#111827',
  },
  text: {
    inverse: '#FFFFFF',
  },
};

export const VideoStreamDetailView: React.FC<VideoStreamDetailViewProps> = ({
  visible,
  data,
  onClose,
  onPlay,
  onPause,
  onEnded,
  onError,
  showMetadata = true,
  enablePictureInPicture = false,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕ Close</Text>
        </TouchableOpacity>

        {/* Video Stream */}
        <View style={styles.videoWrapper}>
          <VideoStream
            data={{
              ...data,
              showMetadata: showMetadata,
              controls: true,
            }}
            mode="full"
            maxWidth={screenWidth}
            maxHeight={screenHeight - 100}
            onPlay={onPlay}
            onPause={onPause}
            onEnded={onEnded}
            onError={onError}
          />
        </View>

        {/* Additional metadata or controls can be added here */}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    zIndex: 1000,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  videoWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default VideoStreamDetailView;
