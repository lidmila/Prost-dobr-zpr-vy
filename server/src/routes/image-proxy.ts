import { Hono } from 'hono';
import type { Env } from '../types';

export const imageProxyRoute = new Hono<{ Bindings: Env }>();

imageProxyRoute.get('/', async (c) => {
  const url = c.req.query('url');

  if (!url || !/^https?:\/\//i.test(url)) {
    return c.json({ error: 'Invalid or missing url parameter' }, 400);
  }

  try {
    const origin = new URL(url).origin;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsReader/1.0)',
        'Referer': origin,
        'Accept': 'image/*',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return c.json({ error: 'Failed to fetch image' }, response.status as 400);
    }

    const contentType = response.headers.get('Content-Type') || '';
    if (!contentType.startsWith('image/')) {
      return c.json({ error: 'URL did not return an image' }, 400);
    }

    const imageData = await response.arrayBuffer();

    return new Response(imageData, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return c.json({ error: 'Failed to proxy image' }, 500);
  }
});
