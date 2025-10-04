export interface Message {
  id: string;
  content: string;
  sender: { id: string; name: string; avatar?: string };
  timestamp: Date;
  isOwn: boolean;
  interactiveComponent?: {
    type: string;
    data: any;
  };
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  reactions?: Array<{ emoji: string; userId: string }>;
  threadId?: string;
  replyTo?: string;
}

export interface ChatPreview {
  id: string;
  title: string;
  type?: 'ai' | 'group' | 'direct';
  groupId?: string;
  participants: Array<{ id: string; name: string; avatar?: string }>;
  lastMessage?: {
    content: string;
    timestamp: Date;
    senderId: string;
    senderName: string;
  };
  unreadCount: number;
  updatedAt: Date;
  createdAt: Date;
  isPinned?: boolean;
  isMuted?: boolean;
  isArchived?: boolean;
  metadata?: Record<string, any>;
}
