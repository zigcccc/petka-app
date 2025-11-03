import { fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import DailyPuzzleSolvedScreen from '@/app/(authenticated)/play/daily-puzzle-solved';
import { puzzleType } from '@/convex/puzzles/models';
import { useDictionaryEntry } from '@/hooks/queries';
import { useDailyPuzzle } from '@/hooks/useDailyPuzzle';
import { usePuzzleStatistics } from '@/hooks/usePuzzlesStatistics';
import { testDailyPuzzle1 } from '@/tests/fixtures/puzzles';
import { testPuzzleStatistics1 } from '@/tests/fixtures/puzzleStatistics';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: jest.fn().mockReturnValue({}),
}));

jest.mock('@/hooks/useDailyPuzzle', () => ({
  ...jest.requireActual('@/hooks/useDailyPuzzle'),
  useDailyPuzzle: jest.fn().mockReturnValue({}),
}));

jest.mock('@/hooks/usePuzzlesStatistics', () => ({
  ...jest.requireActual('@/hooks/usePuzzlesStatistics'),
  usePuzzleStatistics: jest.fn().mockReturnValue({}),
}));

jest.mock('@/hooks/queries', () => ({
  ...jest.requireActual('@/hooks/queries'),
  useDictionaryEntry: jest.fn().mockReturnValue({}),
}));

describe('Daily puzzle solved screen', () => {
  const useDailyPuzzleSpy = useDailyPuzzle as jest.Mock;
  const useDictionaryEntrySpy = useDictionaryEntry as jest.Mock;
  const usePuzzleStatisticsSpy = usePuzzleStatistics as jest.Mock;
  const useRouterSpy = useRouter as jest.Mock;

  const mockNavigate = jest.fn();
  const mockBack = jest.fn();

  const defaultDailyPuzzleOptions = {
    attempts: [],
    puzzle: testDailyPuzzle1,
    isLoading: false,
    isSolved: true,
    isFailed: false,
    isDone: true,
    onShareResults: jest.fn(),
  };

  beforeEach(() => {
    useDictionaryEntrySpy.mockReturnValue({ isLoading: false, data: { explanation: 'test solution explanation' } });
    useRouterSpy.mockReturnValue({ navigate: mockNavigate, back: mockBack });
    useDailyPuzzleSpy.mockReturnValue(defaultDailyPuzzleOptions);
    usePuzzleStatisticsSpy.mockReturnValue({ isLoading: false, data: testPuzzleStatistics1 });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should trigger puzzle statistics query with "daily" as a puzzle type param', () => {
    render(<DailyPuzzleSolvedScreen />);
    expect(usePuzzleStatisticsSpy).toHaveBeenCalledWith(puzzleType.Enum.daily);
  });

  it('should render correct title and subtile when isFailed=false', () => {
    useDailyPuzzleSpy.mockReturnValue({ ...defaultDailyPuzzleOptions, isFailed: false });
    render(<DailyPuzzleSolvedScreen />);

    expect(screen.queryByText('Čestitke 🥳')).toBeOnTheScreen();
    expect(screen.queryByText('Uspešno si opravil/a dnevni izziv.')).toBeOnTheScreen();

    expect(screen.queryByText('O joj... 🙄')).not.toBeOnTheScreen();
    expect(screen.queryByText('Tokrat ti ni uspelo rešiti izziva.')).not.toBeOnTheScreen();
  });

  it('should render correct title and subtile when isFailed=true', () => {
    useDailyPuzzleSpy.mockReturnValue({ ...defaultDailyPuzzleOptions, isFailed: true });
    render(<DailyPuzzleSolvedScreen />);

    expect(screen.queryByText('Čestitke 🥳')).not.toBeOnTheScreen();
    expect(screen.queryByText('Uspešno si opravil/a dnevni izziv.')).not.toBeOnTheScreen();

    expect(screen.queryByText('O joj... 🙄')).toBeOnTheScreen();
    expect(screen.queryByText('Tokrat ti ni uspelo rešiti izziva.')).toBeOnTheScreen();
  });

  it('should render loading indicator if statistics data is loading', () => {
    usePuzzleStatisticsSpy.mockReturnValue({ isLoading: true, data: undefined });
    render(<DailyPuzzleSolvedScreen />);

    expect(screen.queryByRole('spinbutton', { name: 'Nalagam statistiko dnevnih izzivov...' })).toBeOnTheScreen();
    expect(screen.queryByText('Statistika dnevnih izzivov')).not.toBeOnTheScreen();
  });

  it('should render puzzle solution and explanation when explanation is available', () => {
    render(<DailyPuzzleSolvedScreen />);

    expect(screen.queryByText('Rešitev: "CLOTH"')).toBeOnTheScreen();
    expect(screen.queryByText(/Test solution explanation/)).toBeOnTheScreen();
    expect(screen.queryByRole('link', { name: /SSKJ/ })).toBeOnTheScreen();
  });

  it('should render puzzle solution and link to official dictionary explanation when explanation is not available', () => {
    useDictionaryEntrySpy.mockReturnValue({ explanation: null });
    render(<DailyPuzzleSolvedScreen />);

    expect(screen.queryByText('Rešitev: "CLOTH"')).toBeOnTheScreen();
    expect(screen.queryByText(/Razlaga besede na voljo v Fran slovarju/)).toBeOnTheScreen();
    expect(screen.queryByRole('link', { name: /SSKJ/ })).toBeOnTheScreen();
  });

  it('should render puzzle solution without explanation when explanation data is loading', () => {
    useDictionaryEntrySpy.mockReturnValue({ isLoading: true });
    render(<DailyPuzzleSolvedScreen />);

    expect(screen.queryByText('Rešitev: "CLOTH"')).toBeOnTheScreen();
    expect(screen.queryByText(/Test solution explanation/)).not.toBeOnTheScreen();
    expect(screen.queryByText(/Razlaga besede na voljo v Fran slovarju/)).not.toBeOnTheScreen();
    expect(screen.queryByRole('link', { name: /SSKJ/ })).not.toBeOnTheScreen();
  });

  it('should render daily puzzle statistics when data is not loading', () => {
    usePuzzleStatisticsSpy.mockReturnValue({ isLoading: false, data: testPuzzleStatistics1 });
    render(<DailyPuzzleSolvedScreen />);

    expect(screen.queryByRole('spinbutton', { name: 'Nalagam statistiko dnevnih izzivov...' })).not.toBeOnTheScreen();

    expect(screen.queryByText('Statistika dnevnih izzivov')).toBeOnTheScreen();

    expect(screen.getByTestId('num-of-played-games')).toHaveTextContent(/Odigranih5/);
    expect(screen.getByTestId('percentage-solved-games')).toHaveTextContent(/% rešenih80%/);
    expect(screen.getByTestId('current-streak')).toHaveTextContent(/Niz rešenih2/);
  });

  it('should trigger share results action on "Deli" button press', () => {
    render(<DailyPuzzleSolvedScreen />);

    fireEvent.press(screen.getByRole('button', { name: /Deli/ }));

    expect(defaultDailyPuzzleOptions.onShareResults).toHaveBeenCalled();
  });

  it('should trigger router back action on "Nazaj" button press', () => {
    render(<DailyPuzzleSolvedScreen />);

    fireEvent.press(screen.getByRole('button', { name: /Nazaj/ }));

    expect(mockBack).toHaveBeenCalled();
  });

  it('should trigger router navigate action on "Lestvica" button press', () => {
    render(<DailyPuzzleSolvedScreen />);

    fireEvent.press(screen.getByRole('button', { name: /Lestvica/ }));

    expect(mockNavigate).toHaveBeenCalledWith('/leaderboards/weekly-leaderboard');
  });
});
