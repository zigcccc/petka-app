import { renderHook } from '@testing-library/react-native';
import * as toaster from 'burnt';

import { useToaster } from './useToaster';

describe('useToaster', () => {
  const toastSpy = jest.spyOn(toaster, 'toast');

  it('should display toast - minimum config', () => {
    const { result } = renderHook(() => useToaster());

    result.current.toast('Test toast');

    expect(toastSpy).toHaveBeenCalledWith({ title: 'Test toast', haptic: 'none', preset: 'none', from: 'top' });
  });

  it('should display toast - full config', () => {
    const { result } = renderHook(() => useToaster());

    result.current.toast('Test toast', { message: 'Toast message', intent: 'error', from: 'bottom' });

    expect(toastSpy).toHaveBeenCalledWith({
      title: 'Test toast',
      message: 'Toast message',
      haptic: 'error',
      preset: 'error',
      from: 'bottom',
    });
  });

  it.each([
    { intent: 'error', expectedPreset: 'error' },
    { intent: 'success', expectedPreset: 'done' },
    { intent: 'warning', expectedPreset: 'error' },
    { intent: 'none', expectedPreset: 'none' },
  ] as const)(
    'should display toast - intent=$intent -> expected preset = $expectedPreset',
    ({ intent, expectedPreset }) => {
      const { result } = renderHook(() => useToaster());

      result.current.toast('Test toast', { message: 'Toast message', intent, from: 'bottom' });

      expect(toastSpy).toHaveBeenCalledWith({
        title: 'Test toast',
        message: 'Toast message',
        haptic: intent,
        preset: expectedPreset,
        from: 'bottom',
      });
    }
  );
});
