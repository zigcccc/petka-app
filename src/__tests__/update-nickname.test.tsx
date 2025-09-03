import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useConvex } from 'convex/react';
import { ConvexError } from 'convex/values';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';

import UpdateNicknameScreen from '@/app/(authenticated)/update-nickname';
import { api } from '@/convex/_generated/api';
import { useToaster } from '@/hooks/useToaster';
import { useUser } from '@/hooks/useUser';
import { testUser1 } from '@/tests/fixtures/users';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useToaster', () => ({
  ...jest.requireActual('@/hooks/useToaster'),
  useToaster: jest.fn(),
}));

jest.mock('@/hooks/useUser', () => ({
  ...jest.requireActual('@/hooks/useUser'),
  useUser: jest.fn(),
}));

jest.mock('convex/react', () => ({
  ...jest.requireActual('convex/react'),
  useConvex: jest.fn(),
}));

jest.mock('posthog-react-native', () => ({
  ...jest.requireActual('posthog-react-native'),
  usePostHog: jest.fn(),
}));

describe('Update Nickname Screen', () => {
  const useRouterSpy = useRouter as jest.Mock;
  const useToasterSpy = useToaster as jest.Mock;
  const useUserSpy = useUser as jest.Mock;
  const useConvexSpy = useConvex as jest.Mock;
  const usePostHogSpy = usePostHog as jest.Mock;

  const mockBack = jest.fn();
  const mockToast = jest.fn();
  const mockUpdateUser = jest.fn();
  const mockQuery = jest.fn();
  const mockCaptureException = jest.fn();

  beforeEach(() => {
    mockQuery.mockResolvedValue(null);

    useRouterSpy.mockReturnValue({ back: mockBack });
    useToasterSpy.mockReturnValue({ toast: mockToast });
    useUserSpy.mockReturnValue({ updateUser: mockUpdateUser });
    useConvexSpy.mockReturnValue({ query: mockQuery });
    usePostHogSpy.mockReturnValue({ captureException: mockCaptureException });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('should render update nickname screen elements', () => {
    render(<UpdateNicknameScreen />);

    expect(screen.queryByText('Posodobi svoj vzdevek')).toBeOnTheScreen();
    expect(screen.queryByPlaceholderText('Tvoj vzdevek')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Posodobi vzdevek' })).toBeOnTheScreen();
  });

  it('should set the default value for the nickname input field if userId exists in local storage and query request returns user data', async () => {
    await AsyncStorage.setItem('userId', testUser1._id);
    mockQuery.mockResolvedValue(testUser1);

    render(<UpdateNicknameScreen />);

    await waitFor(() => {
      expect(mockQuery).toHaveBeenCalledWith(api.users.queries.read, { id: testUser1._id });
    });

    expect(screen.getByPlaceholderText('Tvoj vzdevek')).toHaveDisplayValue(testUser1.nickname);
  });

  it('should not set the default value for the nickname input field if userId does not exist in local storage', async () => {
    await AsyncStorage.removeItem('userId');
    mockQuery.mockResolvedValue(testUser1);

    render(<UpdateNicknameScreen />);

    expect(mockQuery).not.toHaveBeenCalled();

    expect(screen.getByPlaceholderText('Tvoj vzdevek')).not.toHaveDisplayValue(testUser1.nickname);
  });

  it('should not set the default value for the nickname input field if userId exists in local storage and query request returns no user data', async () => {
    await AsyncStorage.setItem('userId', testUser1._id);
    mockQuery.mockResolvedValue(null);

    render(<UpdateNicknameScreen />);

    expect(mockQuery).not.toHaveBeenCalled();

    expect(screen.getByPlaceholderText('Tvoj vzdevek')).not.toHaveDisplayValue(testUser1.nickname);
  });

  it('should reject account creation if inputted nickname is less than 3 characters long', async () => {
    render(<UpdateNicknameScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Tvoj vzdevek'), 'AB');
    expect(screen.getByRole('button', { name: 'Posodobi vzdevek' })).not.toBeDisabled();

    fireEvent.press(screen.getByRole('button', { name: 'Posodobi vzdevek' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Posodobi vzdevek' })).toBeDisabled();
    });

    expect(screen.queryByText('Vzdevek mora vsebovati vsaj 3 znake.')).toBeOnTheScreen();
    expect(mockToast).toHaveBeenCalledWith('Popravite napake', { intent: 'error' });

    fireEvent.changeText(screen.getByPlaceholderText('Tvoj vzdevek'), 'ABCD');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Posodobi vzdevek' })).not.toBeDisabled();
    });
  });

  it('should reject account creation if inputted nickname is more than 20 characters long', async () => {
    render(<UpdateNicknameScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Tvoj vzdevek'), 'AB'.repeat(20));
    expect(screen.getByRole('button', { name: 'Posodobi vzdevek' })).not.toBeDisabled();

    fireEvent.press(screen.getByRole('button', { name: 'Posodobi vzdevek' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Posodobi vzdevek' })).toBeDisabled();
    });

    expect(screen.queryByText('Vzdevek lahko vsebuje največ 20 znakov.')).toBeOnTheScreen();
    expect(mockToast).toHaveBeenCalledWith('Popravite napake', { intent: 'error' });

    fireEvent.changeText(screen.getByPlaceholderText('Tvoj vzdevek'), 'ABCD');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Posodobi vzdevek' })).not.toBeDisabled();
    });
  });

  it.each(['https://www.g.com', 'http://something.com', 'someone@gmail.com'])(
    'should reject account creation if inputted nickname includes web address (%s)',
    async (input) => {
      render(<UpdateNicknameScreen />);

      fireEvent.changeText(screen.getByPlaceholderText('Tvoj vzdevek'), input);
      expect(screen.getByRole('button', { name: 'Posodobi vzdevek' })).not.toBeDisabled();

      fireEvent.press(screen.getByRole('button', { name: 'Posodobi vzdevek' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Posodobi vzdevek' })).toBeDisabled();
      });

      expect(screen.queryByText('Vzdevek ne sme vsebovati spletnih ali e-poštnih naslovov.')).toBeOnTheScreen();
      expect(mockToast).toHaveBeenCalledWith('Popravite napake', { intent: 'error' });

      fireEvent.changeText(screen.getByPlaceholderText('Tvoj vzdevek'), 'ABCD');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Posodobi vzdevek' })).not.toBeDisabled();
      });
    }
  );

  it('should reject account creation if inputted nickname includes only symbols wihout any letters/numbers', async () => {
    render(<UpdateNicknameScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Tvoj vzdevek'), '?!..!?');
    expect(screen.getByRole('button', { name: 'Posodobi vzdevek' })).not.toBeDisabled();

    fireEvent.press(screen.getByRole('button', { name: 'Posodobi vzdevek' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Posodobi vzdevek' })).toBeDisabled();
    });

    expect(screen.queryByText('Vzdevek mora vsebovati vsaj eno črko ali številko.')).toBeOnTheScreen();
    expect(mockToast).toHaveBeenCalledWith('Popravite napake', { intent: 'error' });

    fireEvent.changeText(screen.getByPlaceholderText('Tvoj vzdevek'), 'ABCD');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Posodobi vzdevek' })).not.toBeDisabled();
    });
  });

  it('should trigger updateUser API request with valid data - success scenario', async () => {
    mockUpdateUser.mockResolvedValue(null);
    render(<UpdateNicknameScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Tvoj vzdevek'), 'Tyson');
    fireEvent.press(screen.getByRole('button', { name: 'Posodobi vzdevek' }));

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ nickname: 'Tyson' });
    });

    await waitFor(() => {
      expect(mockBack).toHaveBeenCalled();
    });

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should trigger updateUser API request with valid data - error scenario, nickname already taken', async () => {
    mockUpdateUser.mockRejectedValue(new ConvexError({ code: 409 }));
    render(<UpdateNicknameScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Tvoj vzdevek'), 'Tyson');
    fireEvent.press(screen.getByRole('button', { name: 'Posodobi vzdevek' }));

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ nickname: 'Tyson' });
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Ta vzdevek je zaseden', { intent: 'error' });
    });

    await waitFor(() => {
      expect(screen.queryByText('Vzdevek "Tyson" je zaseden.')).toBeOnTheScreen();
    });

    expect(mockBack).not.toHaveBeenCalled();
  });

  it('should trigger updateUser API request with valid data - error scenario, unknown error', async () => {
    mockUpdateUser.mockRejectedValue(new Error('ups'));
    render(<UpdateNicknameScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Tvoj vzdevek'), 'Tyson');
    fireEvent.press(screen.getByRole('button', { name: 'Posodobi vzdevek' }));

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ nickname: 'Tyson' });
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Nekaj je šlo narobe', { intent: 'error' });
    });

    await waitFor(() => {
      expect(screen.queryByText('Vzdevek "Tyson" je zaseden.')).not.toBeOnTheScreen();
    });

    expect(mockBack).not.toHaveBeenCalled();
  });
});
