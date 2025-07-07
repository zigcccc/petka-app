import { fireEvent, render, screen } from '@testing-library/react-native';
import { useNavigation } from 'expo-router';

import WeeklyLeaderboardScreen from '@/app/(authenticated)/leaderboards/weekly-leaderboard';
import { leaderboardRange, leaderboardType } from '@/convex/leaderboards/models';
import { useGlobalLeaderboard } from '@/hooks/useGlobalLeaderboard';
import { useLeaderboards } from '@/hooks/useLeaderboards';
import { testGlobalLeaderboard1, testPrivateLeaderboard1 } from '@/tests/fixtures/leaderboards';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useFocusEffect: jest.fn().mockImplementation((cb) => cb()),
  useNavigation: jest.fn().mockReturnValue({}),
}));

jest.mock('@/hooks/useGlobalLeaderboard', () => ({
  ...jest.requireActual('@/hooks/useGlobalLeaderboard'),
  useGlobalLeaderboard: jest.fn().mockReturnValue({}),
}));

jest.mock('@/hooks/useLeaderboards', () => ({
  ...jest.requireActual('@/hooks/useLeaderboards'),
  useLeaderboards: jest.fn().mockReturnValue({}),
}));

describe('<WeeklyLeaderboardScreen />', () => {
  const mockCreatePrivateLeaderboard = jest.fn();
  const mockJoinPrivateLeaderboard = jest.fn();
  const mockPresentLeaderboardActions = jest.fn();
  const mockSetOptions = jest.fn();

  const useNavigationSpy = useNavigation as jest.Mock;
  const useGlobalLeaderboardSpy = useGlobalLeaderboard as jest.Mock;
  const useLeaderboardsSpy = useLeaderboards as jest.Mock;

  beforeEach(() => {
    useNavigationSpy.mockReturnValue({ getParent: jest.fn().mockReturnValue({ setOptions: mockSetOptions }) });
    useGlobalLeaderboardSpy.mockReturnValue({ data: testGlobalLeaderboard1 });
    useLeaderboardsSpy.mockReturnValue({
      leaderboards: [testPrivateLeaderboard1],
      isCreating: false,
      isJoining: false,
      onCreatePrivateLeaderboard: mockCreatePrivateLeaderboard,
      onJoinPrivateLeaderboard: mockJoinPrivateLeaderboard,
      onPresentLeaderboardActions: mockPresentLeaderboardActions,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should trigger global leaderboard and private leaderboards queries with "weekly" param', () => {
    render(<WeeklyLeaderboardScreen />);

    expect(useGlobalLeaderboardSpy).toHaveBeenCalledWith(leaderboardRange.Enum.weekly);
    expect(useLeaderboardsSpy).toHaveBeenCalledWith(leaderboardType.Enum.private, leaderboardRange.Enum.weekly);
  });

  it('should set the parent navigation option title to "Tedenska lestvica"', () => {
    render(<WeeklyLeaderboardScreen />);

    expect(mockSetOptions).toHaveBeenCalledWith({ title: 'Tedenska lestvica' });
  });

  it('should render global and private leaderboards', () => {
    render(<WeeklyLeaderboardScreen />);

    expect(screen.queryByText('Globalna lestvica')).toBeOnTheScreen();
    expect(screen.queryByText('Tvoje lestvice')).toBeOnTheScreen();
    expect(screen.queryByText(testPrivateLeaderboard1.name!)).toBeOnTheScreen();
  });

  it('should render private leaderboards actions (join, create)', () => {
    render(<WeeklyLeaderboardScreen />);

    expect(screen.getByRole('button', { name: 'Pridruži se lestvici' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Ustvari lestvico' })).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Pridruži se lestvici' }));
    expect(mockJoinPrivateLeaderboard).toHaveBeenCalled();

    fireEvent.press(screen.getByRole('button', { name: 'Ustvari lestvico' }));
    expect(mockCreatePrivateLeaderboard).toHaveBeenCalled();
  });

  it('should present private leaderboard actions on present actions trigger', () => {
    render(<WeeklyLeaderboardScreen />);

    fireEvent.press(screen.getByTestId('card--actions-trigger'));

    expect(mockPresentLeaderboardActions).toHaveBeenCalledWith(testPrivateLeaderboard1);
  });

  it.each([null, []])(
    'should render empty state if no private leaderboards exist (private leaderboards = %p)',
    (leaderboards) => {
      useLeaderboardsSpy.mockReturnValue({ leaderboards });
      render(<WeeklyLeaderboardScreen />);

      expect(screen.queryByText('Pridružen/a nisi še nobeni zasebni lestvici...')).toBeOnTheScreen();
    }
  );
});
