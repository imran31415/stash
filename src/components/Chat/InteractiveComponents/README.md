# Interactive Chat Components

A collection of rich, interactive components designed to be embedded within chat messages for enhanced data visualization and user interaction.

## Components

### 1. TaskList

An interactive task list component with modal details, perfect for displaying project tasks or to-do items within chat messages.

**Features:**
- Status indicators with color coding
- Priority badges
- Progress tracking
- Date ranges
- Assignee display
- Interactive detail modal

**Usage:**
```tsx
import { TaskList } from 'stash/src/components/Chat/InteractiveComponents';

<TaskList
  title="Active Tasks"
  subtitle="3 tasks in progress"
  tasks={[
    {
      id: '1',
      title: 'Design new feature',
      description: 'Create mockups',
      startDate: new Date(),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      progress: 75,
      status: 'in-progress',
      priority: 'high',
      assignee: 'John Doe',
    }
  ]}
  onTaskPress={(task) => console.log('Task pressed:', task)}
/>
```

### 2. ResourceList

A flexible, adaptive resource list component with intelligent item limiting based on platform and screen size.

**Features:**
- Adaptive height calculation (mobile: 3-6 items, web: 8 items)
- "Show More/Less" functionality
- Category and status badges
- Tag support with overflow indication
- Custom icons and colors
- Metadata display
- Image support

**Usage:**
```tsx
import { ResourceList } from 'stash/src/components/Chat/InteractiveComponents';

<ResourceList
  title="Documents"
  subtitle="Recent files"
  resources={[
    {
      id: '1',
      title: 'Q4 Report',
      description: 'Financial analysis',
      category: 'Finance',
      status: 'Active',
      priority: 'high',
      icon: '📊',
      tags: ['report', 'quarterly'],
      updatedAt: new Date(),
    }
  ]}
  adaptiveHeight={true}
  showCategory={true}
  showStatus={true}
  onResourcePress={(resource) => console.log('Resource pressed:', resource)}
/>
```

### 3. GanttChart

A comprehensive Gantt chart component with both mini and full modes, ideal for project timeline visualization.

**Features:**
- Mini and full display modes
- Timeline visualization with day/week/month scales
- Progress tracking
- Milestone markers
- Task dependencies (visual representation)
- Today indicator
- Status-based color coding
- Auto-scrolling to selected tasks
- Interactive task bars and milestones
- Expandable from mini to full view

**Usage:**
```tsx
import { GanttChart } from 'stash/src/components/Chat/InteractiveComponents';
import { addDays } from 'date-fns';

<GanttChart
  tasks={[
    {
      id: '1',
      title: 'Development Phase',
      startDate: new Date(),
      endDate: addDays(new Date(), 14),
      progress: 60,
      status: 'in-progress',
      priority: 'high',
      assignee: 'Team A',
      milestones: [
        {
          id: 'm1',
          title: 'Alpha Release',
          date: addDays(new Date(), 7),
          completed: false,
        }
      ],
    }
  ]}
  mode="full"
  title="Project Timeline"
  subtitle="Q1 2025"
  showProgress={true}
  showMilestones={true}
  showToday={true}
  timeScale="day"
  onTaskPress={(task) => console.log('Task:', task)}
  onMilestonePress={(milestone, task) => console.log('Milestone:', milestone)}
/>
```

### 4. CodeBlock

A compact, cross-platform code viewer with syntax highlighting, line numbers, copy, and pagination. Optimized for embedding in chat.

- Modes: mini, preview, full (with expandable detail view)
- Languages: TypeScript, JavaScript, Python, JSON, Markdown, and more
- Pagination for large files in full view
- Copy to clipboard

Usage:
```tsx
import { CodeBlock } from 'stash/src/components/Chat/InteractiveComponents';

<CodeBlock
  code={`const greet = (name: string) => console.log(` + "'hello'" + `, name);`}
  language="typescript"
  fileName="greet.ts"
  mode="preview"
  showLineNumbers
  onViewFullFile={() => {/* open modal */}}
/>
```

### Chat Integration

Embed as an interactive component in a message:
```ts
const message: Message = {
  id: 'm1',
  type: 'text',
  content: 'Check out this snippet',
  sender: { id: 'u1', name: 'Alice' },
  timestamp: new Date(),
  interactiveComponent: {
    type: 'code-block',
    data: {
      code: '# Getting Started\n\n```bash\nyarn add stash\n```',
      language: 'markdown',
      fileName: 'README.md',
      mode: 'preview',
    },
  },
};
```

Note: Syntax highlighting is lightweight for performance; for production-grade theming we can integrate a pluggable highlighter.

## Type Definitions

### Task
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  progress: number; // 0-100
  status: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  dependencies?: string[];
  milestones?: Milestone[];
}
```

### Resource
```typescript
interface Resource {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  imageUrl?: string;
  icon?: string;
  color?: string;
}
```

### GanttTask
```typescript
interface GanttTask {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  progress: number; // 0-100
  status: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  dependencies?: string[];
  color?: string;
  milestones?: GanttMilestone[];
}
```

## Design Principles

### 1. **Self-Contained**
All components are fully self-contained with inline theme definitions, requiring no external theme providers.

### 2. **Adaptive**
Components automatically adapt to platform (iOS, Android, Web) and screen sizes for optimal display.

### 3. **Interactive**
Full support for touch interactions, modals, and responsive feedback.

### 4. **Chat-Optimized**
Designed specifically for embedding in chat messages with appropriate sizing and layout constraints.

### 5. **Production-Ready**
Clean, maintainable code following React Native best practices with TypeScript support.

## Dependencies

- `react-native`: ^0.70.0
- `date-fns`: ^4.1.0 (for GanttChart date utilities)

## Platform Support

- ✅ iOS
- ✅ Android
- ✅ Web (via React Native Web)

## Examples

See `/example/examples/InteractiveComponentsExample.tsx` for comprehensive usage examples.

## License

MIT
