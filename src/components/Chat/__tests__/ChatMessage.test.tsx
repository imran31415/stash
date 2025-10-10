import React from 'react';
import { render } from '@testing-library/react-native';
import { ChatMessage } from '../ChatMessage';
import type { Message } from '../types';

// Mock the interactive components
jest.mock('../InteractiveComponents', () => ({
  TaskList: () => null,
  ResourceList: () => null,
  GanttChart: () => null,
  GanttChartDetailView: () => null,
  TaskDetailBottomSheet: () => null,
  TaskListDetailView: () => null,
  TimeSeriesChart: () => null,
  TimeSeriesChartDetailView: () => null,
  GraphVisualization: () => null,
  GraphVisualizationDetailView: () => null,
  CodeBlock: () => null,
  CodeBlockDetailView: () => null,
  CodeEditor: () => null,
  Media: () => null,
  MediaDetailView: () => null,
  Dashboard: () => null,
  DashboardDetailView: () => null,
  DashboardPreview: () => null,
  DataTable: () => null,
  DataTableDetailView: () => null,
  Workflow: () => null,
  WorkflowDetailView: () => null,
  FlameGraph: () => null,
  VideoStream: () => null,
  VideoStreamDetailView: () => null,
  LiveCameraStream: () => null,
  TreeView: () => null,
  TreeViewDetailView: () => null,
  MultiSwipeable: () => null,
  KanbanBoard: () => null,
  KanbanBoardDetailView: () => null,
}));

describe('ChatMessage', () => {
  const createMessage = (overrides?: Partial<Message>): Message => ({
    id: 'msg-1',
    content: 'Test message',
    type: 'text',
    timestamp: new Date('2024-01-01'),
    sender: { id: 'user-1', name: 'Test User' },
    isOwn: false,
    ...overrides,
  });

  describe('Basic Rendering', () => {
    it('renders text message', () => {
      const message = createMessage();
      const component = render(<ChatMessage message={message} />);
      expect(component).toBeTruthy();
    });

    it('renders own message', () => {
      const message = createMessage({ isOwn: true });
      const component = render(<ChatMessage message={message} />);
      expect(component).toBeTruthy();
    });

    it('renders other user message', () => {
      const message = createMessage({ isOwn: false });
      const component = render(<ChatMessage message={message} />);
      expect(component).toBeTruthy();
    });

    it('renders system message', () => {
      const message = createMessage({ type: 'system', content: 'System notification' });
      const component = render(<ChatMessage message={message} />);
      expect(component).toBeTruthy();
    });

    it('renders loading state', () => {
      const message = createMessage();
      const component = render(<ChatMessage message={message} isLoading={true} />);
      expect(component).toBeTruthy();
    });
  });

  describe('Avatar Display', () => {
    it('shows avatar when enabled', () => {
      const message = createMessage();
      const component = render(<ChatMessage message={message} showAvatar={true} />);
      expect(component).toBeTruthy();
    });

    it('hides avatar when disabled', () => {
      const message = createMessage();
      const component = render(<ChatMessage message={message} showAvatar={false} />);
      expect(component).toBeTruthy();
    });
  });

  describe('Timestamp Display', () => {
    it('shows timestamp when enabled', () => {
      const message = createMessage();
      const component = render(<ChatMessage message={message} showTimestamp={true} />);
      expect(component).toBeTruthy();
    });

    it('hides timestamp when disabled', () => {
      const message = createMessage();
      const component = render(<ChatMessage message={message} showTimestamp={false} />);
      expect(component).toBeTruthy();
    });
  });

  describe('Message Types', () => {
    it('renders text message type', () => {
      const message = createMessage({ type: 'text' });
      const component = render(<ChatMessage message={message} />);
      expect(component).toBeTruthy();
    });

    it('renders image message type', () => {
      const message = createMessage({
        type: 'image',
        imageUrl: 'https://example.com/image.jpg'
      });
      const component = render(<ChatMessage message={message} />);
      expect(component).toBeTruthy();
    });

    it('renders system message type', () => {
      const message = createMessage({ type: 'system' });
      const component = render(<ChatMessage message={message} />);
      expect(component).toBeTruthy();
    });
  });

  describe('Interactive Components', () => {
    it('renders task-list component', () => {
      const message = createMessage({
        interactiveComponent: {
          type: 'task-list',
          data: { tasks: [], title: 'Tasks' }
        }
      });
      const component = render(<ChatMessage message={message} />);
      expect(component).toBeTruthy();
    });

    it('renders dashboard component', () => {
      const message = createMessage({
        interactiveComponent: {
          type: 'dashboard',
          data: { widgets: [] }
        }
      });
      const component = render(<ChatMessage message={message} />);
      expect(component).toBeTruthy();
    });

    it('renders data-table component', () => {
      const message = createMessage({
        interactiveComponent: {
          type: 'data-table',
          data: { columns: [], data: [] }
        }
      });
      const component = render(<ChatMessage message={message} />);
      expect(component).toBeTruthy();
    });

    it('renders kanban-board component', () => {
      const message = createMessage({
        interactiveComponent: {
          type: 'kanban-board',
          data: { id: 'board-1', title: 'Board', columns: [] }
        }
      });
      const component = render(<ChatMessage message={message} />);
      expect(component).toBeTruthy();
    });

    it('renders time-series-chart component', () => {
      const message = createMessage({
        interactiveComponent: {
          type: 'time-series-chart',
          data: { series: [] }
        }
      });
      const component = render(<ChatMessage message={message} />);
      expect(component).toBeTruthy();
    });

    it('renders code-block component', () => {
      const message = createMessage({
        interactiveComponent: {
          type: 'code-block',
          data: { code: 'console.log("hello")', language: 'javascript' }
        }
      });
      const component = render(<ChatMessage message={message} />);
      expect(component).toBeTruthy();
    });
  });

  describe('Presentation Mode', () => {
    it('renders in presentation mode', () => {
      const message = createMessage();
      const component = render(<ChatMessage message={message} presentationMode={true} />);
      expect(component).toBeTruthy();
    });

    it('renders image in full width presentation mode', () => {
      const message = createMessage({
        type: 'image',
        imageUrl: 'https://example.com/image.jpg'
      });
      const component = render(<ChatMessage message={message} presentationMode={true} />);
      expect(component).toBeTruthy();
    });

    it('renders dashboard in full width presentation mode', () => {
      const message = createMessage({
        interactiveComponent: {
          type: 'dashboard',
          data: { widgets: [] }
        }
      });
      const component = render(<ChatMessage message={message} presentationMode={true} />);
      expect(component).toBeTruthy();
    });
  });

  describe('Message Status', () => {
    it('renders sending status', () => {
      const message = createMessage({ status: 'sending' });
      const component = render(<ChatMessage message={message} />);
      expect(component).toBeTruthy();
    });

    it('renders sent status', () => {
      const message = createMessage({ status: 'sent' });
      const component = render(<ChatMessage message={message} />);
      expect(component).toBeTruthy();
    });

    it('renders delivered status', () => {
      const message = createMessage({ status: 'delivered' });
      const component = render(<ChatMessage message={message} />);
      expect(component).toBeTruthy();
    });

    it('renders failed status', () => {
      const message = createMessage({ status: 'failed' });
      const component = render(<ChatMessage message={message} />);
      expect(component).toBeTruthy();
    });
  });

  describe('Theme Support', () => {
    it('applies custom theme', () => {
      const message = createMessage();
      const theme = {
        primaryColor: '#FF0000',
        backgroundColor: '#FFFFFF',
      };
      const component = render(<ChatMessage message={message} theme={theme} />);
      expect(component).toBeTruthy();
    });

    it('works without theme', () => {
      const message = createMessage();
      const component = render(<ChatMessage message={message} />);
      expect(component).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty content', () => {
      const message = createMessage({ content: '' });
      const component = render(<ChatMessage message={message} />);
      expect(component).toBeTruthy();
    });

    it('handles very long content', () => {
      const message = createMessage({ content: 'x'.repeat(10000) });
      const component = render(<ChatMessage message={message} />);
      expect(component).toBeTruthy();
    });
  });

  describe('Cleanup', () => {
    it('unmounts without errors', () => {
      const message = createMessage();
      const { unmount } = render(<ChatMessage message={message} />);
      expect(() => unmount()).not.toThrow();
    });

    it('handles unmount with interactive component', () => {
      const message = createMessage({
        interactiveComponent: {
          type: 'dashboard',
          data: { widgets: [] }
        }
      });
      const { unmount } = render(<ChatMessage message={message} />);
      expect(() => unmount()).not.toThrow();
    });
  });
});
