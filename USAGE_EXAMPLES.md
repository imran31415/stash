# Interactive Components Usage Examples

This document demonstrates how to use the enhanced TaskList and GanttChart components with their new fullscreen and bottom sheet features.

## TaskDetailBottomSheet

The `TaskDetailBottomSheet` is a mobile-optimized bottom sheet modal that slides up from the bottom of the screen, providing a better UX than center-screen modals.

### Features:
- ✅ Slides from bottom with rounded top corners
- ✅ Safe area support
- ✅ Rich header with priority badges
- ✅ Progress and status cards
- ✅ Timeline visualization
- ✅ Milestones and dependencies
- ✅ Action buttons (Edit, Delete, View)

### Usage:

```tsx
import React, { useState } from 'react';
import { TaskList, TaskDetailBottomSheet } from './components/Chat/InteractiveComponents';
import type { Task } from './components/Chat/InteractiveComponents';

function MyComponent() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const tasks: Task[] = [
    {
      id: '1',
      title: 'Design new homepage',
      description: 'Create wireframes and mockups for the new homepage redesign',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-02-01'),
      progress: 65,
      status: 'in-progress',
      priority: 'high',
      assignee: 'Sarah Chen',
      milestones: [
        {
          id: 'm1',
          title: 'Wireframes complete',
          date: new Date('2025-01-20'),
          completed: true,
        },
        {
          id: 'm2',
          title: 'Design review',
          date: new Date('2025-01-28'),
          completed: false,
        },
      ],
    },
    // ... more tasks
  ];

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleEdit = (task: Task) => {
    console.log('Edit task:', task.id);
    // Implement edit logic
  };

  const handleDelete = (taskId: string) => {
    console.log('Delete task:', taskId);
    // Implement delete logic
  };

  return (
    <>
      <TaskList
        title="Project Tasks"
        subtitle="Current sprint tasks"
        tasks={tasks}
        onTaskPress={handleTaskPress}
      />

      <TaskDetailBottomSheet
        visible={modalVisible}
        task={selectedTask}
        onClose={() => setModalVisible(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </>
  );
}
```

## GanttChartDetailView

The `GanttChartDetailView` is a fullscreen modal component that displays a Gantt chart with a side-by-side task list and statistics dashboard.

### Features:
- ✅ Fullscreen modal presentation
- ✅ Two-column layout (chart + task list) on desktop
- ✅ Responsive: stacks vertically on mobile (<768px)
- ✅ Statistics dashboard showing task counts
- ✅ Rich task cards with status, progress, assignee
- ✅ Milestone chips
- ✅ Task selection synchronization between chart and list

### Usage:

```tsx
import React, { useState } from 'react';
import { GanttChart, GanttChartDetailView } from './components/Chat/InteractiveComponents';
import type { Task } from './components/Chat/InteractiveComponents';

function MyGanttComponent() {
  const [showFullscreen, setShowFullscreen] = useState(false);

  const tasks: Task[] = [
    {
      id: '1',
      title: 'Design Phase',
      description: 'Complete all design work',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-02-01'),
      progress: 80,
      status: 'in-progress',
      priority: 'high',
      assignee: 'Sarah Chen',
      milestones: [
        {
          id: 'm1',
          title: 'Wireframes',
          date: new Date('2025-01-20'),
          completed: true,
        },
      ],
    },
    {
      id: '2',
      title: 'Development',
      description: 'Implement features',
      startDate: new Date('2025-02-02'),
      endDate: new Date('2025-03-15'),
      progress: 0,
      status: 'pending',
      priority: 'critical',
      assignee: 'John Doe',
      dependencies: ['1'],
    },
    // ... more tasks
  ];

  return (
    <>
      {/* Mini Gantt Chart with expand button */}
      <GanttChart
        tasks={tasks}
        mode="mini"
        title="Project Timeline"
        subtitle="Q1 2025"
        showProgress
        showMilestones
        showToday
        onExpandPress={() => setShowFullscreen(true)}
      />

      {/* Fullscreen Detail View */}
      <GanttChartDetailView
        visible={showFullscreen}
        tasks={tasks}
        title="Project Timeline"
        subtitle="Q1 2025 - Website Redesign"
        onClose={() => setShowFullscreen(false)}
        onTaskPress={(task) => {
          console.log('Task clicked:', task.title);
        }}
        onTaskEdit={(task) => {
          console.log('Edit task:', task.id);
        }}
      />
    </>
  );
}
```

## Combined Example: Full Workflow

Here's a complete example showing both components working together:

```tsx
import React, { useState } from 'react';
import { View, Button } from 'react-native';
import {
  TaskList,
  GanttChart,
  TaskDetailBottomSheet,
  GanttChartDetailView,
} from './components/Chat/InteractiveComponents';
import type { Task } from './components/Chat/InteractiveComponents';

function ProjectManagementView() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showGanttFullscreen, setShowGanttFullscreen] = useState(false);

  const tasks: Task[] = [
    {
      id: '1',
      title: 'Design new homepage',
      description: 'Create wireframes and mockups',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-02-01'),
      progress: 65,
      status: 'in-progress',
      priority: 'high',
      assignee: 'Sarah Chen',
    },
    {
      id: '2',
      title: 'Implement user authentication',
      description: 'OAuth2 and JWT implementation',
      startDate: new Date('2025-01-20'),
      endDate: new Date('2025-02-10'),
      progress: 30,
      status: 'in-progress',
      priority: 'critical',
      assignee: 'John Doe',
    },
    {
      id: '3',
      title: 'Database migration',
      description: 'Migrate to PostgreSQL',
      startDate: new Date('2025-02-05'),
      endDate: new Date('2025-02-20'),
      progress: 0,
      status: 'pending',
      priority: 'medium',
      assignee: 'Mike Wilson',
      dependencies: ['2'],
    },
  ];

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Task List View */}
      <TaskList
        title="Sprint Tasks"
        subtitle="Week of Jan 15-22"
        tasks={tasks}
        onTaskPress={handleTaskPress}
      />

      {/* Gantt Chart View */}
      <GanttChart
        tasks={tasks}
        mode="mini"
        title="Project Timeline"
        showProgress
        showMilestones
        showToday
        onExpandPress={() => setShowGanttFullscreen(true)}
        onTaskPress={handleTaskPress}
      />

      {/* Task Detail Bottom Sheet */}
      <TaskDetailBottomSheet
        visible={showTaskDetail}
        task={selectedTask}
        onClose={() => setShowTaskDetail(false)}
        onEdit={(task) => {
          console.log('Edit:', task.id);
          setShowTaskDetail(false);
        }}
        onDelete={(taskId) => {
          console.log('Delete:', taskId);
          setShowTaskDetail(false);
        }}
      />

      {/* Gantt Fullscreen View */}
      <GanttChartDetailView
        visible={showGanttFullscreen}
        tasks={tasks}
        title="Project Timeline"
        subtitle="Website Redesign - Q1 2025"
        onClose={() => setShowGanttFullscreen(false)}
        onTaskPress={handleTaskPress}
      />
    </View>
  );
}

export default ProjectManagementView;
```

## Key Features Summary

### TaskDetailBottomSheet
- Bottom sheet modal (better UX than center modal)
- Priority badges with colors
- Progress cards with status
- Timeline visualization
- Milestones checklist
- Dependencies chips
- Action buttons (Edit, Delete, View)

### GanttChartDetailView
- Fullscreen modal
- Responsive two-column layout
- Statistics dashboard (Total, Completed, In Progress, Pending)
- Rich task cards with:
  - Status badges
  - Progress percentage
  - Assignee information
  - Milestone chips
  - Selection highlighting
- Task selection synchronization
- Mobile-optimized (vertical layout on narrow screens)

## Customization

Both components support theming through their inline styles. You can customize:
- Colors (status, priority, backgrounds)
- Spacing and padding
- Border radius
- Shadow effects
- Typography (sizes, weights)

For advanced customization, modify the StyleSheet in each component file.
