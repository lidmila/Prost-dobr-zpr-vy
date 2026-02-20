import { Hono } from 'hono';
import type { Env } from '../types';
import { verifyToken } from '../services/auth';

export const favoritesRoute = new Hono<{ Bindings: Env }>();

// JWT auth middleware for all favorites routes
favoritesRoute.use('*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Authorization header required' }, 401);
  }

  const token = authHeader.slice(7);
  try {
    const payload = await verifyToken(token, c.env.JWT_SECRET);
    c.set('userId' as never, payload.id as never);
    await next();
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
});

favoritesRoute.get('/', async (c) => {
  try {
    const userId = c.get('userId' as never) as string;

    const result = await c.env.INTERNAL_DB.prepare(
      'SELECT article_id, created_at FROM favorites WHERE user_id = ? ORDER BY created_at DESC'
    )
      .bind(userId)
      .all<{ article_id: string; created_at: string }>();

    return c.json({ favorites: result.results || [] });
  } catch (error) {
    console.error('Error listing favorites:', error);
    return c.json({ error: 'Failed to fetch favorites' }, 500);
  }
});

favoritesRoute.post('/:articleId', async (c) => {
  try {
    const userId = c.get('userId' as never) as string;
    const articleId = c.req.param('articleId');
    const id = crypto.randomUUID();

    await c.env.INTERNAL_DB.prepare(
      `INSERT INTO favorites (id, user_id, article_id)
       VALUES (?, ?, ?)
       ON CONFLICT (user_id, article_id) DO NOTHING`
    )
      .bind(id, userId, articleId)
      .run();

    return c.json({ success: true }, 201);
  } catch (error) {
    console.error('Error adding favorite:', error);
    return c.json({ error: 'Failed to add favorite' }, 500);
  }
});

favoritesRoute.delete('/:articleId', async (c) => {
  try {
    const userId = c.get('userId' as never) as string;
    const articleId = c.req.param('articleId');

    await c.env.INTERNAL_DB.prepare(
      'DELETE FROM favorites WHERE user_id = ? AND article_id = ?'
    )
      .bind(userId, articleId)
      .run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return c.json({ error: 'Failed to remove favorite' }, 500);
  }
});
