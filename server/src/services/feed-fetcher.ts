/**
 * RSS feed fetcher and processor.
 * Fetches feeds from configured sources, parses XML, filters articles,
 * and inserts passing articles into D1.
 */

import type { Env, RSSSource } from '../types';
import { RSS_SOURCES } from '../data/sources';
import { filterArticle } from './content-filter';
import { NAMED_ENTITIES } from '../data/html-entities';

export interface ParsedItem {
  title: string;
  link: string;
  description: string;
  content: string | null;
  pubDate: string;
  imageUrl: string | null;
}

/**
 * Fix mojibake patterns caused by UTF-8 bytes being decoded as Latin-1/Windows-1252.
 * E.g. â€™ → ', â€" → —, etc.
 */
export function fixMojibake(text: string): string {
  return text
    .replace(/\u00e2\u20ac\u2122/g, '\u2019')  // â€™ → '
    .replace(/\u00e2\u20ac\u2018/g, '\u2018')  // â€˜ → '
    .replace(/\u00e2\u20ac\u0153/g, '\u201C')  // â€œ → "
    .replace(/\u00e2\u20ac\u009d/g, '\u201D')  // â€ → "
    .replace(/\u00e2\u20ac\u201c/g, '\u2014')  // â€" → —
    .replace(/\u00e2\u20ac\u201d/g, '\u2013')  // â€" → –
    .replace(/\u00e2\u20ac\u00a6/g, '\u2026')  // â€¦ → …
    .replace(/\u00c2\u00ab/g, '\u00AB')         // Â« → «
    .replace(/\u00c2\u00bb/g, '\u00BB')         // Â» → »
    .replace(/\u00c2\u00a0/g, ' ')              // Â  → (non-breaking space)
    .replace(/\u00c3\u00a1/g, '\u00E1')         // Ã¡ → á
    .replace(/\u00c3\u00a9/g, '\u00E9')         // Ã© → é
    .replace(/\u00c3\u00ad/g, '\u00ED')         // Ã­ → í
    .replace(/\u00c3\u00b3/g, '\u00F3')         // Ã³ → ó
    .replace(/\u00c3\u00ba/g, '\u00FA')         // Ãº → ú
    .replace(/\u00c3\u00bd/g, '\u00FD')         // Ã½ → ý
    .replace(/\u00c3\u00a8/g, '\u00E8')         // Ã¨ → è
    .replace(/\u00c3\u00bc/g, '\u00FC')         // Ã¼ → ü
    .replace(/\u00c5\u0099/g, '\u0159')         // Å™ → ř
    .replace(/\u00c5\u00be/g, '\u017E')         // Å¾ → ž
    .replace(/\u00c4\u008d/g, '\u010D')         // Ä → č
    .replace(/\u00c5\u00a1/g, '\u0161')         // Å¡ → š
    .replace(/\u00c4\u009b/g, '\u011B')         // Ä› → ě
    .replace(/\u00c5\u00af/g, '\u016F')         // Å¯ → ů
    .replace(/\u00c4\u008f/g, '\u010F')         // Ä → ď
    .replace(/\u00c5\u00a5/g, '\u0165')         // Å¥ → ť
    .replace(/\u00c5\u0088/g, '\u0148');        // Åˆ → ň
}

/**
 * Generate a stable article ID from a URL using crypto.subtle SHA-256.
 */
async function generateArticleId(url: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(url);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Decode HTML entities (numeric and named) in a string.
 */
export function decodeHtmlEntities(text: string): string {
  return text
    // Decode numeric entities: &#8221; &#x201D;
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    // Decode named entities (try exact case first, then lowercase fallback)
    .replace(/&[a-zA-Z]+;/g, (entity) => NAMED_ENTITIES[entity] ?? NAMED_ENTITIES[entity.toLowerCase()] ?? entity);
}

/** Patterns indicating a tracking pixel, icon, or non-article image */
const IMAGE_BLACKLIST_PATTERNS = [
  'pixel', 'tracking', 'logo', 'icon', 'favicon', 'avatar',
  '1x1', '.svg', 'ads/', 'ad-', 'spacer', 'blank.gif',
  'transparent', 'beacon', 'analytics', 'doubleclick',
];

function isValidImageUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return !IMAGE_BLACKLIST_PATTERNS.some((p) => lower.includes(p));
}

/**
 * Extract text content from an XML element by tag name.
 * Handles CDATA sections.
 */
function extractTag(xml: string, tag: string): string | null {
  // Match both regular content and CDATA sections
  const regex = new RegExp(
    `<${tag}[^>]*>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))</${tag}>`,
    'i'
  );
  const match = xml.match(regex);
  if (!match) return null;
  const content = match[1] ?? match[2] ?? '';
  // Strip HTML tags and decode entities
  return decodeHtmlEntities(
    content
      .replace(/<[^>]*>/g, '') // strip all HTML tags including <p>, <br>, etc.
      .replace(/\s+/g, ' ')   // collapse whitespace
      .trim()
  );
}

/**
 * Extract full HTML content from content:encoded tag, clean it to plain text.
 */
function extractContent(itemXml: string): string | null {
  // Try content:encoded (common in WordPress RSS feeds)
  const contentEncoded = itemXml.match(
    /<content:encoded[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/content:encoded>/i
  );
  if (contentEncoded) {
    const raw = contentEncoded[1] ?? contentEncoded[2] ?? '';
    // Convert <p>, <br> to newlines, strip other tags
    const text = raw
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .trim();
    return decodeHtmlEntities(text) || null;
  }

  // Try <content> tag (Atom feeds)
  const contentTag = extractTag(itemXml, 'content');
  if (contentTag && contentTag.length > 100) {
    return contentTag;
  }

  return null;
}

/**
 * Extract image URL from media:content, enclosure, media:thumbnail,
 * or <img> tags embedded in description/content HTML.
 */
function extractImage(itemXml: string): string | null {
  // Try media:content
  const mediaMatch = itemXml.match(
    /<media:content[^>]+url=["']([^"']+)["'][^>]*\/?\s*>/i
  );
  if (mediaMatch && isValidImageUrl(mediaMatch[1])) return mediaMatch[1];

  // Try enclosure with image type
  const enclosureMatch = itemXml.match(
    /<enclosure[^>]+url=["']([^"']+)["'][^>]*type=["']image\/[^"']*["'][^>]*\/?\s*>/i
  );
  if (enclosureMatch && isValidImageUrl(enclosureMatch[1])) return enclosureMatch[1];

  // Try enclosure url regardless of type (some feeds omit type)
  const enclosureAny = itemXml.match(
    /<enclosure[^>]+url=["']([^"']+)["'][^>]*\/?\s*>/i
  );
  if (enclosureAny && isValidImageUrl(enclosureAny[1])) return enclosureAny[1];

  // Try media:thumbnail
  const thumbMatch = itemXml.match(
    /<media:thumbnail[^>]+url=["']([^"']+)["'][^>]*\/?\s*>/i
  );
  if (thumbMatch && isValidImageUrl(thumbMatch[1])) return thumbMatch[1];

  // Try <img> tags embedded in description/content CDATA or HTML
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*\/?>/gi;
  let imgMatch: RegExpExecArray | null;
  while ((imgMatch = imgRegex.exec(itemXml)) !== null) {
    const src = imgMatch[1];
    if (!isValidImageUrl(src)) continue;

    // Check width — must be ≥200px (reject tracking pixels and tiny icons)
    const widthMatch = imgMatch[0].match(/width=["']?(\d+)/i);
    if (widthMatch && parseInt(widthMatch[1], 10) < 200) continue;

    // Accept if it looks like an actual image URL
    if (src.match(/\.(jpe?g|png|webp|gif)/i) || src.includes('/image') || src.includes('/photo') || src.includes('/media')) {
      return src;
    }

    // Accept if no width specified (assume decent size) or width ≥200
    if (!widthMatch || parseInt(widthMatch[1], 10) >= 200) {
      return src;
    }
  }

  return null;
}

/**
 * Parse RSS XML into an array of items.
 */
export function parseRSSItems(xml: string): ParsedItem[] {
  const items: ParsedItem[] = [];

  // Match all <item>...</item> blocks
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let itemMatch: RegExpExecArray | null;

  while ((itemMatch = itemRegex.exec(xml)) !== null) {
    const itemXml = itemMatch[1];

    const title = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link');
    const description = extractTag(itemXml, 'description') ?? '';
    const content = extractContent(itemXml);
    const pubDate = extractTag(itemXml, 'pubDate') ?? '';
    const imageUrl = extractImage(itemXml);

    if (!title || !link) continue;

    items.push({
      title: fixMojibake(title),
      link,
      description: fixMojibake(description),
      content: content ? fixMojibake(content) : null,
      pubDate,
      imageUrl,
    });
  }

  // Also try Atom <entry> format
  if (items.length === 0) {
    const entryRegex = /<entry[\s>]([\s\S]*?)<\/entry>/gi;
    let entryMatch: RegExpExecArray | null;

    while ((entryMatch = entryRegex.exec(xml)) !== null) {
      const entryXml = entryMatch[1];

      const title = extractTag(entryXml, 'title');
      // Atom uses <link href="..."/>
      const linkMatch = entryXml.match(
        /<link[^>]+href=["']([^"']+)["'][^>]*\/?>/i
      );
      const link = linkMatch ? linkMatch[1] : null;
      const description =
        extractTag(entryXml, 'summary') ??
        '';
      const content = extractContent(entryXml);
      const pubDate =
        extractTag(entryXml, 'published') ??
        extractTag(entryXml, 'updated') ??
        '';
      const imageUrl = extractImage(entryXml);

      if (!title || !link) continue;

      items.push({
        title: fixMojibake(title),
        link,
        description: fixMojibake(description),
        content: content ? fixMojibake(content) : null,
        pubDate,
        imageUrl,
      });
    }
  }

  return items;
}

/**
 * Process a single RSS source: fetch, parse, filter, and insert articles.
 */
async function processSource(source: RSSSource, env: Env): Promise<number> {
  let insertedCount = 0;

  const response = await fetch(source.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': 'application/rss+xml, application/xml, text/xml, */*;q=0.8',
      'Accept-Language': 'cs,sk;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
    },
  });

  if (!response.ok) {
    console.error(
      `Failed to fetch ${source.name}: HTTP ${response.status}`
    );
    return 0;
  }

  const xml = await response.text();
  const items = parseRSSItems(xml);

  for (const item of items) {
    try {
      const articleId = await generateArticleId(item.link);

      // Check if article already exists
      const existing = await env.ARTICLES_DB.prepare(
        'SELECT id FROM articles WHERE id = ? OR url = ?'
      )
        .bind(articleId, item.link)
        .first();

      if (existing) continue;

      // Run through content filter (async — uses AI when available)
      const filterResult = await filterArticle(
        {
          title: item.title,
          description: item.description,
          url: item.link,
        },
        source.domain,
        source.language,
        env.ANTHROPIC_API_KEY
      );

      if (filterResult.aiUnavailable) {
        throw new Error(`AI unavailable: ${filterResult.reason}`);
      }

      if (!filterResult.pass) {
        if (source.language === 'en') {
          console.log(`[FILTER REJECTED] ${source.name}: "${item.title}" (category: ${filterResult.category})`);
        }
        continue;
      }

      // Parse publication date, fallback to now
      let publishedAt: string;
      try {
        const parsed = new Date(item.pubDate);
        publishedAt = isNaN(parsed.getTime())
          ? new Date().toISOString()
          : parsed.toISOString();
      } catch {
        publishedAt = new Date().toISOString();
      }

      // Insert article into D1
      await env.ARTICLES_DB.prepare(
        `INSERT INTO articles (id, title, description, content, url, image_url, source_name, source_domain, language, category, location, is_adult, positivity_score, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          articleId,
          item.title,
          item.description || null,
          item.content || null,
          item.link,
          item.imageUrl,
          source.name,
          source.domain,
          source.language,
          filterResult.category,
          source.location,
          filterResult.isAdult ? 1 : 0,
          filterResult.positivityScore,
          publishedAt
        )
        .run();

      insertedCount++;
    } catch (err) {
      console.error(
        `Error processing item "${item.title}" from ${source.name}:`,
        err
      );
    }
  }

  return insertedCount;
}

/**
 * How many sources to process per invocation.
 * Cloudflare Workers have a subrequest limit (~1000 on paid, ~50 on free).
 * Each source uses 1 fetch + N DB queries + N AI calls.
 * We keep this small to stay well within limits.
 */
const SOURCES_PER_RUN = 10;

/**
 * Get the current batch index from D1 (persists across invocations).
 */
async function getBatchIndex(env: Env): Promise<number> {
  try {
    const row = await env.INTERNAL_DB.prepare(
      "SELECT value FROM kv WHERE key = 'feed_batch_index'"
    ).first<{ value: string }>();
    return row ? parseInt(row.value, 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Save the next batch index to D1.
 */
async function setBatchIndex(env: Env, index: number): Promise<void> {
  await env.INTERNAL_DB.prepare(
    "INSERT OR REPLACE INTO kv (key, value) VALUES ('feed_batch_index', ?)"
  ).bind(String(index)).run();
}

/**
 * Fetch and process a slice of RSS feeds.
 * Each invocation processes SOURCES_PER_RUN sources, then advances the pointer.
 * With cron running every 30 min, all sources get covered within a few hours.
 */
export async function fetchAndProcessFeeds(env: Env): Promise<void> {
  const totalSources = RSS_SOURCES.length;
  const batchIndex = await getBatchIndex(env);
  const start = batchIndex * SOURCES_PER_RUN;

  // If we've gone past the end, wrap around
  const effectiveStart = start >= totalSources ? 0 : start;
  const nextBatchIndex = effectiveStart + SOURCES_PER_RUN >= totalSources ? 0 : (effectiveStart / SOURCES_PER_RUN) + 1;

  const batch = RSS_SOURCES.slice(effectiveStart, effectiveStart + SOURCES_PER_RUN);
  console.log(`Processing sources ${effectiveStart}–${effectiveStart + batch.length - 1} of ${totalSources} (batch ${batchIndex})`);

  let totalInserted = 0;
  let totalErrors = 0;

  // Process sources sequentially to minimize concurrent subrequests
  for (const source of batch) {
    try {
      const count = await processSource(source, env);
      if (count > 0) {
        console.log(`${source.name}: inserted ${count} new articles`);
      }
      totalInserted += count;
    } catch (err) {
      totalErrors++;
      console.error(`${source.name}: failed -`, err);
    }
  }

  // Save next batch index
  await setBatchIndex(env, nextBatchIndex);

  console.log(
    `Batch done: ${totalInserted} new articles, ${totalErrors} errors. Next batch: ${nextBatchIndex}`
  );
}
