import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ConnectionState } from './WebSocketChatService';

export interface ConnectionStatusProps {
  connectionState: ConnectionState;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ connectionState }) => {
  if (connectionState === ConnectionState.Connected) {
    return null; // Don't show anything when connected
  }

  const getStatusConfig = () => {
    switch (connectionState) {
      case ConnectionState.Connecting:
        return {
          text: 'Connecting...',
          color: '#FF9500',
          icon: '🔄',
        };
      case ConnectionState.Reconnecting:
        return {
          text: 'Reconnecting...',
          color: '#FF9500',
          icon: '⚡',
        };
      case ConnectionState.Error:
        return {
          text: 'Connection failed',
          color: '#FF3B30',
          icon: '❌',
        };
      case ConnectionState.Disconnected:
        return {
          text: 'Offline mode',
          color: '#8E8E93',
          icon: '📵',
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <View style={[styles.container, { backgroundColor: `${config.color}15` }]}>
      <Text style={styles.icon}>{config.icon}</Text>
      <Text style={[styles.text, { color: config.color }]}>{config.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 8,
  },
  icon: {
    fontSize: 14,
    marginRight: 8,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});
