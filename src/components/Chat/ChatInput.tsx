import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard,
  Animated,
} from 'react-native';

export interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  maxLength?: number;
  showAttachButton?: boolean;
  showMicButton?: boolean;
  onAttachPress?: () => void;
  onMicPress?: () => void;
  onTyping?: (isTyping: boolean) => void;
  style?: any;
  renderSendButton?: (canSend: boolean, onPress: () => void) => React.ReactNode;
  renderAttachButton?: (onPress: () => void) => React.ReactNode;
  renderMicButton?: (onPress: () => void) => React.ReactNode;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChangeText,
  onSend,
  placeholder = "Type your message...",
  disabled = false,
  loading = false,
  maxLength = 2000,
  showAttachButton = false,
  showMicButton = false,
  onAttachPress,
  onMicPress,
  onTyping,
  style,
  renderSendButton,
  renderAttachButton,
  renderMicButton,
}) => {
  const [inputHeight, setInputHeight] = useState<number>(40);
  const textInputRef = useRef<TextInput>(null);
  const sendButtonScale = useRef(new Animated.Value(1)).current;
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const canSend = value.trim().length > 0 && !disabled && !loading;
  const maxInputHeight = 120;

  useEffect(() => {
    Animated.spring(sendButtonScale, {
      toValue: canSend ? 1 : 0.9,
      tension: 150,
      friction: 4,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [canSend]);

  const handleChangeText = (text: string) => {
    onChangeText(text);

    // Handle typing indicator
    if (onTyping) {
      if (text.trim().length > 0) {
        onTyping(true);

        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to stop typing after 3 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
          onTyping(false);
        }, 3000);
      } else {
        onTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    }
  };

  const handleSend = () => {
    if (canSend) {
      // Bounce animation
      Animated.sequence([
        Animated.timing(sendButtonScale, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(sendButtonScale, {
          toValue: 1,
          tension: 150,
          friction: 4,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();

      const messageToSend = value.trim();
      onSend(messageToSend);
      onChangeText('');
      setInputHeight(40);

      // Stop typing indicator
      if (onTyping) {
        onTyping(false);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (Platform.OS !== 'web') {
        Keyboard.dismiss();
      }
    }
  };

  const handleContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize;
    setInputHeight(Math.max(40, Math.min(maxInputHeight, height)));
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (onTyping) {
        onTyping(false);
      }
    };
  }, []);

  const defaultSendButton = (canSend: boolean, onPress: () => void) => (
    <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
      <TouchableOpacity
        style={[
          styles.sendButton,
          canSend && styles.sendButtonActive,
          loading && styles.sendButtonLoading,
        ]}
        onPress={onPress}
        disabled={!canSend && !loading}
      >
        <View style={styles.sendIcon} />
      </TouchableOpacity>
    </Animated.View>
  );

  const defaultAttachButton = (onPress: () => void) => (
    <TouchableOpacity
      style={styles.actionButton}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.attachIcon} />
    </TouchableOpacity>
  );

  const defaultMicButton = (onPress: () => void) => (
    <TouchableOpacity
      style={styles.actionButton}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.micIcon} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputRow}>
        {showAttachButton && (renderAttachButton ? renderAttachButton(onAttachPress!) : defaultAttachButton(onAttachPress!))}

        <View style={[styles.inputWrapper, { minHeight: Math.max(40, inputHeight) }]}>
          <TextInput
            ref={textInputRef}
            value={value}
            onChangeText={handleChangeText}
            placeholder={placeholder}
            placeholderTextColor="#999999"
            multiline
            maxLength={maxLength}
            editable={!disabled}
            autoFocus={false}
            style={[
              styles.textInput,
              { height: Math.max(40, inputHeight) },
              disabled && { opacity: 0.6 },
            ]}
            onContentSizeChange={handleContentSizeChange}
            returnKeyType="default"
            blurOnSubmit={false}
            textAlignVertical="top"
            scrollEnabled={false}
          />
        </View>

        <View style={styles.rightActions}>
          {showMicButton && !value.trim() && !loading &&
            (renderMicButton ? renderMicButton(onMicPress!) : defaultMicButton(onMicPress!))}

          {renderSendButton ? renderSendButton(canSend, handleSend) : defaultSendButton(canSend, handleSend)}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 20,
    padding: 0,
    margin: 0,
    width: '100%',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        outlineWidth: 0,
      } as any,
    }),
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1D1D6',
  },
  sendButtonActive: {
    backgroundColor: '#007AFF',
  },
  sendButtonLoading: {
    backgroundColor: '#C7C7CC',
    opacity: 0.7,
  },
  sendIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderLeftColor: '#FFFFFF',
    borderTopWidth: 8,
    borderTopColor: 'transparent',
    borderBottomWidth: 8,
    borderBottomColor: 'transparent',
  },
  attachIcon: {
    width: 18,
    height: 18,
    borderRadius: 2,
    backgroundColor: '#8E8E93',
  },
  micIcon: {
    width: 14,
    height: 18,
    borderRadius: 7,
    backgroundColor: '#8E8E93',
  },
});
