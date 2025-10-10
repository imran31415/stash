import React from 'react';
import { render } from '@testing-library/react-native';
import { Dashboard } from '../Dashboard';
import type { DashboardProps } from '../Dashboard.types';

// Mock all the child components
jest.mock('../TimeSeriesChart', () => ({
  TimeSeriesChart: () => null,
}));
jest.mock('../GanttChart', () => ({
  GanttChart: () => null,
}));
jest.mock('../GraphVisualization', () => ({
  GraphVisualization: () => null,
}));
jest.mock('../TaskList', () => ({
  TaskList: () => null,
}));
jest.mock('../ResourceList', () => ({
  ResourceList: () => null,
}));
jest.mock('../CodeBlock', () => ({
  CodeBlock: () => null,
}));
jest.mock('../Media', () => ({
  Media: () => null,
}));
jest.mock('../Heatmap', () => ({
  Heatmap: () => null,
}));
jest.mock('../Workflow', () => ({
  Workflow: () => null,
}));
jest.mock('../TreeView', () => ({
  TreeView: () => null,
}));
jest.mock('../KanbanBoard', () => ({
  KanbanBoard: () => null,
}));
jest.mock('../VideoStream', () => ({
  VideoStream: () => null,
}));
jest.mock('../LiveCameraStream', () => ({
  LiveCameraStream: () => null,
}));

describe('Dashboard', () => {
  const mockConfig: DashboardProps['config'] = {
    id: 'test-dashboard',
    title: 'Test Dashboard',
    gridSize: '2x2',
    items: [
      {
        id: 'item-1',
        type: 'code-block',
        data: { code: 'Test content', language: 'javascript' },
        gridPosition: { row: 0, col: 0 },
      },
      {
        id: 'item-2',
        type: 'code-block',
        data: { code: 'Test content 2', language: 'javascript' },
        gridPosition: { row: 0, col: 1 },
      },
    ],
  };

  describe('Rendering', () => {
    it('renders dashboard with title', () => {
      const { getByText } = render(
        <Dashboard config={mockConfig} />
      );
      expect(getByText('Test Dashboard')).toBeTruthy();
    });

    it('renders in mini mode', () => {
      const { getByText } = render(
        <Dashboard config={mockConfig} mode="mini" />
      );
      expect(getByText('Test Dashboard')).toBeTruthy();
    });

    it('renders in preview mode', () => {
      const { getByText } = render(
        <Dashboard config={mockConfig} mode="preview" />
      );
      expect(getByText('Test Dashboard')).toBeTruthy();
    });

    it('renders in full mode', () => {
      const { getByText } = render(
        <Dashboard config={mockConfig} mode="full" />
      );
      expect(getByText('Test Dashboard')).toBeTruthy();
    });
  });

  describe('Grid Sizes', () => {
    it('renders 1x1 grid', () => {
      const config = {
        ...mockConfig,
        gridSize: '1x1' as const,
      };
      const { getByText } = render(
        <Dashboard config={config} />
      );
      expect(getByText('Test Dashboard')).toBeTruthy();
    });

    it('renders 2x2 grid', () => {
      const config = {
        ...mockConfig,
        gridSize: '2x2' as const,
      };
      const { getByText } = render(
        <Dashboard config={config} />
      );
      expect(getByText('Test Dashboard')).toBeTruthy();
    });

    it('renders 3x3 grid', () => {
      const config = {
        ...mockConfig,
        gridSize: '3x3' as const,
      };
      const { getByText } = render(
        <Dashboard config={config} />
      );
      expect(getByText('Test Dashboard')).toBeTruthy();
    });

    it('renders custom grid', () => {
      const config = {
        ...mockConfig,
        gridSize: 'custom' as const,
        customGrid: { rows: 5, cols: 5 },
      };
      const { getByText } = render(
        <Dashboard config={config} />
      );
      expect(getByText('Test Dashboard')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('supports onExpandPress callback', () => {
      const onExpandPress = jest.fn();
      const { getByText } = render(
        <Dashboard config={mockConfig} onExpandPress={onExpandPress} />
      );

      expect(getByText('Test Dashboard')).toBeTruthy();
    });
  });

  describe('Item Types', () => {
    it('handles empty items array', () => {
      const config = {
        ...mockConfig,
        items: [],
      };
      const { getByText } = render(
        <Dashboard config={config} />
      );
      expect(getByText('Test Dashboard')).toBeTruthy();
    });
  });

  describe('Styling', () => {
    it('renders with different modes', () => {
      const { getByText } = render(
        <Dashboard config={mockConfig} mode="mini" />
      );
      expect(getByText('Test Dashboard')).toBeTruthy();
    });
  });

  describe('Grid Positioning', () => {
    it('handles items with row and col span', () => {
      const config: DashboardProps['config'] = {
        ...mockConfig,
        items: [
          {
            id: 'item-1',
            type: 'code-block' as const,
            data: { code: 'Test', language: 'javascript' },
            gridPosition: { row: 0, col: 0, rowSpan: 2, colSpan: 2 },
          },
        ],
      };
      const { getByText } = render(
        <Dashboard config={config} />
      );
      expect(getByText('Test Dashboard')).toBeTruthy();
    });
  });
});
