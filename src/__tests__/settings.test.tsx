import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import * as Device from 'expo-device';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { type ComponentProps } from 'react';
import { Text as MockText, View as MockView } from 'react-native';

import SettingsScreen from '@/app/(authenticated)/settings';
import { type GenericStackScreen } from '@/components/navigation';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToaster } from '@/hooks/useToaster';
import { useUser } from '@/hooks/useUser';
import { testUser1 } from '@/tests/fixtures/users';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: jest.fn(),
}));

jest.mock('@/components/navigation', () => ({
  ...jest.requireActual('@/components/navigation'),
  GenericStackScreen: ({ children, title }: ComponentProps<typeof GenericStackScreen>) => (
    <MockView>
      <MockText>{title}</MockText>
      {children}
    </MockView>
  ),
}));

jest.mock('@/hooks/useToaster', () => ({
  ...jest.requireActual('@/hooks/useToaster'),
  useToaster: jest.fn(),
}));

jest.mock('@/hooks/useUser', () => ({
  ...jest.requireActual('@/hooks/useUser'),
  useUser: jest.fn(),
}));

jest.mock('@/hooks/usePushNotifications', () => ({
  ...jest.requireActual('@/hooks/usePushNotifications'),
  usePushNotifications: jest.fn(),
}));

describe('Settings screen', () => {
  const useRouterSpy = useRouter as jest.Mock;
  const useToasterSpy = useToaster as jest.Mock;
  const useUserSpy = useUser as jest.Mock;
  const usePushNotificationsSpy = usePushNotifications as jest.Mock;
  const clipboardSetStringAsyncSpy = jest.spyOn(Clipboard, 'setStringAsync').mockResolvedValue(true);
  const openSettingsSpy = jest.spyOn(Linking, 'openSettings');

  const mockNavigate = jest.fn();
  const mockToast = jest.fn();
  const mockDeleteUser = jest.fn();
  const mockTogglePushNotifications = jest.fn();

  beforeEach(() => {
    Object.defineProperty(Device, 'isDevice', { writable: true, value: true });
    useRouterSpy.mockReturnValue({ navigate: mockNavigate });
    useToasterSpy.mockReturnValue({ toast: mockToast });
    useUserSpy.mockReturnValue({ user: testUser1, deleteUser: mockDeleteUser, isDeleting: false });
    usePushNotificationsSpy.mockReturnValue({
      systemNotificationsEnabled: true,
      status: { hasToken: true, paused: false },
      toggle: mockTogglePushNotifications,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render settings screen elements', () => {
    render(<SettingsScreen />);

    expect(screen.queryByText('Nastavitve')).toBeOnTheScreen();

    expect(screen.queryByText('Obvestila')).toBeOnTheScreen();
    expect(screen.queryByText('Dovoli pošiljanje potisnih obvestil')).toBeOnTheScreen();
    expect(screen.queryByRole('switch')).toBeOnTheScreen();

    expect(screen.queryByText('Uporabniški profil')).toBeOnTheScreen();

    expect(screen.queryByText('Tvoj vzdevek')).toBeOnTheScreen();
    expect(screen.queryByText(testUser1.nickname)).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Spremeni' })).toBeOnTheScreen();

    expect(screen.queryByText('Profil ustvarjen')).toBeOnTheScreen();
    expect(screen.queryByText('01. Jul 2025')).toBeOnTheScreen();

    expect(screen.queryByText('ID profila')).toBeOnTheScreen();
    expect(screen.queryByText(testUser1._id)).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Kopiraj' })).toBeOnTheScreen();
  });

  it('should render the "Toggle push notifications" switch as disabled if not on physical device', () => {
    Object.defineProperty(Device, 'isDevice', { writable: true, value: false });

    render(<SettingsScreen />);

    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('should render the "Toggle push notifications" switch with value=true when status.hasToken=true', () => {
    usePushNotificationsSpy.mockReturnValue({
      status: { hasToken: true },
      toggle: mockTogglePushNotifications,
      systemNotificationsEnabled: true,
    });

    render(<SettingsScreen />);

    expect(screen.getByRole('switch')).toHaveProp('value', true);
    expect(screen.getByRole('switch')).toHaveAccessibilityValue({ text: 'On' });
  });

  it.each([null, { hasToken: false }])(
    'should render the "Toggle push notifications" switch with value=false when status=%s',
    (status) => {
      usePushNotificationsSpy.mockReturnValue({
        status,
        toggle: mockTogglePushNotifications,
        systemNotificationsEnabled: false,
      });

      render(<SettingsScreen />);

      expect(screen.getByRole('switch')).toHaveProp('value', false);
      expect(screen.getByRole('switch')).toHaveAccessibilityValue({ text: 'Off' });
    }
  );

  it.each([null, undefined, false])(
    'should render the "Toggle push notifications" switch with value=false when systemNotificationsEnabled=%s',
    (systemNotificationsEnabled) => {
      usePushNotificationsSpy.mockReturnValue({
        status: { hasToken: true },
        toggle: mockTogglePushNotifications,
        systemNotificationsEnabled,
      });

      render(<SettingsScreen />);

      expect(screen.getByRole('switch')).toHaveProp('value', false);
      expect(screen.getByRole('switch')).toHaveAccessibilityValue({ text: 'Off' });
    }
  );

  it('should trigger toggle push notifications action on switch press', () => {
    render(<SettingsScreen />);

    fireEvent(screen.getByRole('switch'), 'valueChange', true);

    expect(mockTogglePushNotifications).toHaveBeenCalledWith(true);
  });

  it('should trigger navigation event on change nickname button press', () => {
    render(<SettingsScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Spremeni' }));

    expect(mockNavigate).toHaveBeenCalledWith('/update-nickname');
  });

  it('should copy user id to clipboard on "Kopiraj" button press', async () => {
    render(<SettingsScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Kopiraj' }));

    expect(clipboardSetStringAsyncSpy).toHaveBeenCalledWith(testUser1._id);
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('ID kopiran', { message: testUser1._id, intent: 'success' });
    });
  });

  it('should display a hint with link to system settings when systemNotificationsEnabled=false', () => {
    usePushNotificationsSpy.mockReturnValue({ systemNotificationsEnabled: false });

    render(<SettingsScreen />);

    expect(screen.queryByText('Preprečil/a si pošiljanje potisnih obvestil')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Odpri nastavitve' }));

    expect(openSettingsSpy).toHaveBeenCalled();
  });

  it('should not display a hint with link to system settings when systemNotificationsEnabled=true', () => {
    usePushNotificationsSpy.mockReturnValue({ systemNotificationsEnabled: true });

    render(<SettingsScreen />);

    expect(screen.queryByText('Preprečil/a si pošiljanje potisnih obvestil')).not.toBeOnTheScreen();
  });
});
