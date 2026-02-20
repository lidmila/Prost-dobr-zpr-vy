/**
 * RSS feed fetcher and processor.
 * Fetches feeds from configured sources, parses XML, filters articles,
 * and inserts passing articles into D1.
 */

import type { Env, RSSSource } from '../types';
import { RSS_SOURCES } from '../data/sources';
import { filterArticle } from './content-filter';

interface ParsedItem {
  title: string;
  link: string;
  description: string;
  content: string | null;
  pubDate: string;
  imageUrl: string | null;
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
function decodeHtmlEntities(text: string): string {
  const named: Record<string, string> = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
    '&apos;': "'", '&nbsp;': ' ', '&ndash;': '\u2013', '&mdash;': '\u2014',
    '&lsquo;': '\u2018', '&rsquo;': '\u2019', '&ldquo;': '\u201C',
    '&rdquo;': '\u201D', '&hellip;': '\u2026', '&copy;': '\u00A9',
    '&reg;': '\u00AE', '&trade;': '\u2122', '&euro;': '\u20AC',
  };
  return text
    // Decode numeric entities: &#8221; &#x201D;
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    // Decode named entities
    .replace(/&[a-zA-Z]+;/g, (entity) => named[entity.toLowerCase()] ?? entity);
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
  return decodeHtmlEntities(content.replace(/<[^>]*>/g, '').trim());
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
  if (mediaMatch) return mediaMatch[1];

  // Try enclosure with image type
  const enclosureMatch = itemXml.match(
    /<enclosure[^>]+url=["']([^"']+)["'][^>]*type=["']image\/[^"']*["'][^>]*\/?\s*>/i
  );
  if (enclosureMatch) return enclosureMatch[1];

  // Try enclosure url regardless of type (some feeds omit type)
  const enclosureAny = itemXml.match(
    /<enclosure[^>]+url=["']([^"']+)["'][^>]*\/?\s*>/i
  );
  if (enclosureAny) return enclosureAny[1];

  // Try media:thumbnail
  const thumbMatch = itemXml.match(
    /<media:thumbnail[^>]+url=["']([^"']+)["'][^>]*\/?\s*>/i
  );
  if (thumbMatch) return thumbMatch[1];

  // Try <img> tags embedded in description/content CDATA or HTML
  const imgMatch = itemXml.match(
    /<img[^>]+src=["']([^"']+)["'][^>]*\/?>/i
  );
  if (imgMatch) {
    const src = imgMatch[1];
    // Only use if it looks like an actual image URL (not a tracking pixel)
    if (src.match(/\.(jpe?g|png|webp|gif)/i) || src.includes('/image') || src.includes('/photo') || src.includes('/media')) {
      return src;
    }
    // Still use it if the img has reasonable width/height attributes (not a 1x1 pixel)
    const widthMatch = imgMatch[0].match(/width=["']?(\d+)/i);
    if (!widthMatch || parseInt(widthMatch[1], 10) > 50) {
      return src;
    }
  }

  return null;
}

/**
 * Parse RSS XML into an array of items.
 */
function parseRSSItems(xml: string): ParsedItem[] {
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
      title,
      link,
      description,
      content,
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
        title,
        link,
        description,
        content,
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
      'User-Agent': 'ProstDobreZpravy/1.0 RSS Reader',
      Accept: 'application/rss+xml, application/xml, text/xml, */*',
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
        env.AI
      );

      if (!filterResult.pass) continue;

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
 * Fetch and process all RSS feeds.
 * Sources are processed in batches of 5 to avoid overwhelming.
 */
export async function fetchAndProcessFeeds(env: Env): Promise<void> {
  console.log(`Starting feed fetch for ${RSS_SOURCES.length} sources`);

  const batchSize = 5;
  let totalInserted = 0;
  let totalErrors = 0;

  for (let i = 0; i < RSS_SOURCES.length; i += batchSize) {
    const batch = RSS_SOURCES.slice(i, i + batchSize);

    const results = await Promise.allSettled(
      batch.map((source) => processSource(source, env))
    );

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      const source = batch[j];

      if (result.status === 'fulfilled') {
        if (result.value > 0) {
          console.log(
            `${source.name}: inserted ${result.value} new articles`
          );
        }
        totalInserted += result.value;
      } else {
        totalErrors++;
        console.error(`${source.name}: failed -`, result.reason);
      }
    }
  }

  console.log(
    `Feed fetch complete: ${totalInserted} new articles, ${totalErrors} source errors`
  );
}
