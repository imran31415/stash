import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

export interface LoadingStateProps {
  /**
   * The message to display while loading
   */
  message?: string;
  /**
   * Size of the loading indicator ('small' | 'medium' | 'large')
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Whether to show as overlay (covers entire component)
   */
  overlay?: boolean;
  /**
   * Background color for overlay mode
   */
  backgroundColor?: string;
  /**
   * Custom height when not in overlay mode
   */
  height?: number;
}

/**
 * LoadingState Component
 *
 * A beautiful, reusable loading indicator that can be used across all components.
 * Supports both inline and overlay modes with smooth animations.
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'medium',
  overlay = false,
  backgroundColor = 'rgba(255, 255, 255, 0.95)',
  height = 200,
}) => {
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Size configurations
  const sizeConfig = {
    small: { dotSize: 8, spacing: 12, fontSize: 12 },
    medium: { dotSize: 12, spacing: 16, fontSize: 14 },
    large: { dotSize: 16, spacing: 20, fontSize: 16 },
  };

  const config = sizeConfig[size];

  useEffect(() => {
    // Fade in on mount
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Pulse animation for dots
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 600,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );

    // Rotate animation for spinner
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    pulseAnimation.start();
    rotateAnimation.start();

    return () => {
      pulseAnimation.stop();
      rotateAnimation.stop();
    };
  }, [pulseAnim, rotateAnim, fadeAnim]);

  // Interpolate rotation
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Render dots with staggered animation
  const renderDots = () => {
    const dots = [0, 1, 2];
    return (
      <View style={styles.dotsContainer}>
        {dots.map((index) => {
          // Stagger the pulse animation for each dot
          const dotScale = pulseAnim.interpolate({
            inputRange: [1, 1.3],
            outputRange: [1, 1.3],
            extrapolate: 'clamp',
          });

          const dotOpacity = pulseAnim.interpolate({
            inputRange: [1, 1.3],
            outputRange: [0.4, 1],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: config.dotSize,
                  height: config.dotSize,
                  borderRadius: config.dotSize / 2,
                  marginHorizontal: config.spacing / 4,
                  transform: [{ scale: dotScale }],
                  opacity: dotOpacity,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  // Render spinner circles
  const renderSpinner = () => {
    const spinnerSize = config.dotSize * 4;
    return (
      <Animated.View
        style={[
          styles.spinner,
          {
            width: spinnerSize,
            height: spinnerSize,
            borderRadius: spinnerSize / 2,
            borderWidth: config.dotSize / 4,
            transform: [{ rotate: spin }],
          },
        ]}
      />
    );
  };

  const containerStyle = overlay
    ? [styles.container, styles.overlayContainer, { backgroundColor }]
    : [styles.container, { height, backgroundColor }];

  return (
    <Animated.View style={[containerStyle, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        {/* Spinner */}
        {renderSpinner()}

        {/* Dots */}
        <View style={styles.dotsWrapper}>{renderDots()}</View>

        {/* Message */}
        {message && (
          <Text style={[styles.message, { fontSize: config.fontSize }]}>{message}</Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    borderRadius: 0,
    pointerEvents: 'auto',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    borderColor: '#E2E8F0',
    borderTopColor: '#3B82F6',
    borderRightColor: '#3B82F6',
  },
  dotsWrapper: {
    marginTop: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    backgroundColor: '#3B82F6',
  },
  message: {
    marginTop: 16,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
});
