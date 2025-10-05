import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { KanbanBoard, type KanbanBoardData } from '../../../src/components/Chat/InteractiveComponents';
import { DemoConfig } from './types';

const kanbanDemo: DemoConfig<KanbanBoardData> = {
  id: 'kanban',
  title: 'Kanban Board',
  description: 'Task management board with cards, columns, and workflow tracking',

  initialCode: `{
  "id": "project-board",
  "title": "Project Board",
  "description": "Sprint planning board",
  "columns": [
    {
      "id": "todo",
      "title": "To Do",
      "cards": [
        {
          "id": "card-1",
          "title": "Design landing page",
          "description": "Create mockups and wireframes",
          "priority": "high",
          "status": "todo",
          "assignees": [
            {
              "id": "1",
              "name": "Alice",
              "avatar": "👩‍💻"
            }
          ],
          "tags": [
            {"id": "t1", "label": "Design", "color": "#3B82F6"}
          ]
        },
        {
          "id": "card-2",
          "title": "Setup CI/CD pipeline",
          "description": "Configure GitHub Actions",
          "priority": "medium",
          "status": "todo",
          "assignees": [
            {
              "id": "3",
              "name": "Charlie",
              "avatar": "👨‍💼"
            }
          ],
          "tags": [
            {"id": "t3", "label": "DevOps", "color": "#F59E0B"}
          ]
        }
      ]
    },
    {
      "id": "in_progress",
      "title": "In Progress",
      "cards": [
        {
          "id": "card-3",
          "title": "Implement authentication",
          "description": "JWT and OAuth integration",
          "priority": "urgent",
          "status": "in_progress",
          "assignees": [
            {
              "id": "2",
              "name": "Bob",
              "avatar": "👨‍💻"
            }
          ],
          "tags": [
            {"id": "t2", "label": "Backend", "color": "#10B981"}
          ]
        }
      ]
    },
    {
      "id": "review",
      "title": "Review",
      "cards": [
        {
          "id": "card-4",
          "title": "Update documentation",
          "description": "API documentation updates",
          "priority": "low",
          "status": "review",
          "assignees": [
            {
              "id": "1",
              "name": "Alice",
              "avatar": "👩‍💻"
            }
          ],
          "tags": [
            {"id": "t4", "label": "Docs", "color": "#8B5CF6"}
          ]
        }
      ]
    },
    {
      "id": "done",
      "title": "Done",
      "cards": []
    }
  ]
}`,

  implementationCode: `import { KanbanBoard, type KanbanBoardData } from 'stash';

// Define your kanban board data
const data: KanbanBoardData = {
  id: 'project-board',
  title: 'Project Board',
  description: 'Sprint planning board',
  columns: [
    {
      id: 'todo',
      title: 'To Do',
      cards: [
        {
          id: 'card-1',
          title: 'Design landing page',
          description: 'Create mockups and wireframes',
          priority: 'high',
          status: 'todo',
          assignees: [
            { id: '1', name: 'Alice', avatar: '👩‍💻' }
          ],
          tags: [
            { id: 't1', label: 'Design', color: '#3B82F6' }
          ]
        }
      ]
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      cards: [
        {
          id: 'card-2',
          title: 'Implement authentication',
          description: 'JWT and OAuth integration',
          priority: 'urgent',
          status: 'in_progress',
          assignees: [
            { id: '2', name: 'Bob', avatar: '👨‍💻' }
          ],
          tags: [
            { id: 't2', label: 'Backend', color: '#10B981' }
          ]
        }
      ]
    }
    // ... more columns
  ]
};

// Render the KanbanBoard component
<KanbanBoard
  data={data}
  mode="full"
  height={400}
  showStats={true}
/>`,

  parseData: (code: string): KanbanBoardData | null => {
    try {
      const parsed = JSON.parse(code);

      if (!parsed || typeof parsed !== 'object') {
        console.error('KanbanDemo: Data must be an object', parsed);
        return null;
      }

      if (!Array.isArray(parsed.columns)) {
        console.error('KanbanDemo: Data must have columns array. Got:', parsed);
        return null;
      }

      if (parsed.columns.length === 0) {
        console.error('KanbanDemo: Columns array is empty');
        return null;
      }

      return {
        id: String(parsed.id || 'kanban-board'),
        title: String(parsed.title || 'Kanban Board'),
        description: parsed.description ? String(parsed.description) : undefined,
        columns: parsed.columns.map((col: any) => ({
          id: String(col.id),
          title: String(col.title || col.id),
          cards: Array.isArray(col.cards) ? col.cards.map((card: any) => ({
            id: String(card.id),
            title: String(card.title || 'Untitled'),
            description: card.description ? String(card.description) : undefined,
            priority: card.priority || 'medium',
            status: card.status || 'todo',
            assignees: Array.isArray(card.assignees) ? card.assignees.map((a: any) => ({
              id: String(a.id),
              name: String(a.name),
              avatar: a.avatar ? String(a.avatar) : undefined,
              color: a.color ? String(a.color) : undefined,
            })) : undefined,
            tags: Array.isArray(card.tags) ? card.tags.map((t: any) => ({
              id: String(t.id),
              label: String(t.label),
              color: String(t.color),
            })) : undefined,
            dueDate: card.dueDate ? new Date(card.dueDate) : undefined,
            estimatedHours: card.estimatedHours ? Number(card.estimatedHours) : undefined,
            actualHours: card.actualHours ? Number(card.actualHours) : undefined,
            checklistItems: card.checklistItems ? Number(card.checklistItems) : undefined,
            checklistCompleted: card.checklistCompleted ? Number(card.checklistCompleted) : undefined,
            attachments: card.attachments ? Number(card.attachments) : undefined,
            comments: card.comments ? Number(card.comments) : undefined,
          })) : [],
          color: col.color ? String(col.color) : undefined,
          icon: col.icon ? String(col.icon) : undefined,
          wipLimit: col.wipLimit ? Number(col.wipLimit) : undefined,
          collapsed: col.collapsed !== undefined ? Boolean(col.collapsed) : undefined,
        })),
        useSwimlanes: parsed.useSwimlanes !== undefined ? Boolean(parsed.useSwimlanes) : undefined,
        metadata: parsed.metadata || undefined,
      };
    } catch (e) {
      console.error('KanbanDemo parse error:', e);
      return null;
    }
  },

  renderPreview: (data: KanbanBoardData) => {
    if (!data || !data.columns || data.columns.length === 0) {
      return (
        <View style={styles.errorView}>
          <Text style={styles.errorText}>Please provide columns in the data</Text>
        </View>
      );
    }

    return (
      <KanbanBoard
        data={data}
        mode="full"
        height={400}
        showStats={true}
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

export default kanbanDemo;
