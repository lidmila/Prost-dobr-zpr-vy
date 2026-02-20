import { Hono } from 'hono';
import type { Env } from '../types';

export const notificationsRoute = new Hono<{ Bindings: Env }>();

notificationsRoute.post('/register', async (c) => {
  try {
    const { pushToken, notificationPref } = await c.req.json<{
      pushToken: string;
      notificationPref?: string;
    }>();

    if (!pushToken) {
      return c.json({ error: 'pushToken is required' }, 400);
    }

    const id = crypto.randomUUID();
    const pref = notificationPref || 'all';

    await c.env.INTERNAL_DB.prepare(
      `INSERT INTO device_tokens (id, push_token, notification_pref)
       VALUES (?, ?, ?)
       ON CONFLICT (push_token) DO UPDATE SET notification_pref = excluded.notification_pref`
    )
      .bind(id, pushToken, pref)
      .run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Error registering device:', error);
    return c.json({ error: 'Failed to register device' }, 500);
  }
});
