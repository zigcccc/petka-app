import { usePresence } from '@convex-dev/presence/react-native';
import { captureException } from '@sentry/react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useNavigation, useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';

import DailyPuzzleScreen, { ErrorBoundary } from '@/app/(authenticated)/play/daily-puzzle';
import { api } from '@/convex/_generated/api';
import { useDailyPuzzle } from '@/hooks/useDailyPuzzle';
import { useUser } from '@/hooks/useUser';
import { testDailyPuzzle1 } from '@/tests/fixtures/puzzles';
import { testUser1 } from '@/tests/fixtures/users';

jest.mock('posthog-react-native', () => ({
  ...jest.requireActual('posthog-react-native'),
  usePostHog: jest.fn().mockReturnValue({}),
}));

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: jest.fn().mockReturnValue({}),
  useNavigation: jest.fn().mockReturnValue({}),
}));

jest.mock('@/hooks/useDailyPuzzle', () => ({
  ...jest.requireActual('@/hooks/useDailyPuzzle'),
  useDailyPuzzle: jest.fn().mockReturnValue({}),
}));

jest.mock('@convex-dev/presence/react-native', () => ({
  ...jest.requireActual('@convex-dev/presence/react-native'),
  usePresence: jest.fn().mockReturnValue({}),
}));

jest.mock('@/hooks/useUser', () => ({
  ...jest.requireActual('@/hooks/useUser'),
  useUser: jest.fn().mockReturnValue({}),
}));

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

describe('DailyPuzzleScreen', () => {
  const mockNavigate = jest.fn();
  const mockSetNavigationOptions = jest.fn();
  const mockCapturePosthogException = jest.fn();

  const sentryCaptureExceptionSpy = captureException as jest.Mock;
  const useDailyPuzzleSpy = useDailyPuzzle as jest.Mock;
  const useNavigationSpy = useNavigation as jest.Mock;
  const useRouterSpy = useRouter as jest.Mock;
  const usePostHogSpy = usePostHog as jest.Mock;
  const usePresenceSpy = usePresence as jest.Mock;
  const useUserSpy = useUser as jest.Mock;

  const defaultDailyPuzzleOptions = {
    attempts: [],
    puzzle: testDailyPuzzle1,
    isLoading: false,
    isSolved: false,
    isDone: false,
    onSubmitAttempt: jest.fn(),
  };

  beforeEach(() => {
    usePostHogSpy.mockReturnValue({ captureException: mockCapturePosthogException });
    useRouterSpy.mockReturnValue({ navigate: mockNavigate });
    useNavigationSpy.mockReturnValue({ setOptions: mockSetNavigationOptions });
    useDailyPuzzleSpy.mockReturnValue(defaultDailyPuzzleOptions);
    useUserSpy.mockReturnValue({ user: testUser1 });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should navigate to puzzle solved screen and set navigation options with header right element when puzzle is done', () => {
    useDailyPuzzleSpy.mockReturnValue({ ...defaultDailyPuzzleOptions, isDone: true });

    render(<DailyPuzzleScreen />);

    expect(mockNavigate).toHaveBeenCalledWith('/play/daily-puzzle-solved');
    expect(mockSetNavigationOptions).toHaveBeenCalledWith({ headerRight: expect.any(Function) });
  });

  it('should not navigate to puzzle solved screen and set navigation options with header right element set to null when puzzle is not solved', () => {
    useDailyPuzzleSpy.mockReturnValue({ ...defaultDailyPuzzleOptions, isDone: false });

    render(<DailyPuzzleScreen />);

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockSetNavigationOptions).toHaveBeenCalledWith({ headerRight: null });
  });

  it('should throw an error if puzzle is not loading and no puzzle data exists', async () => {
    useDailyPuzzleSpy.mockReturnValue({ ...defaultDailyPuzzleOptions, isLoading: false, puzzle: null });

    expect(() => render(<DailyPuzzleScreen />)).toThrow('Daily puzzle not found!');

    await waitFor(() => {
      expect(mockCapturePosthogException).toHaveBeenCalledWith(new Error('Daily puzzle not found!'));
      expect(sentryCaptureExceptionSpy).toHaveBeenCalledWith(new Error('Daily puzzle not found!'));
    });
  });

  it.each([
    { desc: 'puzzle data is available', isLoading: false, puzzle: testDailyPuzzle1 },
    { desc: 'puzzle data is loading', isLoading: true, puzzle: null },
  ])('should not throw an error if $desc', ({ isLoading, puzzle }) => {
    useDailyPuzzleSpy.mockReturnValue({ ...defaultDailyPuzzleOptions, isLoading, puzzle });

    expect(() => render(<DailyPuzzleScreen />)).not.toThrow();

    expect(mockCapturePosthogException).not.toHaveBeenCalled();
    expect(sentryCaptureExceptionSpy).not.toHaveBeenCalled();
  });

  it('should render loading state when puzzle data is loading', () => {
    useDailyPuzzleSpy.mockReturnValue({ ...defaultDailyPuzzleOptions, isLoading: true, puzzle: null });

    render(<DailyPuzzleScreen />);

    expect(screen.queryByText('Iščem aktivno igro...')).toBeOnTheScreen();
  });

  it('should render puzzle guess grid and keyboard when puzzle data is available', () => {
    useDailyPuzzleSpy.mockReturnValue({ ...defaultDailyPuzzleOptions, puzzle: testDailyPuzzle1 });

    render(<DailyPuzzleScreen />);

    expect(screen.getAllByTestId(/^guess-grid--row-\d+$/).length).toBe(6);
    expect(screen.getAllByTestId(/^keyboard-key--[A-Za-z]+$/).length).toBeGreaterThan(0);
  });

  it('should trigger user presence hook', () => {
    render(<DailyPuzzleScreen />);

    expect(usePresenceSpy).toHaveBeenCalledWith(api.presence, 'daily-puzzle', testUser1.nickname);
  });

  it('should trigger user presence hook with empty string as a user id when user data is not available', () => {
    useUserSpy.mockReturnValue({ user: null });
    render(<DailyPuzzleScreen />);

    expect(usePresenceSpy).toHaveBeenCalledWith(api.presence, 'daily-puzzle', '');
  });
});

describe('DailyPuzzleScreen - ErrorBoundary', () => {
  it('should render the daily puzzle error screen', () => {
    const mockRetry = jest.fn().mockResolvedValue(null);
    render(<ErrorBoundary error={new Error('Ups')} retry={mockRetry} />);

    expect(screen.queryByText('To pa je nerodno...')).toBeOnTheScreen();
    expect(screen.queryByText('Dnevne uganke nismo uspeli najti.')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Poizkusi ponovno' }));

    expect(mockRetry).toHaveBeenCalled();
  });
});
