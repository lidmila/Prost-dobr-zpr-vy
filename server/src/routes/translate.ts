import { Hono } from 'hono';
import type { Env } from '../types';
import { callClaude } from '../services/claude';

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

    if (!c.env.ANTHROPIC_API_KEY) {
      return c.json({ error: 'Translation service is not available in this environment' }, 503);
    }

    const source = sourceLang || 'auto-detected language';
    const prompt = `Translate the following text from ${source} to ${targetLang}. Return only the translated text, nothing else.\n\n${text}`;

    const translatedText = await callClaude(c.env.ANTHROPIC_API_KEY, prompt);

    if (!translatedText) {
      return c.json({ error: 'Translation returned empty result' }, 502);
    }

    return c.json({ translatedText });
  } catch (error) {
    console.error('Error translating:', error);
    return c.json({ error: 'Failed to translate text' }, 500);
  }
});
