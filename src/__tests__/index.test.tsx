import { fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import HomeScreen from '@/app/(authenticated)';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: jest.fn(),
}));

describe('Home screen', () => {
  const useRouterSpy = useRouter as jest.Mock;

  const mockNavigate = jest.fn();

  beforeEach(() => {
    useRouterSpy.mockReturnValue({ navigate: mockNavigate });
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
});
