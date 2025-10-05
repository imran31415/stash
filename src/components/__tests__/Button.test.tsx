import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

// Mock the theme hook
jest.mock('../../theme', () => ({
  useThemeColors: () => ({
    primary: '#007AFF',
    secondary: '#5856D6',
    textOnPrimary: '#FFFFFF',
  }),
}));

describe('Button', () => {
  describe('Rendering', () => {
    it('renders with title', () => {
      const { getByText } = render(
        <Button title="Click me" onPress={() => {}} />
      );
      expect(getByText('Click me')).toBeTruthy();
    });

    it('renders primary variant', () => {
      const { getByText } = render(
        <Button title="Primary" onPress={() => {}} variant="primary" />
      );
      expect(getByText('Primary')).toBeTruthy();
    });

    it('renders secondary variant', () => {
      const { getByText } = render(
        <Button title="Secondary" onPress={() => {}} variant="secondary" />
      );
      expect(getByText('Secondary')).toBeTruthy();
    });

    it('renders outline variant', () => {
      const { getByText } = render(
        <Button title="Outline" onPress={() => {}} variant="outline" />
      );
      expect(getByText('Outline')).toBeTruthy();
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      const { getByText } = render(
        <Button title="Small" onPress={() => {}} size="small" />
      );
      expect(getByText('Small')).toBeTruthy();
    });

    it('renders medium size', () => {
      const { getByText } = render(
        <Button title="Medium" onPress={() => {}} size="medium" />
      );
      expect(getByText('Medium')).toBeTruthy();
    });

    it('renders large size', () => {
      const { getByText } = render(
        <Button title="Large" onPress={() => {}} size="large" />
      );
      expect(getByText('Large')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onPress when clicked', () => {
      const onPressMock = jest.fn();
      const { getByText } = render(
        <Button title="Click" onPress={onPressMock} />
      );
      fireEvent.press(getByText('Click'));
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('supports disabled prop', () => {
      const onPressMock = jest.fn();
      const { getByText } = render(
        <Button
          title="Disabled"
          onPress={onPressMock}
          disabled={true}
        />
      );
      expect(getByText('Disabled')).toBeTruthy();
    });

    it('supports testID prop', () => {
      const { getByTestId } = render(
        <Button
          title="Test"
          onPress={() => {}}
          testID="test-button"
        />
      );
      expect(getByTestId('test-button')).toBeTruthy();
    });
  });
});
