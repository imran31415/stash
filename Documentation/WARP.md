# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Stash is a React Native Expo component library focused on **chat functionality with integrated interactive components**. The library provides:
- Real-time chat components with WebSocket and HTTP support
- Rich interactive components (TaskList, ResourceList, GanttChart, TimeSeriesChart, GraphVisualization)
- Chat history management with sidebar and modal views
- Reusable hooks for pagination, message windows, and modal navigation

## Essential Commands

### Package Management
```bash
# Install dependencies (uses yarn - see user preferences)
yarn install

# Build the library (compiles TypeScript to dist/)
yarn build
```

### Development Workflow
```bash
# Link library for local testing
yarn link

# In a test project, link to local stash
yarn link stash

# Watch mode for development (manual - run build after changes)
yarn build
```

### Publishing
```bash
# Update version in package.json first, then:
yarn publish
# Note: prepublishOnly hook automatically runs yarn build
```

### Example Project (validation/demo)
```bash
# Run example app to validate new components
cd example
yarn install
yarn start  # or npx expo start

# Platform-specific
yarn ios
yarn android
yarn web
```

## Architecture

### Core Structure

```
src/
├── components/
│   ├── Button.tsx                    # Simple example component
│   └── Chat/                         # Main chat system
│       ├── Chat.tsx                  # Primary chat container
│       ├── ChatWithPagination.tsx    # Chat with pagination support
│       ├── ChatInput.tsx             # Message input with typing indicators
│       ├── ChatMessage.tsx           # Individual message bubbles
│       ├── ConnectionStatus.tsx      # WebSocket connection indicator
│       ├── TypingIndicator.tsx       # Animated typing status
│       ├── WebSocketChatService.ts   # Real-time WebSocket service
│       ├── HTTPChatService.ts        # HTTP fallback service
│       ├── types.ts                  # Core type definitions
│       │
│       ├── ChatHistory/              # Chat history management
│       │   ├── ChatHistory.tsx       # Main history component
│       │   ├── ChatHistoryModal.tsx  # Modal view for history
│       │   ├── ChatHistorySidebar.tsx # Sidebar view
│       │   ├── ChatLayout.tsx        # Layout wrapper
│       │   ├── types.ts              # History-specific types
│       │   └── styles.ts             # Shared styles
│       │
│       ├── hooks/                    # Reusable custom hooks
│       │   ├── useMessageWindow.ts   # Message windowing/pagination
│       │   ├── usePaginatedList.ts   # Generic list pagination
│       │   └── useModalNavigation.ts # Modal state management
│       │
│       └── InteractiveComponents/    # Rich interactive components
│           ├── TaskList.tsx          # Task list with status/priority
│           ├── TaskListDetailView.tsx
│           ├── TaskDetailModal.tsx
│           ├── TaskDetailBottomSheet.tsx
│           ├── ResourceList.tsx      # Generic resource list (adaptive)
│           ├── ResourceDetailModal.tsx
│           ├── GanttChart.tsx        # Timeline visualization
│           ├── GanttChartDetailView.tsx
│           ├── TimeSeriesChart.tsx   # Time-based data charts
│           ├── TimeSeriesChartDetailView.tsx
│           ├── GraphVisualization.tsx # Network/graph visualization
│           ├── GraphVisualizationDetailView.tsx
│           ├── LoadingState.tsx      # Reusable loading component
│           ├── types.ts              # Shared types
│           └── README.md             # Component documentation

example/
├── App.tsx                           # Example app with tabs
├── examples/
│   ├── ChatHistoryExample.tsx        # Demo of chat history features
│   └── InteractiveComponentsExample.tsx # Demo of interactive components
```

### Key Architectural Patterns

#### 1. Dual Communication Layer
- **WebSocket Service**: Real-time messaging with auto-reconnection, exponential backoff
- **HTTP Service**: Fallback for message history, offline storage
- Services are initialized conditionally based on `enableWebSocket` and `enableHTTP` props

#### 2. Interactive Components in Messages
Messages can embed rich interactive components via `interactiveComponent` field:
```typescript
interface Message {
  id: string;
  content: string;
  interactiveComponent?: {
    type: 'task-list' | 'resource-list' | 'gantt-chart' | 'time-series-chart' | 'graph-visualization';
    data: any;
    onAction?: (action: string, data: any) => void;
  };
}
```

#### 3. Self-Contained Components
All interactive components are **self-contained**:
- No external theme providers required
- Inline theme definitions
- Platform-adaptive (iOS, Android, Web)
- Fully typed with TypeScript

#### 4. Adaptive UI Design
Components like `ResourceList` automatically adapt display based on:
- Platform (mobile shows 3-6 items, web shows 8)
- Screen size and dimensions
- Show more/less functionality built-in

#### 5. Reusable Hooks Pattern
Custom hooks for common patterns:
- `useMessageWindow`: Sliding window pagination for messages
- `usePaginatedList`: Generic pagination for any list
- `useModalNavigation`: Stack-based modal navigation

## Development Workflow

### Adding a New Component (Standard Flow)

1. **Create Component in Library** (`src/components/`)
   ```
   src/components/YourComponent/
   ├── YourComponent.tsx          # Main implementation
   ├── YourComponent.types.ts     # TypeScript interfaces
   ├── YourComponent.utils.ts     # Helper functions (optional)
   ├── index.ts                   # Barrel exports
   └── README.md                  # Documentation
   ```

2. **Export from Library**
   - Add exports to `src/components/index.ts`
   - Exports automatically bubble up through `src/index.ts`

3. **Build Library**
   ```bash
   yarn build
   ```

4. **Create Example** (`example/examples/`)
   - Create `YourComponentExample.tsx` with demo usage
   - Import component using relative path: `../../src/components/YourComponent`

5. **Add to Example App** (`example/App.tsx`)
   - Update `TabType` union to include new tab
   - Add tab button in render
   - Add case in `renderContent()` switch statement
   - Import the example component

6. **Validate in Example App**
   ```bash
   cd example
   yarn start
   # Test on iOS, Android, and Web
   ```

### Adding Interactive Chat Components

For components that embed in chat messages (in `src/components/Chat/InteractiveComponents/`):

1. **Create Component Files**
   - Main component (e.g., `MyChart.tsx`)
   - Detail view for expansion (e.g., `MyChartDetailView.tsx`)
   - Types file (e.g., `MyChart.types.ts`)
   - Utils if needed (e.g., `MyChart.utils.ts`)

2. **Export from InteractiveComponents**
   - Add to `src/components/Chat/InteractiveComponents/index.ts`

3. **Update Core Types**
   - Add component type to `InteractiveComponent.type` union in `src/components/Chat/types.ts`

4. **Handle in ChatMessage**
   - Update `ChatMessage.tsx` to render new component type

5. **Create Example Usage**
   - Add demo to `example/examples/InteractiveComponentsExample.tsx`
   - Or create dedicated example file

6. **Document Component**
   - Update `src/components/Chat/InteractiveComponents/README.md`

## Code Standards

### TypeScript
- Strict typing enabled in `tsconfig.json`
- All components must have properly typed props interfaces
- Export both component and its prop types

### Component Structure
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { YourComponentProps } from './YourComponent.types';

export const YourComponent: React.FC<YourComponentProps> = ({
  prop1,
  prop2,
}) => {
  // Use React.memo, useMemo, useCallback for performance
  return (
    <View style={styles.container}>
      {/* Component JSX */}
    </View>
  );
};

// Inline StyleSheet for self-contained components
const styles = StyleSheet.create({
  container: {
    // Styles
  },
});
```

### Exports Pattern
```typescript
// index.ts
export * from './YourComponent.types';
export { YourComponent } from './YourComponent';
```

### Documentation
- Each component should have a README.md with:
  - Feature list
  - Usage examples
  - Props table
  - Type definitions

## Project-Specific Guidelines

### Message Components
- Messages support `text`, `image`, `file`, `system` types
- Status tracking: `sending`, `sent`, `delivered`, `read`, `failed`
- Always include `isOwn` to distinguish user's messages

### WebSocket Integration
- WebSocket service handles auto-reconnection with exponential backoff
- Event types: `chat.message.sent`, `typing.start`, `typing.stop`
- Always provide `getAuthToken` async function
- Connection state: `Connecting`, `Connected`, `Disconnected`, `Reconnecting`, `Error`

### Chat Types
- `user`: One-on-one chats
- `group`: Multi-user group chats
- `ai`: AI assistant chats

### Platform Considerations
- Use `Platform.select()` for platform-specific behavior
- Test on iOS, Android, and Web
- KeyboardAvoidingView for proper input behavior

### Performance
- Use `React.memo` for expensive components
- `useMemo` and `useCallback` for optimizations
- FlatList for message lists (with proper `keyExtractor`)

## Dependencies

### Core
- `react`: ^18.0.0
- `react-native`: ^0.70.0
- `react-native-svg`: >=13.0.0 (peer dependency)

### Runtime
- `date-fns`: ^4.1.0 (for date manipulation in charts)

### Development
- `typescript`: ^5.9.3
- `@types/react`: ^19.1.17
- `@types/react-native`: ^0.73.0

## Build Output

- Source: `src/`
- Compiled: `dist/`
- Entry points:
  - Main: `dist/index.js` (CommonJS)
  - Module: `dist/index.esm.js` (ES Modules)
  - Types: `dist/index.d.ts`

## Resources

- CONTRIBUTING.md: Detailed step-by-step guide for adding components
- README.md: Public-facing documentation and API reference
- `src/components/Chat/InteractiveComponents/README.md`: Interactive component documentation
