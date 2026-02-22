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
import { sendDailyNotifications } from './services/notification-sender';
import { HARD_BLOCK_STEMS, BLOCKED_URL_SEGMENTS } from './services/content-filter';

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
    return c.json({ status: 'ok', message: 'Feeds refreshed (1 batch)', purged: purge === '1', articleCount: count?.cnt ?? 0 });
  } catch (error) {
    console.error('Feed refresh failed:', error);
    return c.json({ error: 'Feed refresh failed' }, 500);
  }
});

// Process all batches in sequence — use for full refresh (may take a while)
app.get('/api/admin/refresh-all', async (c) => {
  try {
    const purge = c.req.query('purge');
    if (purge === '1') {
      await c.env.ARTICLES_DB.prepare('DELETE FROM articles').run();
    }
    const { RSS_SOURCES } = await import('./data/sources');
    const totalBatches = Math.ceil(RSS_SOURCES.length / 10);
    for (let i = 0; i < totalBatches; i++) {
      await fetchAndProcessFeeds(c.env);
    }
    const count = await c.env.ARTICLES_DB.prepare('SELECT COUNT(*) as cnt FROM articles').first<{ cnt: number }>();
    return c.json({ status: 'ok', message: `All ${totalBatches} batches processed`, purged: purge === '1', articleCount: count?.cnt ?? 0 });
  } catch (error) {
    console.error('Full feed refresh failed:', error);
    return c.json({ error: 'Full feed refresh failed', details: String(error) }, 500);
  }
});

// Cleanup: delete existing articles that match blocked stems, URL segments, or removed sources
app.get('/api/admin/cleanup', async (c) => {
  try {
    const removedDomains = [
      'games.tiscali.cz',
      'autorevue.cz',
      'autoforum.cz',
      'automagazin.sk',
      'hriesnekrasna.sk',
      'zenamagazin.sk',
    ];

    // Only use the NEW stems added in this update (not the old ones already enforced)
    const newStems = [
      'celebrity', 'celebrit',
      'influencer', 'influencerka',
      'červený koberec', 'červenom koberci',
      'přiznala', 'přiznal', 'prozradila', 'prozradil',
      'horoskop', 'znamení zvěrokruh', 'tarot',
      'horoscope', 'zodiac',
      'jak poznat nevěr', 'znamení, že vás partner',
      'vztahov', 'randění', 'rande',
      'dating tips', 'relationship advice',
      'trendy jaro', 'trendy léto', 'trendy podzim', 'trendy zima',
      'jak se líčit', 'make-up trik', 'beauty tip',
      'fashion trend',
      'kurz koruny', 'kurz eura', 'kurz dolaru',
      'bitcoin', 'kryptomě', 'ethereum',
      'burzovní', 'akciový trh', 'stock market',
      'exchange rate',
      'komerční sdělení', 'sponzorovaný článek', 'sponzorovaný obsah',
      'komerčná správa', 'sponzorovaný príspevok',
      'sponsored content', 'advertorial', 'paid partnership',
      'výstraha', 'výstrahy', 'varování meteorolog',
      'weather warning', 'weather alert',
      'silný vítr', 'silný mráz', 'náledí',
    ];

    const newUrlSegments = ['/celebrity', '/horoskop', '/krimi/', '/auto/', '/hry/'];

    let totalDeleted = 0;

    // 1. Delete by removed source domains
    for (const domain of removedDomains) {
      const res = await c.env.ARTICLES_DB.prepare(
        'DELETE FROM articles WHERE source_domain = ?'
      ).bind(domain).run();
      totalDeleted += res.meta?.changes ?? 0;
    }

    // 2. Delete by new blocked URL segments
    for (const segment of newUrlSegments) {
      const res = await c.env.ARTICLES_DB.prepare(
        'DELETE FROM articles WHERE LOWER(url) LIKE ?'
      ).bind(`%${segment}%`).run();
      totalDeleted += res.meta?.changes ?? 0;
    }

    // 3. Delete by new blocked stems (match against title + description)
    for (const stem of newStems) {
      const pattern = `%${stem}%`;
      const res = await c.env.ARTICLES_DB.prepare(
        "DELETE FROM articles WHERE LOWER(title || ' ' || COALESCE(description, '')) LIKE ?"
      ).bind(pattern).run();
      totalDeleted += res.meta?.changes ?? 0;
    }

    const count = await c.env.ARTICLES_DB.prepare('SELECT COUNT(*) as cnt FROM articles').first<{ cnt: number }>();
    return c.json({
      status: 'ok',
      message: `Cleanup complete. Deleted ${totalDeleted} articles.`,
      remainingArticles: count?.cnt ?? 0,
    });
  } catch (error) {
    console.error('Cleanup failed:', error);
    return c.json({ error: 'Cleanup failed', details: String(error) }, 500);
  }
});

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(fetchAndProcessFeeds(env));

    // Send daily notifications once a day around 8:00 UTC (9:00 CET)
    const hour = new Date(event.scheduledTime).getUTCHours();
    if (hour === 8) {
      ctx.waitUntil(sendDailyNotifications(env));
    }
  },
};
