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
 * Query all push tokens with daily notification preference.
 */
async function getDailyTokens(env: Env): Promise<string[]> {
  const result = await env.INTERNAL_DB.prepare(
    `SELECT push_token FROM device_tokens WHERE notification_pref = 'daily'`
  ).all<{ push_token: string }>();

  return result.results.map((row) => row.push_token);
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
 * Send daily push notifications to all subscribed devices.
 */
export async function sendDailyNotifications(env: Env): Promise<void> {
  console.log('Starting daily notification send');

  try {
    // Get the top article of the day
    const topArticle = await getTopArticleOfDay(env);

    if (!topArticle) {
      console.log('No articles found for daily notification');
      return;
    }

    // Get all push tokens with daily preference
    const tokens = await getDailyTokens(env);

    if (tokens.length === 0) {
      console.log('No devices subscribed to daily notifications');
      return;
    }

    console.log(
      `Sending daily notification to ${tokens.length} devices for article: ${topArticle.title}`
    );

    // Truncate description for notification body
    const body = topArticle.description
      ? topArticle.description.length > 150
        ? topArticle.description.slice(0, 147) + '...'
        : topArticle.description
      : 'Tap to read the top positive story of the day.';

    // Build push messages
    const messages: ExpoPushMessage[] = tokens.map((token) => ({
      to: token,
      title: topArticle.title,
      body,
      data: { articleId: topArticle.id },
      sound: 'default' as const,
    }));

    await sendPushBatch(messages);

    console.log('Daily notification send complete');
  } catch (err) {
    console.error('Failed to send daily notifications:', err);
  }
}
