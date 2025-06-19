import { z } from 'zod';

export const baseDbModel = z.object({
  _id: z.string(),
  _creationTime: z.string(),
});
