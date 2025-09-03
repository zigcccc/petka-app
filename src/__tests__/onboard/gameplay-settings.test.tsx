import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import GameplaySettingsScreen from '@/app/onboard/gameplay-settings';
import { gameplayKeyboardType, useGameplaySettings } from '@/hooks/useGameplaySettings';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useGameplaySettings', () => ({
  ...jest.requireActual('@/hooks/useGameplaySettings'),
  useGameplaySettings: jest.fn(),
}));

describe('Gameplay Settings Screen', () => {
  const useRouterSpy = useRouter as jest.Mock;
  const useGameplaySettingsSpy = useGameplaySettings as jest.Mock;

  const mockUpdateSettings = jest.fn();
  const mockSetDefaultSettings = jest.fn();
  const mockReplace = jest.fn();

  beforeEach(() => {
    useRouterSpy.mockReturnValue({ replace: mockReplace });
    useGameplaySettingsSpy.mockReturnValue({
      autosubmitPuzzleAttempt: true,
      keyboardType: gameplayKeyboardType.Enum.qwerty,
      updateSettings: mockUpdateSettings,
      isUninitialised: true,
      setDefaultSettings: mockSetDefaultSettings,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render create account screen elements', () => {
    render(<GameplaySettingsScreen />);

    expect(screen.queryByText('Preden začneš...')).toBeOnTheScreen();
    expect(screen.queryByText('Izberi svoje preference glede načina igranja.')).toBeOnTheScreen();

    expect(
      screen.queryByText(/Za bolj prilagojeno in lažje reševanje lahko izbirate med naslednjimi nastavitvami:/)
    ).toBeOnTheScreen();
    expect(screen.queryByText(/- razporeditev tipkovnice \(qwerty ali abcde\)/)).toBeOnTheScreen();
    expect(screen.queryByText(/- avtomatsko preverjanje besed ob vnosu zadnje črke/)).toBeOnTheScreen();

    expect(screen.queryByRole('switch', { name: /Avtomatsko preveri besedo/ })).toBeOnTheScreen();
    expect(screen.queryByRole('radio', { name: /QWERTY tipkovnica/ })).toBeOnTheScreen();
    expect(screen.queryByRole('radio', { name: /ABCDE tipkovnica/ })).toBeOnTheScreen();

    expect(screen.queryByText('Nastavitve lahko spremeniš kadarkoli')).toBeOnTheScreen();
    expect(
      screen.queryByText(
        'V nastavitvah aplikacije lahko kadarkoli posodobiš svoje preference, tudi ko jih boš enkrat potrdil/a na tem zaslonu.'
      )
    ).toBeOnTheScreen();

    expect(screen.queryByRole('button', { name: 'Potrdi preference' })).toBeOnTheScreen();
  });

  it('should update gameplay setting on interaction with "Avtomatsko preveri besedo" switch', () => {
    render(<GameplaySettingsScreen />);

    fireEvent(screen.getByRole('switch', { name: /Avtomatsko preveri besedo/ }), 'valueChange', true);

    expect(mockUpdateSettings).toHaveBeenCalledWith({ autosubmitPuzzleAttempt: true });
  });

  it.each([
    { radioButton: 'QWERTY tipkovnica', keyboardType: gameplayKeyboardType.Enum.qwerty },
    { radioButton: 'ABCDE tipkovnica', keyboardType: gameplayKeyboardType.Enum.abcde },
  ])('should update gameplay setting on "$radioButton" radio button press', ({ radioButton, keyboardType }) => {
    render(<GameplaySettingsScreen />);

    fireEvent.press(screen.getByRole('radio', { name: radioButton }));

    expect(mockUpdateSettings).toHaveBeenCalledWith({ keyboardType });
  });

  it('should set the default settings and navigate to authenticated app layout on "Potrdi preference" button press when settings are not initialised', async () => {
    useGameplaySettingsSpy.mockReturnValue({ isUninitialised: true, setDefaultSettings: mockSetDefaultSettings });

    render(<GameplaySettingsScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Potrdi preference' }));

    await waitFor(() => {
      expect(mockSetDefaultSettings).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(authenticated)');
    });
  });

  it('should navigate to authenticated app layout on "Potrdi preference" button press without setting the default settings when settings are initialised', async () => {
    useGameplaySettingsSpy.mockReturnValue({ isUninitialised: false, setDefaultSettings: mockSetDefaultSettings });

    render(<GameplaySettingsScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Potrdi preference' }));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(authenticated)');
    });

    expect(mockSetDefaultSettings).not.toHaveBeenCalled();
  });
});
