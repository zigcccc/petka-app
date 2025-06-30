import { z } from 'zod';

export const baseDbModel = z.object({
  _id: z.string(),
  _creationTime: z.string(),
});

export const paginationOptsValidator = z.object({
  id: z.number().optional(),
  endCursor: z.string().nullish(),
  maximumRowsRead: z.number().optional(),
  maximumBytesRead: z.number().optional(),
  numItems: z.number(),
  cursor: z.string().nullable(),
});
