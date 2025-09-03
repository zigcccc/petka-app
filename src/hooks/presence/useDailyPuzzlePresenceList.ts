import { useQuery } from 'convex/react';

import { api } from '@/convex/_generated/api';

export function useDailyPuzzlePresenceList() {
  return useQuery(api.presence.listRoom, { roomId: 'daily-puzzle', onlineOnly: true });
}
