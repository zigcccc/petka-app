import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import RestoreAccountScreen from '@/app/onboard/restore-account';
import { useValidateUserAccount } from '@/hooks/mutations';
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

jest.mock('@/hooks/mutations', () => ({
  ...jest.requireActual('@/hooks/mutations'),
  useValidateUserAccount: jest.fn(),
}));

describe('Create Account Screen', () => {
  const useRouterSpy = useRouter as jest.Mock;
  const useToasterSpy = useToaster as jest.Mock;
  const useUserSpy = useUser as jest.Mock;
  const useValidateUserAccountSpy = useValidateUserAccount as jest.Mock;

  const mockNavigate = jest.fn();
  const mockToast = jest.fn();
  const mockSetUserId = jest.fn();
  const mockValidateUserAccount = jest.fn();

  beforeEach(() => {
    useRouterSpy.mockReturnValue({ navigate: mockNavigate });
    useToasterSpy.mockReturnValue({ toast: mockToast });
    useUserSpy.mockReturnValue({ setUserId: mockSetUserId });
    useValidateUserAccountSpy.mockReturnValue({ mutate: mockValidateUserAccount });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render create account screen elements', () => {
    render(<RestoreAccountScreen />);

    expect(screen.queryByText('Obnovi svoj profil')).toBeOnTheScreen();
    expect(screen.queryByText('Vnesi podatke obstoječega profila.')).toBeOnTheScreen();
    expect(screen.queryByText(/ID in uporabniško ime profila lahko najdeš na obstoječi napravi/)).toBeOnTheScreen();
    expect(screen.queryByPlaceholderText('ID profila')).toBeOnTheScreen();
    expect(screen.queryByPlaceholderText('Vzdevek profila')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Obnovi profil' })).toBeOnTheScreen();
    expect(screen.queryByText(/Bi raje ustvaril\/a nov profil\?/)).toBeOnTheScreen();
    expect(screen.queryByText('Klikni tukaj.')).toBeOnTheScreen();
  });

  it('should reject account creation if inputted id is empty', async () => {
    render(<RestoreAccountScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('ID profila'), '');
    fireEvent.changeText(screen.getByPlaceholderText('Vzdevek profila'), 'vzdevek');
    expect(screen.getByRole('button', { name: 'Obnovi profil' })).not.toBeDisabled();

    fireEvent.press(screen.getByRole('button', { name: 'Obnovi profil' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Obnovi profil' })).toBeDisabled();
    });

    expect(screen.queryByText('Polje je obvezno.')).toBeOnTheScreen();

    fireEvent.changeText(screen.getByPlaceholderText('ID profila'), 'asd785asd65a4s67');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Obnovi profil' })).not.toBeDisabled();
    });
  });

  it('should reject account creation if inputted nickname is empty', async () => {
    render(<RestoreAccountScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('ID profila'), 'asd785asd65a4s67');
    fireEvent.changeText(screen.getByPlaceholderText('Vzdevek profila'), '');
    expect(screen.getByRole('button', { name: 'Obnovi profil' })).not.toBeDisabled();

    fireEvent.press(screen.getByRole('button', { name: 'Obnovi profil' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Obnovi profil' })).toBeDisabled();
    });

    expect(screen.queryByText('Polje je obvezno.')).toBeOnTheScreen();

    fireEvent.changeText(screen.getByPlaceholderText('Vzdevek profila'), 'vzdevek');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Obnovi profil' })).not.toBeDisabled();
    });
  });

  it('should trigger validate account info and reject account restoration if request is not successful', async () => {
    mockValidateUserAccount.mockRejectedValue(new Error('Nope'));
    render(<RestoreAccountScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('ID profila'), 'asd785asd65a4s67');
    fireEvent.changeText(screen.getByPlaceholderText('Vzdevek profila'), 'Vzdevek');

    fireEvent.press(screen.getByRole('button', { name: 'Obnovi profil' }));

    await waitFor(() => {
      expect(mockValidateUserAccount).toHaveBeenCalledWith({ id: 'asd785asd65a4s67', nickname: 'Vzdevek' });
    });

    expect(mockToast).toHaveBeenCalledWith('Napačni podatki', { intent: 'error' });
    expect(mockSetUserId).not.toHaveBeenCalled();
  });

  it.each([{}, null])(
    'should trigger validate account info and reject account restoration if response does not include user id (response = %p)',
    async (response) => {
      mockValidateUserAccount.mockResolvedValue(response);
      render(<RestoreAccountScreen />);

      fireEvent.changeText(screen.getByPlaceholderText('ID profila'), 'asd785asd65a4s67');
      fireEvent.changeText(screen.getByPlaceholderText('Vzdevek profila'), 'Vzdevek');

      fireEvent.press(screen.getByRole('button', { name: 'Obnovi profil' }));

      await waitFor(() => {
        expect(mockValidateUserAccount).toHaveBeenCalledWith({ id: 'asd785asd65a4s67', nickname: 'Vzdevek' });
      });

      expect(mockToast).toHaveBeenCalledWith('Napačni podatki', { intent: 'error' });
      expect(mockSetUserId).not.toHaveBeenCalled();
    }
  );

  it('should trigger validate account info and restore user account when response includes user id', async () => {
    mockValidateUserAccount.mockResolvedValue(testUser1);
    render(<RestoreAccountScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('ID profila'), testUser1._id);
    fireEvent.changeText(screen.getByPlaceholderText('Vzdevek profila'), 'Vzdevek');

    fireEvent.press(screen.getByRole('button', { name: 'Obnovi profil' }));

    await waitFor(() => {
      expect(mockValidateUserAccount).toHaveBeenCalledWith({ id: testUser1._id, nickname: 'Vzdevek' });
    });

    expect(mockToast).not.toHaveBeenCalled();
    expect(mockSetUserId).toHaveBeenCalledWith(testUser1._id);
    expect(mockNavigate).toHaveBeenCalledWith('/onboard/gameplay-settings');
  });
});
