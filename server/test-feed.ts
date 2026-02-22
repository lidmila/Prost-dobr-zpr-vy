/**
 * Test skript: pipeline test na konkrétním RSS feedu.
 *
 * Použití:
 *   npx tsx server/test-feed.ts <RSS_FEED_URL>
 *
 * Env:
 *   ANTHROPIC_API_KEY=sk-... (volitelné, bez něj se použije keyword fallback)
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseRSSItems } from './src/services/feed-fetcher';
import { filterArticle } from './src/services/content-filter';

// Load .env from server directory
function loadEnv() {
  try {
    const dir = dirname(fileURLToPath(import.meta.url));
    const envPath = resolve(dir, '.env');
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env not found — no problem
  }
}

loadEnv();

async function main() {
  const feedUrl = process.argv[2];
  if (!feedUrl) {
    console.error('Použití: npx tsx server/test-feed.ts <RSS_FEED_URL>');
    process.exit(1);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Extract source domain from feed URL
  const sourceDomain = new URL(feedUrl).hostname;

  console.log(`Feed: ${feedUrl}`);
  console.log(`Doména: ${sourceDomain}`);
  console.log(`AI klíč: ${apiKey ? 'ano' : 'ne (články bez předfiltru budou zastaveny)'}`);
  console.log('');

  // Fetch feed (some servers like sme.sk require Referer to avoid 403)
  const feedOrigin = new URL(feedUrl).origin;
  const response = await fetch(feedUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      Accept: 'application/rss+xml, application/xml, text/xml, */*;q=0.8',
      'Accept-Language': 'cs,sk;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Referer': feedOrigin + '/',
      'Connection': 'keep-alive',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    console.error(`Chyba při stahování feedu: HTTP ${response.status}`);
    process.exit(1);
  }

  const xml = await response.text();
  const items = parseRSSItems(xml);

  console.log(`Nalezeno článků: ${items.length}`);
  console.log('');

  // Table header
  const hdr = [
    '#'.padStart(3),
    'PASS',
    'Kategorie'.padEnd(12),
    'Důvod'.padEnd(30),
    'Titulek',
  ].join(' | ');
  console.log(hdr);
  console.log('-'.repeat(hdr.length));

  let passCount = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    const result = await filterArticle(
      {
        title: item.title,
        description: item.description || null,
        url: item.link,
      },
      sourceDomain,
      undefined,
      apiKey
    );

    if (result.aiUnavailable) {
      console.log('');
      console.error(`⚠ ZASTAVENO: ${result.reason} — další články nelze zpracovat bez AI.`);
      break;
    }

    if (result.pass) passCount++;

    const row = [
      String(i + 1).padStart(3),
      result.pass ? ' ✓  ' : ' ✗  ',
      result.category.padEnd(12),
      (result.reason ?? '—').padEnd(30),
      item.title.length > 60 ? item.title.slice(0, 57) + '...' : item.title,
    ].join(' | ');

    console.log(row);
  }

  console.log('');
  console.log(
    `Souhrn: ${passCount}/${items.length} prošlo (${items.length ? Math.round((passCount / items.length) * 100) : 0}%)`
  );
}

main().catch((err) => {
  console.error('Chyba:', err);
  process.exit(1);
});
