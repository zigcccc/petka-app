import { type Id } from '@/convex/_generated/dataModel';
import { type User } from '@/convex/users/models';

export const testUser1: User = {
  _id: 'user1' as Id<'users'>,
  _creationTime: 1751328000000, // 2025-07-01
  lowercaseNickname: 'og_wordler',
  nickname: 'OG_Wordler',
};

export const testUser2: User = {
  _id: 'user2' as Id<'users'>,
  _creationTime: 1751879338378,
  lowercaseNickname: 'the joiner',
  nickname: 'The Joiner',
};
