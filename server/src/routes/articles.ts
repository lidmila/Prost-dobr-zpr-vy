import { Hono } from 'hono';
import type { Env, Article } from '../types';
import { scrapeArticle } from '../services/article-scraper';

export const articlesRoute = new Hono<{ Bindings: Env }>();

articlesRoute.get('/', async (c) => {
  try {
    const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(c.req.query('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    const category = c.req.query('category');
    const language = c.req.query('language');
    const location = c.req.query('location');
    const search = c.req.query('search');
    const adult = c.req.query('adult') || '0';

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    if (language) {
      conditions.push('language = ?');
      params.push(language);
    }

    if (location) {
      conditions.push('location = ?');
      params.push(location);
    }

    if (search) {
      conditions.push('(title LIKE ? OR description LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    if (adult !== '1') {
      conditions.push('is_adult = 0');
    }

    let sql = 'SELECT * FROM articles';
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY published_at DESC LIMIT ? OFFSET ?';
    params.push(limit + 1, offset);

    const result = await c.env.ARTICLES_DB.prepare(sql)
      .bind(...params)
      .all<Article>();

    const articles = result.results || [];
    const hasMore = articles.length > limit;

    return c.json({
      articles: hasMore ? articles.slice(0, limit) : articles,
      page,
      limit,
      hasMore,
    });
  } catch (error) {
    console.error('Error listing articles:', error);
    return c.json({ error: 'Failed to fetch articles' }, 500);
  }
});

articlesRoute.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const article = await c.env.ARTICLES_DB.prepare(
      'SELECT * FROM articles WHERE id = ?'
    )
      .bind(id)
      .first<Article>();

    if (!article) {
      return c.json({ error: 'Article not found' }, 404);
    }

    // If no full content, try to scrape it from the original URL
    if (!article.content && article.url) {
      const result = await scrapeArticle(article.url);
      if (result.content) {
        article.content = result.content;
      }
      if (result.ogImage) {
        article.image_url = result.ogImage;
      }
      // Cache in DB for future requests
      if (result.content || result.ogImage) {
        c.executionCtx.waitUntil(
          c.env.ARTICLES_DB.prepare(
            'UPDATE articles SET content = COALESCE(?, content), image_url = COALESCE(?, image_url) WHERE id = ?'
          )
            .bind(result.content, result.ogImage, article.id)
            .run()
        );
      }
    }

    return c.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    return c.json({ error: 'Failed to fetch article' }, 500);
  }
});
