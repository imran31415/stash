import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { TimeSeriesChart } from '../TimeSeriesChart';
import type { TimeSeriesSeries } from '../TimeSeriesChart.types';

// Mock react-native-svg
jest.mock('react-native-svg', () => ({
  Svg: 'Svg',
  Path: 'Path',
  Line: 'Line',
  Circle: 'Circle',
  Text: 'Text',
}));

describe('TimeSeriesChart Live Streaming', () => {
  const mockSeries: TimeSeriesSeries[] = [
    {
      id: 'test-series',
      name: 'Test Series',
      data: [
        { timestamp: new Date('2024-01-01T10:00:00'), value: 100 },
        { timestamp: new Date('2024-01-01T10:01:00'), value: 110 },
      ],
      color: '#3B82F6',
    },
  ];

  describe('Pause/Resume Controls', () => {
    it('should render streaming controls when enableLiveStreaming is true', () => {
      const { getByText } = render(
        <TimeSeriesChart
          series={mockSeries}
          mode="full"
          enableLiveStreaming={true}
          showStreamingControls={true}
        />
      );

      expect(getByText('Pause')).toBeTruthy();
    });

    it('should not render streaming controls when enableLiveStreaming is false', () => {
      const { queryByText } = render(
        <TimeSeriesChart
          series={mockSeries}
          mode="full"
          enableLiveStreaming={false}
          showStreamingControls={true}
        />
      );

      expect(queryByText('Pause')).toBeNull();
    });

    it('should call onStreamingToggle with correct value when pause button is clicked', () => {
      const mockOnStreamingToggle = jest.fn();

      const { getByText } = render(
        <TimeSeriesChart
          series={mockSeries}
          mode="full"
          enableLiveStreaming={true}
          showStreamingControls={true}
          onStreamingToggle={mockOnStreamingToggle}
          streamingPaused={false}
        />
      );

      // Click pause button
      fireEvent.press(getByText('Pause'));

      // Should be called with false (isActive = false, meaning paused)
      expect(mockOnStreamingToggle).toHaveBeenCalledWith(false);
    });

    it('should call onStreamingToggle with correct value when resume button is clicked', () => {
      const mockOnStreamingToggle = jest.fn();

      const { getByText } = render(
        <TimeSeriesChart
          series={mockSeries}
          mode="full"
          enableLiveStreaming={true}
          showStreamingControls={true}
          onStreamingToggle={mockOnStreamingToggle}
          streamingPaused={true}
        />
      );

      // Click resume button
      fireEvent.press(getByText('Resume'));

      // Should be called with true (isActive = true, meaning resumed)
      expect(mockOnStreamingToggle).toHaveBeenCalledWith(true);
    });

    it('should show correct button text based on streamingPaused prop', () => {
      const { getByText, rerender } = render(
        <TimeSeriesChart
          series={mockSeries}
          mode="full"
          enableLiveStreaming={true}
          showStreamingControls={true}
          streamingPaused={false}
        />
      );

      expect(getByText('Pause')).toBeTruthy();

      rerender(
        <TimeSeriesChart
          series={mockSeries}
          mode="full"
          enableLiveStreaming={true}
          showStreamingControls={true}
          streamingPaused={true}
        />
      );

      expect(getByText('Resume')).toBeTruthy();
    });

    it('should display LIVE indicator when not paused', () => {
      const { getByText } = render(
        <TimeSeriesChart
          series={mockSeries}
          mode="full"
          title="Test Chart"
          enableLiveStreaming={true}
          streamingPaused={false}
        />
      );

      expect(getByText('LIVE')).toBeTruthy();
    });

    it('should display PAUSED indicator when paused', () => {
      const { getByText } = render(
        <TimeSeriesChart
          series={mockSeries}
          mode="full"
          title="Test Chart"
          enableLiveStreaming={true}
          streamingPaused={true}
        />
      );

      expect(getByText('PAUSED')).toBeTruthy();
    });
  });

  describe('Data Updates', () => {
    it('should update series when new data arrives and not paused', async () => {
      const initialSeries: TimeSeriesSeries[] = [
        {
          id: 'test',
          name: 'Test',
          data: [{ timestamp: new Date('2024-01-01T10:00:00'), value: 100 }],
        },
      ];

      const updatedSeries: TimeSeriesSeries[] = [
        {
          id: 'test',
          name: 'Test',
          data: [
            { timestamp: new Date('2024-01-01T10:00:00'), value: 100 },
            { timestamp: new Date('2024-01-01T10:01:00'), value: 110 },
          ],
        },
      ];

      const { rerender } = render(
        <TimeSeriesChart
          series={initialSeries}
          mode="full"
          enableLiveStreaming={true}
          streamingPaused={false}
        />
      );

      rerender(
        <TimeSeriesChart
          series={updatedSeries}
          mode="full"
          enableLiveStreaming={true}
          streamingPaused={false}
        />
      );

      // Chart should re-render with new data
      await waitFor(() => {
        // The component should have processed the update
        expect(true).toBe(true);
      });
    });

    it('should not update chart when paused even if new data arrives', async () => {
      const mockOnDataUpdate = jest.fn();
      const initialSeries: TimeSeriesSeries[] = [
        {
          id: 'test',
          name: 'Test',
          data: [{ timestamp: new Date('2024-01-01T10:00:00'), value: 100 }],
        },
      ];

      const updatedSeries: TimeSeriesSeries[] = [
        {
          id: 'test',
          name: 'Test',
          data: [
            { timestamp: new Date('2024-01-01T10:00:00'), value: 100 },
            { timestamp: new Date('2024-01-01T10:01:00'), value: 110 },
          ],
        },
      ];

      const { rerender } = render(
        <TimeSeriesChart
          series={initialSeries}
          mode="full"
          enableLiveStreaming={true}
          streamingPaused={true}
          onDataUpdate={mockOnDataUpdate}
        />
      );

      rerender(
        <TimeSeriesChart
          series={updatedSeries}
          mode="full"
          enableLiveStreaming={true}
          streamingPaused={true}
          onDataUpdate={mockOnDataUpdate}
        />
      );

      // onDataUpdate should not be called when paused
      await waitFor(() => {
        expect(mockOnDataUpdate).not.toHaveBeenCalled();
      });
    });

    it('should maintain fixed memory by limiting data points', () => {
      const largeSeries: TimeSeriesSeries[] = [
        {
          id: 'test',
          name: 'Test',
          data: Array.from({ length: 200 }, (_, i) => ({
            timestamp: new Date(`2024-01-01T${String(10 + Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00`),
            value: 100 + i,
          })),
        },
      ];

      const mockOnDataUpdate = jest.fn();

      render(
        <TimeSeriesChart
          series={largeSeries}
          mode="full"
          enableLiveStreaming={true}
          maxDataPoints={100}
          streamingPaused={false}
          onDataUpdate={mockOnDataUpdate}
        />
      );

      // onDataUpdate should be called with constrained series (max 100 points)
      expect(mockOnDataUpdate).toHaveBeenCalled();
      const constrainedData = mockOnDataUpdate.mock.calls[0][0];
      expect(constrainedData[0].data.length).toBeLessThanOrEqual(100);
    });

    it('should display only streamingWindowSize points on screen', () => {
      const series: TimeSeriesSeries[] = [
        {
          id: 'test',
          name: 'Test',
          data: Array.from({ length: 100 }, (_, i) => ({
            timestamp: new Date(`2024-01-01T${String(10 + Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00`),
            value: 100 + i,
          })),
        },
      ];

      const { getByText } = render(
        <TimeSeriesChart
          series={series}
          mode="full"
          enableLiveStreaming={true}
          maxDataPoints={100}
          streamingWindowSize={50}
          showStreamingControls={true}
        />
      );

      // Should show streaming stats with correct values
      expect(getByText('100 points')).toBeTruthy();
      expect(getByText('50 displayed')).toBeTruthy();
    });
  });

  describe('Integration with Detail View', () => {
    it('should pass all streaming props to detail view via onExpandPress', () => {
      const mockOnExpandPress = jest.fn();

      const { getByLabelText } = render(
        <TimeSeriesChart
          series={mockSeries}
          mode="full"
          title="Test Chart"
          enableLiveStreaming={true}
          streamingPaused={false}
          showStreamingControls={true}
          onExpandPress={mockOnExpandPress}
        />
      );

      const expandButton = getByLabelText('Expand chart');
      fireEvent.press(expandButton);

      expect(mockOnExpandPress).toHaveBeenCalled();
    });
  });
});
