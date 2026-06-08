import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';
import { Alert, type AlertButton, Button, Platform, Text } from 'react-native';

import { PromptProvider } from './Prompt.provider';
import { usePrompt } from './usePrompt';

jest.mock('@gorhom/bottom-sheet', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ...require('@gorhom/bottom-sheet/mock'),
}));

describe('<PromptProvider />', () => {
  function setOS(os: 'ios' | 'android' = 'ios') {
    Platform.OS = os;
  }

  function TestWrapper({ children }: PropsWithChildren) {
    return <BottomSheetModalProvider>{children}</BottomSheetModalProvider>;
  }

  function TestComponent({
    title = 'Prompt title',
    message,
    buttons,
  }: Readonly<{
    title?: string;
    message?: string;
    buttons?: AlertButton[];
  }>) {
    const prompt = usePrompt();

    return (
      <>
        <Text>Child</Text>
        <Button onPress={() => prompt(title, message, buttons)} title="Present" />
      </>
    );
  }

  beforeEach(() => {
    setOS('ios');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw if usePrompt is not used within PromptProvider', async () => {
    expect(async () => await render(<TestComponent />)).rejects.toThrow(
      'usePrompt() must be used within <PromptProvider /> component.'
    );
  });

  it('should present the native Alert.prompt when Platform.OS=ios', async () => {
    const spy = jest.spyOn(Alert, 'prompt').mockImplementation(() => null);

    setOS('ios');

    const buttons: AlertButton[] = [{ text: 'Press me', isPreferred: true, style: 'destructive' }];

    await render(
      <PromptProvider>
        <TestComponent buttons={buttons} message="iOS Message" title="iOS Title" />
      </PromptProvider>,
      { wrapper: TestWrapper }
    );

    expect(screen.queryByText('Child')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Present' }));

    expect(spy).toHaveBeenCalledWith('iOS Title', 'iOS Message', buttons);
    spy.mockRestore();
  });

  it('should render the custom action sheet using bottom sheet when Platform.OS=android', async () => {
    jest.useFakeTimers();
    setOS('android');

    const mockOnDelete = jest.fn();
    const mockOnConfirm = jest.fn();

    await render(
      <PromptProvider>
        <TestComponent
          buttons={[
            { style: 'cancel', text: 'Prompt - Cancel' },
            { style: 'destructive', text: 'Prompt - Delete', onPress: mockOnDelete },
            { style: 'default', text: 'Prompt - Confirm', isPreferred: true, onPress: mockOnConfirm },
          ]}
          message="Android message"
          title="Android title"
        />
      </PromptProvider>,
      { wrapper: TestWrapper }
    );

    expect(screen.queryByText('Child')).toBeOnTheScreen();

    expect(screen.queryByText('Android title')).not.toBeOnTheScreen();
    expect(screen.queryByText('Android message')).not.toBeOnTheScreen();
    expect(screen.queryAllByRole('button', { name: /Prompt -/ }).length).toBe(0);

    await fireEvent.press(screen.getByRole('button', { name: 'PRESENT' }));

    await waitFor(() => {
      expect(screen.queryByText('Android title')).toBeOnTheScreen();
    });
    expect(screen.queryByText('Android message')).toBeOnTheScreen();
    expect(screen.queryAllByRole('button', { name: /Prompt -/ }).length).toBe(3);

    await fireEvent.changeText(screen.getByTestId('prompt-input'), 'Input');

    await fireEvent.press(screen.getByRole('button', { name: 'Prompt - Cancel' }));
    expect(mockOnConfirm).not.toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('button', { name: 'PRESENT' }));

    await fireEvent.press(screen.getByRole('button', { name: 'Prompt - Delete' }));
    expect(mockOnDelete).toHaveBeenCalledWith('Input');

    await fireEvent.press(screen.getByRole('button', { name: 'Prompt - Confirm' }));
    expect(mockOnConfirm).toHaveBeenCalledWith('Input');
  });
});
