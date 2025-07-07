import { type Id } from '@/convex/_generated/dataModel';
import { type User } from '@/convex/users/models';

export const testUser1: User = {
  _id: 'user1' as Id<'users'>,
  _creationTime: Date.now(),
  lowercaseNickname: 'og_wordler',
  nickname: 'OG_Wordler',
};
