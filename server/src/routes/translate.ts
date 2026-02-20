import { Hono } from 'hono';
import type { Env } from '../types';

export const translateRoute = new Hono<{ Bindings: Env }>();

translateRoute.post('/', async (c) => {
  try {
    const { text, targetLang, sourceLang } = await c.req.json<{
      text: string;
      targetLang: string;
      sourceLang?: string;
    }>();

    if (!text || !targetLang) {
      return c.json({ error: 'text and targetLang are required' }, 400);
    }

    const body: Record<string, string> = {
      q: text,
      target: targetLang,
    };

    if (sourceLang) {
      body.source = sourceLang;
    } else {
      body.source = 'auto';
    }

    const response = await fetch(c.env.LIBRE_TRANSLATE_URL + '/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LibreTranslate error:', errorText);
      return c.json({ error: 'Translation service error' }, 502);
    }

    const data = await response.json<{ translatedText: string }>();

    return c.json({ translatedText: data.translatedText });
  } catch (error) {
    console.error('Error translating:', error);
    return c.json({ error: 'Failed to translate text' }, 500);
  }
});
