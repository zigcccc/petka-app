import { renderHook } from '@testing-library/react-native';

import { usePlural, type PluralTextMap } from './usePlural';

describe('usePlural', () => {
  const textsMap: PluralTextMap = {
    zero: 'zero',
    one: 'one',
    two: 'two',
    few: 'few',
    many: 'many',
  };

  it('returns zero text for count 0 if zero is defined', () => {
    const { result } = renderHook(() => usePlural(0, textsMap));
    expect(result.current).toBe('zero');
  });

  it('returns one text for count 1', () => {
    const { result } = renderHook(() => usePlural(1, textsMap));
    expect(result.current).toBe('one');
  });

  it('returns two text for count 2', () => {
    const { result } = renderHook(() => usePlural(2, textsMap));
    expect(result.current).toBe('two');
  });

  it('returns few text for counts 3 and 4', () => {
    const { result: result3 } = renderHook(() => usePlural(3, textsMap));
    const { result: result4 } = renderHook(() => usePlural(4, textsMap));

    expect(result3.current).toBe('few');
    expect(result4.current).toBe('few');
  });

  it('returns many text for counts >=5', () => {
    const { result } = renderHook(() => usePlural(5, textsMap));
    expect(result.current).toBe('many');
  });

  it('falls back to one if zero, two, few, or many are missing', () => {
    const map: PluralTextMap = { one: 'one' };

    expect(renderHook(() => usePlural(0, map)).result.current).toBe('one');
    expect(renderHook(() => usePlural(2, map)).result.current).toBe('one');
    expect(renderHook(() => usePlural(3, map)).result.current).toBe('one');
    expect(renderHook(() => usePlural(5, map)).result.current).toBe('one');
  });

  it('handles counts over 100 correctly (uses count % 100)', () => {
    expect(renderHook(() => usePlural(101, textsMap)).result.current).toBe('one'); // 101 % 100 = 1
    expect(renderHook(() => usePlural(102, textsMap)).result.current).toBe('two'); // 102 % 100 = 2
    expect(renderHook(() => usePlural(103, textsMap)).result.current).toBe('few'); // 103 % 100 = 3
    expect(renderHook(() => usePlural(111, textsMap)).result.current).toBe('many'); // 111 % 100 = 11 => many
    expect(renderHook(() => usePlural(114, textsMap)).result.current).toBe('many'); // 114 % 100 = 14
  });

  describe('fallbacks to "one" if optional forms are missing', () => {
    const map: PluralTextMap = { one: 'one' };

    it('falls back to one when zero is missing', () => {
      const { result } = renderHook(() => usePlural(0, map));

      expect(result.current).toBe('one');
    });

    it('falls back to one when two is missing', () => {
      const { result } = renderHook(() => usePlural(2, map));

      expect(result.current).toBe('one');
    });

    it.each([3, 4])('falls back to one when few is missing (count=%s)', (count) => {
      const { result } = renderHook(() => usePlural(count, map));

      expect(result.current).toBe('one');
    });

    it('falls back to one when many is missing', () => {
      const { result } = renderHook(() => usePlural(5, map));

      expect(result.current).toBe('one');
    });
  });
});
