import type { Message } from '../../src/components/Chat/types';

/**
 * KanbanBoard Component Tutorial
 * Interactive tutorial explaining the KanbanBoard component with examples
 */

export const getKanbanBoardTutorialMessages = (): Message[] => {
  return [
    {
      id: 'kb-intro-1',
      content: '# 📋 KanbanBoard Component\n\nWelcome to the **KanbanBoard** tutorial! This component helps you visualize work in progress with a powerful, interactive kanban board.',
      sender: { id: 'system', name: 'Stash Tutor', avatar: '🎓' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'kb-intro-2',
      content: '**What you\'ll learn:**\n\n✅ Basic kanban board setup\n✅ Cards, columns, and organization\n✅ Priority indicators and WIP limits\n✅ Advanced features (tags, assignees, checklists)\n✅ Interactive callbacks and actions',
      sender: { id: 'system', name: 'Stash Tutor', avatar: '📚' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'kb-basic-1',
      content: '## 🎯 Basic Kanban Board\n\nLet\'s start with a simple kanban board showing a basic workflow:',
      sender: { id: 'system', name: 'Stash Tutor', avatar: '🎓' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'kb-basic-example',
      interactiveComponent: {
        type: 'kanban-board',
        data: {
          title: 'My First Kanban Board',
          description: 'Simple workflow with 3 columns',
          columns: [
            {
              id: 'todo',
              title: 'To Do',
              icon: '📝',
              cards: [
                {
                  id: 'card-1',
                  title: 'Design new feature',
                  description: 'Create mockups for the dashboard',
                },
                {
                  id: 'card-2',
                  title: 'Write documentation',
                  description: 'Document the API endpoints',
                },
              ],
            },
            {
              id: 'in-progress',
              title: 'In Progress',
              icon: '⚡',
              cards: [
                {
                  id: 'card-3',
                  title: 'Implement authentication',
                  description: 'Add JWT token support',
                },
              ],
            },
            {
              id: 'done',
              title: 'Done',
              icon: '✅',
              cards: [
                {
                  id: 'card-4',
                  title: 'Setup project',
                  description: 'Initialize React Native project',
                },
              ],
            },
          ],
        },
      },
      sender: { id: 'system', name: 'Stash Tutor', avatar: '📊' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'kb-basic-code',
      content: '**Code for the basic board:**',
      sender: { id: 'system', name: 'Stash Tutor', avatar: '💻' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'kb-basic-code-block',
      interactiveComponent: {
        type: 'code-block',
        data: {
          language: 'typescript',
          fileName: 'BasicKanban.tsx',
          code: `import { KanbanBoard } from 'stash';

const MyKanban = () => {
  return (
    <KanbanBoard
      data={{
        title: 'My First Kanban Board',
        description: 'Simple workflow with 3 columns',
        columns: [
          {
            id: 'todo',
            title: 'To Do',
            icon: '📝',
            cards: [
              {
                id: 'card-1',
                title: 'Design new feature',
                description: 'Create mockups for the dashboard',
              },
            ],
          },
          {
            id: 'in-progress',
            title: 'In Progress',
            icon: '⚡',
            cards: [/* ... */],
          },
          {
            id: 'done',
            title: 'Done',
            icon: '✅',
            cards: [/* ... */],
          },
        ],
      }}
    />
  );
};`,
        },
      },
      sender: { id: 'system', name: 'Stash Tutor', avatar: '📝' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'kb-priorities-1',
      content: '## 🎯 Priority Indicators\n\nCards can have priority levels that show visual indicators:',
      sender: { id: 'system', name: 'Stash Tutor', avatar: '🎓' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'kb-priorities-example',
      interactiveComponent: {
        type: 'kanban-board',
        data: {
          title: 'Priority-Based Kanban',
          description: 'Cards with different priority levels',
          columns: [
            {
              id: 'backlog',
              title: 'Backlog',
              icon: '📦',
              cards: [
                {
                  id: 'p1',
                  title: 'Critical Bug Fix',
                  description: 'Production server is down',
                  priority: 'high',
                  dueDate: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours
                },
                {
                  id: 'p2',
                  title: 'Update dependencies',
                  description: 'Routine maintenance task',
                  priority: 'low',
                  dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
                },
                {
                  id: 'p3',
                  title: 'Add new feature',
                  description: 'User requested feature',
                  priority: 'medium',
                  dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days
                },
              ],
            },
          ],
        },
      },
      sender: { id: 'system', name: 'Stash Tutor', avatar: '📊' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'kb-priorities-explanation',
      content: '**Priority Levels:**\n\n🔴 **High** - Red indicator, urgent tasks\n🟡 **Medium** - Yellow indicator, normal priority\n🟢 **Low** - Green indicator, can wait\n\nOverdue tasks show a red border automatically!',
      sender: { id: 'system', name: 'Stash Tutor', avatar: '📚' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'kb-wip-1',
      content: '## 🚦 WIP Limits\n\n**Work In Progress (WIP) limits** help prevent bottlenecks by limiting how many cards can be in a column:',
      sender: { id: 'system', name: 'Stash Tutor', avatar: '🎓' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'kb-wip-example',
      interactiveComponent: {
        type: 'kanban-board',
        data: {
          title: 'Kanban with WIP Limits',
          description: 'Columns have maximum card limits',
          columns: [
            {
              id: 'todo-wip',
              title: 'To Do',
              icon: '📝',
              wipLimit: 5,
              cards: [
                { id: 'w1', title: 'Task 1' },
                { id: 'w2', title: 'Task 2' },
                { id: 'w3', title: 'Task 3' },
              ],
            },
            {
              id: 'progress-wip',
              title: 'In Progress',
              icon: '⚡',
              wipLimit: 3,
              cards: [
                { id: 'w4', title: 'Active Task 1' },
                { id: 'w5', title: 'Active Task 2' },
                { id: 'w6', title: 'Active Task 3' },
              ],
            },
            {
              id: 'review-wip',
              title: 'Review',
              icon: '👀',
              wipLimit: 2,
              cards: [
                { id: 'w7', title: 'Under Review 1' },
                { id: 'w8', title: 'Under Review 2' },
                { id: 'w9', title: 'Under Review 3' }, // Over limit!
              ],
            },
          ],
        },
      },
      sender: { id: 'system', name: 'Stash Tutor', avatar: '📊' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'kb-wip-explanation',
      content: 'Notice the **Review** column is over its WIP limit (3/2)! The progress bar turns red to alert you.\n\nWIP limits help teams:\n✅ Focus on finishing work\n✅ Identify bottlenecks\n✅ Improve flow efficiency',
      sender: { id: 'system', name: 'Stash Tutor', avatar: '💡' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'kb-advanced-1',
      content: '## 🎨 Advanced Features\n\nKanban cards support rich metadata including tags, assignees, checklists, and attachments:',
      sender: { id: 'system', name: 'Stash Tutor', avatar: '🎓' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'kb-advanced-example',
      interactiveComponent: {
        type: 'kanban-board',
        data: {
          title: 'Full-Featured Kanban',
          description: 'Cards with all metadata',
          columns: [
            {
              id: 'sprint',
              title: 'Current Sprint',
              icon: '🏃',
              cards: [
                {
                  id: 'advanced-1',
                  title: 'Build user dashboard',
                  description: 'Create comprehensive analytics dashboard for end users',
                  priority: 'high',
                  dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
                  tags: [
                    { id: 't1', label: 'Frontend', color: '#3B82F6' },
                    { id: 't2', label: 'React', color: '#61DAFB' },
                    { id: 't3', label: 'TypeScript', color: '#3178C6' },
                  ],
                  assignees: [
                    { id: 'u1', name: 'Alice Johnson', color: '#8B5CF6' },
                    { id: 'u2', name: 'Bob Smith', color: '#EC4899' },
                  ],
                  checklistItems: 10,
                  checklistCompleted: 6,
                  comments: 8,
                  attachments: 3,
                },
                {
                  id: 'advanced-2',
                  title: 'API integration',
                  description: 'Connect frontend to new backend endpoints',
                  priority: 'medium',
                  dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
                  tags: [
                    { id: 't4', label: 'Backend', color: '#10B981' },
                    { id: 't5', label: 'API', color: '#F59E0B' },
                  ],
                  assignees: [
                    { id: 'u3', name: 'Charlie Davis', color: '#6366F1' },
                  ],
                  checklistItems: 5,
                  checklistCompleted: 2,
                  comments: 3,
                },
              ],
            },
          ],
        },
      },
      sender: { id: 'system', name: 'Stash Tutor', avatar: '📊' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'kb-advanced-code',
      content: '**Rich card metadata:**',
      sender: { id: 'system', name: 'Stash Tutor', avatar: '💻' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'kb-advanced-code-block',
      interactiveComponent: {
        type: 'code-block',
        data: {
          language: 'typescript',
          fileName: 'AdvancedKanban.tsx',
          code: `interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;

  // Metadata
  tags?: Array<{
    id: string;
    label: string;
    color: string;
  }>;
  assignees?: Array<{
    id: string;
    name: string;
    color?: string;
  }>;

  // Progress tracking
  checklistItems?: number;
  checklistCompleted?: number;
  comments?: number;
  attachments?: number;
}`,
        },
      },
      sender: { id: 'system', name: 'Stash Tutor', avatar: '📝' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'kb-interactions-1',
      content: '## 🖱️ Interactive Features\n\nThe KanbanBoard supports various callbacks for user interactions:',
      sender: { id: 'system', name: 'Stash Tutor', avatar: '🎓' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'kb-interactions-code',
      interactiveComponent: {
        type: 'code-block',
        data: {
          language: 'typescript',
          fileName: 'InteractiveKanban.tsx',
          code: `import { KanbanBoard } from 'stash';

const InteractiveKanban = () => {
  return (
    <KanbanBoard
      data={kanbanData}

      // Card interactions
      onCardPress={(card, column) => {
        console.log('Clicked card:', card.title);
        console.log('In column:', column.title);
      }}

      // Column interactions
      onColumnPress={(column) => {
        console.log('Clicked column:', column.title);
      }}

      // Drag & drop (future feature)
      onCardMove={(card, fromColumn, toColumn) => {
        console.log(\`Moved \${card.title}\`);
        console.log(\`From \${fromColumn.title} to \${toColumn.title}\`);
      }}

      // Expand to detail view
      onExpandPress={() => {
        console.log('Expand board to full screen');
      }}
    />
  );
};`,
        },
      },
      sender: { id: 'system', name: 'Stash Tutor', avatar: '📝' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'kb-modes-1',
      content: '## 📐 Display Modes\n\nKanbanBoard supports different display modes for various use cases:',
      sender: { id: 'system', name: 'Stash Tutor', avatar: '🎓' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'kb-modes-code',
      interactiveComponent: {
        type: 'code-block',
        data: {
          language: 'typescript',
          fileName: 'KanbanModes.tsx',
          code: `// Mini mode - compact for chat messages
<KanbanBoard
  data={kanbanData}
  mode="mini"
  height={300}
/>

// Preview mode - medium size for overviews
<KanbanBoard
  data={kanbanData}
  mode="preview"
  height={400}
/>

// Full mode - maximum detail
<KanbanBoard
  data={kanbanData}
  mode="full"
  height={600}
  showStats={true}
/>`,
        },
      },
      sender: { id: 'system', name: 'Stash Tutor', avatar: '📝' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'kb-best-practices',
      content: '## ✨ Best Practices\n\n**1. Keep WIP limits reasonable**\n- In Progress: 3-5 items\n- Review: 2-3 items\n\n**2. Use priorities effectively**\n- Reserve "high" for truly urgent items\n- Most work should be "medium"\n\n**3. Card descriptions**\n- Keep titles concise (< 50 chars)\n- Use descriptions for details\n\n**4. Tags for filtering**\n- Use consistent tag names\n- Limit to 3-4 tags per card\n\n**5. Assignees**\n- Limit to 2-3 people per card\n- Use for accountability, not just awareness',
      sender: { id: 'system', name: 'Stash Tutor', avatar: '💡' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'kb-api-reference',
      content: '## 📚 API Reference\n\nCheck the full TypeScript definitions for complete API documentation:',
      sender: { id: 'system', name: 'Stash Tutor', avatar: '🎓' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'kb-api-code',
      interactiveComponent: {
        type: 'code-block',
        data: {
          language: 'typescript',
          fileName: 'KanbanBoard.types.ts',
          code: `interface KanbanBoardProps {
  data: KanbanBoardData;
  mode?: 'mini' | 'preview' | 'full';
  layout?: 'horizontal' | 'vertical';
  height?: number;
  width?: number;
  showStats?: boolean;
  enableDragDrop?: boolean;
  onCardPress?: (card: KanbanCard, column: KanbanColumn) => void;
  onCardMove?: (
    card: KanbanCard,
    fromColumn: KanbanColumn,
    toColumn: KanbanColumn
  ) => void;
  onColumnPress?: (column: KanbanColumn) => void;
  onExpandPress?: () => void;
}`,
        },
      },
      sender: { id: 'system', name: 'Stash Tutor', avatar: '📝' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'kb-conclusion',
      content: '## 🎉 You\'re Ready!\n\nYou now know how to:\n\n✅ Create basic kanban boards\n✅ Add priorities and due dates\n✅ Set up WIP limits\n✅ Use rich card metadata\n✅ Handle user interactions\n\n**Next Steps:**\n- Try the TreeView tutorial for hierarchical data\n- Explore MultiSwipeable for carousel layouts\n- Check out DataTable for tabular data\n\nHappy building! 🚀',
      sender: { id: 'system', name: 'Stash Tutor', avatar: '🎓' },
      timestamp: new Date(),
      status: 'delivered',
      isOwn: false,
    },
  ];
};
