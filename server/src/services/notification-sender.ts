/**
 * Push notification sender for daily article digest.
 * Sends Expo push notifications to subscribed devices.
 */

import type { Env } from '../types';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
}

interface ExpoPushTicket {
  id?: string;
  status: 'ok' | 'error';
  message?: string;
  details?: { error?: string };
}

/**
 * Query the top article of the day from ARTICLES_DB.
 * Returns the article with the highest positivity score published today.
 */
async function getTopArticleOfDay(
  env: Env
): Promise<{ id: string; title: string; description: string | null } | null> {
  const result = await env.ARTICLES_DB.prepare(
    `SELECT id, title, description
     FROM articles
     WHERE published_at >= datetime('now', '-1 day')
       AND is_adult = 0
     ORDER BY positivity_score DESC
     LIMIT 1`
  ).first<{ id: string; title: string; description: string | null }>();

  return result ?? null;
}

/**
 * Query push tokens with daily notification preference, grouped by language.
 */
async function getDailyTokensByLanguage(env: Env): Promise<{ cs: string[]; en: string[] }> {
  const result = await env.INTERNAL_DB.prepare(
    `SELECT push_token, COALESCE(language, 'cs') as language FROM device_tokens WHERE notification_pref = 'daily'`
  ).all<{ push_token: string; language: string }>();

  const cs: string[] = [];
  const en: string[] = [];
  for (const row of result.results) {
    if (row.language === 'en') {
      en.push(row.push_token);
    } else {
      cs.push(row.push_token);
    }
  }
  return { cs, en };
}

/**
 * Send push notifications in batches (Expo supports up to 100 per request).
 */
async function sendPushBatch(messages: ExpoPushMessage[]): Promise<void> {
  const batchSize = 100;

  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);

    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(batch),
      });

      if (!response.ok) {
        console.error(
          `Expo push API returned ${response.status}: ${await response.text()}`
        );
        continue;
      }

      const body = (await response.json()) as { data: ExpoPushTicket[] };

      // Log any individual ticket errors
      for (const ticket of body.data) {
        if (ticket.status === 'error') {
          console.error(
            `Push notification error: ${ticket.message} (${ticket.details?.error ?? 'unknown'})`
          );
        }
      }
    } catch (err) {
      console.error(`Failed to send push notification batch:`, err);
    }
  }
}

/**
 * Ensure the language column exists in device_tokens.
 */
async function ensureLanguageColumn(env: Env): Promise<void> {
  try {
    await env.INTERNAL_DB.prepare(
      `ALTER TABLE device_tokens ADD COLUMN language TEXT DEFAULT 'cs'`
    ).run();
  } catch {
    // Column already exists — ignore
  }
}

/**
 * Send daily push notifications to all subscribed devices.
 */
export async function sendDailyNotifications(env: Env): Promise<void> {
  console.log('Starting daily notification send');

  try {
    await ensureLanguageColumn(env);

    const topArticle = await getTopArticleOfDay(env);

    if (!topArticle) {
      console.log('No articles found for daily notification');
      return;
    }

    const { cs, en } = await getDailyTokensByLanguage(env);
    const totalTokens = cs.length + en.length;

    if (totalTokens === 0) {
      console.log('No devices subscribed to daily notifications');
      return;
    }

    console.log(
      `Sending daily notification to ${totalTokens} devices (${cs.length} CZ, ${en.length} EN) for article: ${topArticle.id}`
    );

    const messages: ExpoPushMessage[] = [];

    for (const token of cs) {
      messages.push({
        to: token,
        title: 'Ve světě se dějí dobré věci! 🎉',
        body: 'Mrkni na nový článek a zlepši si den.',
        data: { articleId: topArticle.id },
        sound: 'default',
      });
    }

    for (const token of en) {
      messages.push({
        to: token,
        title: 'Good things are happening! 🎉',
        body: 'Check out a new article and brighten your day.',
        data: { articleId: topArticle.id },
        sound: 'default',
      });
    }

    await sendPushBatch(messages);

    console.log('Daily notification send complete');
  } catch (err) {
    console.error('Failed to send daily notifications:', err);
  }
}
