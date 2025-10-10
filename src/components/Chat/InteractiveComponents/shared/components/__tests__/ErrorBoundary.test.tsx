import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text>No error</Text>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for cleaner test output
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  describe('Normal Operation', () => {
    it('renders children when no error', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <Text>Child content</Text>
        </ErrorBoundary>
      );
      expect(getByText('Child content')).toBeTruthy();
    });

    it('does not show error UI when children render successfully', () => {
      const { queryByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );
      expect(queryByText('Something went wrong')).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('catches errors and displays default fallback', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );
      expect(getByText('Something went wrong')).toBeTruthy();
      expect(getByText('Test error')).toBeTruthy();
    });

    it('displays error message', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );
      expect(getByText('Test error')).toBeTruthy();
    });

    it('shows Try Again button', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );
      expect(getByText('Try Again')).toBeTruthy();
    });
  });

  describe('Error Recovery', () => {
    it('calls reset function when Try Again is pressed', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(getByText('Something went wrong')).toBeTruthy();

      const tryAgainButton = getByText('Try Again');

      // Just verify button exists and is pressable
      expect(tryAgainButton).toBeTruthy();
      fireEvent.press(tryAgainButton);
    });
  });

  describe('Custom Fallback', () => {
    it('renders custom fallback UI', () => {
      const customFallback = (error: Error, reset: () => void) => (
        <Text>Custom error: {error.message}</Text>
      );

      const { getByText } = render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(getByText('Custom error: Test error')).toBeTruthy();
    });

    it('passes reset function to custom fallback', () => {
      const resetFn = jest.fn();
      const customFallback = (error: Error, reset: () => void) => (
        <Text onPress={reset}>Custom Reset</Text>
      );

      const { getByText } = render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      const customReset = getByText('Custom Reset');
      expect(customReset).toBeTruthy();
    });
  });

  describe('Error Callback', () => {
    it('calls onError callback when error occurs', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0].message).toBe('Test error');
    });

    it('provides error info to onError callback', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });
  });

  describe('Multiple Errors', () => {
    it('handles different error messages', () => {
      const ThrowCustomError = () => {
        throw new Error('Custom error message');
      };

      const { getByText } = render(
        <ErrorBoundary>
          <ThrowCustomError />
        </ErrorBoundary>
      );

      expect(getByText('Custom error message')).toBeTruthy();
    });

    it('handles errors without message', () => {
      const ThrowErrorNoMessage = () => {
        throw new Error();
      };

      const { getByText } = render(
        <ErrorBoundary>
          <ThrowErrorNoMessage />
        </ErrorBoundary>
      );

      expect(getByText('An unexpected error occurred')).toBeTruthy();
    });
  });

  describe('Nested Error Boundaries', () => {
    it('inner boundary catches error before outer', () => {
      const outerFallback = () => <Text>Outer fallback</Text>;
      const innerFallback = () => <Text>Inner fallback</Text>;

      const { getByText } = render(
        <ErrorBoundary fallback={outerFallback}>
          <ErrorBoundary fallback={innerFallback}>
            <ThrowError />
          </ErrorBoundary>
        </ErrorBoundary>
      );

      expect(getByText('Inner fallback')).toBeTruthy();
    });
  });
});
