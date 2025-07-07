import { act, renderHook, waitFor } from '@testing-library/react-native';
import { usePostHog } from 'posthog-react-native';

import { type Id } from '@/convex/_generated/dataModel';
import { puzzleType } from '@/convex/puzzles/models';
import { testCorrectPuzzleGuessAttempt1, testIncorrectPuzzleGuessAttempt1 } from '@/tests/fixtures/puzzleGuessAttempts';
import { testDailyPuzzle1 } from '@/tests/fixtures/puzzles';
import { testUser1 } from '@/tests/fixtures/users';

import { useCreatePuzzleGuessAttemptMutation, useMarkPuzzleAsSolvedMutation } from '../mutations';
import { useActiveDailyPuzzleQuery, usePuzzleAttemptsQuery } from '../queries';
import { useToaster } from '../useToaster';
import { useUser } from '../useUser';

import { useDailyPuzzle } from './useDailyPuzzle';

jest.mock('posthog-react-native', () => ({
  ...jest.requireActual('posthog-react-native'),
  usePostHog: jest.fn(),
}));

jest.mock('../useToaster', () => ({
  ...jest.requireActual('../useToaster'),
  useToaster: jest.fn(),
}));

jest.mock('../mutations', () => ({
  ...jest.requireActual('../mutations'),
  useMarkPuzzleAsSolvedMutation: jest.fn(),
  useCreatePuzzleGuessAttemptMutation: jest.fn(),
}));

jest.mock('../queries', () => ({
  ...jest.requireActual('../queries'),
  useActiveDailyPuzzleQuery: jest.fn().mockReturnValue({}),
  usePuzzleAttemptsQuery: jest.fn().mockReturnValue({}),
}));

jest.mock('../useUser', () => ({
  ...jest.requireActual('../useUser'),
  useUser: jest.fn().mockReturnValue({}),
}));

describe('useDailyPuzzle', () => {
  const mockCaptureEvent = jest.fn();
  const mockToast = jest.fn();
  const mockMarkPuzzleAsSolved = jest.fn();
  const mockCreatePuzzleGuessAttempt = jest.fn();

  const useActiveDailyPuzzleQuerySpy = useActiveDailyPuzzleQuery as jest.Mock;
  const usePuzzleAttemptsQuerySpy = usePuzzleAttemptsQuery as jest.Mock;
  const useCreatePuzzleGuessAttemptMutationSpy = useCreatePuzzleGuessAttemptMutation as jest.Mock;
  const useMarkPuzzleAsSolvedMutationSpy = useMarkPuzzleAsSolvedMutation as jest.Mock;
  const usePostHogSpy = usePostHog as jest.Mock;
  const useUserSpy = useUser as jest.Mock;
  const useToasterSpy = useToaster as jest.Mock;

  beforeEach(() => {
    useMarkPuzzleAsSolvedMutationSpy.mockReturnValue({ mutate: mockMarkPuzzleAsSolved });
    useCreatePuzzleGuessAttemptMutationSpy.mockReturnValue({ mutate: mockCreatePuzzleGuessAttempt });
    useUserSpy.mockReturnValue({ user: testUser1 });
    useToasterSpy.mockReturnValue({ toast: mockToast });
    usePostHogSpy.mockReturnValue({ capture: mockCaptureEvent });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should trigger puzzle attempts query with userId and puzzleId when user and puzzle data is available', () => {
    useActiveDailyPuzzleQuerySpy.mockReturnValue({ data: testDailyPuzzle1 });

    renderHook(() => useDailyPuzzle());

    expect(usePuzzleAttemptsQuerySpy).toHaveBeenCalledWith({ userId: testUser1._id, puzzleId: testDailyPuzzle1._id });
  });

  it.each([
    { desc: 'user data is not available', user: null, puzzle: testDailyPuzzle1 },
    { desc: 'puzzle data is not available', user: testUser1, puzzle: null },
  ])('should trigger puzzle attempts query with "skip" param when $desc', ({ user, puzzle }) => {
    useUserSpy.mockReturnValue({ user });
    useActiveDailyPuzzleQuerySpy.mockReturnValue({ data: puzzle });

    renderHook(() => useDailyPuzzle());

    expect(usePuzzleAttemptsQuerySpy).toHaveBeenCalledWith('skip');
  });

  it('should set isSolved=true when last puzzle attempt is correct', () => {
    usePuzzleAttemptsQuerySpy.mockReturnValue({
      data: [testIncorrectPuzzleGuessAttempt1, testCorrectPuzzleGuessAttempt1],
    });

    const { result } = renderHook(() => useDailyPuzzle());

    expect(result.current.isSolved).toBe(true);
  });

  it.each([
    { desc: 'attempts data is not available', attempts: undefined },
    { desc: 'last attempts is not correct', attempts: [testIncorrectPuzzleGuessAttempt1] },
  ])('should set isSolved=false when $desc', ({ attempts }) => {
    usePuzzleAttemptsQuerySpy.mockReturnValue({ data: attempts });

    const { result } = renderHook(() => useDailyPuzzle());

    expect(result.current.isSolved).toBe(false);
  });

  it('should set isFailed=true when length of attempts is 6 and last attempts is not correct', () => {
    const attempts = new Array(6).fill(null).map((_, idx) => ({
      ...testIncorrectPuzzleGuessAttempt1,
      _id: `incorrectAttempt${idx}` as Id<'puzzleGuessAttempts'>,
    }));
    usePuzzleAttemptsQuerySpy.mockReturnValue({ data: attempts });

    const { result } = renderHook(() => useDailyPuzzle());

    expect(result.current.isFailed).toBe(true);
  });

  it('should set isFailed=false when length of attempts is 6 and last attempts is correct', () => {
    const incorrectAttempts = new Array(5).fill(null).map((_, idx) => ({
      ...testIncorrectPuzzleGuessAttempt1,
      _id: `incorrectAttempt${idx}` as Id<'puzzleGuessAttempts'>,
    }));
    usePuzzleAttemptsQuerySpy.mockReturnValue({ data: [...incorrectAttempts, testCorrectPuzzleGuessAttempt1] });

    const { result } = renderHook(() => useDailyPuzzle());

    expect(result.current.isFailed).toBe(false);
  });

  it.each([
    { desc: 'attempts data is not available', attempts: undefined },
    { desc: 'attempts length is not 6', attempts: [testIncorrectPuzzleGuessAttempt1] },
  ])('should set isFailed=false when $desc', ({ attempts }) => {
    usePuzzleAttemptsQuerySpy.mockReturnValue({ data: attempts });

    const { result } = renderHook(() => useDailyPuzzle());

    expect(result.current.isFailed).toBe(false);
  });

  it('should trigger createPuzzleAttempt mutation on onSubmitAttempt action - success scenario, attempt is not correct', async () => {
    mockCreatePuzzleGuessAttempt.mockResolvedValue({ isCorrect: false });
    useActiveDailyPuzzleQuerySpy.mockReturnValue({ data: testDailyPuzzle1 });

    const { result } = renderHook(() => useDailyPuzzle());

    act(() => {
      result.current.onSubmitAttempt('spawn');
    });

    await waitFor(() => {
      expect(mockCreatePuzzleGuessAttempt).toHaveBeenCalledWith({
        data: {
          userId: testUser1._id,
          puzzleId: testDailyPuzzle1._id,
          attempt: 'spawn',
        },
      });
    });

    await waitFor(() => {
      expect(mockMarkPuzzleAsSolved).not.toHaveBeenCalled();
    });

    expect(mockCaptureEvent).not.toHaveBeenCalled();
    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should trigger createPuzzleAttempt mutation on onSubmitAttempt action - success scenario, attempt is correct', async () => {
    mockMarkPuzzleAsSolved.mockResolvedValue(null);
    mockCreatePuzzleGuessAttempt.mockResolvedValue({ isCorrect: true });
    useActiveDailyPuzzleQuerySpy.mockReturnValue({ data: testDailyPuzzle1 });

    const { result } = renderHook(() => useDailyPuzzle());

    act(() => {
      result.current.onSubmitAttempt('spawn');
    });

    await waitFor(() => {
      expect(mockCreatePuzzleGuessAttempt).toHaveBeenCalledWith({
        data: {
          userId: testUser1._id,
          puzzleId: testDailyPuzzle1._id,
          attempt: 'spawn',
        },
      });
    });

    await waitFor(() => {
      expect(mockMarkPuzzleAsSolved).toHaveBeenCalledWith({ puzzleId: testDailyPuzzle1._id, userId: testUser1._id });
    });

    expect(mockCaptureEvent).toHaveBeenCalledWith('puzzle:solved', {
      puzzleId: testDailyPuzzle1._id,
      userId: testUser1._id,
      type: puzzleType.Enum.daily,
    });

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should trigger createPuzzleAttempt mutation on onSubmitAttempt action - success scenario, attempt is correct', async () => {
    mockMarkPuzzleAsSolved.mockResolvedValue(null);
    mockCreatePuzzleGuessAttempt.mockResolvedValue({ isCorrect: true });
    useActiveDailyPuzzleQuerySpy.mockReturnValue({ data: testDailyPuzzle1 });

    const { result } = renderHook(() => useDailyPuzzle());

    act(() => {
      result.current.onSubmitAttempt('spawn');
    });

    await waitFor(() => {
      expect(mockCreatePuzzleGuessAttempt).toHaveBeenCalledWith({
        data: {
          userId: testUser1._id,
          puzzleId: testDailyPuzzle1._id,
          attempt: 'spawn',
        },
      });
    });

    await waitFor(() => {
      expect(mockMarkPuzzleAsSolved).toHaveBeenCalledWith({ puzzleId: testDailyPuzzle1._id, userId: testUser1._id });
    });

    expect(mockCaptureEvent).toHaveBeenCalledWith('puzzle:solved', {
      puzzleId: testDailyPuzzle1._id,
      userId: testUser1._id,
      type: puzzleType.Enum.daily,
    });

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should trigger createPuzzleAttempt mutation on onSubmitAttempt action - success scenario, attempt is correct', async () => {
    mockMarkPuzzleAsSolved.mockResolvedValue(null);
    mockCreatePuzzleGuessAttempt.mockResolvedValue({ isCorrect: true });
    useActiveDailyPuzzleQuerySpy.mockReturnValue({ data: testDailyPuzzle1 });

    const { result } = renderHook(() => useDailyPuzzle());

    act(() => {
      result.current.onSubmitAttempt('spawn');
    });

    await waitFor(() => {
      expect(mockCreatePuzzleGuessAttempt).toHaveBeenCalledWith({
        data: {
          userId: testUser1._id,
          puzzleId: testDailyPuzzle1._id,
          attempt: 'spawn',
        },
      });
    });

    await waitFor(() => {
      expect(mockMarkPuzzleAsSolved).toHaveBeenCalledWith({ puzzleId: testDailyPuzzle1._id, userId: testUser1._id });
    });

    expect(mockCaptureEvent).toHaveBeenCalledWith('puzzle:solved', {
      puzzleId: testDailyPuzzle1._id,
      userId: testUser1._id,
      type: puzzleType.Enum.daily,
    });

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should trigger createPuzzleAttempt mutation on onSubmitAttempt action - error scenario', async () => {
    mockCreatePuzzleGuessAttempt.mockRejectedValue(new Error('Ups'));
    useActiveDailyPuzzleQuerySpy.mockReturnValue({ data: testDailyPuzzle1 });

    const { result } = renderHook(() => useDailyPuzzle());

    act(() => {
      result.current.onSubmitAttempt('spawn');
    });

    await waitFor(() => {
      expect(mockCreatePuzzleGuessAttempt).toHaveBeenCalledWith({
        data: {
          userId: testUser1._id,
          puzzleId: testDailyPuzzle1._id,
          attempt: 'spawn',
        },
      });
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Nekaj je šlo narobe.', { intent: 'error' });
    });

    expect(mockMarkPuzzleAsSolved).not.toHaveBeenCalled();
    expect(mockCaptureEvent).not.toHaveBeenCalled();
  });
});
