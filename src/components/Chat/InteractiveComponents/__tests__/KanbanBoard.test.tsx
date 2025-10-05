import React from 'react';
import { render, fireEvent, within } from '@testing-library/react-native';
import { KanbanBoard } from '../KanbanBoard';
import type { KanbanBoardData, KanbanCard, KanbanColumn } from '../KanbanBoard.types';

// Mock theme provider
jest.mock('../../../../theme', () => ({
  useThemeColors: () => ({
    surface: '#FFFFFF',
    background: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    border: '#E5E7EB',
    primary: '#3B82F6',
  }),
}));

describe('KanbanBoard', () => {
  const mockData: KanbanBoardData = {
    id: 'test-board',
    title: 'Test Kanban Board',
    description: 'A test board',
    columns: [
      {
        id: 'col-1',
        title: 'To Do',
        icon: '📝',
        cards: [
          {
            id: 'card-1',
            title: 'Task 1',
            description: 'First task',
          },
          {
            id: 'card-2',
            title: 'Task 2',
            description: 'Second task',
            priority: 'high',
          },
        ],
      },
      {
        id: 'col-2',
        title: 'In Progress',
        icon: '⚡',
        cards: [
          {
            id: 'card-3',
            title: 'Task 3',
            description: 'Third task',
          },
        ],
      },
      {
        id: 'col-3',
        title: 'Done',
        icon: '✅',
        cards: [],
      },
    ],
  };

  describe('Rendering', () => {
    it('renders the kanban board with title', () => {
      const { getByText } = render(<KanbanBoard data={mockData} />);
      expect(getByText('Test Kanban Board')).toBeTruthy();
    });

    it('renders all columns', () => {
      const { getAllByText } = render(<KanbanBoard data={mockData} />);
      expect(getAllByText('To Do')[0]).toBeTruthy();
      expect(getAllByText('In Progress')[0]).toBeTruthy();
      expect(getAllByText('Done')[0]).toBeTruthy();
    });

    it('renders all cards in columns', () => {
      const { getByText } = render(<KanbanBoard data={mockData} />);
      expect(getByText('Task 1')).toBeTruthy();
      expect(getByText('Task 2')).toBeTruthy();
      expect(getByText('Task 3')).toBeTruthy();
    });

    it('displays column icons', () => {
      const { getByText } = render(<KanbanBoard data={mockData} />);
      expect(getByText('📝')).toBeTruthy();
      expect(getByText('⚡')).toBeTruthy();
      expect(getByText('✅')).toBeTruthy();
    });

    it('shows card count in column header', () => {
      const { getAllByText } = render(<KanbanBoard data={mockData} />);
      const cardCounts = getAllByText(/[0-9]+/);
      expect(cardCounts.length).toBeGreaterThan(0);
    });
  });

  describe('Stats Display', () => {
    it('shows stats bar when showStats is true', () => {
      const { getByText } = render(
        <KanbanBoard data={mockData} showStats={true} />
      );
      // Stats should show total cards
      expect(getByText('Total')).toBeTruthy();
    });

    it('hides stats bar when showStats is false', () => {
      const { queryByText } = render(
        <KanbanBoard data={mockData} showStats={false} />
      );
      expect(queryByText('Total')).toBeNull();
    });
  });

  describe('WIP Limits', () => {
    it('displays WIP limit indicator when column has wipLimit', () => {
      const dataWithWIP: KanbanBoardData = {
        ...mockData,
        columns: [
          {
            ...mockData.columns[0],
            wipLimit: 3,
          },
        ],
      };

      const { getByText } = render(<KanbanBoard data={dataWithWIP} />);
      // Should show 2/3 (2 cards, limit of 3)
      expect(getByText(/2\/3/)).toBeTruthy();
    });

    it('shows over-limit warning when cards exceed WIP limit', () => {
      const dataWithOverLimit: KanbanBoardData = {
        ...mockData,
        columns: [
          {
            ...mockData.columns[0],
            wipLimit: 1, // Only 1 allowed, but has 2 cards
          },
        ],
      };

      const { getByText } = render(<KanbanBoard data={dataWithOverLimit} />);
      expect(getByText(/2\/1/)).toBeTruthy();
    });
  });

  describe('Card Features', () => {
    it('displays priority indicators for high priority cards', () => {
      const { getByLabelText } = render(<KanbanBoard data={mockData} />);
      // High priority card (Task 2) should have priority label
      const highPriorityCard = getByLabelText(/Card: Task 2, high priority/);
      expect(highPriorityCard).toBeTruthy();
    });

    it('shows due dates on cards', () => {
      const dataWithDueDates: KanbanBoardData = {
        ...mockData,
        columns: [
          {
            ...mockData.columns[0],
            cards: [
              {
                ...mockData.columns[0].cards[0],
                dueDate: new Date('2025-12-31'),
              },
            ],
          },
        ],
      };

      const { getByText } = render(<KanbanBoard data={dataWithDueDates} />);
      expect(getByText(/📅/)).toBeTruthy();
    });

    it('displays tags when present', () => {
      const dataWithTags: KanbanBoardData = {
        ...mockData,
        columns: [
          {
            ...mockData.columns[0],
            cards: [
              {
                ...mockData.columns[0].cards[0],
                tags: [
                  { id: 't1', label: 'Frontend', color: '#3B82F6' },
                  { id: 't2', label: 'Urgent', color: '#EF4444' },
                ],
              },
            ],
          },
        ],
      };

      const { getByText } = render(<KanbanBoard data={dataWithTags} mode="full" />);
      expect(getByText('Frontend')).toBeTruthy();
      expect(getByText('Urgent')).toBeTruthy();
    });

    it('shows assignee avatars', () => {
      const dataWithAssignees: KanbanBoardData = {
        ...mockData,
        columns: [
          {
            ...mockData.columns[0],
            cards: [
              {
                ...mockData.columns[0].cards[0],
                assignees: [
                  { id: 'u1', name: 'Alice Johnson' },
                  { id: 'u2', name: 'Bob Smith' },
                ],
              },
            ],
          },
        ],
      };

      const { getByText } = render(<KanbanBoard data={dataWithAssignees} />);
      // Should show initials
      expect(getByText('AJ')).toBeTruthy();
      expect(getByText('BS')).toBeTruthy();
    });

    it('displays checklist progress', () => {
      const dataWithChecklist: KanbanBoardData = {
        ...mockData,
        columns: [
          {
            ...mockData.columns[0],
            cards: [
              {
                ...mockData.columns[0].cards[0],
                checklistItems: 10,
                checklistCompleted: 7,
              },
            ],
          },
        ],
      };

      const { getByText } = render(<KanbanBoard data={dataWithChecklist} />);
      expect(getByText('7/10')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onCardPress when card is clicked', () => {
      const onCardPress = jest.fn();
      const { getByText } = render(
        <KanbanBoard data={mockData} onCardPress={onCardPress} />
      );

      fireEvent.press(getByText('Task 1'));
      expect(onCardPress).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'card-1', title: 'Task 1' }),
        expect.objectContaining({ id: 'col-1', title: 'To Do' })
      );
    });

    it('calls onColumnPress when column header is clicked', () => {
      const onColumnPress = jest.fn();
      const { getByText } = render(
        <KanbanBoard data={mockData} onColumnPress={onColumnPress} />
      );

      fireEvent.press(getByText('To Do'));
      expect(onColumnPress).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'col-1', title: 'To Do' })
      );
    });

    it('calls onExpandPress when expand button is clicked', () => {
      const onExpandPress = jest.fn();
      const { getByLabelText } = render(
        <KanbanBoard
          data={mockData}
          mode="mini"
          onExpandPress={onExpandPress}
        />
      );

      // Find and click expand button in ComponentHeader
      const expandButton = getByLabelText('Expand');
      fireEvent.press(expandButton);
      expect(onExpandPress).toHaveBeenCalled();
    });
  });

  describe('Modes', () => {
    it('renders in mini mode with compact layout', () => {
      const { root } = render(
        <KanbanBoard data={mockData} mode="mini" />
      );
      expect(root).toBeTruthy();
    });

    it('renders in preview mode', () => {
      const { root } = render(
        <KanbanBoard data={mockData} mode="preview" />
      );
      expect(root).toBeTruthy();
    });

    it('renders in full mode with all details', () => {
      const { root } = render(
        <KanbanBoard data={mockData} mode="full" />
      );
      expect(root).toBeTruthy();
    });
  });

  describe('Empty States', () => {
    it('shows empty message when column has no cards', () => {
      const { getByText } = render(<KanbanBoard data={mockData} />);
      expect(getByText('No cards')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has accessible labels for cards', () => {
      const { getByLabelText } = render(<KanbanBoard data={mockData} />);
      expect(getByLabelText(/Card: Task 1/)).toBeTruthy();
    });

    it('has accessible labels for columns', () => {
      const { getByLabelText } = render(<KanbanBoard data={mockData} />);
      expect(getByLabelText(/Column: To Do, 2 cards/)).toBeTruthy();
    });

    it('provides hints for interactive elements', () => {
      const { getByLabelText } = render(<KanbanBoard data={mockData} />);
      const card = getByLabelText(/Card: Task 1/);
      expect(card.props.accessibilityHint).toBe('Double tap to view card details');
    });
  });

  describe('Performance', () => {
    it('handles large number of cards efficiently', () => {
      const largeData: KanbanBoardData = {
        ...mockData,
        columns: [
          {
            id: 'large-col',
            title: 'Large Column',
            cards: Array.from({ length: 100 }, (_, i) => ({
              id: `card-${i}`,
              title: `Task ${i}`,
              description: `Description ${i}`,
            })),
          },
        ],
      };

      const { getAllByText } = render(<KanbanBoard data={largeData} />);
      expect(getAllByText(/Task \d+/).length).toBe(100);
    });
  });
});
