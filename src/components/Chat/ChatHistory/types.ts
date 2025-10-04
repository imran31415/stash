export interface ChatPreview {
  id: string;
  title: string;
  lastMessage?: {
    content: string;
    timestamp: Date;
    senderId: string;
    senderName: string;
  };
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  unreadCount: number;
  type: 'direct' | 'group' | 'ai';
  updatedAt: Date;
  createdAt: Date;
  isPinned?: boolean;
  isMuted?: boolean;
  isArchived?: boolean;
  metadata?: Record<string, any>;
  groupId?: string; // ID of the group this chat belongs to
}

export interface ChatGroup {
  id: string;
  title: string;
  icon?: string;
  collapsed?: boolean;
  order?: number;
}

export interface GroupedChats {
  groups: ChatGroup[];
  chats: ChatPreview[];
}

export interface ChatHistoryCallbacks {
  onChatSelect: (chat: ChatPreview) => void;
  onChatDelete?: (chatId: string) => void;
  onChatArchive?: (chatId: string) => void;
  onChatPin?: (chatId: string) => void;
  onChatMute?: (chatId: string) => void;
  onLoadBefore?: (beforeId: string, limit: number) => Promise<ChatPreview[]>;
  onLoadAfter?: (afterId: string, limit: number) => Promise<ChatPreview[]>;
  onLoadInitial?: (limit: number) => Promise<{ chats: ChatPreview[]; totalCount: number }>;
  onRefresh?: () => Promise<void>;
  onCreateNewChat?: () => void;
  onChatsLoaded?: (chats: ChatPreview[]) => void;
  onGroupToggle?: (groupId: string, collapsed: boolean) => void;
}

export interface ChatHistoryProps extends ChatHistoryCallbacks {
  userId: string;
  currentChatId?: string;
  windowSize?: number;
  loadMoreThreshold?: number;
  showSearch?: boolean;
  showCreateButton?: boolean;
  emptyStateMessage?: string;
  renderChatItem?: (chat: ChatPreview, isSelected: boolean) => React.ReactNode;
  groups?: ChatGroup[]; // Optional chat groups
  enableGrouping?: boolean; // Enable grouped chat display
}
