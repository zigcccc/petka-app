import { renderHook } from '@testing-library/react-native';

import { puzzleType } from '@/convex/puzzles/models';
import { testPuzzleStatistics1 } from '@/tests/fixtures/puzzleStatistics';
import { testUser1 } from '@/tests/fixtures/users';

import { usePuzzlesStatisticsQuery } from '../queries';
import { useUser } from '../useUser';

import { usePuzzleStatistics } from './usePuzzlesStatistics';

jest.mock('../queries', () => ({
  ...jest.requireActual('../queries'),
  usePuzzlesStatisticsQuery: jest.fn().mockReturnValue({}),
}));

jest.mock('../useUser', () => ({
  ...jest.requireActual('../useUser'),
  useUser: jest.fn().mockReturnValue({}),
}));

describe('usePuzzleStatistics', () => {
  const usePuzzlesStatisticsQuerySpy = usePuzzlesStatisticsQuery as jest.Mock;
  const useUserSpy = useUser as jest.Mock;

  beforeEach(() => {
    useUserSpy.mockReturnValue({ user: testUser1 });
  });

  it('should trigger puzzle statistics query with "skip" param if user data is not available', () => {
    useUserSpy.mockReturnValue({ user: null });

    renderHook(() => usePuzzleStatistics(puzzleType.Enum.daily));

    expect(usePuzzlesStatisticsQuerySpy).toHaveBeenCalledWith('skip');
  });

  it('should trigger puzzle statistics query with userId and puzzle type params when user data is available', () => {
    useUserSpy.mockReturnValue({ user: testUser1 });

    renderHook(() => usePuzzleStatistics(puzzleType.Enum.daily));

    expect(usePuzzlesStatisticsQuerySpy).toHaveBeenCalledWith({ userId: testUser1._id, type: puzzleType.Enum.daily });
  });

  it.each([
    { isLoading: true, isNotFound: false },
    { isLoading: false, isNotFound: true },
    { isLoading: true, isNotFound: true },
  ])(
    'should set isLoading=true and data=null when query.isLoading=$isLoading and query.isNotFound=$isNotFound',
    ({ isLoading, isNotFound }) => {
      usePuzzlesStatisticsQuerySpy.mockReturnValue({ data: testPuzzleStatistics1, isLoading, isNotFound });

      const { result } = renderHook(() => usePuzzleStatistics(puzzleType.Enum.daily));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBe(null);
    }
  );

  it('should set isLoading=false and data to query data when query.isLoading=false and query.isNotFound=false', () => {
    usePuzzlesStatisticsQuerySpy.mockReturnValue({ data: testPuzzleStatistics1, isLoading: false, isNotFound: false });

    const { result } = renderHook(() => usePuzzleStatistics(puzzleType.Enum.daily));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(testPuzzleStatistics1);
  });
});
