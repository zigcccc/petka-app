import { zid } from 'convex-helpers/server/zod';
import { z } from 'zod';

export const getBaseDbModel = <const T extends string>(tablename: T) =>
  z.object({
    _id: zid(tablename),
    _creationTime: z.number(),
  });

export const paginationOptsValidator = z.object({
  id: z.number().optional(),
  endCursor: z.string().nullish(),
  maximumRowsRead: z.number().optional(),
  maximumBytesRead: z.number().optional(),
  numItems: z.number(),
  cursor: z.string().nullable(),
});
