import type * as React from 'react';

export type MessageType = 'text' | 'image' | 'file' | 'system';
export type ChatType = 'user' | 'group' | 'ai';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface InteractiveComponent {
  type: 'task-list' | 'resource-list' | 'risk-list' | 'gantt-chart' | 'time-series-chart' | 'graph-visualization' | 'code-block' | 'code-editor' | 'media' | 'data-table' | 'dashboard' | 'dashboard-preview' | 'video-stream' | 'live-camera-stream' | 'workflow' | 'dag' | 'flamegraph' | 'flame-graph' | 'tree-view' | 'multi-swipeable' | 'kanban-board' | 'button' | 'custom';
  data: any;
  onAction?: (action: string, data: any) => void;
  customRenderer?: () => React.ReactNode;
}

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  sender: User;
  timestamp: Date;
  status?: MessageStatus;
  isOwn?: boolean;
  replyTo?: Message;
  interactiveComponent?: InteractiveComponent;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    imageUrl?: string;
    [key: string]: any;
  };
}

export interface TypingIndicator {
  userId: string;
  userName: string;
}

export interface ChatTheme {
  primaryColor?: string;
  backgroundColor?: string;
  messageBackgroundOwn?: string;
  messageBackgroundOther?: string;
  textColorOwn?: string;
  textColorOther?: string;
  inputBackgroundColor?: string;
  borderColor?: string;
}
