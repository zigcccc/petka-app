import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useMutation, useQuery } from 'convex/react';
import * as Clipboard from 'expo-clipboard';
import { ActionSheetIOS, Alert } from 'react-native';

import { api } from '@/convex/_generated/api';
import { type Id } from '@/convex/_generated/dataModel';
import { leaderboardRange, leaderboardType } from '@/convex/leaderboards/models';

import { useToaster } from '../useToaster';
import { useUser } from '../useUser';

import { useLeaderboards } from './useLeaderboards';

jest.mock('convex/react', () => ({
  ...jest.requireActual('convex/react'),
  useMutation: jest.fn(),
  useQuery: jest.fn(),
}));

jest.mock('../useUser', () => ({
  useUser: jest.fn(),
}));

jest.mock('../useToaster', () => ({
  useToaster: jest.fn(),
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
  const showActionSheetWithOptionsSpy = jest.spyOn(ActionSheetIOS, 'showActionSheetWithOptions');
  const alertSpy = jest.spyOn(Alert, 'alert');
  const promptSpy = jest.spyOn(Alert, 'prompt');

  const useToasterSpy = useToaster as jest.Mock;
  const useMutationSpy = useMutation as jest.Mock;
  const useQuerySpy = useQuery as jest.Mock;
  const useUserSpy = useUser as jest.Mock;
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

  beforeEach(() => {
    useToasterSpy.mockReturnValue({ toast: mockToast });
    useUserSpy.mockReturnValue({ user: testUser });
    useMutationSpy
      .mockReturnValueOnce(mockCreatePrivateLeaderboard)
      .mockReturnValueOnce(mockJoinPrivateLeaderboard)
      .mockReturnValueOnce(mockDeletePrivateLeaderboard)
      .mockReturnValueOnce(mockLeavePrivateLeaderboard)
      .mockReturnValueOnce(mockUpdateLeaderboardName);
    useQuerySpy.mockReturnValue(testLeaderboards);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should call useQuery hook with "skip" as an argument when user object is not available', () => {
    useUserSpy.mockReturnValue({ user: null });

    renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

    expect(useQuerySpy).toHaveBeenCalledWith(api.leaderboards.queries.list, 'skip');
  });

  it('should call useQuery hook with query args when user object is available', () => {
    const testTimestamp = 1751444599;
    jest.useFakeTimers().setSystemTime(testTimestamp);

    useUserSpy.mockReturnValue({ user: testUser });

    renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

    expect(useQuerySpy).toHaveBeenCalledWith(api.leaderboards.queries.list, {
      userId: testUser._id,
      type: initialProps.type,
      range: initialProps.range,
      timestamp: testTimestamp,
    });

    jest.useRealTimers();
  });

  it('should set isLoading to true when leaderboards are not defined', () => {
    useQuerySpy.mockReturnValue(undefined);

    const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

    expect(result.current.isLoading).toBe(true);
  });

  it.each([null, testLeaderboards])('should set isLoading to false when leaderboards=%s', (leaderboards) => {
    useQuerySpy.mockReturnValue(leaderboards);

    const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

    expect(result.current.isLoading).toBe(false);
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
      expect(result.current.isDeleting).toBe(false);
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

      expect(result.current.isDeleting).toBe(true);

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });

      expect(mockToast).not.toHaveBeenCalled();
    });

    it('should trigger delete leaderboard mutation - error scenario', async () => {
      mockDeletePrivateLeaderboard.mockRejectedValue(new Error('Ups'));
      showActionSheetWithOptionsSpy.mockImplementation((_opts, callback) => callback(0));

      const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

      result.current.onPresentLeaderboardActions(testLeaderboardWithCurrentUserAsCreator);

      expect(showActionSheetWithOptionsSpy).toHaveBeenCalledWith(expectedActionSheetOptions, expect.any(Function));
      expect(result.current.isDeleting).toBe(false);
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

      expect(result.current.isDeleting).toBe(true);

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });

      expect(mockToast).toHaveBeenCalledWith('Nekaj je šlo narobe.', { intent: 'error' });
    });

    it('should trigger update leaderboard name mutation - success scenario', async () => {
      mockUpdateLeaderboardName.mockResolvedValue(null);
      showActionSheetWithOptionsSpy.mockImplementation((_opts, callback) => callback(1));

      const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

      result.current.onPresentLeaderboardActions(testLeaderboardWithCurrentUserAsCreator);

      expect(showActionSheetWithOptionsSpy).toHaveBeenCalledWith(expectedActionSheetOptions, expect.any(Function));
      expect(result.current.isUpdating).toBe(false);
      expect(promptSpy).toHaveBeenCalledWith('Ime lestvice:', '', [
        { isPreferred: false, style: 'cancel', text: 'Prekliči', onPress: expect.any(Function) },
        { isPreferred: true, text: 'Posodobi', onPress: expect.any(Function) },
      ]);

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(true);
      });

      act(() => {
        // @ts-expect-error
        promptSpy.mock.lastCall?.[2]?.[1].onPress?.('New leaderboard name');
      });

      expect(mockUpdateLeaderboardName).toHaveBeenCalledWith({
        leaderboardId: testLeaderboardWithCurrentUserAsCreator._id,
        userId: testUser._id,
        data: { name: 'New leaderboard name' },
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(mockToast).not.toHaveBeenCalled();
    });

    it('should trigger update leaderboard name mutation - error scenario', async () => {
      mockUpdateLeaderboardName.mockRejectedValue(new Error('Ups'));
      showActionSheetWithOptionsSpy.mockImplementation((_opts, callback) => callback(1));

      const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

      result.current.onPresentLeaderboardActions(testLeaderboardWithCurrentUserAsCreator);

      expect(showActionSheetWithOptionsSpy).toHaveBeenCalledWith(expectedActionSheetOptions, expect.any(Function));
      expect(result.current.isUpdating).toBe(false);
      expect(promptSpy).toHaveBeenCalledWith('Ime lestvice:', '', [
        { isPreferred: false, style: 'cancel', text: 'Prekliči', onPress: expect.any(Function) },
        { isPreferred: true, text: 'Posodobi', onPress: expect.any(Function) },
      ]);

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(true);
      });

      act(() => {
        // @ts-expect-error
        promptSpy.mock.lastCall?.[2]?.[1].onPress?.('New leaderboard name');
      });

      expect(mockUpdateLeaderboardName).toHaveBeenCalledWith({
        leaderboardId: testLeaderboardWithCurrentUserAsCreator._id,
        userId: testUser._id,
        data: { name: 'New leaderboard name' },
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(mockToast).toHaveBeenCalledWith('Nekaj je šlo narobe.', { intent: 'error' });
    });

    it.each([undefined, null, ''])(
      'should trigger update leaderboard name mutation - new name not provided (is %p)',
      async (newLeaderboardName) => {
        mockUpdateLeaderboardName.mockRejectedValue(new Error('Ups'));
        showActionSheetWithOptionsSpy.mockImplementation((_opts, callback) => callback(1));

        const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

        result.current.onPresentLeaderboardActions(testLeaderboardWithCurrentUserAsCreator);

        expect(showActionSheetWithOptionsSpy).toHaveBeenCalledWith(expectedActionSheetOptions, expect.any(Function));
        expect(result.current.isUpdating).toBe(false);
        expect(promptSpy).toHaveBeenCalledWith('Ime lestvice:', '', [
          { isPreferred: false, style: 'cancel', text: 'Prekliči', onPress: expect.any(Function) },
          { isPreferred: true, text: 'Posodobi', onPress: expect.any(Function) },
        ]);

        await waitFor(() => {
          expect(result.current.isUpdating).toBe(true);
        });

        act(() => {
          // @ts-expect-error
          promptSpy.mock.lastCall?.[2]?.[1].onPress?.(newLeaderboardName);
        });

        expect(mockUpdateLeaderboardName).not.toHaveBeenCalled();

        await waitFor(() => {
          expect(result.current.isUpdating).toBe(false);
        });

        expect(mockToast).not.toHaveBeenCalled();
      }
    );

    it('should trigger update leaderboard name mutation - action is cancelled', async () => {
      mockUpdateLeaderboardName.mockRejectedValue(new Error('Ups'));
      showActionSheetWithOptionsSpy.mockImplementation((_opts, callback) => callback(1));

      const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

      result.current.onPresentLeaderboardActions(testLeaderboardWithCurrentUserAsCreator);

      expect(showActionSheetWithOptionsSpy).toHaveBeenCalledWith(expectedActionSheetOptions, expect.any(Function));
      expect(result.current.isUpdating).toBe(false);
      expect(promptSpy).toHaveBeenCalledWith('Ime lestvice:', '', [
        { isPreferred: false, style: 'cancel', text: 'Prekliči', onPress: expect.any(Function) },
        { isPreferred: true, text: 'Posodobi', onPress: expect.any(Function) },
      ]);

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(true);
      });

      act(() => {
        // @ts-expect-error
        promptSpy.mock.lastCall?.[2]?.[0].onPress?.();
      });

      expect(mockUpdateLeaderboardName).not.toHaveBeenCalled();

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(mockToast).not.toHaveBeenCalled();
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
        // @ts-expect-error
        promptSpy.mock.lastCall?.[2]?.[1].onPress?.();
      });

      await waitFor(() => {
        expect(clipboardSetStringAsyncSpy).toHaveBeenCalledWith(testLeaderboardWithCurrentUserAsCreator.inviteCode);
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith('Koda kopirana', { intent: 'success' });
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
      expect(result.current.isLeaving).toBe(false);
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

      await waitFor(() => {
        expect(result.current.isLeaving).toBe(true);
      });

      expect(mockLeavePrivateLeaderboard).toHaveBeenCalledWith({
        leaderboardId: testLeaderboard._id,
        userId: testUser._id,
      });

      await waitFor(() => {
        expect(result.current.isLeaving).toBe(false);
      });

      expect(mockToast).not.toHaveBeenCalled();
    });

    it('should trigger leave leaderboard mutation - error scenario', async () => {
      mockLeavePrivateLeaderboard.mockRejectedValue(new Error('Ups'));
      showActionSheetWithOptionsSpy.mockImplementation((_opts, callback) => callback(0));

      const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

      result.current.onPresentLeaderboardActions(testLeaderboard);

      expect(showActionSheetWithOptionsSpy).toHaveBeenCalledWith(expectedActionSheetOptions, expect.any(Function));
      expect(result.current.isLeaving).toBe(false);
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

      await waitFor(() => {
        expect(result.current.isLeaving).toBe(true);
      });

      expect(mockLeavePrivateLeaderboard).toHaveBeenCalledWith({
        leaderboardId: testLeaderboard._id,
        userId: testUser._id,
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith('Nekaj je šlo narobe', { intent: 'error' });
      });

      await waitFor(() => {
        expect(result.current.isLeaving).toBe(false);
      });
    });

    it('should not trigger leave leaderboard mutation when user data is not available', async () => {
      useUserSpy.mockReturnValue({ user: null });
      mockLeavePrivateLeaderboard.mockRejectedValue(new Error('Ups'));
      showActionSheetWithOptionsSpy.mockImplementation((_opts, callback) => callback(0));

      const { result } = renderHook(({ type, range }) => useLeaderboards(type, range), { initialProps });

      result.current.onPresentLeaderboardActions(testLeaderboard);

      expect(showActionSheetWithOptionsSpy).toHaveBeenCalledWith(expectedActionSheetOptions, expect.any(Function));
      expect(result.current.isLeaving).toBe(false);
      expect(alertSpy).not.toHaveBeenCalled();

      expect(mockLeavePrivateLeaderboard).not.toHaveBeenCalled();

      expect(mockToast).not.toHaveBeenCalled();
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
        // @ts-expect-error
        promptSpy.mock.lastCall?.[2]?.[1].onPress?.();
      });

      await waitFor(() => {
        expect(clipboardSetStringAsyncSpy).toHaveBeenCalledWith(testLeaderboard.inviteCode);
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith('Koda kopirana', { intent: 'success' });
      });
    });
  });
});
