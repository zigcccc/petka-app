import { render, screen } from '@testing-library/react-native';
import { useNavigation, useRouter } from 'expo-router';

import TrainingPuzzleScreen from '@/app/(authenticated)/play/training-puzzle';
import { useTrainingPuzzle } from '@/hooks/useTrainingPuzzle';
import { testTrainingPuzzle1 } from '@/tests/fixtures/puzzles';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: jest.fn().mockReturnValue({}),
  useNavigation: jest.fn().mockReturnValue({}),
}));

jest.mock('@/hooks/useTrainingPuzzle', () => ({
  ...jest.requireActual('@/hooks/useTrainingPuzzle'),
  useTrainingPuzzle: jest.fn().mockReturnValue({}),
}));

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

describe('TrainingPuzzleScreen', () => {
  const mockNavigate = jest.fn();
  const mockSetNavigationOptions = jest.fn();

  const useTrainingPuzzleSpy = useTrainingPuzzle as jest.Mock;
  const useNavigationSpy = useNavigation as jest.Mock;
  const useRouterSpy = useRouter as jest.Mock;

  const defaultTrainingPuzzleOptions = {
    attempts: [],
    puzzle: testTrainingPuzzle1,
    isLoading: false,
    isSolved: false,
    isFailed: false,
    isDone: false,
    onSubmitAttempt: jest.fn(),
  };

  beforeEach(() => {
    useRouterSpy.mockReturnValue({ navigate: mockNavigate });
    useNavigationSpy.mockReturnValue({ setOptions: mockSetNavigationOptions });
    useTrainingPuzzleSpy.mockReturnValue(defaultTrainingPuzzleOptions);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should display loading indicator if there is no training puzzle data available - isCreating=false', () => {
    useTrainingPuzzleSpy.mockReturnValue({ ...defaultTrainingPuzzleOptions, puzzle: null, isCreating: false });

    render(<TrainingPuzzleScreen />);

    expect(screen.queryByText('Iščem aktivno igro...')).toBeOnTheScreen();

    expect(screen.queryByText('Ustvarjam novo igro...')).not.toBeOnTheScreen();
    expect(screen.queryAllByTestId(/^guess-grid--row-\d+$/).length).toBe(0);
  });

  it('should display loading indicator if there is no training puzzle data available - isCreating=true', () => {
    useTrainingPuzzleSpy.mockReturnValue({ ...defaultTrainingPuzzleOptions, puzzle: null, isCreating: true });

    render(<TrainingPuzzleScreen />);

    expect(screen.queryByText('Ustvarjam novo igro...')).toBeOnTheScreen();

    expect(screen.queryByText('Iščem aktivno igro...')).not.toBeOnTheScreen();
    expect(screen.queryAllByTestId(/^guess-grid--row-\d+$/).length).toBe(0);
  });

  it('should navigate to puzzle solved screen and set navigation options with header right element when puzzle is done', () => {
    useTrainingPuzzleSpy.mockReturnValue({ ...defaultTrainingPuzzleOptions, isDone: true });

    render(<TrainingPuzzleScreen />);

    expect(mockNavigate).toHaveBeenCalledWith('/play/training-puzzle-solved');
    expect(mockSetNavigationOptions).toHaveBeenCalledWith({ headerRight: expect.any(Function) });
  });

  it('should not navigate to puzzle solved screen and set navigation options with header right element set to null when puzzle is not solved', () => {
    useTrainingPuzzleSpy.mockReturnValue({ ...defaultTrainingPuzzleOptions, isDone: false });

    render(<TrainingPuzzleScreen />);

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockSetNavigationOptions).toHaveBeenCalledWith({ headerRight: null });
  });

  it('should render puzzle guess grid and keyboard when puzzle data is available', () => {
    useTrainingPuzzleSpy.mockReturnValue({ ...defaultTrainingPuzzleOptions, puzzle: testTrainingPuzzle1 });

    render(<TrainingPuzzleScreen />);

    expect(screen.getAllByTestId(/^guess-grid--row-\d+$/).length).toBe(6);
    expect(screen.getAllByTestId(/^keyboard-key--[A-Za-z]+$/).length).toBeGreaterThan(0);
  });
});
