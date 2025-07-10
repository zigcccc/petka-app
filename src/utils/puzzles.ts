import dayjs from 'dayjs';

import { type Puzzle } from '@/convex/puzzles/models';

export function getDateObjectFromPuzzle({ year, month, day }: Pick<Puzzle, 'year' | 'month' | 'day'>) {
  return dayjs()
    .year(year)
    .month(month - 1)
    .date(day);
}
