import { act, renderHook as renderHookBase, waitFor } from '@testing-library/react-native';
import { ConvexError } from 'convex/values';
import * as Clipboard from 'expo-clipboard';
import { usePostHog } from 'posthog-react-native';
import { Alert } from 'react-native';

import { useActionSheet } from '@/context/ActionSheet';
import { usePrompt } from '@/context/Prompt';
import { type Id } from '@/convex/_generated/dataModel';
import {
  type LeaderboardRange,
  leaderboardRange,
  type LeaderboardType,
  leaderboardType,
} from '@/convex/leaderboards/models';

import {
  useCreatePrivateLeaderboardMutation,
  useDeletePrivateLeaderboardMutation,
  useJoinPrivateLeaderboardMutation,
  useLeavePrivateLeaderboardMutation,
  useUpdateLeaderboardNameMutation,
} from '../mutations';
import { useLeaderboardsQuery } from '../queries';
import { useToaster } from '../useToaster';
import { useUser } from '../useUser';

import { useLeaderboards } from './useLeaderboards';

jest.mock('posthog-react-native', () => ({
  ...jest.requireActual('posthog-react-native'),
  usePostHog: jest.fn(),
}));

jest.mock('@/context/ActionSheet', () => ({
  ...jest.requireActual('@/context/ActionSheet'),
  useActionSheet: jest.fn(),
}));

jest.mock('@/context/Prompt', () => ({
  ...jest.requireActual('@/context/Prompt'),
  usePrompt: jest.fn(),
}));

jest.mock('../useUser', () => ({
  useUser: jest.fn(),
}));

jest.mock('../useToaster', () => ({
  useToaster: jest.fn(),
}));

jest.mock('../mutations', () => ({
  ...jest.requireActual('../mutations'),
  useCreatePrivateLeaderboardMutation: jest.fn(),
  useDeletePrivateLeaderboardMutation: jest.fn(),
  useJoinPrivateLeaderboardMutation: jest.fn(),
  useLeavePrivateLeaderboardMutation: jest.fn(),
  useUpdateLeaderboardNameMutation: jest.fn(),
}));

jest.mock('../queries', () => ({
  ...jest.requireActual('../queries'),
  useLeaderboardsQuery: jest.fn(),
}));

jest.mock('expo-clipboard', () => ({
  ...jest.requireActual('expo-clipboard'),
  setStringAsync: jest.fn(),
}));

describe('useLeaderboards', () => {
  const mockCreatePrivateLeaderboard = jest.fn();
  const mockJoinPrivateLeaderboard = jest.fn();
  const mockDeletePrivateLeaderboard = jest.fn();
  const mockLeavePrivateLeaderboard = jest.fn();
  const mockUpdateLeaderboardName = jest.fn();
  const mockToast = jest.fn();
  const mockCaptureEvent = jest.fn();
  const showActionSheetWithOptionsSpy = jest.fn();
  const alertSpy = jest.spyOn(Alert, 'alert');
  const promptSpy = jest.fn();

  const useActionSheetSpy = useActionSheet as jest.Mock;
  const usePromptSpy = usePrompt as jest.Mock;
  const useCreatePrivateLeaderboardMutationSpy = useCreatePrivateLeaderboardMutation as jest.Mock;
  const useDeletePrivateLeaderboardMutationSpy = useDeletePrivateLeaderboardMutation as jest.Mock;
  const useJoinPrivateLeaderboardMutationSpy = useJoinPrivateLeaderboardMutation as jest.Mock;
  const useLeavePrivateLeaderboardMutationSpy = useLeavePrivateLeaderboardMutation as jest.Mock;
  const useUpdateLeaderboardNameMutationSpy = useUpdateLeaderboardNameMutation as jest.Mock;
  const useLeaderboardsQuerySpy = useLeaderboardsQuery as jest.Mock;
  const useToasterSpy = useToaster as jest.Mock;
  const useUserSpy = useUser as jest.Mock;
  const usePostHogSpy = usePostHog as jest.Mock;
  const clipboardSetStringAsyncSpy = Clipboard.setStringAsync as jest.Mock;

  const testLeaderboard = {
    _id: 'testLeaderboardId' as Id<'leaderboards'>,
    _creationTime: 1751438306804,
    type: leaderboardType.Enum.private,
    creatorId: 'testCreatorId' as Id<'users'>,
    inviteCode: 'INVITE_ME',
    name: 'Test leaderboard',
    users: [],
  };
  const testLeaderboards = [testLeaderboard];

  const testUser = { _id: 'testUserId' as Id<'users'> };

  const initialProps = { type: leaderboardType.Enum.private, range: leaderboardRange.Enum.weekly };

  const renderHook = renderHookBase<
    ReturnType<typeof useLeaderboards>,
    { type: LeaderboardType; range: LeaderboardRange }
  >;

  beforeEach(() => {
    useToasterSpy.mockReturnValue({ toast: mockToast });
    useUserSpy.mockReturnValue({ user: testUser });
    useCreatePrivateLeaderboardMutationSpy.mockReturnValue({ mutate: mockCreatePrivateLeaderboard });
    useDeletePrivateLeaderboardMutationSpy.mockReturnValue({ mutate: mockDeletePrivateLeaderboard });
    useJoinPrivateLeaderboardMutationSpy.mockReturnValue({ mutate: mockJoinPrivateLeaderboard });
    useLeavePrivateLeaderboardMutationSpy.mockReturnValue({ mutate: mockLeavePrivateLeaderboard });
    useUpdateLeaderboardNameMutationSpy.mockReturnValue({ mutate: mockUpdateLeaderboardName });
    useLeaderboardsQuerySpy.mockReturnValue({ data: testLeaderboards, isLoading: false });
    usePostHogSpy.mockReturnValue({ capture: mockCaptureEvent });
    useActionSheetSpy.mockReturnValue({ present: showActionSheetWithOptionsSpy });
    usePromptSpy.mockReturnValue(promptSpy);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should trigger leaderboards query hook with "skip" as an argument when user object is not available', () => {
    useUserSpy.mockReturnValue({ user: null });

    renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

    expect(useLeaderboardsQuerySpy).toHaveBeenCalledWith('skip');
  });

  it('should trigger leaderboards query hook with query args when user object is available', () => {
    useUserSpy.mockReturnValue({ user: testUser });

    renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

    expect(useLeaderboardsQuerySpy).toHaveBeenCalledWith({
      userId: testUser._id,
      type: initialProps.type,
      range: initialProps.range,
    });
  });

  it('should set isLoading to true when leaderboards query is loading', () => {
    useLeaderboardsQuerySpy.mockReturnValue({ data: undefined, isLoading: true });

    const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

    expect(result.current.isLoading).toBe(true);
  });

  it('should set isLoading to false when leaderboards query is not loading', () => {
    useLeaderboardsQuerySpy.mockReturnValue({ data: testLeaderboards, isLoading: false });

    const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

    expect(result.current.isLoading).toBe(false);
  });

  describe('join private leaderboard', () => {
    it('should trigger join private leaderboard mutation when invite code is received via prompt - success scenario', async () => {
      mockJoinPrivateLeaderboard.mockResolvedValue({ _id: 'leaderboard1' });
      const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

      result.current.onJoinPrivateLeaderboard();

      expect(promptSpy).toHaveBeenCalledWith('Koda:', '', [
        { text: 'Prekliči', isPreferred: false, style: 'cancel' },
        { text: 'Pridruži se', isPreferred: true, onPress: expect.any(Function) },
      ]);

      act(() => {
        promptSpy.mock.lastCall[2][1].onPress('invite_me');
      });

      expect(mockJoinPrivateLeaderboard).toHaveBeenCalledWith({ inviteCode: 'INVITE_ME', userId: testUser._id });

      await waitFor(() => {
        expect(mockCaptureEvent).toHaveBeenCalledWith('leaderboards:join', {
          leaderboardId: 'leaderboard1',
          userId: testUser._id,
          leaderboardType: leaderboardType.Enum.private,
        });
      });
      expect(mockToast).not.toHaveBeenCalled();
    });

    it.each([
      { errorMessage: 'Invalid invite code.', expectedErrorText: 'Neveljavna koda.', expectedIntent: 'error' },
      {
        errorMessage: 'Already joined this leaderboard.',
        expectedErrorText: 'Tej lestvici si že pridružen/a.',
        expectedIntent: 'warning',
      },
      { errorMessage: 'Unknown error.', expectedErrorText: 'Nekaj je šlo narobe.', expectedIntent: 'error' },
    ])(
      'should trigger join private leaderboard mutation when invite code is received via prompt - error scenario - $errorMessage',
      async ({ errorMessage, expectedErrorText, expectedIntent }) => {
        mockJoinPrivateLeaderboard.mockRejectedValue(new ConvexError({ message: errorMessage }));
        const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

        result.current.onJoinPrivateLeaderboard();

        expect(promptSpy).toHaveBeenCalledWith('Koda:', '', [
          { text: 'Prekliči', isPreferred: false, style: 'cancel' },
          { text: 'Pridruži se', isPreferred: true, onPress: expect.any(Function) },
        ]);

        act(() => {
          promptSpy.mock.lastCall[2][1].onPress('invite_me');
        });

        expect(mockJoinPrivateLeaderboard).toHaveBeenCalledWith({ inviteCode: 'INVITE_ME', userId: testUser._id });

        await waitFor(() => {
          expect(mockToast).toHaveBeenCalledWith(expectedErrorText, { intent: expectedIntent });
        });

        expect(mockCaptureEvent).not.toHaveBeenCalled();
      }
    );

    it('should trigger join private leaderboard mutation when invite code is received via prompt - error scenario - unknown error', async () => {
      mockJoinPrivateLeaderboard.mockRejectedValue(new Error('Ups'));
      const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

      result.current.onJoinPrivateLeaderboard();

      expect(promptSpy).toHaveBeenCalledWith('Koda:', '', [
        { text: 'Prekliči', isPreferred: false, style: 'cancel' },
        { text: 'Pridruži se', isPreferred: true, onPress: expect.any(Function) },
      ]);

      act(() => {
        promptSpy.mock.lastCall[2][1].onPress('invite_me');
      });

      expect(mockJoinPrivateLeaderboard).toHaveBeenCalledWith({ inviteCode: 'INVITE_ME', userId: testUser._id });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith('Nekaj je šlo narobe.', { intent: 'error' });
      });

      expect(mockCaptureEvent).not.toHaveBeenCalled();
    });

    it.each([undefined, null, ''])(
      'should not trigger join private leaderboard mutation when invite code is not received via prompt (is %p)',
      async (inviteCode) => {
        mockJoinPrivateLeaderboard.mockRejectedValue(new Error('Ups'));
        const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

        result.current.onJoinPrivateLeaderboard();

        expect(promptSpy).toHaveBeenCalledWith('Koda:', '', [
          { text: 'Prekliči', isPreferred: false, style: 'cancel' },
          { text: 'Pridruži se', isPreferred: true, onPress: expect.any(Function) },
        ]);

        act(() => {
          promptSpy.mock.lastCall[2][1].onPress(inviteCode);
        });

        expect(mockJoinPrivateLeaderboard).not.toHaveBeenCalled();
        expect(mockToast).not.toHaveBeenCalled();
        expect(mockCaptureEvent).not.toHaveBeenCalled();
      }
    );

    it('should not trigger join private leaderboard mutation when cancel action is triggered', async () => {
      mockJoinPrivateLeaderboard.mockRejectedValue(new Error('Ups'));
      const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

      result.current.onJoinPrivateLeaderboard();

      expect(promptSpy).toHaveBeenCalledWith('Koda:', '', [
        { text: 'Prekliči', isPreferred: false, style: 'cancel' },
        { text: 'Pridruži se', isPreferred: true, onPress: expect.any(Function) },
      ]);

      expect(mockJoinPrivateLeaderboard).not.toHaveBeenCalled();
      expect(mockToast).not.toHaveBeenCalled();
      expect(mockCaptureEvent).not.toHaveBeenCalled();
    });
  });

  describe('create private leaderboard', () => {
    it('should trigger create private leaderboard mutation when leaderboard name is received via prompt - success scenario', async () => {
      mockCreatePrivateLeaderboard.mockResolvedValue('leaderboardId');
      const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

      result.current.onCreatePrivateLeaderboard();

      expect(promptSpy).toHaveBeenCalledWith('Ime lestvice:', '', [
        { text: 'Prekliči', isPreferred: false, style: 'cancel' },
        { text: 'Ustvari', isPreferred: true, onPress: expect.any(Function) },
      ]);

      act(() => {
        promptSpy.mock.lastCall[2][1].onPress('New board');
      });

      expect(mockCreatePrivateLeaderboard).toHaveBeenCalledWith({ userId: testUser._id, data: { name: 'New board' } });

      await waitFor(() => {
        expect(mockCaptureEvent).toHaveBeenCalledWith('leaderboards:create', {
          leaderboardId: 'leaderboardId',
          userId: testUser._id,
          leaderboardType: leaderboardType.Enum.private,
        });
      });

      expect(mockToast).not.toHaveBeenCalled();
    });

    it('should trigger join private leaderboard mutation when invite code is received via prompt - error scenario - unknown error', async () => {
      mockCreatePrivateLeaderboard.mockRejectedValue(new Error('Ups'));
      const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

      result.current.onCreatePrivateLeaderboard();

      expect(promptSpy).toHaveBeenCalledWith('Ime lestvice:', '', [
        { text: 'Prekliči', isPreferred: false, style: 'cancel' },
        { text: 'Ustvari', isPreferred: true, onPress: expect.any(Function) },
      ]);

      act(() => {
        promptSpy.mock.lastCall[2][1].onPress('New board');
      });

      expect(mockCreatePrivateLeaderboard).toHaveBeenCalledWith({ userId: testUser._id, data: { name: 'New board' } });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith('Nekaj je šlo narobe.', { intent: 'error' });
      });

      expect(mockCaptureEvent).not.toHaveBeenCalled();
    });

    it.each([undefined, null, ''])(
      'should not trigger creating private leaderboard mutation when leaderboard name is not received via prompt (is %p)',
      async (name) => {
        mockCreatePrivateLeaderboard.mockRejectedValue(new Error('Ups'));
        const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

        result.current.onCreatePrivateLeaderboard();

        expect(promptSpy).toHaveBeenCalledWith('Ime lestvice:', '', [
          { text: 'Prekliči', isPreferred: false, style: 'cancel' },
          { text: 'Ustvari', isPreferred: true, onPress: expect.any(Function) },
        ]);

        act(() => {
          promptSpy.mock.lastCall[2][1].onPress(name);
        });

        expect(mockCreatePrivateLeaderboard).not.toHaveBeenCalled();
        expect(mockToast).not.toHaveBeenCalled();
        expect(mockCaptureEvent).not.toHaveBeenCalled();
      }
    );

    it('should not trigger creating private leaderboard mutation when cancel action is triggered', async () => {
      mockCreatePrivateLeaderboard.mockRejectedValue(new Error('Ups'));
      const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

      result.current.onCreatePrivateLeaderboard();

      expect(promptSpy).toHaveBeenCalledWith('Ime lestvice:', '', [
        { text: 'Prekliči', isPreferred: false, style: 'cancel' },
        { text: 'Ustvari', isPreferred: true, onPress: expect.any(Function) },
      ]);

      expect(mockCreatePrivateLeaderboard).not.toHaveBeenCalled();
      expect(mockToast).not.toHaveBeenCalled();
      expect(mockCaptureEvent).not.toHaveBeenCalled();
    });
  });

  describe('leaderboard actions - current user is leaderboard creator', () => {
    const testLeaderboardWithCurrentUserAsCreator = { ...testLeaderboard, creatorId: testUser._id };
    const expectedActionSheetOptions = {
      options: ['Izbriši lestvico', 'Uredi ime lestvice', 'Povabi prijatelja', 'Prekliči'],
      cancelButtonIndex: 3,
      destructiveButtonIndex: 0,
      title: `Upravljanje lestvice "Test leaderboard"`,
      message: 'Si lastnik/ca te lestvice.',
      disabledButtonIndices: undefined,
    };

    it('should trigger delete leaderboard mutation - success scenario', async () => {
      mockDeletePrivateLeaderboard.mockResolvedValue(null);
      showActionSheetWithOptionsSpy.mockImplementation((_opts, callback) => callback(0));

      const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

      result.current.onPresentLeaderboardActions(testLeaderboardWithCurrentUserAsCreator);

      expect(showActionSheetWithOptionsSpy).toHaveBeenCalledWith(expectedActionSheetOptions, expect.any(Function));
      expect(alertSpy).toHaveBeenCalledWith(
        'Si prepričan/a?',
        'Ko je lestvica enkrat izbrisana je ni mogoče pridobiti nazaj.',
        [
          { isPreferred: true, style: 'cancel', text: 'Prekliči' },
          { isPreferred: false, style: 'destructive', text: 'Izbriši', onPress: expect.any(Function) },
        ]
      );

      act(() => {
        alertSpy.mock.lastCall?.[2]?.[1].onPress?.();
      });

      expect(mockDeletePrivateLeaderboard).toHaveBeenCalledWith({
        leaderboardId: testLeaderboardWithCurrentUserAsCreator._id,
        userId: testUser._id,
      });

      await waitFor(() => {
        expect(mockCaptureEvent).toHaveBeenCalledWith('leaderboards:delete', {
          leaderboardId: testLeaderboardWithCurrentUserAsCreator._id,
          userId: testUser._id,
          leaderboardType: leaderboardType.Enum.private,
        });
      });

      expect(mockCaptureEvent).toHaveBeenCalledWith('leaderboards:actions_open', {
        leaderboardId: testLeaderboardWithCurrentUserAsCreator._id,
        userId: testUser._id,
        leaderboardType: leaderboardType.Enum.private,
      });
      expect(mockToast).not.toHaveBeenCalled();
    });

    it('should trigger delete leaderboard mutation - error scenario', async () => {
      const error = new Error('Ups');
      mockDeletePrivateLeaderboard.mockRejectedValue(error);
      showActionSheetWithOptionsSpy.mockImplementation((_opts, callback) => callback(0));

      const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

      result.current.onPresentLeaderboardActions(testLeaderboardWithCurrentUserAsCreator);

      expect(showActionSheetWithOptionsSpy).toHaveBeenCalledWith(expectedActionSheetOptions, expect.any(Function));
      expect(alertSpy).toHaveBeenCalledWith(
        'Si prepričan/a?',
        'Ko je lestvica enkrat izbrisana je ni mogoče pridobiti nazaj.',
        [
          { isPreferred: true, style: 'cancel', text: 'Prekliči' },
          { isPreferred: false, style: 'destructive', text: 'Izbriši', onPress: expect.any(Function) },
        ]
      );

      act(() => {
        alertSpy.mock.lastCall?.[2]?.[1].onPress?.();
      });

      expect(mockDeletePrivateLeaderboard).toHaveBeenCalledWith({
        leaderboardId: testLeaderboardWithCurrentUserAsCreator._id,
        userId: testUser._id,
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith('Nekaj je šlo narobe.', { intent: 'error' });
      });

      expect(mockCaptureEvent).toHaveBeenCalledWith('leaderboards:actions_open', {
        leaderboardId: testLeaderboardWithCurrentUserAsCreator._id,
        userId: testUser._id,
        leaderboardType: leaderboardType.Enum.private,
      });
      expect(mockCaptureEvent).not.toHaveBeenCalledWith('leaderboards:delete', {
        leaderboardId: testLeaderboardWithCurrentUserAsCreator._id,
        userId: testUser._id,
        leaderboardType: leaderboardType.Enum.private,
      });
    });

    it('should trigger update leaderboard name mutation - success scenario', async () => {
      mockUpdateLeaderboardName.mockResolvedValue(null);
      showActionSheetWithOptionsSpy.mockImplementation((_opts, callback) => callback(1));

      const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

      result.current.onPresentLeaderboardActions(testLeaderboardWithCurrentUserAsCreator);

      expect(showActionSheetWithOptionsSpy).toHaveBeenCalledWith(expectedActionSheetOptions, expect.any(Function));
      expect(promptSpy).toHaveBeenCalledWith('Ime lestvice:', '', [
        { isPreferred: false, style: 'cancel', text: 'Prekliči' },
        { isPreferred: true, text: 'Posodobi', onPress: expect.any(Function) },
      ]);

      act(() => {
        promptSpy.mock.lastCall?.[2]?.[1].onPress?.('New leaderboard name');
      });

      expect(mockUpdateLeaderboardName).toHaveBeenCalledWith({
        leaderboardId: testLeaderboardWithCurrentUserAsCreator._id,
        userId: testUser._id,
        data: { name: 'New leaderboard name' },
      });

      await waitFor(() => {
        expect(mockCaptureEvent).toHaveBeenCalledWith('leaderboards:update_name', {
          leaderboardId: testLeaderboardWithCurrentUserAsCreator._id,
          userId: testUser._id,
          leaderboardType: leaderboardType.Enum.private,
        });
      });

      expect(mockToast).not.toHaveBeenCalled();
      expect(mockCaptureEvent).toHaveBeenCalledWith('leaderboards:actions_open', {
        leaderboardId: testLeaderboardWithCurrentUserAsCreator._id,
        userId: testUser._id,
        leaderboardType: leaderboardType.Enum.private,
      });
    });

    it('should trigger update leaderboard name mutation - error scenario', async () => {
      const error = new Error('Ups');
      mockUpdateLeaderboardName.mockRejectedValue(error);
      showActionSheetWithOptionsSpy.mockImplementation((_opts, callback) => callback(1));

      const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

      result.current.onPresentLeaderboardActions(testLeaderboardWithCurrentUserAsCreator);

      expect(showActionSheetWithOptionsSpy).toHaveBeenCalledWith(expectedActionSheetOptions, expect.any(Function));
      expect(promptSpy).toHaveBeenCalledWith('Ime lestvice:', '', [
        { isPreferred: false, style: 'cancel', text: 'Prekliči' },
        { isPreferred: true, text: 'Posodobi', onPress: expect.any(Function) },
      ]);

      act(() => {
        promptSpy.mock.lastCall?.[2]?.[1].onPress?.('New leaderboard name');
      });

      expect(mockUpdateLeaderboardName).toHaveBeenCalledWith({
        leaderboardId: testLeaderboardWithCurrentUserAsCreator._id,
        userId: testUser._id,
        data: { name: 'New leaderboard name' },
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith('Nekaj je šlo narobe.', { intent: 'error' });
      });
      expect(mockCaptureEvent).toHaveBeenCalledWith('leaderboards:actions_open', {
        leaderboardId: testLeaderboardWithCurrentUserAsCreator._id,
        userId: testUser._id,
        leaderboardType: leaderboardType.Enum.private,
      });
      expect(mockCaptureEvent).not.toHaveBeenCalledWith('leaderboards:update_name', {
        leaderboardId: testLeaderboardWithCurrentUserAsCreator._id,
        userId: testUser._id,
        leaderboardType: leaderboardType.Enum.private,
      });
    });

    it.each([undefined, null, ''])(
      'should trigger update leaderboard name mutation - new name not provided (is %p)',
      async (newLeaderboardName) => {
        mockUpdateLeaderboardName.mockRejectedValue(new Error('Ups'));
        showActionSheetWithOptionsSpy.mockImplementation((_opts, callback) => callback(1));

        const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

        result.current.onPresentLeaderboardActions(testLeaderboardWithCurrentUserAsCreator);

        expect(showActionSheetWithOptionsSpy).toHaveBeenCalledWith(expectedActionSheetOptions, expect.any(Function));
        expect(promptSpy).toHaveBeenCalledWith('Ime lestvice:', '', [
          { isPreferred: false, style: 'cancel', text: 'Prekliči' },
          { isPreferred: true, text: 'Posodobi', onPress: expect.any(Function) },
        ]);

        act(() => {
          promptSpy.mock.lastCall?.[2]?.[1].onPress?.(newLeaderboardName);
        });

        expect(mockUpdateLeaderboardName).not.toHaveBeenCalled();

        expect(mockToast).not.toHaveBeenCalled();
        expect(mockCaptureEvent).toHaveBeenCalledWith('leaderboards:actions_open', {
          leaderboardId: testLeaderboardWithCurrentUserAsCreator._id,
          userId: testUser._id,
          leaderboardType: leaderboardType.Enum.private,
        });
        expect(mockCaptureEvent).not.toHaveBeenCalledWith('leaderboards:update_name', {
          leaderboardId: testLeaderboardWithCurrentUserAsCreator._id,
          userId: testUser._id,
          leaderboardType: leaderboardType.Enum.private,
        });
      }
    );

    it('should trigger update leaderboard name mutation - action is cancelled', async () => {
      mockUpdateLeaderboardName.mockRejectedValue(new Error('Ups'));
      showActionSheetWithOptionsSpy.mockImplementation((_opts, callback) => callback(1));

      const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

      result.current.onPresentLeaderboardActions(testLeaderboardWithCurrentUserAsCreator);

      expect(showActionSheetWithOptionsSpy).toHaveBeenCalledWith(expectedActionSheetOptions, expect.any(Function));
      expect(promptSpy).toHaveBeenCalledWith('Ime lestvice:', '', [
        { isPreferred: false, style: 'cancel', text: 'Prekliči' },
        { isPreferred: true, text: 'Posodobi', onPress: expect.any(Function) },
      ]);

      act(() => {
        promptSpy.mock.lastCall?.[2]?.[0].onPress?.();
      });

      expect(mockUpdateLeaderboardName).not.toHaveBeenCalled();

      expect(mockToast).not.toHaveBeenCalled();
      expect(mockCaptureEvent).toHaveBeenCalledWith('leaderboards:actions_open', {
        leaderboardId: testLeaderboardWithCurrentUserAsCreator._id,
        userId: testUser._id,
        leaderboardType: leaderboardType.Enum.private,
      });
      expect(mockCaptureEvent).not.toHaveBeenCalledWith('leaderboards:update_name', {
        leaderboardId: testLeaderboardWithCurrentUserAsCreator._id,
        userId: testUser._id,
        leaderboardType: leaderboardType.Enum.private,
      });
    });

    it('should display alert with invite code on "Invite friend" action trigger', async () => {
      clipboardSetStringAsyncSpy.mockResolvedValue(null);
      showActionSheetWithOptionsSpy.mockImplementation((_opts, callback) => callback(2));

      const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

      result.current.onPresentLeaderboardActions(testLeaderboardWithCurrentUserAsCreator);

      expect(showActionSheetWithOptionsSpy).toHaveBeenCalledWith(expectedActionSheetOptions, expect.any(Function));
      expect(alertSpy).toHaveBeenCalledWith('Povabi prijatelja', 'Koda: INVITE_ME', [
        { isPreferred: false, style: 'cancel', text: 'Zapri' },
        { isPreferred: true, style: 'default', text: 'Kopiraj', onPress: expect.any(Function) },
      ]);

      act(() => {
        alertSpy.mock.lastCall?.[2]?.[1].onPress?.();
      });

      await waitFor(() => {
        expect(clipboardSetStringAsyncSpy).toHaveBeenCalledWith(testLeaderboardWithCurrentUserAsCreator.inviteCode);
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith('Koda kopirana', { intent: 'success' });
      });

      expect(mockCaptureEvent).toHaveBeenCalledWith('leaderboards:actions_open', {
        leaderboardId: testLeaderboardWithCurrentUserAsCreator._id,
        userId: testUser._id,
        leaderboardType: leaderboardType.Enum.private,
      });
      expect(mockCaptureEvent).toHaveBeenCalledWith('leaderboards:invite_code:copy', {
        leaderboardType: leaderboardType.Enum.private,
      });
    });

    it('should not display alert with invite code on "Invite friend" action trigger when leaderboard does not have an invite code', async () => {
      clipboardSetStringAsyncSpy.mockResolvedValue(null);
      showActionSheetWithOptionsSpy.mockImplementation((_opts, callback) => callback(2));

      const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

      result.current.onPresentLeaderboardActions({ ...testLeaderboardWithCurrentUserAsCreator, inviteCode: null });

      expect(showActionSheetWithOptionsSpy).toHaveBeenCalledWith(
        { ...expectedActionSheetOptions, disabledButtonIndices: [2] },
        expect.any(Function)
      );
      expect(alertSpy).not.toHaveBeenCalled();

      expect(clipboardSetStringAsyncSpy).not.toHaveBeenCalled();
      expect(mockToast).not.toHaveBeenCalled();
      expect(mockCaptureEvent).toHaveBeenCalledWith('leaderboards:actions_open', {
        leaderboardId: testLeaderboardWithCurrentUserAsCreator._id,
        userId: testUser._id,
        leaderboardType: leaderboardType.Enum.private,
      });
      expect(mockCaptureEvent).not.toHaveBeenCalledWith('leaderboards:invite_code:copy', {
        leaderboardType: leaderboardType.Enum.private,
      });
    });
  });

  describe('leaderboard actions - current user is not leaderboard creator', () => {
    const expectedActionSheetOptions = {
      options: ['Zapusti lestvico', 'Povabi prijatelja', 'Prekliči'],
      cancelButtonIndex: 2,
      destructiveButtonIndex: 0,
      title: `Upravljanje lestvice "Test leaderboard"`,
      message: 'Si pridružen/a tej lestvici.',
      disabledButtonIndices: undefined,
    };

    it('should trigger leave leaderboard mutation - success scenario', async () => {
      mockLeavePrivateLeaderboard.mockResolvedValue(null);
      showActionSheetWithOptionsSpy.mockImplementation((_opts, callback) => callback(0));

      const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

      result.current.onPresentLeaderboardActions(testLeaderboard);

      expect(showActionSheetWithOptionsSpy).toHaveBeenCalledWith(expectedActionSheetOptions, expect.any(Function));
      expect(alertSpy).toHaveBeenCalledWith(
        'Si prepričan/a?',
        'Ko enkrat zapustiš lestvico bodo iz te lestvice izbrisani vsi tvoji pretekli rezultati.',
        [
          { isPreferred: true, style: 'cancel', text: 'Prekliči' },
          { isPreferred: false, style: 'destructive', text: 'Zapusti', onPress: expect.any(Function) },
        ]
      );

      act(() => {
        alertSpy.mock.lastCall?.[2]?.[1].onPress?.();
      });

      expect(mockLeavePrivateLeaderboard).toHaveBeenCalledWith({
        leaderboardId: testLeaderboard._id,
        userId: testUser._id,
      });

      expect(mockToast).not.toHaveBeenCalled();
      expect(mockCaptureEvent).toHaveBeenCalledWith('leaderboards:actions_open', {
        leaderboardId: testLeaderboard._id,
        userId: testUser._id,
        leaderboardType: leaderboardType.Enum.private,
      });
      await waitFor(() => {
        expect(mockCaptureEvent).toHaveBeenCalledWith('leaderboards:leave', {
          leaderboardId: testLeaderboard._id,
          userId: testUser._id,
          leaderboardType: leaderboardType.Enum.private,
        });
      });
    });

    it('should trigger leave leaderboard mutation - error scenario', async () => {
      const error = new Error('Ups');
      mockLeavePrivateLeaderboard.mockRejectedValue(error);
      showActionSheetWithOptionsSpy.mockImplementation((_opts, callback) => callback(0));

      const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

      result.current.onPresentLeaderboardActions(testLeaderboard);

      expect(showActionSheetWithOptionsSpy).toHaveBeenCalledWith(expectedActionSheetOptions, expect.any(Function));
      expect(alertSpy).toHaveBeenCalledWith(
        'Si prepričan/a?',
        'Ko enkrat zapustiš lestvico bodo iz te lestvice izbrisani vsi tvoji pretekli rezultati.',
        [
          { isPreferred: true, style: 'cancel', text: 'Prekliči' },
          { isPreferred: false, style: 'destructive', text: 'Zapusti', onPress: expect.any(Function) },
        ]
      );

      act(() => {
        alertSpy.mock.lastCall?.[2]?.[1].onPress?.();
      });

      expect(mockLeavePrivateLeaderboard).toHaveBeenCalledWith({
        leaderboardId: testLeaderboard._id,
        userId: testUser._id,
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith('Nekaj je šlo narobe', { intent: 'error' });
      });

      expect(mockCaptureEvent).toHaveBeenCalledWith('leaderboards:actions_open', {
        leaderboardId: testLeaderboard._id,
        userId: testUser._id,
        leaderboardType: leaderboardType.Enum.private,
      });
      expect(mockCaptureEvent).not.toHaveBeenCalledWith('leaderboards:leave', {
        leaderboardId: testLeaderboard._id,
        userId: testUser._id,
        leaderboardType: leaderboardType.Enum.private,
      });
    });

    it('should not trigger leave leaderboard mutation when user data is not available', async () => {
      useUserSpy.mockReturnValue({ user: null });
      mockLeavePrivateLeaderboard.mockRejectedValue(new Error('Ups'));
      showActionSheetWithOptionsSpy.mockImplementation((_opts, callback) => callback(0));

      const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

      result.current.onPresentLeaderboardActions(testLeaderboard);

      expect(showActionSheetWithOptionsSpy).toHaveBeenCalledWith(expectedActionSheetOptions, expect.any(Function));
      expect(alertSpy).not.toHaveBeenCalled();

      expect(mockLeavePrivateLeaderboard).not.toHaveBeenCalled();

      expect(mockToast).not.toHaveBeenCalled();
      expect(mockCaptureEvent).toHaveBeenCalledWith('leaderboards:actions_open', {
        leaderboardId: testLeaderboard._id,
        userId: undefined,
        leaderboardType: leaderboardType.Enum.private,
      });
      expect(mockCaptureEvent).not.toHaveBeenCalledWith('leaderboards:leave', {
        leaderboardId: testLeaderboard._id,
        userId: testUser._id,
        leaderboardType: leaderboardType.Enum.private,
      });
    });

    it('should display alert with invite code on "Invite friend" action trigger', async () => {
      clipboardSetStringAsyncSpy.mockResolvedValue(null);
      showActionSheetWithOptionsSpy.mockImplementation((_opts, callback) => callback(1));

      const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

      result.current.onPresentLeaderboardActions(testLeaderboard);

      expect(showActionSheetWithOptionsSpy).toHaveBeenCalledWith(expectedActionSheetOptions, expect.any(Function));
      expect(alertSpy).toHaveBeenCalledWith('Povabi prijatelja', 'Koda: INVITE_ME', [
        { isPreferred: false, style: 'cancel', text: 'Zapri' },
        { isPreferred: true, style: 'default', text: 'Kopiraj', onPress: expect.any(Function) },
      ]);

      act(() => {
        alertSpy.mock.lastCall?.[2]?.[1].onPress?.();
      });

      await waitFor(() => {
        expect(clipboardSetStringAsyncSpy).toHaveBeenCalledWith(testLeaderboard.inviteCode);
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith('Koda kopirana', { intent: 'success' });
      });

      expect(mockCaptureEvent).toHaveBeenCalledWith('leaderboards:actions_open', {
        leaderboardId: testLeaderboard._id,
        userId: testUser._id,
        leaderboardType: leaderboardType.Enum.private,
      });
      expect(mockCaptureEvent).toHaveBeenCalledWith('leaderboards:invite_code:copy', {
        leaderboardType: leaderboardType.Enum.private,
      });
    });
  });
});
