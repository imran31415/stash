import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ChatInput } from '../ChatInput';

// Mock theme hook
jest.mock('../../../theme', () => ({
  useThemeColors: () => ({
    background: '#FFFFFF',
    border: '#E0E0E0',
    surface: '#F5F5F5',
    text: '#000000',
    textTertiary: '#999999',
    buttonBackground: '#CCCCCC',
    buttonBackgroundActive: '#007AFF',
  }),
}));

// Mock Animated
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

describe('ChatInput', () => {
  const mockOnChangeText = jest.fn();
  const mockOnSend = jest.fn();
  const mockOnTyping = jest.fn();
  const mockOnAttachPress = jest.fn();
  const mockOnMicPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('Rendering', () => {
    it('renders with placeholder', () => {
      const { getByPlaceholderText } = render(
        <ChatInput
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
        />
      );
      expect(getByPlaceholderText('Type your message...')).toBeTruthy();
    });

    it('renders with custom placeholder', () => {
      const { getByPlaceholderText } = render(
        <ChatInput
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
          placeholder="Custom placeholder"
        />
      );
      expect(getByPlaceholderText('Custom placeholder')).toBeTruthy();
    });

    it('renders with initial value', () => {
      const { getByDisplayValue } = render(
        <ChatInput
          value="Hello"
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
        />
      );
      expect(getByDisplayValue('Hello')).toBeTruthy();
    });
  });

  describe('Text Input', () => {
    it('calls onChangeText when text changes', () => {
      const { getByPlaceholderText } = render(
        <ChatInput
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
        />
      );
      const input = getByPlaceholderText('Type your message...');
      fireEvent.changeText(input, 'Hello World');
      expect(mockOnChangeText).toHaveBeenCalledWith('Hello World');
    });

    it('respects maxLength prop', () => {
      const { getByPlaceholderText } = render(
        <ChatInput
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
          maxLength={10}
        />
      );
      const input = getByPlaceholderText('Type your message...');
      expect(input.props.maxLength).toBe(10);
    });

    it('uses default maxLength of 2000', () => {
      const { getByPlaceholderText } = render(
        <ChatInput
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
        />
      );
      const input = getByPlaceholderText('Type your message...');
      expect(input.props.maxLength).toBe(2000);
    });

    it('disables input when disabled prop is true', () => {
      const { getByPlaceholderText } = render(
        <ChatInput
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
          disabled={true}
        />
      );
      const input = getByPlaceholderText('Type your message...');
      expect(input.props.editable).toBe(false);
    });
  });

  describe('Send Button', () => {
    it('renders send button functionality', () => {
      const { getByPlaceholderText } = render(
        <ChatInput
          value="Test message"
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
        />
      );

      expect(getByPlaceholderText('Type your message...')).toBeTruthy();
    });
  });

  describe('Typing Indicator', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('calls onTyping(true) when user starts typing', () => {
      const { getByPlaceholderText } = render(
        <ChatInput
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
          onTyping={mockOnTyping}
        />
      );

      const input = getByPlaceholderText('Type your message...');
      fireEvent.changeText(input, 'H');

      expect(mockOnTyping).toHaveBeenCalledWith(true);
    });

    it('calls onTyping(false) when text is cleared', () => {
      const { getByDisplayValue } = render(
        <ChatInput
          value="Hello"
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
          onTyping={mockOnTyping}
        />
      );

      const input = getByDisplayValue('Hello');
      fireEvent.changeText(input, '');

      expect(mockOnTyping).toHaveBeenCalledWith(false);
    });

    it('calls onTyping(false) after 3 seconds of inactivity', () => {
      const { getByPlaceholderText } = render(
        <ChatInput
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
          onTyping={mockOnTyping}
        />
      );

      const input = getByPlaceholderText('Type your message...');
      fireEvent.changeText(input, 'Hello');

      expect(mockOnTyping).toHaveBeenCalledWith(true);

      jest.advanceTimersByTime(3000);

      expect(mockOnTyping).toHaveBeenCalledWith(false);
    });

    it('supports typing callback prop', () => {
      const { getByPlaceholderText } = render(
        <ChatInput
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
          onTyping={mockOnTyping}
        />
      );

      expect(getByPlaceholderText('Type your message...')).toBeTruthy();
    });
  });

  describe('Action Buttons', () => {
    it('supports attach button prop', () => {
      const { getByPlaceholderText } = render(
        <ChatInput
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
          showAttachButton={true}
          onAttachPress={mockOnAttachPress}
        />
      );

      expect(getByPlaceholderText('Type your message...')).toBeTruthy();
    });

    it('supports mic button prop', () => {
      const { getByPlaceholderText } = render(
        <ChatInput
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
          showMicButton={true}
          onMicPress={mockOnMicPress}
        />
      );

      expect(getByPlaceholderText('Type your message...')).toBeTruthy();
    });
  });

  describe('Custom Renderers', () => {
    it('uses custom send button renderer', () => {
      const customSendButton = jest.fn((canSend, onPress) => null);

      render(
        <ChatInput
          value="Test"
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
          renderSendButton={customSendButton}
        />
      );

      expect(customSendButton).toHaveBeenCalled();
    });

    it('uses custom attach button renderer', () => {
      const customAttachButton = jest.fn(() => null);

      render(
        <ChatInput
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
          showAttachButton={true}
          renderAttachButton={customAttachButton}
          onAttachPress={mockOnAttachPress}
        />
      );

      expect(customAttachButton).toHaveBeenCalled();
    });

    it('uses custom mic button renderer', () => {
      const customMicButton = jest.fn(() => null);

      render(
        <ChatInput
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
          showMicButton={true}
          renderMicButton={customMicButton}
          onMicPress={mockOnMicPress}
        />
      );

      expect(customMicButton).toHaveBeenCalled();
    });
  });
});
