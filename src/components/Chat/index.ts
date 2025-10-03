export { Chat } from './Chat';
export type { ChatProps } from './Chat';

export { ChatWithPagination } from './ChatWithPagination';
export type { ChatWithPaginationProps } from './ChatWithPagination';

export { ChatMessage } from './ChatMessage';
export type { ChatMessageProps } from './ChatMessage';

export { ChatInput } from './ChatInput';
export type { ChatInputProps } from './ChatInput';

export { TypingIndicator } from './TypingIndicator';
export type { TypingIndicatorProps } from './TypingIndicator';

export { ConnectionStatus } from './ConnectionStatus';
export type { ConnectionStatusProps } from './ConnectionStatus';

export { WebSocketChatService, ConnectionState } from './WebSocketChatService';
export type { WSMessage, WSMessageType, WSEventAction } from './WebSocketChatService';

export { HTTPChatService } from './HTTPChatService';
export type { ChatServiceConfig, ChatApiResponse } from './HTTPChatService';

// Re-export interactive components for convenience
export * from './InteractiveComponents';

export { useMessageWindow } from './hooks/useMessageWindow';
export type {
  PaginationState,
  MessageWindowCallbacks,
  UseMessageWindowOptions,
  UseMessageWindowReturn,
} from './hooks/useMessageWindow';

export { usePaginatedList } from './hooks/usePaginatedList';
export type {
  PaginatedListState,
  PaginatedListCallbacks,
  UsePaginatedListOptions,
  UsePaginatedListReturn,
} from './hooks/usePaginatedList';

export { useModalNavigation } from './hooks/useModalNavigation';
export type { UseModalNavigationOptions } from './hooks/useModalNavigation';

export * from './ChatHistory';

export * from './types';
