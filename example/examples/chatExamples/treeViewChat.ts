import type { Message, ChatPreview } from './types';
import type { TreeViewData, TreeNode } from '../../../src/components/Chat/InteractiveComponents';

const generateProjectTree = (): TreeViewData => {
  const roots: TreeNode[] = [
    {
      id: 'src',
      label: 'src',
      type: 'folder',
      expanded: true,
      children: [
        {
          id: 'components',
          label: 'components',
          type: 'folder',
          expanded: true,
          metadata: { count: 12 },
          children: [
            {
              id: 'auth',
              label: 'Auth',
              type: 'folder',
              metadata: { count: 3 },
              children: [
                {
                  id: 'login',
                  label: 'Login.tsx',
                  type: 'file',
                  metadata: {
                    size: 3072,
                    modified: new Date(2024, 2, 20),
                    description: 'User login component with form validation',
                  },
                },
                {
                  id: 'signup',
                  label: 'Signup.tsx',
                  type: 'file',
                  metadata: {
                    size: 2560,
                    modified: new Date(2024, 2, 18),
                    description: 'User registration form',
                  },
                },
                {
                  id: 'forgot',
                  label: 'ForgotPassword.tsx',
                  type: 'file',
                  metadata: {
                    size: 1536,
                    modified: new Date(2024, 2, 15),
                    description: 'Password reset flow',
                  },
                },
              ],
            },
            {
              id: 'dashboard',
              label: 'Dashboard',
              type: 'folder',
              status: 'highlighted',
              metadata: { count: 5 },
              children: [
                {
                  id: 'overview',
                  label: 'Overview.tsx',
                  type: 'file',
                  metadata: {
                    size: 4096,
                    modified: new Date(2024, 2, 22),
                    description: 'Main dashboard overview with metrics',
                  },
                },
                {
                  id: 'analytics',
                  label: 'Analytics.tsx',
                  type: 'file',
                  badge: 'new',
                  metadata: {
                    size: 5120,
                    modified: new Date(),
                    description: 'Analytics dashboard with charts',
                  },
                },
                {
                  id: 'settings',
                  label: 'Settings.tsx',
                  type: 'file',
                  metadata: {
                    size: 2048,
                    modified: new Date(2024, 2, 19),
                    description: 'User settings and preferences',
                  },
                },
                {
                  id: 'profile',
                  label: 'Profile.tsx',
                  type: 'file',
                  metadata: {
                    size: 3584,
                    modified: new Date(2024, 2, 21),
                    description: 'User profile management',
                  },
                },
              ],
            },
            {
              id: 'ui',
              label: 'UI',
              type: 'folder',
              metadata: { count: 8 },
              children: [
                { id: 'button', label: 'Button.tsx', type: 'file', metadata: { size: 2048 } },
                { id: 'input', label: 'Input.tsx', type: 'file', metadata: { size: 2560 } },
                { id: 'modal', label: 'Modal.tsx', type: 'file', metadata: { size: 3072 } },
                { id: 'dropdown', label: 'Dropdown.tsx', type: 'file', metadata: { size: 1536 } },
              ],
            },
          ],
        },
        {
          id: 'hooks',
          label: 'hooks',
          type: 'folder',
          metadata: { count: 8 },
          children: [
            {
              id: 'use-auth',
              label: 'useAuth.ts',
              type: 'file',
              status: 'selected',
              metadata: {
                size: 2048,
                modified: new Date(2024, 2, 23),
                description: 'Authentication state management hook',
              },
            },
            {
              id: 'use-theme',
              label: 'useTheme.ts',
              type: 'file',
              metadata: {
                size: 1536,
                modified: new Date(2024, 2, 17),
                description: 'Theme management hook for dark/light mode',
              },
            },
            {
              id: 'use-api',
              label: 'useApi.ts',
              type: 'file',
              metadata: {
                size: 3072,
                modified: new Date(2024, 2, 20),
                description: 'API request hook with caching',
              },
            },
            {
              id: 'use-websocket',
              label: 'useWebSocket.ts',
              type: 'file',
              badge: 'new',
              metadata: {
                size: 2560,
                modified: new Date(),
                description: 'WebSocket connection management',
              },
            },
          ],
        },
        {
          id: 'utils',
          label: 'utils',
          type: 'folder',
          metadata: { count: 6 },
          children: [
            { id: 'formatters', label: 'formatters.ts', type: 'file', metadata: { size: 1024 } },
            { id: 'validators', label: 'validators.ts', type: 'file', metadata: { size: 2048 } },
            { id: 'api', label: 'api.ts', type: 'file', metadata: { size: 5120 } },
            { id: 'storage', label: 'storage.ts', type: 'file', metadata: { size: 1536 } },
          ],
        },
      ],
    },
    {
      id: 'public',
      label: 'public',
      type: 'folder',
      metadata: { count: 4 },
      children: [
        { id: 'index-html', label: 'index.html', type: 'file', metadata: { size: 1024 } },
        { id: 'manifest', label: 'manifest.json', type: 'file', metadata: { size: 512 } },
        { id: 'robots', label: 'robots.txt', type: 'file', metadata: { size: 256 } },
        { id: 'favicon', label: 'favicon.ico', type: 'file', metadata: { size: 4096 } },
      ],
    },
    {
      id: 'config',
      label: 'config',
      type: 'folder',
      metadata: { count: 3 },
      children: [
        { id: 'webpack', label: 'webpack.config.js', type: 'file', metadata: { size: 8192 } },
        { id: 'babel', label: '.babelrc', type: 'file', metadata: { size: 256 } },
        { id: 'tsconfig', label: 'tsconfig.json', type: 'file', metadata: { size: 512 } },
      ],
    },
  ];

  return {
    id: 'project-structure',
    title: 'Project File System',
    description: 'React Native application file structure',
    roots,
    metadata: {
      totalNodes: 35,
      maxDepth: 4,
    },
  };
};

export const getTreeViewChatMessages = (): Message[] => {
  const treeData = generateProjectTree();

  return [
    {
      id: 'tree-1',
      content: 'Show me the project file structure',
      sender: { id: 'user-dev', name: 'You' },
      timestamp: new Date(Date.now() - 5000),
      isOwn: true,
    },
    {
      id: 'tree-2',
      content: "Here's the current project structure. I've highlighted the Dashboard folder which contains recent changes, including the new Analytics component.",
      sender: { id: 'ai-assistant', name: 'Code Assistant' },
      timestamp: new Date(Date.now() - 3000),
      isOwn: false,
      interactiveComponent: {
        type: 'tree-view',
        data: treeData,
      },
    },
    {
      id: 'tree-3',
      content: 'Can you tell me about the useAuth hook?',
      sender: { id: 'user-dev', name: 'You' },
      timestamp: new Date(Date.now() - 2000),
      isOwn: true,
    },
    {
      id: 'tree-4',
      content: "The useAuth hook (selected in the tree above) is located at src/hooks/useAuth.ts. It's 2KB in size and was last modified on March 23rd. This hook handles authentication state management including login, logout, session management, and token refresh functionality.",
      sender: { id: 'ai-assistant', name: 'Code Assistant' },
      timestamp: new Date(Date.now() - 1000),
      isOwn: false,
    },
    {
      id: 'tree-5',
      content: 'What are the new files?',
      sender: { id: 'user-dev', name: 'You' },
      timestamp: new Date(Date.now() - 500),
      isOwn: true,
    },
    {
      id: 'tree-6',
      content: "There are two new files marked with badges in the tree:\n\n1. **Analytics.tsx** in Dashboard - A new analytics dashboard with charts and metrics visualization\n2. **useWebSocket.ts** in hooks - WebSocket connection management for real-time features\n\nBoth were added today.",
      sender: { id: 'ai-assistant', name: 'Code Assistant' },
      timestamp: new Date(),
      isOwn: false,
    },
  ];
};

export const treeViewChat: ChatPreview = {
  id: 'chat-tree-view',
  title: '🌳 Project Structure',
  type: 'ai',
  groupId: 'examples',
  participants: [
    { id: 'user-dev', name: 'You', avatar: '👤' },
    { id: 'ai-assistant', name: 'Code Assistant', avatar: '🤖' },
  ],
  lastMessage: {
    content: 'Both were added today.',
    timestamp: new Date(),
    senderId: 'ai-assistant',
    senderName: 'Code Assistant',
  },
  unreadCount: 0,
  updatedAt: new Date(),
  createdAt: new Date(),
  isPinned: false,
  isMuted: false,
  isArchived: false,
  metadata: {
    category: 'code-navigation',
    tags: ['file-system', 'project-structure', 'navigation'],
  },
};
