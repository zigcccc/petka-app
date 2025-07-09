import { PushNotifications } from '@convex-dev/expo-push-notifications';

import { components } from '../_generated/api';

export const pushNotifications = new PushNotifications(components.pushNotifications);
