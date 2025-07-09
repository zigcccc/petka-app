import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { usePostHog } from 'posthog-react-native';

import { type Id } from '@/convex/_generated/dataModel';
import { puzzleType } from '@/convex/puzzles/models';
import { testCorrectPuzzleGuessAttempt1, testIncorrectPuzzleGuessAttempt1 } from '@/tests/fixtures/puzzleGuessAttempts';
import { testTrainingPuzzle1 } from '@/tests/fixtures/puzzles';
import { testUser1 } from '@/tests/fixtures/users';

import {
  useCreatePuzzleGuessAttemptMutation,
  useCreateTrainingPuzzleMutation,
  useMarkPuzzleAsSolvedMutation,
} from '../mutations';
import { usePuzzleAttemptsQuery, useActiveTrainingPuzzleQuery } from '../queries';
import { useToaster } from '../useToaster';
import { useUser } from '../useUser';

import { useTrainingPuzzle } from './useTrainingPuzzle';

jest.mock('posthog-react-native', () => ({
  ...jest.requireActual('posthog-react-native'),
  usePostHog: jest.fn(),
}));

jest.mock('../mutations', () => ({
  ...jest.requireActual('../mutations'),
  useCreatePuzzleGuessAttemptMutation: jest.fn().mockReturnValue({}),
  useCreateTrainingPuzzleMutation: jest.fn().mockReturnValue({}),
  useMarkPuzzleAsSolvedMutation: jest.fn().mockReturnValue({}),
}));

jest.mock('../queries', () => ({
  ...jest.requireActual('../queries'),
  useActiveTrainingPuzzleQuery: jest.fn().mockReturnValue({}),
  usePuzzleAttemptsQuery: jest.fn().mockReturnValue({}),
}));

jest.mock('../useToaster', () => ({
  ...jest.requireActual('../useToaster'),
  useToaster: jest.fn(),
}));

jest.mock('../useUser', () => ({
  ...jest.requireActual('../useUser'),
  useUser: jest.fn(),
}));

describe('useTrainingPuzzle', () => {
  const mockCaptureEvent = jest.fn();
  const mockCaptureException = jest.fn();
  const mockToast = jest.fn();

  const mockCreateTrainingPuzzle = jest.fn();
  const mockMarkPuzzleAsSolved = jest.fn();
  const mockCreatePuzzleGuessAttempt = jest.fn();

  const usePostHogSpy = usePostHog as jest.Mock;
  const useToasterSpy = useToaster as jest.Mock;
  const useUserSpy = useUser as jest.Mock;
  const useActiveTrainingPuzzleQuerySpy = useActiveTrainingPuzzleQuery as jest.Mock;
  const usePuzzleAttemptsQuerySpy = usePuzzleAttemptsQuery as jest.Mock;
  const useCreatePuzzleGuessAttemptMutationSpy = useCreatePuzzleGuessAttemptMutation as jest.Mock;
  const useCreateTrainingPuzzleMutationSpy = useCreateTrainingPuzzleMutation as jest.Mock;
  const useMarkPuzzleAsSolvedMutationSpy = useMarkPuzzleAsSolvedMutation as jest.Mock;
  const hapticsNotificationAsyncSpy = jest.spyOn(Haptics, 'notificationAsync');
  const hapticsImpactAsyncSpy = jest.spyOn(Haptics, 'impactAsync');

  beforeEach(() => {
    useCreateTrainingPuzzleMutationSpy.mockReturnValue({ mutate: mockCreateTrainingPuzzle });
    useMarkPuzzleAsSolvedMutationSpy.mockReturnValue({ mutate: mockMarkPuzzleAsSolved });
    useCreatePuzzleGuessAttemptMutationSpy.mockReturnValueOnce({ mutate: mockCreatePuzzleGuessAttempt });
    usePostHogSpy.mockReturnValue({ capture: mockCaptureEvent, captureException: mockCaptureException });
    useToasterSpy.mockReturnValue({ toast: mockToast });
    useUserSpy.mockReturnValue({ user: testUser1 });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should trigger puzzle query with userId param', () => {
    renderHook(() => useTrainingPuzzle());

    expect(useActiveTrainingPuzzleQuerySpy).toHaveBeenCalledWith({ userId: testUser1._id });
  });

  it('should trigger puzzle query with "skip" param when use data is not available', () => {
    useUserSpy.mockReturnValue({ user: null });
    renderHook(() => useTrainingPuzzle());

    expect(useActiveTrainingPuzzleQuerySpy).toHaveBeenCalledWith('skip');
  });

  it('should trigger attempts query with userId and puzzleId params', () => {
    useUserSpy.mockReturnValue({ user: testUser1 });
    useActiveTrainingPuzzleQuerySpy.mockReturnValue({ data: testTrainingPuzzle1 });

    renderHook(() => useTrainingPuzzle());

    expect(usePuzzleAttemptsQuerySpy).toHaveBeenCalledWith({
      userId: testUser1._id,
      puzzleId: testTrainingPuzzle1._id,
    });
  });

  it.each([
    { desc: 'user data is not available', user: null, puzzle: testTrainingPuzzle1 },
    { desc: 'puzzle data is not available', user: testUser1, puzzle: null },
  ])('should trigger attempts query with "skip" param when $desc', ({ user, puzzle }) => {
    useUserSpy.mockReturnValue({ user });
    useActiveTrainingPuzzleQuerySpy.mockReturnValue({ data: puzzle });

    renderHook(() => useTrainingPuzzle());

    expect(usePuzzleAttemptsQuerySpy).toHaveBeenCalledWith('skip');
  });

  it('should trigger create training puzzle mutation when training puzzle is not found and puzzle is not currently being created - success scenario', async () => {
    mockCreateTrainingPuzzle.mockResolvedValue('createdPuzzleId');
    useActiveTrainingPuzzleQuerySpy.mockReturnValue({ data: null });

    renderHook(() => useTrainingPuzzle());

    expect(mockCreateTrainingPuzzle).toHaveBeenCalledWith({ userId: testUser1._id });

    await waitFor(() => {
      expect(mockCaptureEvent).toHaveBeenCalledWith('puzzle:created', {
        puzzleId: 'createdPuzzleId',
        userId: testUser1._id,
        type: puzzleType.Enum.training,
      });
    });

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should trigger create training puzzle mutation when training puzzle is not found and puzzle is not currently being created - error scenario', async () => {
    mockCreateTrainingPuzzle.mockRejectedValue(new Error('Ups'));
    useActiveTrainingPuzzleQuerySpy.mockReturnValue({ data: null });

    renderHook(() => useTrainingPuzzle());

    expect(mockCreateTrainingPuzzle).toHaveBeenCalledWith({ userId: testUser1._id });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Nekaj je šlo narobe.', { intent: 'error' });
    });

    expect(mockCaptureEvent).not.toHaveBeenCalled();
  });

  it.each([
    { desc: 'puzzle aleady exists', puzzle: testTrainingPuzzle1, isCreating: false },
    { desc: 'puzzle data is loading', puzzle: undefined, isCreating: false },
    { desc: 'is already creating a puzzle', puzzle: null, isCreating: true },
  ])('should not rigger create training puzzle mutation when $desc', async ({ puzzle, isCreating }) => {
    mockCreateTrainingPuzzle.mockRejectedValue(new Error('Ups'));
    useCreateTrainingPuzzleMutationSpy.mockReturnValue({ mutate: mockCreateTrainingPuzzle, isLoading: isCreating });
    useActiveTrainingPuzzleQuerySpy.mockReturnValue({ data: puzzle });

    renderHook(() => useTrainingPuzzle());

    expect(mockCreateTrainingPuzzle).not.toHaveBeenCalled();
  });

  it('should set isSolved=true when last puzzle attempt is correct', () => {
    usePuzzleAttemptsQuerySpy.mockReturnValue({
      data: [testIncorrectPuzzleGuessAttempt1, testCorrectPuzzleGuessAttempt1],
    });

    const { result } = renderHook(() => useTrainingPuzzle());

    expect(result.current.isSolved).toBe(true);
  });

  it.each([
    { desc: 'attempts data is not available', attempts: undefined },
    { desc: 'last attempts is not correct', attempts: [testIncorrectPuzzleGuessAttempt1] },
  ])('should set isSolved=false when $desc', ({ attempts }) => {
    usePuzzleAttemptsQuerySpy.mockReturnValue({ data: attempts });

    const { result } = renderHook(() => useTrainingPuzzle());

    expect(result.current.isSolved).toBe(false);
  });

  it('should set isFailed=true when length of attempts is 6 and last attempts is not correct', () => {
    const attempts = new Array(6).fill(null).map((_, idx) => ({
      ...testIncorrectPuzzleGuessAttempt1,
      _id: `incorrectAttempt${idx}` as Id<'puzzleGuessAttempts'>,
    }));
    usePuzzleAttemptsQuerySpy.mockReturnValue({ data: attempts });

    const { result } = renderHook(() => useTrainingPuzzle());

    expect(result.current.isFailed).toBe(true);
  });

  it('should set isFailed=false when length of attempts is 6 and last attempts is correct', () => {
    const incorrectAttempts = new Array(5).fill(null).map((_, idx) => ({
      ...testIncorrectPuzzleGuessAttempt1,
      _id: `incorrectAttempt${idx}` as Id<'puzzleGuessAttempts'>,
    }));
    usePuzzleAttemptsQuerySpy.mockReturnValue({ data: [...incorrectAttempts, testCorrectPuzzleGuessAttempt1] });

    const { result } = renderHook(() => useTrainingPuzzle());

    expect(result.current.isFailed).toBe(false);
  });

  it.each([
    { desc: 'attempts data is not available', attempts: undefined },
    { desc: 'attempts length is not 6', attempts: [testIncorrectPuzzleGuessAttempt1] },
  ])('should set isFailed=false when $desc', ({ attempts }) => {
    usePuzzleAttemptsQuerySpy.mockReturnValue({ data: attempts });

    const { result } = renderHook(() => useTrainingPuzzle());

    expect(result.current.isFailed).toBe(false);
  });

  it('should trigger markPuzzleAsSolved mutation on onMarkAsSolved action', async () => {
    useActiveTrainingPuzzleQuerySpy.mockReturnValue({ data: testTrainingPuzzle1 });
    mockMarkPuzzleAsSolved.mockResolvedValue(null);

    const { result } = renderHook(() => useTrainingPuzzle());

    act(() => {
      result.current.onMarkAsSolved();
    });

    await waitFor(() => {
      expect(mockMarkPuzzleAsSolved).toHaveBeenCalledWith({ puzzleId: testTrainingPuzzle1._id, userId: testUser1._id });
    });

    await waitFor(() => {
      expect(mockCaptureEvent).toHaveBeenCalledWith('puzzle:solved', {
        puzzleId: testTrainingPuzzle1._id,
        userId: testUser1._id,
        type: puzzleType.Enum.training,
      });
    });
  });

  it('should trigger createPuzzleGuessAttempt mutation on onSubmitAttempt action - success scenario, attempt is not correct', async () => {
    useActiveTrainingPuzzleQuerySpy.mockReturnValue({ data: testTrainingPuzzle1 });
    mockCreatePuzzleGuessAttempt.mockResolvedValue({ isCorrect: false });

    const { result } = renderHook(() => useTrainingPuzzle());

    act(() => {
      result.current.onSubmitAttempt('shake');
    });

    await waitFor(() => {
      expect(mockCreatePuzzleGuessAttempt).toHaveBeenCalledWith({
        data: {
          userId: testUser1._id,
          puzzleId: testTrainingPuzzle1._id,
          attempt: 'shake',
        },
      });
    });

    await waitFor(() => {
      expect(hapticsImpactAsyncSpy).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
    });

    await waitFor(() => {
      expect(mockToast).not.toHaveBeenCalled();
    });

    expect(hapticsNotificationAsyncSpy).not.toHaveBeenCalled();
  });

  it('should trigger createPuzzleGuessAttempt mutation on onSubmitAttempt action - success scenario, attempt is correct', async () => {
    useActiveTrainingPuzzleQuerySpy.mockReturnValue({ data: testTrainingPuzzle1 });
    mockCreatePuzzleGuessAttempt.mockResolvedValue({ isCorrect: true });

    const { result } = renderHook(() => useTrainingPuzzle());

    act(() => {
      result.current.onSubmitAttempt('shake');
    });

    await waitFor(() => {
      expect(mockCreatePuzzleGuessAttempt).toHaveBeenCalledWith({
        data: {
          userId: testUser1._id,
          puzzleId: testTrainingPuzzle1._id,
          attempt: 'shake',
        },
      });
    });

    await waitFor(() => {
      expect(hapticsNotificationAsyncSpy).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Success);
    });

    await waitFor(() => {
      expect(mockToast).not.toHaveBeenCalled();
    });

    expect(hapticsImpactAsyncSpy).not.toHaveBeenCalled();
  });

  it('should trigger createPuzzleGuessAttempt mutation on onSubmitAttempt action - error scenario', async () => {
    useActiveTrainingPuzzleQuerySpy.mockReturnValue({ data: testTrainingPuzzle1 });
    mockCreatePuzzleGuessAttempt.mockRejectedValue(new Error('Ups'));

    const { result } = renderHook(() => useTrainingPuzzle());

    act(() => {
      result.current.onSubmitAttempt('shake');
    });

    await waitFor(() => {
      expect(mockCreatePuzzleGuessAttempt).toHaveBeenCalledWith({
        data: {
          userId: testUser1._id,
          puzzleId: testTrainingPuzzle1._id,
          attempt: 'shake',
        },
      });
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Nekaj je šlo narobe.', { intent: 'error' });
    });
  });
});
