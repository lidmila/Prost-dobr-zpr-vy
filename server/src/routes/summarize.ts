import { Hono } from 'hono';
import type { Env } from '../types';
import { callClaude } from '../services/claude';

export const summarizeRoute = new Hono<{ Bindings: Env }>();

summarizeRoute.post('/', async (c) => {
  try {
    const { text, language } = await c.req.json<{
      text: string;
      language: string;
    }>();

    if (!text || !language) {
      return c.json({ error: 'text and language are required' }, 400);
    }

    if (!c.env.ANTHROPIC_API_KEY) {
      return c.json({ error: 'Summarization service is not available in this environment' }, 503);
    }

    const prompt = `Shrň následující článek do 700–800 znaků v jazyce "${language}". Vytvoř stručné, informativní shrnutí s klíčovými informacemi. Vrať pouze text shrnutí, nic jiného.\n\n${text}`;

    const summary = await callClaude(c.env.ANTHROPIC_API_KEY, prompt, 400);

    if (!summary) {
      return c.json({ error: 'Summarization returned empty result' }, 502);
    }

    return c.json({ summary });
  } catch (error) {
    console.error('Error summarizing:', error);
    return c.json({ error: 'Failed to summarize text' }, 500);
  }
});
