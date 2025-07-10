import { fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import TrainingPuzzleSolvedScreen from '@/app/(authenticated)/play/training-puzzle-solved';
import { puzzleType } from '@/convex/puzzles/models';
import { usePuzzleStatistics } from '@/hooks/usePuzzlesStatistics';
import { useTrainingPuzzle } from '@/hooks/useTrainingPuzzle';
import { testTrainingPuzzle1 } from '@/tests/fixtures/puzzles';
import { testPuzzleStatistics1 } from '@/tests/fixtures/puzzleStatistics';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: jest.fn().mockReturnValue({}),
}));

jest.mock('@/hooks/useTrainingPuzzle', () => ({
  ...jest.requireActual('@/hooks/useTrainingPuzzle'),
  useTrainingPuzzle: jest.fn().mockReturnValue({}),
}));

jest.mock('@/hooks/usePuzzlesStatistics', () => ({
  ...jest.requireActual('@/hooks/usePuzzlesStatistics'),
  usePuzzleStatistics: jest.fn().mockReturnValue({}),
}));

describe('Training puzzle solved screen', () => {
  const useTrainingPuzzleSpy = useTrainingPuzzle as jest.Mock;
  const usePuzzleStatisticsSpy = usePuzzleStatistics as jest.Mock;
  const useRouterSpy = useRouter as jest.Mock;

  const mockNavigate = jest.fn();
  const mockBack = jest.fn();

  const defaultDailyPuzzleOptions = {
    attempts: [],
    puzzle: testTrainingPuzzle1,
    isLoading: false,
    isSolved: true,
    isFailed: false,
    isDone: true,
    onShareResults: jest.fn(),
    onMarkAsSolved: jest.fn(),
  };

  beforeEach(() => {
    useRouterSpy.mockReturnValue({ navigate: mockNavigate, back: mockBack });
    useTrainingPuzzleSpy.mockReturnValue(defaultDailyPuzzleOptions);
    usePuzzleStatisticsSpy.mockReturnValue({ isLoading: false, data: testPuzzleStatistics1 });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should trigger puzzle statistics query with "training" as a puzzle type param', () => {
    render(<TrainingPuzzleSolvedScreen />);
    expect(usePuzzleStatisticsSpy).toHaveBeenCalledWith(puzzleType.Enum.training);
  });

  it('should render correct title and subtile when isFailed=false', () => {
    useTrainingPuzzleSpy.mockReturnValue({ ...defaultDailyPuzzleOptions, isFailed: false });
    render(<TrainingPuzzleSolvedScreen />);

    expect(screen.queryByText('Čestitke 🥳')).toBeOnTheScreen();
    expect(screen.queryByText('Uspešno si opravil/a trening izziv.')).toBeOnTheScreen();

    expect(screen.queryByText('O joj... 🙄')).not.toBeOnTheScreen();
    expect(screen.queryByText('Tokrat ti ni uspelo rešiti izziva.')).not.toBeOnTheScreen();
  });

  it('should render correct title and subtile when isFailed=true', () => {
    useTrainingPuzzleSpy.mockReturnValue({ ...defaultDailyPuzzleOptions, isFailed: true });
    render(<TrainingPuzzleSolvedScreen />);

    expect(screen.queryByText('Čestitke 🥳')).not.toBeOnTheScreen();
    expect(screen.queryByText('Uspešno si opravil/a trening izziv.')).not.toBeOnTheScreen();

    expect(screen.queryByText('O joj... 🙄')).toBeOnTheScreen();
    expect(screen.queryByText('Tokrat ti ni uspelo rešiti izziva.')).toBeOnTheScreen();
  });

  it('should render loading indicator if statistics data is loading', () => {
    usePuzzleStatisticsSpy.mockReturnValue({ isLoading: true, data: undefined });
    render(<TrainingPuzzleSolvedScreen />);

    expect(screen.queryByRole('spinbutton', { name: 'Nalagam statistiko trening izzivov...' })).toBeOnTheScreen();
    expect(screen.queryByText('Trening statistika')).not.toBeOnTheScreen();
  });

  it('should render daily puzzle statistics when data is not loading', () => {
    usePuzzleStatisticsSpy.mockReturnValue({ isLoading: false, data: testPuzzleStatistics1 });
    render(<TrainingPuzzleSolvedScreen />);

    expect(screen.queryByRole('spinbutton', { name: 'Nalagam statistiko trening izzivov...' })).not.toBeOnTheScreen();

    expect(screen.queryByText('Trening statistika')).toBeOnTheScreen();

    expect(screen.getByTestId('num-of-played-games')).toHaveTextContent(/Odigranih5/);
    expect(screen.getByTestId('percentage-solved-games')).toHaveTextContent(/% rešenih80%/);
    expect(screen.getByTestId('current-streak')).toHaveTextContent(/Niz rešenih2/);
  });

  it('should trigger share results action on "Deli" button press', () => {
    render(<TrainingPuzzleSolvedScreen />);

    fireEvent.press(screen.getByRole('button', { name: /Deli/ }));

    expect(defaultDailyPuzzleOptions.onShareResults).toHaveBeenCalled();
  });

  it('should trigger router back action on "Nazaj" button press', () => {
    render(<TrainingPuzzleSolvedScreen />);

    fireEvent.press(screen.getByRole('button', { name: /Nazaj/ }));

    expect(mockBack).toHaveBeenCalled();
  });

  it('should trigger router back and mark as solved actions on "Začni nov izziv" button press', () => {
    render(<TrainingPuzzleSolvedScreen />);

    fireEvent.press(screen.getByRole('button', { name: /Začni nov izziv/ }));

    expect(mockBack).toHaveBeenCalled();
    expect(defaultDailyPuzzleOptions.onMarkAsSolved).toHaveBeenCalled();
  });
});
