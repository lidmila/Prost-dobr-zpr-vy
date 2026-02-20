import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import { articlesRoute } from './routes/articles';
import { translateRoute } from './routes/translate';
import { notificationsRoute } from './routes/notifications';
import { authRoute } from './routes/auth';
import { favoritesRoute } from './routes/favorites';
import { imageProxyRoute } from './routes/image-proxy';
import { fetchAndProcessFeeds } from './services/feed-fetcher';

const app = new Hono<{ Bindings: Env }>();

app.use('/*', cors());

app.get('/', (c) => c.json({ status: 'ok', name: 'Prostě dobrý zprávy API' }));

app.route('/api/articles', articlesRoute);
app.route('/api/translate', translateRoute);
app.route('/api/notifications', notificationsRoute);
app.route('/api/auth', authRoute);
app.route('/api/favorites', favoritesRoute);
app.route('/api/image-proxy', imageProxyRoute);

app.get('/api/admin/refresh-feeds', async (c) => {
  try {
    const purge = c.req.query('purge');
    if (purge === '1') {
      await c.env.ARTICLES_DB.prepare('DELETE FROM articles').run();
    }
    await fetchAndProcessFeeds(c.env);
    const count = await c.env.ARTICLES_DB.prepare('SELECT COUNT(*) as cnt FROM articles').first<{ cnt: number }>();
    return c.json({ status: 'ok', message: 'Feeds refreshed', purged: purge === '1', articleCount: count?.cnt ?? 0 });
  } catch (error) {
    console.error('Feed refresh failed:', error);
    return c.json({ error: 'Feed refresh failed' }, 500);
  }
});

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(fetchAndProcessFeeds(env));
  },
};
