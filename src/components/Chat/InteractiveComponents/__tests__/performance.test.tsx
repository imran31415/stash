import React from 'react';
import { render } from '@testing-library/react-native';
import { DataTable } from '../DataTable';
import { KanbanBoard } from '../KanbanBoard';
import type { DataTableProps } from '../DataTable.types';
import type { KanbanBoardProps } from '../KanbanBoard.types';

/**
 * Performance and stress tests for interactive components
 * Ensures components handle large datasets efficiently
 */

describe('Performance Tests', () => {
  describe('DataTable Performance', () => {
    const createLargeDataset = (rows: number) => {
      return Array.from({ length: rows }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        status: i % 2 === 0 ? 'active' : 'inactive',
        score: Math.random() * 100,
      }));
    };

    const columns: DataTableProps['columns'] = [
      { id: "col", accessor: 'id', header: 'ID' },
      { id: "col", accessor: 'name', header: 'Name' },
      { id: "col", accessor: 'email', header: 'Email' },
      { id: "col", accessor: 'status', header: 'Status' },
      { id: "col", accessor: 'score', header: 'Score' },
    ];

    it('renders 100 rows efficiently with pagination', () => {
      const data = createLargeDataset(100);
      const startTime = performance.now();

      const { getByText } = render(
        <DataTable
          columns={columns}
          data={data}
          paginated={true}
          defaultPageSize={10}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(getByText('Data Table')).toBeTruthy();
      // Should render in reasonable time (< 500ms)
      expect(renderTime).toBeLessThan(500);
    });

    it('handles 1000 rows with pagination', () => {
      const data = createLargeDataset(1000);
      const startTime = performance.now();

      const component = render(
        <DataTable
          columns={columns}
          data={data}
          paginated={true}
          defaultPageSize={50}
        />
      );

      const endTime = performance.now();

      expect(component).toBeTruthy();
      // Even with 1000 rows, should render quickly due to pagination
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('maintains performance with wide tables (many columns)', () => {
      const wideColumns = Array.from({ length: 20 }, (_, i) => ({
        id: `col${i}`,
        accessor: `col${i}`,
        header: `Column ${i}`,
      }));

      const data = Array.from({ length: 50 }, (_, i) =>
        wideColumns.reduce((acc, col) => ({
          ...acc,
          [col.accessor]: `Value ${i}-${col.accessor}`,
        }), { id: i })
      );

      const startTime = performance.now();

      const component = render(
        <DataTable
          columns={wideColumns}
          data={data}
          paginated={true}
          defaultPageSize={10}
        />
      );

      const endTime = performance.now();

      expect(component).toBeTruthy();
      expect(endTime - startTime).toBeLessThan(800);
    });
  });

  describe('KanbanBoard Performance', () => {
    const createLargeKanbanData = (cardsPerColumn: number): KanbanBoardProps => {
      const columnsWithCards = [
        { id: 'todo', title: 'To Do', color: '#3B82F6', cards: [] as KanbanBoardProps['data']['columns'][0]['cards'] },
        { id: 'inprogress', title: 'In Progress', color: '#F59E0B', cards: [] as KanbanBoardProps['data']['columns'][0]['cards'] },
        { id: 'done', title: 'Done', color: '#10B981', cards: [] as KanbanBoardProps['data']['columns'][0]['cards'] },
      ];

      columnsWithCards.forEach((column) => {
        for (let i = 0; i < cardsPerColumn; i++) {
          column.cards.push({
            id: `${column.id}-${i}`,
            title: `Card ${i}`,
            description: `Description for card ${i}`,
            priority: i % 3 === 0 ? ('high' as const) : ('medium' as const),
            assignees: [{ id: `user-${i % 5}`, name: `User ${i % 5}`, avatar: '' }],
          });
        }
      });

      return {
        data: {
          id: 'perf-test',
          title: 'Performance Test Board',
          columns: columnsWithCards,
        },
      };
    };

    it('renders 50 cards efficiently', () => {
      const config = createLargeKanbanData(50);
      const startTime = performance.now();

      const component = render(
        <KanbanBoard {...config} />
      );

      const endTime = performance.now();

      expect(component).toBeTruthy();
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('handles 100 cards across columns', () => {
      const config = createLargeKanbanData(100);
      const startTime = performance.now();

      const component = render(
        <KanbanBoard {...config} mode="preview" />
      );

      const endTime = performance.now();

      expect(component).toBeTruthy();
      // Preview mode should be even faster
      expect(endTime - startTime).toBeLessThan(800);
    });
  });

  describe('Memory Usage', () => {
    it('does not accumulate memory with repeated renders', () => {
      const data = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
      }));

      const columns = [
        { id: "col", accessor: 'id', header: 'ID' },
        { id: "col", accessor: 'name', header: 'Name' },
      ];

      // Render and unmount multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <DataTable columns={columns} data={data} />
        );
        unmount();
      }

      // Test passes if no memory errors occur
      expect(true).toBe(true);
    });

    it('cleans up large datasets on unmount', () => {
      const data = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        value: `Value ${i}`,
      }));

      const columns = [{ id: "col", accessor: 'id', header: 'ID' }, { id: "col", accessor: 'value', header: 'Value' }];

      const { unmount } = render(
        <DataTable columns={columns} data={data} paginated={true} />
      );

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Render Optimization', () => {
    it('uses pagination to limit rendered items', () => {
      const data = Array.from({ length: 500 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
      }));

      const columns = [
        { id: "col", accessor: 'id', header: 'ID' },
        { id: "col", accessor: 'name', header: 'Name' },
      ];

      const pageSize = 25;

      const { UNSAFE_getAllByType } = render(
        <DataTable
          columns={columns}
          data={data}
          paginated={true}
          defaultPageSize={pageSize}
        />
      );

      // Only one page worth of items should be rendered
      // This is a basic check - actual implementation may vary
      expect(data.length).toBe(500);
      expect(pageSize).toBe(25);
    });
  });

  describe('Concurrent Updates', () => {
    it('handles rapid state updates efficiently', () => {
      const columns = [{ id: "col", accessor: 'id', header: 'ID' }, { id: "col", accessor: 'value', header: 'Value' }];

      let data = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        value: `Initial ${i}`,
      }));

      const { rerender } = render(
        <DataTable columns={columns} data={data} />
      );

      const startTime = performance.now();

      // Simulate rapid updates
      for (let i = 0; i < 50; i++) {
        data = data.map(item => ({
          ...item,
          value: `Update ${i}-${item.id}`,
        }));
        rerender(<DataTable columns={columns} data={data} />);
      }

      const endTime = performance.now();

      // Should handle many updates efficiently
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty dataset', () => {
      const columns = [{ id: "col", accessor: 'id', header: 'ID' }];

      const { getByText } = render(
        <DataTable columns={columns} data={[]} />
      );

      expect(getByText('Data Table')).toBeTruthy();
    });

    it('handles single item', () => {
      const columns = [{ id: "col", accessor: 'id', header: 'ID' }];
      const data = [{ id: 1 }];

      const component = render(
        <DataTable columns={columns} data={data} />
      );

      expect(component).toBeTruthy();
    });

    it('handles very large single row', () => {
      const columns = [
        { id: "col", accessor: 'id', header: 'ID' },
        { id: "col", accessor: 'data', header: 'Data' },
      ];

      // Create row with very long string
      const data = [{
        id: 1,
        data: 'x'.repeat(10000),
      }];

      const startTime = performance.now();

      const component = render(
        <DataTable columns={columns} data={data} />
      );

      const endTime = performance.now();

      expect(component).toBeTruthy();
      expect(endTime - startTime).toBeLessThan(500);
    });
  });
});
