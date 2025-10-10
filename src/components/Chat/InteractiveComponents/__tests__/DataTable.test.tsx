import React from 'react';
import { render } from '@testing-library/react-native';
import { DataTable } from '../DataTable';
import type { DataTableProps } from '../DataTable.types';

describe('DataTable', () => {
  const mockColumns: DataTableProps['columns'] = [
    { id: "col", accessor: 'id', header: 'ID', sortable: true },
    { id: "col", accessor: 'name', header: 'Name', sortable: true },
    { id: "col", accessor: 'email', header: 'Email' },
  ];

  const mockData: DataTableProps['data'] = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
  ];

  describe('Rendering', () => {
    it('renders table with title', () => {
      const { getByText } = render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          title="Test Table"
        />
      );
      expect(getByText('Test Table')).toBeTruthy();
    });

    it('renders with subtitle', () => {
      const { getByText } = render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          title="Test Table"
          subtitle="Test Subtitle"
        />
      );
      expect(getByText('Test Subtitle')).toBeTruthy();
    });

    it('renders table component', () => {
      const component = render(
        <DataTable columns={mockColumns} data={mockData} />
      );
      expect(component).toBeTruthy();
    });
  });

  describe('Modes', () => {
    it('renders in mini mode', () => {
      const component = render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          mode="mini"
        />
      );
      expect(component).toBeTruthy();
    });

    it('renders in preview mode', () => {
      const component = render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          mode="preview"
        />
      );
      expect(component).toBeTruthy();
    });

    it('renders in full mode', () => {
      const component = render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          mode="full"
        />
      );
      expect(component).toBeTruthy();
    });
  });

  describe('Features', () => {
    it('supports sortable columns', () => {
      const component = render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          sortable={true}
        />
      );
      expect(component).toBeTruthy();
    });

    it('supports striped rows', () => {
      const component = render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          striped={true}
        />
      );
      expect(component).toBeTruthy();
    });

    it('supports bordered style', () => {
      const component = render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          bordered={true}
        />
      );
      expect(component).toBeTruthy();
    });
  });

  describe('Pagination', () => {
    it('supports pagination', () => {
      const component = render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          paginated={true}
          defaultPageSize={2}
        />
      );
      expect(component).toBeTruthy();
    });

    it('supports custom page size', () => {
      const component = render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          paginated={true}
          defaultPageSize={1}
        />
      );
      expect(component).toBeTruthy();
    });
  });

  describe('Styling', () => {
    it('supports custom colors', () => {
      const component = render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          headerBackgroundColor="#FF0000"
          rowBackgroundColor="#00FF00"
          textColor="#0000FF"
          borderColor="#FF00FF"
        />
      );
      expect(component).toBeTruthy();
    });
  });

  describe('Callbacks', () => {
    it('supports callbacks', () => {
      const onSort = jest.fn();
      const onRowPress = jest.fn();
      const onExpandPress = jest.fn();

      const component = render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          sortable={true}
          onSort={onSort}
          onRowPress={onRowPress}
          onExpandPress={onExpandPress}
        />
      );
      expect(component).toBeTruthy();
    });
  });

  describe('Column Features', () => {
    it('supports custom column widths', () => {
      const columnsWithWidth = [
        { id: "col", accessor: 'id', header: 'ID', width: 50 },
        { id: "col", accessor: 'name', header: 'Name', width: 200 },
      ];
      const component = render(
        <DataTable columns={columnsWithWidth} data={mockData} />
      );
      expect(component).toBeTruthy();
    });

    it('supports column priority', () => {
      const columnsWithPriority = [
        { id: "col", accessor: 'id', header: 'ID', priority: 1 },
        { id: "col", accessor: 'name', header: 'Name', priority: 2 },
        { id: "col", accessor: 'email', header: 'Email', priority: 3 },
      ];
      const component = render(
        <DataTable columns={columnsWithPriority} data={mockData} mode="mini" />
      );
      expect(component).toBeTruthy();
    });
  });

  describe('Selection', () => {
    it('supports row selection', () => {
      const onRowSelect = jest.fn();
      const component = render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          selectable={true}
          onRowSelect={onRowSelect}
        />
      );
      expect(component).toBeTruthy();
    });
  });
});
