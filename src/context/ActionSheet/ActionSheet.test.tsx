import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { type PropsWithChildren } from 'react';
import { ActionSheetIOS, type ActionSheetIOSOptions, Button, Platform, Text } from 'react-native';

import { ActionSheetProvider } from './ActionSheet.provider';
import { type ActionSheetPressCallback } from './ActionSheet.types';
import { useActionSheet } from './useActionSheet';

describe('<ActionSheetProvider />', () => {
  function setOS(os: 'ios' | 'android' = 'ios') {
    Platform.OS = os;
  }

  function TestWrapper({ children }: PropsWithChildren) {
    return <BottomSheetModalProvider>{children}</BottomSheetModalProvider>;
  }

  function TestComponent({
    options,
    onActionPress,
  }: Readonly<{
    options: ActionSheetIOSOptions;
    onActionPress: ActionSheetPressCallback;
  }>) {
    const actionSheet = useActionSheet();

    return (
      <>
        <Text>Child</Text>
        <Button onPress={() => actionSheet.present(options, onActionPress)} title="Present" />
      </>
    );
  }

  beforeEach(() => {
    setOS('ios');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw if useActionSheet is not used within ActionSheetProvider', () => {
    expect(() => render(<TestComponent onActionPress={jest.fn()} options={{ options: [] }} />)).toThrow(
      'useActionSheet() must be used within <ActionSheetProvider />'
    );
  });

  it('should present the native ActionSheetIOS.showActionSheetWithOptions when Platform.OS=ios', () => {
    const spy = jest.spyOn(ActionSheetIOS, 'showActionSheetWithOptions').mockImplementation(() => null);

    setOS('ios');

    const options = { options: ['Option 1'] };
    const onActionPress = jest.fn();
    render(
      <ActionSheetProvider>
        <TestComponent onActionPress={onActionPress} options={{ options: ['Option 1'] }} />
      </ActionSheetProvider>,
      { wrapper: TestWrapper }
    );

    expect(screen.queryByText('Child')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Present' }));

    expect(spy).toHaveBeenCalledWith(options, onActionPress);
    spy.mockRestore();
  });

  it('should render the custom action sheet using bottom sheet when Platform.OS=android', async () => {
    jest.useFakeTimers();
    setOS('android');

    const onActionPress = jest.fn();

    render(
      <ActionSheetProvider>
        <TestComponent
          onActionPress={onActionPress}
          options={{
            title: 'Actions',
            message: 'My message',
            options: ['Option 1', 'Option 2', 'Option 3'],
            disabledButtonIndices: [1],
            cancelButtonIndex: 2,
          }}
        />
      </ActionSheetProvider>,
      { wrapper: TestWrapper }
    );

    expect(screen.queryByText('Child')).toBeOnTheScreen();

    expect(screen.queryByText('Actions')).not.toBeOnTheScreen();
    expect(screen.queryByText('My message')).not.toBeOnTheScreen();
    expect(screen.queryAllByRole('button', { name: /Option/ }).length).toBe(0);

    fireEvent.press(screen.getByRole('button', { name: 'PRESENT' }));

    expect(screen.queryByText('Actions')).toBeOnTheScreen();
    expect(screen.queryByText('My message')).toBeOnTheScreen();
    expect(screen.queryAllByRole('button', { name: /Option/ }).length).toBe(3);

    expect(screen.getByRole('button', { name: 'Option 2' })).toBeDisabled();

    fireEvent.press(screen.getByRole('button', { name: 'Option 3' }));
    expect(onActionPress).not.toHaveBeenCalled();

    fireEvent.press(screen.getByRole('button', { name: 'PRESENT' }));

    fireEvent.press(screen.getByRole('button', { name: 'Option 1' }));
    expect(onActionPress).toHaveBeenCalledWith(0);
  });
});
