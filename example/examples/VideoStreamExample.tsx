import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chat } from '../../src/components/Chat';
import type { Message } from '../../src/components/Chat/types';
import { addMinutes } from 'date-fns';

/**
 * VideoStreamExample - Demonstrates live camera streaming
 * Shows real-time camera access with controls for flipping, recording, and stopping
 */

const VideoStreamExample: React.FC = () => {
  const messages: Message[] = [
    {
      id: 'msg-0',
      content: '🎥 Welcome to Live Camera Streaming! Stream directly from your device camera in the chat.',
      sender: { id: 'bot', name: 'StreamBot', avatar: '🤖' },
      timestamp: addMinutes(new Date(), -10),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'msg-1',
      type: 'text',
      content: '📹 **Start Your Live Stream** - Click the button below to start streaming from your camera. Perfect for video calls, live demos, and real-time collaboration!',
      sender: { id: 'bot', name: 'StreamBot', avatar: '🤖' },
      timestamp: addMinutes(new Date(), -8),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'live-camera-stream',
        data: {
          mode: 'full',
          autoStart: false,
          showControls: true,
          enableFlip: true,
        },
        onAction: (action, data) => {
          console.log(`[LiveCameraStream] ${action}:`, data);
        },
      },
    },
    {
      id: 'msg-2',
      content: '**Features:**\n\n🔄 **Flip Camera** - Switch between front and back cameras\n⏺️ **Record** - Start/stop recording (visual indicator)\n■ **Stop** - End the stream\n🔴 **Live Badge** - Shows when actively streaming\n\nYour camera stream works seamlessly on web browsers and native mobile apps! 📱💻',
      sender: { id: 'bot', name: 'StreamBot', avatar: '🤖' },
      timestamp: addMinutes(new Date(), -5),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'msg-3',
      content: 'This component uses **HTML5 getUserMedia** on web and **expo-camera** on native iOS/Android. The implementation automatically detects your platform and uses the appropriate API! ✨',
      sender: { id: 'bot', name: 'StreamBot', avatar: '🤖' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: false,
    },
  ];

  const [chatMessages, setChatMessages] = useState<Message[]>(messages);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      sender: { id: 'user-you', name: 'You', avatar: '👤' },
      timestamp: new Date(),
      status: 'sending',
      isOwn: true,
    };
    setChatMessages([...chatMessages, newMessage]);

    setTimeout(() => {
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: 'delivered' as const } : msg
        )
      );
    }, 500);
  };

  return (
    <View style={styles.container}>
      <Chat
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        placeholder="Ask about streaming features..."
        currentUserId="user-you"
        title="Live Camera Streaming"
        subtitle="Real-time video streaming"
        showTypingIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
});

export default VideoStreamExample;
