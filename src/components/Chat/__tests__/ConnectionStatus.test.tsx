import React from 'react';
import { render } from '@testing-library/react-native';
import { ConnectionStatus } from '../ConnectionStatus';
import { ConnectionState } from '../WebSocketChatService';

describe('ConnectionStatus', () => {
  describe('Connected State', () => {
    it('renders nothing when connected', () => {
      const component = render(
        <ConnectionStatus connectionState={ConnectionState.Connected} />
      );

      // Should not render any visible component
      expect(component).toBeTruthy();
    });
  });

  describe('Connecting State', () => {
    it('displays connecting message', () => {
      const { getByText } = render(
        <ConnectionStatus connectionState={ConnectionState.Connecting} />
      );

      expect(getByText('Connecting...')).toBeTruthy();
      expect(getByText('🔄')).toBeTruthy();
    });
  });

  describe('Reconnecting State', () => {
    it('displays reconnecting message', () => {
      const { getByText } = render(
        <ConnectionStatus connectionState={ConnectionState.Reconnecting} />
      );

      expect(getByText('Reconnecting...')).toBeTruthy();
      expect(getByText('⚡')).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('displays error message', () => {
      const { getByText } = render(
        <ConnectionStatus connectionState={ConnectionState.Error} />
      );

      expect(getByText('Connection failed')).toBeTruthy();
      expect(getByText('❌')).toBeTruthy();
    });
  });

  describe('Disconnected State', () => {
    it('displays offline message', () => {
      const { getByText } = render(
        <ConnectionStatus connectionState={ConnectionState.Disconnected} />
      );

      expect(getByText('Offline mode')).toBeTruthy();
      expect(getByText('📵')).toBeTruthy();
    });
  });

  describe('State Transitions', () => {
    it('updates when connection state changes', () => {
      const { getByText, rerender } = render(
        <ConnectionStatus connectionState={ConnectionState.Connecting} />
      );

      expect(getByText('Connecting...')).toBeTruthy();

      rerender(<ConnectionStatus connectionState={ConnectionState.Connected} />);
      // Should not show anything when connected
      expect(() => getByText('Connecting...')).toThrow();

      rerender(<ConnectionStatus connectionState={ConnectionState.Error} />);
      expect(getByText('Connection failed')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('provides clear visual feedback for each state', () => {
      const states = [
        { state: ConnectionState.Connecting, text: 'Connecting...', icon: '🔄' },
        { state: ConnectionState.Reconnecting, text: 'Reconnecting...', icon: '⚡' },
        { state: ConnectionState.Error, text: 'Connection failed', icon: '❌' },
        { state: ConnectionState.Disconnected, text: 'Offline mode', icon: '📵' },
      ];

      states.forEach(({ state, text, icon }) => {
        const { getByText } = render(<ConnectionStatus connectionState={state} />);
        expect(getByText(text)).toBeTruthy();
        expect(getByText(icon)).toBeTruthy();
      });
    });
  });
});
