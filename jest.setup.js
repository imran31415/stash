// Jest setup file for React Native Testing Library
import '@testing-library/react-native/extend-expect';

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  return {
    Svg: ({ children, ...props }) => React.createElement('Svg', props, children),
    Circle: (props) => React.createElement('Circle', props),
    Path: (props) => React.createElement('Path', props),
    Line: (props) => React.createElement('Line', props),
    Rect: (props) => React.createElement('Rect', props),
    G: ({ children, ...props }) => React.createElement('G', props, children),
    Text: ({ children, ...props }) => React.createElement('Text', props, children),
  };
});

// Mock expo-av
jest.mock('expo-av', () => ({
  Video: 'Video',
  Audio: {
    Sound: {
      createAsync: jest.fn(() => Promise.resolve({ sound: {} })),
    },
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
  },
  ResizeMode: {
    CONTAIN: 'contain',
    COVER: 'cover',
    STRETCH: 'stretch',
  },
}));

// Mock expo-camera
jest.mock('expo-camera', () => ({
  CameraView: 'CameraView',
  CameraType: {
    back: 'back',
    front: 'front',
  },
  useCameraPermissions: () => [{ granted: true }, jest.fn()],
}));

// Global test utilities
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
