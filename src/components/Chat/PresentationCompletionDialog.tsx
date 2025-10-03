import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import type { ChatTheme } from './types';

export interface PresentationCompletionDialogProps {
  visible: boolean;
  theme?: ChatTheme;
  onExitPresentation: () => void;
  onRestartPresentation: () => void;
}

export const PresentationCompletionDialog: React.FC<PresentationCompletionDialogProps> = ({
  visible,
  theme,
  onExitPresentation,
  onRestartPresentation,
}) => {
  const primaryColor = theme?.primaryColor || '#007AFF';
  const backgroundColor = theme?.backgroundColor || '#FFFFFF';
  const textColor = theme?.textColorOther || '#000000';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onExitPresentation}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor }]}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>✓</Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: textColor }]}>
            Presentation Complete
          </Text>

          {/* Message */}
          <Text style={[styles.message, { color: textColor, opacity: 0.7 }]}>
            You have reached the end of the presentation
          </Text>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton, { borderColor: primaryColor }]}
              onPress={onRestartPresentation}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText, { color: primaryColor }]}>
                Restart
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton, { backgroundColor: primaryColor }]}
              onPress={onExitPresentation}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, styles.primaryButtonText]}>
                Return to Chat
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
});
