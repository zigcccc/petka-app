import { render, screen, fireEvent, within, renderHook } from '@testing-library/react-native';
import React from 'react';

import { RadioInput } from './RadioInput';
import { useRadioInputContext, RadioInputContext } from './RadioInput.context';
import { type RadioInputContextProps } from './RadioInput.types';

describe('RadioInput', () => {
  it('renders all items with separators between them', () => {
    render(
      <RadioInput onChange={jest.fn()} value="first">
        <RadioInput.Item label="First" value="first" />
        <RadioInput.Item label="Second" value="second" />
        <RadioInput.Item label="Third" value="third" />
      </RadioInput>
    );

    // All labels render
    expect(screen.getByText('First')).toBeOnTheScreen();
    expect(screen.getByText('Second')).toBeOnTheScreen();
    expect(screen.getByText('Third')).toBeOnTheScreen();

    // Separators exist between items
    expect(screen.getByTestId('radio-input-separator--0')).toBeOnTheScreen();
    expect(screen.getByTestId('radio-input-separator--1')).toBeOnTheScreen();
  });

  it('marks the selected item with a check icon and semibold text', () => {
    render(
      <RadioInput onChange={jest.fn()} value="first">
        <RadioInput.Item label="First" value="first" />
        <RadioInput.Item label="Second" value="second" />
      </RadioInput>
    );

    // Selected state is accessible
    expect(screen.getByRole('radio', { name: 'First' }).props.accessibilityState.selected).toBe(true);
    expect(screen.getByRole('radio', { name: 'Second' }).props.accessibilityState.selected).toBe(false);

    // Check icon exists for selected
    expect(
      within(screen.getByRole('radio', { name: 'First' })).getByTestId('radio-input--item--check-icon')
    ).toBeOnTheScreen();
  });

  it('calls onChange with correct value when item is pressed', () => {
    const handleChange = jest.fn();

    render(
      <RadioInput onChange={handleChange} value="first">
        <RadioInput.Item label="First" value="first" />
        <RadioInput.Item label="Second" value="second" />
      </RadioInput>
    );

    fireEvent.press(screen.getByRole('radio', { name: 'Second' }));

    expect(handleChange).toHaveBeenCalledWith('second');
  });

  it('updates selection visually when value changes', () => {
    const { rerender } = render(
      <RadioInput onChange={jest.fn()} value="first">
        <RadioInput.Item label="First" value="first" />
        <RadioInput.Item label="Second" value="second" />
      </RadioInput>
    );

    // Initially first is selected
    expect(screen.getByRole('radio', { name: 'First' }).props.accessibilityState.selected).toBe(true);

    // Change selection
    rerender(
      <RadioInput onChange={jest.fn()} value="second">
        <RadioInput.Item label="First" value="first" />
        <RadioInput.Item label="Second" value="second" />
      </RadioInput>
    );

    // Now second is selected
    const second = screen.getByRole('radio', { name: 'Second' });
    expect(second.props.accessibilityState.selected).toBe(true);
    expect(within(second).getByTestId('radio-input--item--check-icon')).toBeOnTheScreen();
  });
});

describe('useRadioInputContext', () => {
  it('returns the context value when used inside the provider', () => {
    const mockContext: RadioInputContextProps<string> = {
      value: 'test',
      onChange: jest.fn(),
    };

    const { result } = renderHook(() => useRadioInputContext(), {
      wrapper: ({ children }) => (
        <RadioInputContext.Provider value={mockContext}>{children}</RadioInputContext.Provider>
      ),
    });

    expect(result.current).toBe(mockContext);
  });

  it('throws an error when used outside the provider', () => {
    expect(() => {
      renderHook(() => useRadioInputContext());
    }).toThrow('useRadioInputContext hook must be used inside of the <RadioInput /> component.');
  });
});
