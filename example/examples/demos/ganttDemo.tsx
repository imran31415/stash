import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GanttChart, type GanttTask } from '../../../src/components/Chat/InteractiveComponents';
import { DemoConfig } from './types';

const ganttDemo: DemoConfig<GanttTask[]> = {
  id: 'gantt',
  title: 'Gantt Chart',
  description: 'Project timeline visualization with tasks, dependencies, and progress tracking',

  initialCode: `[
  {
    "id": "1",
    "title": "Design Phase",
    "description": "UI/UX design and wireframes",
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-01-15T00:00:00.000Z",
    "progress": 100,
    "status": "completed",
    "priority": "high",
    "assignee": "Alice Chen"
  },
  {
    "id": "2",
    "title": "Development",
    "description": "Core features implementation",
    "startDate": "2025-01-10T00:00:00.000Z",
    "endDate": "2025-02-28T00:00:00.000Z",
    "progress": 60,
    "status": "in-progress",
    "priority": "critical",
    "assignee": "Bob Smith",
    "dependencies": ["1"]
  },
  {
    "id": "3",
    "title": "Testing",
    "description": "QA and bug fixes",
    "startDate": "2025-02-20T00:00:00.000Z",
    "endDate": "2025-03-15T00:00:00.000Z",
    "progress": 0,
    "status": "pending",
    "priority": "high",
    "assignee": "Carol Wang",
    "dependencies": ["2"]
  }
]`,

  implementationCode: `import { GanttChart, type GanttTask } from 'stash';

// Define your tasks
const tasks: GanttTask[] = [
  {
    id: '1',
    title: 'Design Phase',
    description: 'UI/UX design and wireframes',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-15'),
    progress: 100,
    status: 'completed',
    priority: 'high',
    assignee: 'Alice Chen'
  },
  {
    id: '2',
    title: 'Development',
    description: 'Core features implementation',
    startDate: new Date('2025-01-10'),
    endDate: new Date('2025-02-28'),
    progress: 60,
    status: 'in-progress',
    priority: 'critical',
    assignee: 'Bob Smith',
    dependencies: ['1']
  },
  {
    id: '3',
    title: 'Testing',
    description: 'QA and bug fixes',
    startDate: new Date('2025-02-20'),
    endDate: new Date('2025-03-15'),
    progress: 0,
    status: 'pending',
    priority: 'high',
    assignee: 'Carol Wang',
    dependencies: ['2']
  }
];

// Render the GanttChart component
<GanttChart
  tasks={tasks}
  mode="full"
  showProgress={true}
  showToday={true}
  showDependencies={true}
  height={400}
/>`,

  parseData: (code: string): GanttTask[] | null => {
    try {
      const parsed = JSON.parse(code);
      if (!Array.isArray(parsed)) {
        console.error('GanttDemo: Data must be an array');
        return null;
      }

      const tasks = parsed.map((task: any) => {
        if (!task || typeof task !== 'object') {
          console.error('GanttDemo: Each task must be an object');
          return null;
        }

        const startDate = new Date(task.startDate);
        const endDate = new Date(task.endDate);

        // Validate dates
        if (isNaN(startDate.getTime())) {
          console.error('GanttDemo: Invalid startDate:', task.startDate);
          return null;
        }
        if (isNaN(endDate.getTime())) {
          console.error('GanttDemo: Invalid endDate:', task.endDate);
          return null;
        }

        return {
          id: String(task.id),
          title: String(task.title || 'Untitled'),
          description: task.description ? String(task.description) : undefined,
          startDate,
          endDate,
          progress: Number(task.progress) || 0,
          status: task.status || 'pending',
          priority: task.priority || 'medium',
          assignee: task.assignee ? String(task.assignee) : undefined,
          dependencies: Array.isArray(task.dependencies) ? task.dependencies : undefined,
          color: task.color ? String(task.color) : undefined,
        };
      }).filter(Boolean);

      return tasks.length > 0 ? tasks as GanttTask[] : null;
    } catch (e) {
      console.error('GanttDemo parse error:', e);
      return null;
    }
  },

  renderPreview: (tasks: GanttTask[]) => {
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return (
        <View style={styles.errorView}>
          <Text style={styles.errorText}>Please provide an array of tasks</Text>
        </View>
      );
    }

    return (
      <GanttChart
        tasks={tasks}
        mode="full"
        showProgress={true}
        showToday={true}
        showDependencies={true}
        height={400}
      />
    );
  },
};

const styles = StyleSheet.create({
  errorView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    margin: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default ganttDemo;
