import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { ConvexError } from 'convex/values';
import { useRouter } from 'expo-router';

import CreateAccountScreen from '@/app/create-account';
import { useToaster } from '@/hooks/useToaster';
import { useUser } from '@/hooks/useUser';

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

describe('Create Account Screen', () => {
  const useRouterSpy = useRouter as jest.Mock;
  const useToasterSpy = useToaster as jest.Mock;
  const useUserSpy = useUser as jest.Mock;

  const mockReplace = jest.fn();
  const mockToast = jest.fn();
  const mockCreateUser = jest.fn();

  beforeEach(() => {
    useRouterSpy.mockReturnValue({ replace: mockReplace });
    useToasterSpy.mockReturnValue({ toast: mockToast });
    useUserSpy.mockReturnValue({ createUser: mockCreateUser });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render create account screen elements', () => {
    render(<CreateAccountScreen />);

    expect(screen.queryByText('Hej 👋')).toBeOnTheScreen();
    expect(screen.queryByText('Dobrodošel/a v Petki!')).toBeOnTheScreen();
    expect(screen.queryByText(/Želim ti obilico uspeha in zabave/)).toBeOnTheScreen();
    expect(screen.queryByPlaceholderText('Tvoj vzdevek')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Ustvari profil' })).toBeOnTheScreen();
  });

  it('should reject account creation if inputted nickname is less than 3 characters long', async () => {
    render(<CreateAccountScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Tvoj vzdevek'), 'AB');
    expect(screen.getByRole('button', { name: 'Ustvari profil' })).not.toBeDisabled();

    fireEvent.press(screen.getByRole('button', { name: 'Ustvari profil' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Ustvari profil' })).toBeDisabled();
    });

    expect(screen.queryByText('Vzdevek mora vsebovati vsaj 3 znake.')).toBeOnTheScreen();
    expect(mockToast).toHaveBeenCalledWith('Popravite napake', { intent: 'error' });

    fireEvent.changeText(screen.getByPlaceholderText('Tvoj vzdevek'), 'ABCD');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Ustvari profil' })).not.toBeDisabled();
    });
  });

  it('should reject account creation if inputted nickname is more than 20 characters long', async () => {
    render(<CreateAccountScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Tvoj vzdevek'), 'AB'.repeat(20));
    expect(screen.getByRole('button', { name: 'Ustvari profil' })).not.toBeDisabled();

    fireEvent.press(screen.getByRole('button', { name: 'Ustvari profil' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Ustvari profil' })).toBeDisabled();
    });

    expect(screen.queryByText('Vzdevek lahko vsebuje največ 20 znakov.')).toBeOnTheScreen();
    expect(mockToast).toHaveBeenCalledWith('Popravite napake', { intent: 'error' });

    fireEvent.changeText(screen.getByPlaceholderText('Tvoj vzdevek'), 'ABCD');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Ustvari profil' })).not.toBeDisabled();
    });
  });

  it.each(['https://www.g.com', 'http://something.com', 'someone@gmail.com'])(
    'should reject account creation if inputted nickname includes web address (%s)',
    async (input) => {
      render(<CreateAccountScreen />);

      fireEvent.changeText(screen.getByPlaceholderText('Tvoj vzdevek'), input);
      expect(screen.getByRole('button', { name: 'Ustvari profil' })).not.toBeDisabled();

      fireEvent.press(screen.getByRole('button', { name: 'Ustvari profil' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Ustvari profil' })).toBeDisabled();
      });

      expect(screen.queryByText('Vzdevek ne sme vsebovati spletnih ali e-poštnih naslovov.')).toBeOnTheScreen();
      expect(mockToast).toHaveBeenCalledWith('Popravite napake', { intent: 'error' });

      fireEvent.changeText(screen.getByPlaceholderText('Tvoj vzdevek'), 'ABCD');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Ustvari profil' })).not.toBeDisabled();
      });
    }
  );

  it('should reject account creation if inputted nickname includes only symbols wihout any letters/numbers', async () => {
    render(<CreateAccountScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Tvoj vzdevek'), '?!..!?');
    expect(screen.getByRole('button', { name: 'Ustvari profil' })).not.toBeDisabled();

    fireEvent.press(screen.getByRole('button', { name: 'Ustvari profil' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Ustvari profil' })).toBeDisabled();
    });

    expect(screen.queryByText('Vzdevek mora vsebovati vsaj eno črko ali številko.')).toBeOnTheScreen();
    expect(mockToast).toHaveBeenCalledWith('Popravite napake', { intent: 'error' });

    fireEvent.changeText(screen.getByPlaceholderText('Tvoj vzdevek'), 'ABCD');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Ustvari profil' })).not.toBeDisabled();
    });
  });

  it('should trigger createUser API request with valid data - success scenario', async () => {
    mockCreateUser.mockResolvedValue(null);
    render(<CreateAccountScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Tvoj vzdevek'), 'Tyson');
    fireEvent.press(screen.getByRole('button', { name: 'Ustvari profil' }));

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith({ nickname: 'Tyson' });
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(authenticated)');
    });

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should trigger createUser API request with valid data - error scenario, nickname already taken', async () => {
    mockCreateUser.mockRejectedValue(new ConvexError({ code: 409 }));
    render(<CreateAccountScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Tvoj vzdevek'), 'Tyson');
    fireEvent.press(screen.getByRole('button', { name: 'Ustvari profil' }));

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith({ nickname: 'Tyson' });
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Ta vzdevek je zaseden', { intent: 'error' });
    });

    await waitFor(() => {
      expect(screen.queryByText('Vzdevek "Tyson" je zaseden.')).toBeOnTheScreen();
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('should trigger createUser API request with valid data - error scenario, unknown error', async () => {
    mockCreateUser.mockRejectedValue(new Error('ups'));
    render(<CreateAccountScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Tvoj vzdevek'), 'Tyson');
    fireEvent.press(screen.getByRole('button', { name: 'Ustvari profil' }));

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith({ nickname: 'Tyson' });
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Nekaj je šlo narobe', { intent: 'error' });
    });

    await waitFor(() => {
      expect(screen.queryByText('Vzdevek "Tyson" je zaseden.')).not.toBeOnTheScreen();
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
