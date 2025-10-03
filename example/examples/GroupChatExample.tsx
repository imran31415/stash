import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chat, Message, User } from '../../src/components/Chat';

const MOCK_USER: User = {
  id: 'user-1',
  name: 'You',
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    type: 'system',
    content: 'Welcome to the Development Team group! 👥',
    sender: { id: 'system', name: 'System' },
    timestamp: new Date(Date.now() - 120000),
    isOwn: false,
  },
  {
    id: 'msg-2',
    type: 'text',
    content: 'Hey everyone! Ready for the sprint planning?',
    sender: { id: 'user-2', name: 'Alice', avatar: undefined },
    timestamp: new Date(Date.now() - 90000),
    status: 'read',
    isOwn: false,
  },
  {
    id: 'msg-3',
    type: 'text',
    content: 'Yes! I have some ideas for the new features.',
    sender: { id: 'user-3', name: 'Bob', avatar: undefined },
    timestamp: new Date(Date.now() - 60000),
    status: 'read',
    isOwn: false,
  },
  {
    id: 'msg-4',
    type: 'text',
    content: "Great! Let's start in 5 minutes.",
    sender: MOCK_USER,
    timestamp: new Date(Date.now() - 30000),
    status: 'read',
    isOwn: true,
  },
];

export default function GroupChatExample() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);

  const handleSendMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const getAuthToken = async () => {
    return 'mock-token-123';
  };

  return (
    <View style={styles.container}>
      <Chat
        userId={MOCK_USER.id}
        chatType="group"
        chatId="group-dev-team"
        messages={messages}
        onSendMessage={handleSendMessage}

        // WebSocket configuration
        enableWebSocket={true}
        wsConfig={{
          baseUrl: 'ws://localhost:8082',
          getAuthToken,
          tenantId: 'tenant-1',
          projectId: 'project-1',
        }}

        // HTTP fallback configuration
        enableHTTP={true}
        httpConfig={{
          baseUrl: 'http://localhost:8082/api',
        }}

        showConnectionStatus={true}
        showTypingIndicator={true}
        placeholder="Message Development Team..."

        onMessagePress={(msg) => console.log('Message clicked:', msg)}
        onMessageLongPress={(msg) => console.log('Message long pressed:', msg)}
        onAvatarPress={(userId) => console.log('Avatar clicked:', userId)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
