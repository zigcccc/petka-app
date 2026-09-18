import type { Id } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';

export function listUserMemberships(ctx: QueryCtx, userId: Id<'users'>) {
  return ctx.db
    .query('leaderboardMembers')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .collect();
}

export function listLeaderboardMemberships(ctx: QueryCtx, leaderboardId: Id<'leaderboards'>) {
  return ctx.db
    .query('leaderboardMembers')
    .withIndex('by_leaderboard_user', (q) => q.eq('leaderboardId', leaderboardId))
    .collect();
}

export function getMembership(ctx: QueryCtx, leaderboardId: Id<'leaderboards'>, userId: Id<'users'>) {
  return ctx.db
    .query('leaderboardMembers')
    .withIndex('by_leaderboard_user', (q) => q.eq('leaderboardId', leaderboardId).eq('userId', userId))
    .unique();
}

export async function addScoreToMembership(ctx: MutationCtx, membershipId: Id<'leaderboardMembers'>, score: number) {
  const membership = await ctx.db.get(membershipId);
  if (!membership) return;
  await ctx.db.patch(membershipId, { totalScore: membership.totalScore + score });
}

export async function deleteLeaderboardMemberships(ctx: MutationCtx, leaderboardId: Id<'leaderboards'>) {
  for (const membership of await listLeaderboardMemberships(ctx, leaderboardId)) {
    await ctx.db.delete(membership._id);
  }
}
