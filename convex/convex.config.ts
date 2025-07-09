import crons from '@convex-dev/crons/convex.config';
import pushNotifications from '@convex-dev/expo-push-notifications/convex.config';
import migrations from '@convex-dev/migrations/convex.config';
import { defineApp } from 'convex/server';

const app = defineApp();
app.use(migrations);
app.use(crons);
app.use(pushNotifications);

export default app;
