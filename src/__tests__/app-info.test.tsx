import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';

import AppInfoScreen from '@/app/(authenticated)/app-info';
import { useToaster } from '@/hooks/useToaster';
import { LinkingUtils } from '@/utils/linking';

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

jest.mock('expo-router', () => {
  const { View, Text } = jest.requireActual('react-native');
  return {
    Stack: {
      Screen: ({ options }: { options: { title: string } }) => (
        <View accessibilityRole="header" accessible>
          <Text>{options.title}</Text>
        </View>
      ),
    },
  };
});

jest.mock('@/hooks/useToaster', () => ({
  useToaster: jest.fn().mockReturnValue({}),
}));

describe('App info screen', () => {
  const safeOpenUrlSpy = jest.spyOn(LinkingUtils, 'safeOpenURL');
  const setStringAsyncSpy = jest.spyOn(Clipboard, 'setStringAsync');
  const mockToast = jest.fn();

  beforeEach(() => {
    (useToaster as jest.Mock).mockReturnValue({ toast: mockToast });
    setStringAsyncSpy.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should display basic app information', () => {
    render(<AppInfoScreen />);

    expect(within(screen.getByRole('header')).queryByText('Informacije')).toBeOnTheScreen();

    expect(screen.queryByText('O aplikaciji')).toBeOnTheScreen();
    expect(screen.queryByText('Aplikacija Petka je', { exact: false })).toBeOnTheScreen();
    expect(screen.queryByRole('link', { name: '"Wordle"' })).toBeOnTheScreen();

    expect(screen.queryByText('O razvijalcu')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Najdi me na GitHub-u' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Poveživa se na LinkedIn-u' })).toBeOnTheScreen();

    expect(screen.queryByText('Tehnične podrobnosti')).toBeOnTheScreen();
    expect(screen.queryByText('Verzija aplikacije')).toBeOnTheScreen();
    expect(screen.queryByText('Verzija SDK')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Kopiraj vrednosti' })).toBeOnTheScreen();
  });

  it('should open wikipedia Wordle page on wordle link press', () => {
    render(<AppInfoScreen />);

    fireEvent.press(screen.getByRole('link', { name: '"Wordle"' }));

    expect(safeOpenUrlSpy).toHaveBeenCalledWith('https://en.wikipedia.org/wiki/Wordle');
  });

  it('should open github page on "Connect on GitHub" button press', () => {
    render(<AppInfoScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Najdi me na GitHub-u' }));

    expect(safeOpenUrlSpy).toHaveBeenCalledWith('https://github.com/zigcccc/');
  });

  it('should open linkedin page on "Connect on LinkedIn" button press', () => {
    render(<AppInfoScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Poveživa se na LinkedIn-u' }));

    expect(safeOpenUrlSpy).toHaveBeenCalledWith('https://www.linkedin.com/in/zigakrasovec/');
  });

  it('should copy values to clipboard and display success toast on "Copy version values" button press', async () => {
    render(<AppInfoScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Kopiraj vrednosti' }));

    expect(setStringAsyncSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Kopirano', { intent: 'success' });
    });
  });
});
