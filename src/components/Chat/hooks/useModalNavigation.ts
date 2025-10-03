import { useEffect } from 'react';
import { Platform, BackHandler } from 'react-native';

export interface UseModalNavigationOptions {
  /**
   * Whether the modal is currently visible
   */
  visible: boolean;
  /**
   * Callback to close the modal
   */
  onClose: () => void;
  /**
   * Whether to handle browser back/forward navigation (default: true on web)
   */
  handleBrowserNavigation?: boolean;
  /**
   * Whether to handle Android hardware back button (default: true on Android)
   */
  handleAndroidBack?: boolean;
  /**
   * Whether to handle Escape key (default: true on web)
   */
  handleEscapeKey?: boolean;
}

/**
 * Custom hook to handle modal navigation across all platforms
 *
 * Provides consistent behavior for:
 * - Android hardware back button
 * - Browser back/forward navigation
 * - Escape key on web
 *
 * @example
 * ```tsx
 * const MyModal = ({ visible, onClose }) => {
 *   useModalNavigation({ visible, onClose });
 *
 *   return (
 *     <Modal visible={visible}>
 *       {/* modal content *\/}
 *     </Modal>
 *   );
 * };
 * ```
 */
export function useModalNavigation(options: UseModalNavigationOptions): void {
  const {
    visible,
    onClose,
    handleBrowserNavigation = Platform.OS === 'web',
    handleAndroidBack = Platform.OS === 'android',
    handleEscapeKey = Platform.OS === 'web',
  } = options;

  // Handle Android hardware back button
  useEffect(() => {
    if (!visible || !handleAndroidBack) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        onClose();
        return true; // Prevent default behavior (exit app)
      }
      return false;
    });

    return () => backHandler.remove();
  }, [visible, onClose, handleAndroidBack]);

  // Handle browser back/forward navigation on web
  useEffect(() => {
    if (!visible || !handleBrowserNavigation || Platform.OS !== 'web') return;

    // Type guard for window object on web
    const win = globalThis as any;
    if (!win.window) return;

    const handlePopState = () => {
      onClose();
    };

    // Push state to browser history when modal opens
    win.window.history.pushState({ modalOpen: true }, '');
    win.window.addEventListener('popstate', handlePopState);

    return () => {
      const cleanupWin = globalThis as any;
      if (cleanupWin.window) {
        cleanupWin.window.removeEventListener('popstate', handlePopState);
      }
    };
  }, [visible, onClose, handleBrowserNavigation]);

  // Handle Escape key on web
  useEffect(() => {
    if (!visible || !handleEscapeKey || Platform.OS !== 'web') return;

    // Type guard for window object on web
    const win = globalThis as any;
    if (!win.window) return;

    const handleKeyDown = (event: any) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    win.window.addEventListener('keydown', handleKeyDown);

    return () => {
      const cleanupWin = globalThis as any;
      if (cleanupWin.window) {
        cleanupWin.window.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [visible, onClose, handleEscapeKey]);
}
