import { Hono } from 'hono';
import type { Env } from '../types';

export const notificationsRoute = new Hono<{ Bindings: Env }>();

notificationsRoute.post('/register', async (c) => {
  try {
    const { pushToken, notificationPref, language } = await c.req.json<{
      pushToken: string;
      notificationPref?: string;
      language?: string;
    }>();

    if (!pushToken) {
      return c.json({ error: 'pushToken is required' }, 400);
    }

    const id = crypto.randomUUID();
    const pref = notificationPref || 'all';
    const lang = language === 'en' ? 'en' : 'cs';

    await c.env.INTERNAL_DB.prepare(
      `INSERT INTO device_tokens (id, push_token, notification_pref, language)
       VALUES (?, ?, ?, ?)
       ON CONFLICT (push_token) DO UPDATE SET notification_pref = excluded.notification_pref, language = excluded.language`
    )
      .bind(id, pushToken, pref, lang)
      .run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Error registering device:', error);
    return c.json({ error: 'Failed to register device' }, 500);
  }
});
