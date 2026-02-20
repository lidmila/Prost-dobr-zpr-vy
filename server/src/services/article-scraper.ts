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

function extractBySelector(html: string, selector: string): string | null {
  // Handle tag selectors: <article>, <main>, <nav> etc.
  // Handle class selectors: .article-body, .post-content etc.
  // Handle attribute selectors: [role="article"]
  let regex: RegExp;

  if (selector.startsWith('[')) {
    // Attribute selector like [role="article"]
    const match = selector.match(/\[(\w+)="([^"]+)"\]/);
    if (!match) return null;
    regex = new RegExp(`<\\w+[^>]*${match[1]}="${match[2]}"[^>]*>([\\s\\S]*?)<\\/\\w+>`, 'i');
  } else if (selector.startsWith('.')) {
    // Class selector
    const className = selector.slice(1);
    regex = new RegExp(`<\\w+[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>([\\s\\S]*?)<\\/\\w+>`, 'i');
  } else {
    // Tag selector — use greedy match for the outermost tag
    regex = new RegExp(`<${selector}[^>]*>([\\s\\S]*)<\\/${selector}>`, 'i');
  }

  const match = html.match(regex);
  return match ? match[1] : null;
}

function cleanHtml(html: string): string {
  let cleaned = html;

  // Remove unwanted elements
  for (const pattern of REMOVE_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }

  // Extract text from paragraphs for better structure
  const paragraphs: string[] = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let pMatch;
  while ((pMatch = pRegex.exec(cleaned)) !== null) {
    const text = pMatch[1]
      .replace(/<[^>]+>/g, '') // strip remaining tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();

    if (text.length > 20) {
      paragraphs.push(text);
    }
  }

  if (paragraphs.length >= 2) {
    return paragraphs.join('\n\n');
  }

  // Fallback: strip all tags
  return cleaned
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export interface ScrapeResult {
  content: string | null;
  ogImage: string | null;
}

function extractOgImage(html: string): string | null {
  // Match both attribute orders: property then content, or content then property
  const pattern = /<meta[^>]*(?:property=["']og:image["'][^>]*content=["']([^"']+)["']|content=["']([^"']+)["'][^>]*property=["']og:image["'])[^>]*\/?>/i;
  const match = html.match(pattern);
  if (!match) return null;
  return match[1] || match[2] || null;
}

export async function scrapeArticle(url: string): Promise<ScrapeResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsReader/1.0)',
        'Accept': 'text/html',
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
          return { content: cleaned, ogImage };
        }
      }
    }

    // Last resort: try to get all <p> tags from <body>
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) {
      const cleaned = cleanHtml(bodyMatch[1]);
      if (cleaned.length >= 200) {
        return { content: cleaned, ogImage };
      }
    }

    return { content: null, ogImage };
  } catch {
    return { content: null, ogImage: null };
  }
}
