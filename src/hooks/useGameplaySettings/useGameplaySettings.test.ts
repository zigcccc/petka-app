import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, act, waitFor } from '@testing-library/react-native';

import { useGameplaySettings, type GameplaySettings, gameplayKeyboardType } from './useGameplaySettings';

const mockToast = jest.fn();
jest.mock('../useToaster', () => ({
  useToaster: () => ({ toast: mockToast }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

describe('useGameplaySettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load default values if no saved settings', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    const { result } = renderHook(() => useGameplaySettings());

    // Wait for async load
    await waitFor(() => {
      expect(result.current.autosubmitPuzzleAttempt).toBe(true);
    });

    expect(result.current.keyboardType).toBe(gameplayKeyboardType.Enum.qwerty);
    expect(result.current.isUninitialised).toBe(true);
  });

  it('should load saved settings from storage', async () => {
    const saved: GameplaySettings = {
      autosubmitPuzzleAttempt: false,
      keyboardType: gameplayKeyboardType.Enum.abcde,
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(saved));

    const { result } = renderHook(() => useGameplaySettings());

    await waitFor(() => {
      expect(result.current.autosubmitPuzzleAttempt).toBe(false);
    });

    expect(result.current.keyboardType).toBe(gameplayKeyboardType.Enum.abcde);
    expect(result.current.isUninitialised).toBe(false);
  });

  it('should fall back to defaults if saved settings are invalid', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify({ invalid: 'data' }));

    const { result } = renderHook(() => useGameplaySettings());

    await waitFor(() => {
      expect(result.current.autosubmitPuzzleAttempt).toBe(true);
    });

    expect(result.current.keyboardType).toBe(gameplayKeyboardType.Enum.qwerty);
  });

  it('should update settings and save to storage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    const { result } = renderHook(() => useGameplaySettings());

    await waitFor(() => {
      expect(result.current.autosubmitPuzzleAttempt).toBe(true);
    });

    await act(async () => {
      await result.current.updateSettings({ autosubmitPuzzleAttempt: false });
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'GAMEPLAY_SETTINGS',
      JSON.stringify({
        autosubmitPuzzleAttempt: false,
        keyboardType: gameplayKeyboardType.Enum.qwerty,
      })
    );
    expect(result.current.autosubmitPuzzleAttempt).toBe(false);
    expect(mockToast).toHaveBeenCalledWith('Nastavitev posodobljena', { intent: 'success' });
  });

  it('should merge new settings with existing ones', async () => {
    const saved: GameplaySettings = {
      autosubmitPuzzleAttempt: false,
      keyboardType: gameplayKeyboardType.Enum.abcde,
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(saved));

    const { result } = renderHook(() => useGameplaySettings());

    await waitFor(() => {
      expect(result.current.autosubmitPuzzleAttempt).toBe(false);
    });

    await act(async () => {
      await result.current.updateSettings({ keyboardType: gameplayKeyboardType.Enum.qwerty });
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'GAMEPLAY_SETTINGS',
      JSON.stringify({
        autosubmitPuzzleAttempt: false,
        keyboardType: gameplayKeyboardType.Enum.qwerty,
      })
    );
  });
});
