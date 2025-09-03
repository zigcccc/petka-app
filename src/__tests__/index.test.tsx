import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import HomeScreen from '@/app/(authenticated)';
import { useDailyPuzzlePresenceList } from '@/hooks/presence';
import { useGameplaySettings } from '@/hooks/useGameplaySettings';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: jest.fn(),
  useFocusEffect: jest.fn().mockImplementation((cb) => cb()),
}));

jest.mock('@/hooks/useGameplaySettings', () => ({
  ...jest.requireActual('@/hooks/useGameplaySettings'),
  useGameplaySettings: jest.fn().mockReturnValue({}),
}));

jest.mock('@/hooks/presence', () => ({
  ...jest.requireActual('@/hooks/presence'),
  useDailyPuzzlePresenceList: jest.fn().mockReturnValue([]),
}));

describe('Home screen', () => {
  const useRouterSpy = useRouter as jest.Mock;
  const useGameplaySettingsSpy = useGameplaySettings as jest.Mock;
  const useDailyPuzzlePresenceListSpy = useDailyPuzzlePresenceList as jest.Mock;

  const mockNavigate = jest.fn();
  const mockSetDefaultSettings = jest.fn();

  beforeEach(() => {
    useRouterSpy.mockReturnValue({ navigate: mockNavigate });
    useGameplaySettingsSpy.mockReturnValue({ isUninitialised: false, setDefaultSettings: mockSetDefaultSettings });
    useDailyPuzzlePresenceListSpy.mockReturnValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render home screen with action buttons', () => {
    render(<HomeScreen />);

    fireEvent.press(screen.getByRole('button', { name: /Igraj/ }));
    expect(mockNavigate).toHaveBeenNthCalledWith(1, '/play/daily-puzzle');

    fireEvent.press(screen.getByRole('button', { name: /Trening/ }));
    expect(mockNavigate).toHaveBeenNthCalledWith(2, '/play/training-puzzle');

    fireEvent.press(screen.getByRole('button', { name: /Lestvica/ }));
    expect(mockNavigate).toHaveBeenNthCalledWith(3, '/leaderboards/weekly-leaderboard');

    fireEvent.press(screen.getByRole('button', { name: /icon-info/ }));
    expect(mockNavigate).toHaveBeenNthCalledWith(4, '/app-info');

    fireEvent.press(screen.getByRole('button', { name: /icon-history/ }));
    expect(mockNavigate).toHaveBeenNthCalledWith(5, '/history/daily-challenges');

    fireEvent.press(screen.getByRole('button', { name: /icon-gear/ }));
    expect(mockNavigate).toHaveBeenNthCalledWith(6, '/settings');
  });

  it('should not present bottom sheet for configuring gameplay settings if settings are already initialised', async () => {
    useGameplaySettingsSpy.mockReturnValue({ isUninitialised: false, setDefaultSettings: mockSetDefaultSettings });

    render(<HomeScreen />);

    await waitFor(() => {
      expect(
        screen.queryByText('Na tej napravi še nisi nastavil/a svojih preferenc glede reševanja ugank.')
      ).not.toBeOnTheScreen();
    });
  });

  it('should present bottom sheet for configuring gameplay settings if settings are uninitialised and redirect to settings page on "Prilagodi nastavitve" button press', async () => {
    useGameplaySettingsSpy.mockReturnValue({ isUninitialised: true, setDefaultSettings: mockSetDefaultSettings });

    render(<HomeScreen />);

    await waitFor(() => {
      expect(
        screen.queryByText('Na tej napravi še nisi nastavil/a svojih preferenc glede reševanja ugank.')
      ).toBeOnTheScreen();
    });

    expect(screen.queryByText('🛠️ Prilagodi nastavitve reševanja')).toBeOnTheScreen();
    expect(
      screen.queryByText('Za bolj prilagojeno in lažje reševanje lahko izbirate med naslednjimi nastavitvami:')
    ).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Prilagodi nastavitve' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Uporabi privzete nastavitve' })).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Prilagodi nastavitve' }));

    expect(mockNavigate).toHaveBeenCalledWith('/settings');
    expect(mockSetDefaultSettings).toHaveBeenCalled();
  });

  it('should present bottom sheet for configuring gameplay settings if settings are uninitialised and dismiess the sheet on "Uporabi privzete nastavitve" button press', async () => {
    useGameplaySettingsSpy.mockReturnValue({ isUninitialised: true, setDefaultSettings: mockSetDefaultSettings });

    render(<HomeScreen />);

    await waitFor(() => {
      expect(
        screen.queryByText('Na tej napravi še nisi nastavil/a svojih preferenc glede reševanja ugank.')
      ).toBeOnTheScreen();
    });

    expect(screen.queryByText('🛠️ Prilagodi nastavitve reševanja')).toBeOnTheScreen();
    expect(
      screen.queryByText('Za bolj prilagojeno in lažje reševanje lahko izbirate med naslednjimi nastavitvami:')
    ).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Prilagodi nastavitve' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Uporabi privzete nastavitve' })).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Uporabi privzete nastavitve' }));

    expect(mockNavigate).not.toHaveBeenCalledWith('/settings');
    expect(mockSetDefaultSettings).toHaveBeenCalled();
  });

  it('should render currently online users playing daily puzzles if there are any', () => {
    useDailyPuzzlePresenceListSpy.mockReturnValue([{ userId: 'onlineUserId', online: true }]);
    render(<HomeScreen />);

    expect(screen.queryByText('1 uporabnik igra dnevni izziv 🧠')).toBeOnTheScreen();
  });

  it.each([undefined, [], [{ userId: 'onlineUserId', online: false }]])(
    'should not render currenty online users playing daily puzzle if there are not any (users=%s)',
    (onlineUsers) => {
      useDailyPuzzlePresenceListSpy.mockReturnValue(onlineUsers);

      render(<HomeScreen />);

      expect(screen.queryByText('dnevni izziv 🧠', { exact: false })).not.toBeOnTheScreen();
    }
  );
});
