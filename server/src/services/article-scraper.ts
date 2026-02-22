import { NAMED_ENTITIES } from '../data/html-entities';

const SELECTORS_PRIORITY = [
  'article',
  '[role="article"]',
  '.article-body',
  '.article-content',
  '.post-content',
  '.entry-content',
  '.story-body',
  '.content-body',
  'main',
];

const REMOVE_PATTERNS = [
  /<script[\s\S]*?<\/script>/gi,
  /<style[\s\S]*?<\/style>/gi,
  /<nav[\s\S]*?<\/nav>/gi,
  /<header[\s\S]*?<\/header>/gi,
  /<footer[\s\S]*?<\/footer>/gi,
  /<aside[\s\S]*?<\/aside>/gi,
  /<iframe[\s\S]*?<\/iframe>/gi,
  /<form[\s\S]*?<\/form>/gi,
  /<!--[\s\S]*?-->/g,
];

/** Class/id patterns that indicate non-article content (sidebars, related, social, etc.) */
const JUNK_CLASS_PATTERNS = [
  'related', 'sidebar', 'comment', 'social', 'share', 'newsletter',
  'author-bio', 'tags', 'breadcrumb', 'cookie', 'recommended', 'also-read',
  'podobne', 'dalsi-clanky', 'widget', 'promo', 'subscribe', 'ad-container',
  'banner', 'popup', 'modal',
];

const JUNK_ELEMENT_REGEX = new RegExp(
  `<(?:div|section|aside|ul|ol|nav|figure)[^>]*(?:class|id)=["'][^"']*\\b(?:${JUNK_CLASS_PATTERNS.join('|')})\\b[^"']*["'][^>]*>[\\s\\S]*?<\\/(?:div|section|aside|ul|ol|nav|figure)>`,
  'gi'
);

/** Footer marker phrases — article content is trimmed starting from the first match (only if past 1/3 of text) */
const FOOTER_MARKERS = [
  // CZ
  'přečtěte si také', 'čtěte také', 'mohlo by vás zajímat', 'doporučujeme',
  'sledujte nás', 'všechna práva vyhrazena', 'sdílejte', 'komentáře',
  'diskuse', 'zdroj:', 'foto:', 'autor:', 'tagy:', 'klíčová slova:', 'reklama',
  'přihlaste se k odběru', 'odebírejte', 'další články',
  // SK
  'mohlo by vás zaujať', 'odporúčame', 'súvisiace články', 'všetky práva vyhradené',
  'zdieľajte', 'komentáre', 'diskusia', 'inzercia', 'štítky:',
  'prihláste sa na odber',
];

/** Patterns that indicate a tracking pixel / icon / logo, not a real article image */
const IMAGE_BLACKLIST_PATTERNS = [
  'pixel', 'tracking', 'logo', 'icon', 'favicon', 'avatar',
  '1x1', '.svg', 'ads/', 'ad-', 'banner-small', 'spacer',
  'blank.gif', 'transparent', 'beacon', 'analytics',
  'facebook.com', 'twitter.com', 'doubleclick',
];

function extractBySelector(html: string, selector: string): string | null {
  if (selector.startsWith('[')) {
    // Attribute selector like [role="article"]
    const attrMatch = selector.match(/\[(\w+)="([^"]+)"\]/);
    if (!attrMatch) return null;
    const openRegex = new RegExp(
      `<(\\w+)[^>]*${attrMatch[1]}="${attrMatch[2]}"[^>]*>`,
      'i'
    );
    return extractWithTagCounting(html, openRegex);
  } else if (selector.startsWith('.')) {
    // Class selector — use tag-counting approach
    const className = selector.slice(1);
    const openRegex = new RegExp(
      `<(\\w+)[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>`,
      'i'
    );
    return extractWithTagCounting(html, openRegex);
  } else {
    // Tag selector — use greedy match for the outermost tag
    const regex = new RegExp(`<${selector}[^>]*>([\\s\\S]*)<\\/${selector}>`, 'i');
    const match = html.match(regex);
    return match ? match[1] : null;
  }
}

/**
 * Find the opening tag matched by `openRegex`, then count open/close tags
 * of the same tag name to find the correct closing tag (handles nesting).
 */
function extractWithTagCounting(html: string, openRegex: RegExp): string | null {
  const openMatch = openRegex.exec(html);
  if (!openMatch) return null;

  const tagName = openMatch[1].toLowerCase();
  const contentStart = openMatch.index + openMatch[0].length;

  // Count nested open/close tags to find the matching close
  let depth = 1;
  const tagPattern = new RegExp(
    `<(/?)${tagName}(?:\\s[^>]*)?>`,
    'gi'
  );
  tagPattern.lastIndex = contentStart;

  let tagMatch: RegExpExecArray | null;
  while ((tagMatch = tagPattern.exec(html)) !== null) {
    if (tagMatch[1] === '/') {
      depth--;
      if (depth === 0) {
        return html.slice(contentStart, tagMatch.index);
      }
    } else {
      // Skip self-closing tags
      if (!tagMatch[0].endsWith('/>')) {
        depth++;
      }
    }
  }

  // If we never found the closing tag, return everything from contentStart
  return html.slice(contentStart);
}

function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&[a-zA-Z]+;/g, (entity) => NAMED_ENTITIES[entity] ?? NAMED_ENTITIES[entity.toLowerCase()] ?? entity);
}

/**
 * Fix mojibake patterns caused by UTF-8 bytes decoded as Latin-1/Windows-1252.
 */
function fixMojibake(text: string): string {
  return text
    .replace(/\u00e2\u20ac\u2122/g, '\u2019')
    .replace(/\u00e2\u20ac\u2018/g, '\u2018')
    .replace(/\u00e2\u20ac\u0153/g, '\u201C')
    .replace(/\u00e2\u20ac\u009d/g, '\u201D')
    .replace(/\u00e2\u20ac\u201c/g, '\u2014')
    .replace(/\u00e2\u20ac\u201d/g, '\u2013')
    .replace(/\u00e2\u20ac\u00a6/g, '\u2026')
    .replace(/\u00c2\u00a0/g, ' ')
    .replace(/\u00c3\u00a1/g, '\u00E1')
    .replace(/\u00c3\u00a9/g, '\u00E9')
    .replace(/\u00c3\u00ad/g, '\u00ED')
    .replace(/\u00c3\u00b3/g, '\u00F3')
    .replace(/\u00c3\u00ba/g, '\u00FA')
    .replace(/\u00c3\u00bd/g, '\u00FD')
    .replace(/\u00c5\u0099/g, '\u0159')
    .replace(/\u00c5\u00be/g, '\u017E')
    .replace(/\u00c4\u008d/g, '\u010D')
    .replace(/\u00c5\u00a1/g, '\u0161')
    .replace(/\u00c4\u009b/g, '\u011B')
    .replace(/\u00c5\u00af/g, '\u016F')
    .replace(/\u00c4\u008f/g, '\u010F')
    .replace(/\u00c5\u00a5/g, '\u0165')
    .replace(/\u00c5\u0088/g, '\u0148');
}

/**
 * Trim footer content from article text.
 * Scans line by line and cuts from the first footer marker found,
 * but only if it appears after the first 1/3 of the text.
 */
function trimFooterContent(text: string): string {
  const lines = text.split('\n');
  const totalLength = text.length;
  const minOffset = Math.floor(totalLength / 3);

  let charCount = 0;
  for (let i = 0; i < lines.length; i++) {
    charCount += lines[i].length + 1; // +1 for newline
    if (charCount < minOffset) continue;

    const lineLower = lines[i].toLowerCase().trim();
    if (!lineLower) continue;

    for (const marker of FOOTER_MARKERS) {
      if (lineLower.startsWith(marker) || lineLower === marker) {
        // Cut here — return everything before this line
        return lines.slice(0, i).join('\n').trimEnd();
      }
    }
  }

  return text;
}

function cleanHtml(html: string): string {
  let cleaned = html;

  // Remove unwanted elements
  for (const pattern of REMOVE_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }

  // Remove elements with junk class/id patterns (related articles, social, etc.)
  cleaned = cleaned.replace(JUNK_ELEMENT_REGEX, '');

  // Extract text from paragraphs for better structure
  const paragraphs: string[] = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let pMatch;
  while ((pMatch = pRegex.exec(cleaned)) !== null) {
    const text = decodeEntities(
      pMatch[1]
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    );

    if (text.length > 20) {
      paragraphs.push(text);
    }
  }

  if (paragraphs.length >= 2) {
    return paragraphs.join('\n\n');
  }

  // Fallback: strip all tags
  return decodeEntities(
    cleaned
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

export interface ScrapeResult {
  content: string | null;
  ogImage: string | null;
}

function extractOgImage(html: string): string | null {
  // Try og:image first
  const ogPattern = /<meta[^>]*(?:property=["']og:image["'][^>]*content=["']([^"']+)["']|content=["']([^"']+)["'][^>]*property=["']og:image["'])[^>]*\/?>/i;
  const ogMatch = html.match(ogPattern);
  if (ogMatch) return ogMatch[1] || ogMatch[2] || null;

  // Fallback: twitter:image
  const twPattern = /<meta[^>]*(?:name=["']twitter:image["'][^>]*content=["']([^"']+)["']|content=["']([^"']+)["'][^>]*name=["']twitter:image["'])[^>]*\/?>/i;
  const twMatch = html.match(twPattern);
  if (twMatch) return twMatch[1] || twMatch[2] || null;

  return null;
}

/**
 * Check if an image URL looks like a real article image (not a tracking pixel/icon/logo).
 */
function isValidImageUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return !IMAGE_BLACKLIST_PATTERNS.some((p) => lower.includes(p));
}

/**
 * Extract the first meaningful image from article HTML body.
 * Filters out tracking pixels, icons, logos, and tiny images.
 */
function extractBodyImage(html: string): string | null {
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*\/?>/gi;
  let match: RegExpExecArray | null;

  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    if (!isValidImageUrl(src)) continue;

    // Check width attribute if present — must be ≥200
    const widthMatch = match[0].match(/width=["']?(\d+)/i);
    if (widthMatch && parseInt(widthMatch[1], 10) < 200) continue;

    // Check height attribute — skip tiny images (< 100px)
    const heightMatch = match[0].match(/height=["']?(\d+)/i);
    if (heightMatch && parseInt(heightMatch[1], 10) < 100) continue;

    return src;
  }

  return null;
}

export async function scrapeArticle(url: string): Promise<ScrapeResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'cs,sk;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
      redirect: 'follow',
    });

    if (!response.ok) return { content: null, ogImage: null };

    const html = await response.text();
    const ogImage = extractOgImage(html);

    // Try each selector in priority order
    for (const selector of SELECTORS_PRIORITY) {
      const extracted = extractBySelector(html, selector);
      if (extracted) {
        const cleaned = cleanHtml(extracted);
        // Only accept if we got meaningful content (at least 200 chars)
        if (cleaned.length >= 200) {
          const image = ogImage || extractBodyImage(extracted);
          return { content: fixMojibake(trimFooterContent(cleaned)), ogImage: image };
        }
      }
    }

    // Last resort: try to get all <p> tags from <body>
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) {
      const cleaned = cleanHtml(bodyMatch[1]);
      if (cleaned.length >= 200) {
        const image = ogImage || extractBodyImage(bodyMatch[1]);
        return { content: fixMojibake(trimFooterContent(cleaned)), ogImage: image };
      }
    }

    return { content: null, ogImage };
  } catch {
    return { content: null, ogImage: null };
  }
}
