import { useState, useCallback } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import type { ComponentMode } from '../types';

/**
 * Hook for measuring component layout dimensions
 * Used by components that need to adapt to container size
 */
export const useLayoutMeasurement = (customWidth?: number, customHeight?: number) => {
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;

      if (width > 0 && !customWidth && width !== measuredWidth) {
        setMeasuredWidth(width);
      }

      if (height > 0 && !customHeight && height !== measuredHeight) {
        setMeasuredHeight(height);
      }
    },
    [customWidth, customHeight, measuredWidth, measuredHeight]
  );

  const width = customWidth || measuredWidth;
  const height = customHeight || measuredHeight;

  return { width, height, handleLayout, measuredWidth, measuredHeight };
};

/**
 * Hook for responsive mode detection
 * Provides convenient boolean flags for component modes
 */
export const useResponsiveMode = (mode: ComponentMode = 'full') => {
  const isMini = mode === 'mini';
  const isPreview = mode === 'preview';
  const isFull = mode === 'full';

  return { isMini, isPreview, isFull, mode };
};

/**
 * Hook for managing component theme with consistent color application
 * Extends useThemeColors with component-specific defaults
 */
export { useThemeColors } from '../../../../../theme';
