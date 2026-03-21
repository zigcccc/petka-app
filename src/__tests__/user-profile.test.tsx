import { render, screen } from '@testing-library/react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import UserProfileScreen from '@/app/(authenticated)/user-profile';
import { puzzleType } from '@/convex/puzzles/models';
import { usePuzzlesStatisticsQuery, useUserQuery } from '@/hooks/queries';
import { testPuzzleStatistics1 } from '@/tests/fixtures/puzzleStatistics';
import { testUser1 } from '@/tests/fixtures/users';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  Stack: {
    Screen: jest.fn().mockReturnValue(null),
  },
  useLocalSearchParams: jest.fn(),
}));

jest.mock('@/hooks/queries', () => ({
  ...jest.requireActual('@/hooks/queries'),
  usePuzzlesStatisticsQuery: jest.fn(),
  useUserQuery: jest.fn(),
}));

describe('<UserProfileScreen />', () => {
  const StackScreenSpy = Stack.Screen as unknown as jest.Mock;
  const useLocalSearchParamsSpy = useLocalSearchParams as jest.Mock;
  const usePuzzlesStatisticsQuerySpy = usePuzzlesStatisticsQuery as jest.Mock;
  const useUserQuerySpy = useUserQuery as jest.Mock;

  beforeEach(() => {
    useLocalSearchParamsSpy.mockReturnValue({ userId: testUser1._id });
    useUserQuerySpy.mockReturnValue({ isLoading: false, data: testUser1 });
    usePuzzlesStatisticsQuerySpy.mockReturnValue({ isLoading: false, isNotFound: false, data: testPuzzleStatistics1 });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call useUserQuery with the userId from route params', () => {
    render(<UserProfileScreen />);

    expect(useUserQuerySpy).toHaveBeenCalledWith({ id: testUser1._id });
  });

  it('should call usePuzzlesStatisticsQuery with "daily" puzzle type and the userId from route params', () => {
    render(<UserProfileScreen />);

    expect(usePuzzlesStatisticsQuerySpy).toHaveBeenCalledWith({
      puzzleType: puzzleType.enum.daily,
      userId: testUser1._id,
    });
  });

  it('should set the screen title to "Nalagam podatke..." while user data is loading', () => {
    useUserQuerySpy.mockReturnValue({ isLoading: true, data: undefined });
    render(<UserProfileScreen />);

    expect(StackScreenSpy).toHaveBeenCalledWith(
      expect.objectContaining({ options: expect.objectContaining({ title: 'Nalagam podatke...' }) }),
      undefined
    );
  });

  it('should set the screen title to the user nickname once loaded', () => {
    render(<UserProfileScreen />);

    expect(StackScreenSpy).toHaveBeenCalledWith(
      expect.objectContaining({ options: expect.objectContaining({ title: testUser1.nickname }) }),
      undefined
    );
  });

  it('should render loading indicator while user data is loading', () => {
    useUserQuerySpy.mockReturnValue({ isLoading: true, data: undefined });
    render(<UserProfileScreen />);

    expect(screen.queryByRole('spinbutton', { name: 'Nalagam podatke o uporabniku...' })).toBeOnTheScreen();
    expect(screen.queryByText('Statistika dnevnih izzivov')).not.toBeOnTheScreen();
  });

  it('should render loading indicator while stats are loading', () => {
    usePuzzlesStatisticsQuerySpy.mockReturnValue({ isLoading: true, data: undefined });
    render(<UserProfileScreen />);

    expect(screen.queryByRole('spinbutton', { name: 'Nalagam podatke o uporabniku...' })).toBeOnTheScreen();
    expect(screen.queryByText('Statistika dnevnih izzivov')).not.toBeOnTheScreen();
  });

  it('should render the member since date', () => {
    render(<UserProfileScreen />);

    // testUser1._creationTime = 1751328000000 (2025-07-01); dayjs sl locale → "julij 2025"
    expect(screen.queryByText(/Član od: julij 2025/)).toBeOnTheScreen();
  });

  it('should render daily stats when data is loaded', () => {
    render(<UserProfileScreen />);

    expect(screen.queryByRole('spinbutton', { name: 'Nalagam podatke o uporabniku...' })).not.toBeOnTheScreen();
    expect(screen.queryByText('Statistika dnevnih izzivov')).toBeOnTheScreen();
    expect(screen.getByTestId('stat-total-played')).toHaveTextContent(/Odigranih5/);
    expect(screen.getByTestId('stat-win-rate')).toHaveTextContent(/% rešenih80%/);
    expect(screen.getByTestId('stat-current-streak')).toHaveTextContent(/Trenutni niz2/);
    expect(screen.getByTestId('stat-max-streak')).toHaveTextContent(/Najdaljši niz3/);
  });

  it('should render 100% win rate when totalPlayed is 0', () => {
    usePuzzlesStatisticsQuerySpy.mockReturnValue({
      isLoading: false,
      isNotFound: false,
      data: { ...testPuzzleStatistics1, totalPlayed: 0, totalWon: 0 },
    });
    render(<UserProfileScreen />);

    expect(screen.queryByText('100%')).toBeOnTheScreen();
  });

  it('should render empty state when user has no stats', () => {
    usePuzzlesStatisticsQuerySpy.mockReturnValue({ isLoading: false, isNotFound: true, data: null });
    render(<UserProfileScreen />);

    expect(screen.queryByText('Ta igralec še ni rešil nobene uganke.')).toBeOnTheScreen();
    expect(screen.queryByText('Statistika dnevnih izzivov')).not.toBeOnTheScreen();
  });
});
