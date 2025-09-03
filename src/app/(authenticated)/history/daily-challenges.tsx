import { FlashList } from '@shopify/flash-list';
import { usePaginatedQuery } from 'convex/react';
import { useCallback, useRef } from 'react';
import { useWindowDimensions } from 'react-native';

import { HistoryGrid } from '@/components/elements';
import { api } from '@/convex/_generated/api';
import { puzzleType } from '@/convex/puzzles/models';
import { useUser } from '@/hooks/useUser';
import { breakpoints } from '@/styles/breakpoints';

export default function DailyChallengesHistoryScreen() {
  const { width } = useWindowDimensions();
  const { user } = useUser();
  const timestampRef = useRef(Date.now());
  const { results, loadMore, status } = usePaginatedQuery(
    api.puzzles.queries.list,
    user?._id ? { userId: user._id, type: puzzleType.Enum.daily, timestamp: timestampRef.current } : 'skip',
    { initialNumItems: 7 }
  );

  const cellWidth = width > breakpoints.md ? 100 : (width - 96) / 5;
  const estimatedItemSize = cellWidth * 6 + 24;

  const handleEndReached = useCallback(() => {
    if (status === 'CanLoadMore') {
      loadMore(7);
    }
  }, [status, loadMore]);

  return (
    <FlashList
      contentInsetAdjustmentBehavior="automatic"
      data={results}
      estimatedItemSize={estimatedItemSize}
      extraData={{ user }}
      keyExtractor={(item) => item._id}
      onEndReached={handleEndReached}
      renderItem={({ item }) => <HistoryGrid cellWidth={cellWidth} puzzle={item} userId={user?._id} />}
    />
  );
}
