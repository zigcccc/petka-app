import { cronJobs } from 'convex/server';

import { internal } from './_generated/api';

const crons = cronJobs();

crons.cron('create daily challenge', '0 12 * * *', internal.puzzles.internal.createDailyPuzzle);
crons.cron('send reminder for daily challenge', '0 12 * * *', internal.puzzles.internal.sendReminderForDailyChallange);

export default crons;
