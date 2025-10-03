import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chat, Message, User } from '../../src/components/Chat';
import { addDays } from 'date-fns';

const MOCK_USER: User = {
  id: 'user-1',
  name: 'John Doe',
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    type: 'system',
    content: 'Welcome to the user chat! This is a 1-on-1 conversation.',
    sender: { id: 'system', name: 'System' },
    timestamp: new Date(Date.now() - 60000),
    isOwn: false,
  },
  {
    id: 'msg-2',
    type: 'text',
    content: 'Hey! How are you doing today?',
    sender: { id: 'user-2', name: 'Jane Smith', avatar: undefined },
    timestamp: new Date(Date.now() - 45000),
    status: 'read',
    isOwn: false,
  },
  {
    id: 'msg-3',
    type: 'text',
    content: "I'm doing great! Thanks for asking. How about you?",
    sender: MOCK_USER,
    timestamp: new Date(Date.now() - 30000),
    status: 'read',
    isOwn: true,
  },
  {
    id: 'msg-4',
    type: 'text',
    content: "I'm good! By the way, here are the tasks we discussed:",
    sender: { id: 'user-2', name: 'Jane Smith', avatar: undefined },
    timestamp: new Date(Date.now() - 20000),
    status: 'read',
    isOwn: false,
    interactiveComponent: {
      type: 'task-list',
      data: {
        title: 'Shared Tasks',
        subtitle: '2 tasks to complete',
        tasks: [
          {
            id: '1',
            title: 'Review design mockups',
            description: 'Check the new landing page designs',
            startDate: new Date(),
            endDate: addDays(new Date(), 3),
            progress: 50,
            status: 'in-progress',
            priority: 'high',
            assignee: 'John Doe',
          },
          {
            id: '2',
            title: 'Schedule team meeting',
            description: 'Find a time that works for everyone',
            startDate: addDays(new Date(), 1),
            endDate: addDays(new Date(), 2),
            progress: 0,
            status: 'pending',
            priority: 'medium',
            assignee: 'Jane Smith',
          },
        ],
      },
      onAction: (action, data) => console.log('Task action:', action, data),
    },
  },
  {
    id: 'msg-5',
    type: 'text',
    content: "Perfect! I'll get started on those.",
    sender: MOCK_USER,
    timestamp: new Date(Date.now() - 10000),
    status: 'delivered',
    isOwn: true,
  },
];

export default function UserChatExample() {
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
        chatType="user"
        chatId="chat-user-2"
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
        placeholder="Type a message..."

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
