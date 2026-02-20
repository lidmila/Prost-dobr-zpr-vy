import { classifyCategory } from './category-classifier';
import { BLACKLIST_DOMAINS } from '../data/blacklist';
import { POSITIVE_KEYWORDS_CS, POSITIVE_KEYWORDS_EN } from '../data/positive-keywords';
import { NEGATIVE_KEYWORDS_CS, NEGATIVE_KEYWORDS_EN } from '../data/negative-keywords';
import { ADULT_KEYWORDS } from '../data/adult-keywords';

const POSITIVE_KEYWORDS = [...POSITIVE_KEYWORDS_CS, ...POSITIVE_KEYWORDS_EN];
const NEGATIVE_KEYWORDS = [...NEGATIVE_KEYWORDS_CS, ...NEGATIVE_KEYWORDS_EN];

const POSITIVE_SOURCES = [
  'goodnewsnetwork.org',
  'positive.news',
  'reasonstobecheerful.world',
];

/**
 * Categories that are auto-rejected (never wholesome enough).
 */
const BLOCKED_CATEGORIES = ['business'];

/**
 * Hard-block stems — matched against full text (title + description) using
 * substring matching so that inflected forms are caught.
 * If ANY stem is found, the article is immediately rejected.
 */
const HARD_BLOCK_STEMS = [
  // ── Violence & death ──
  // CS/SK
  'zemřel', 'umřel', 'zahynul', 'zavražd', 'zabil', 'zastřel',
  'pobodal', 'znásiln', 'odsouzen', 'odsúden', 'zatčen', 'zatknut', 'obviněn',
  'nehod', 'havári', 'výbuch', 'požár', 'povodn', 'válk', 'válečn',
  'útok', 'teror', 'sebevražd', 'hrozí', 'hrozb',
  'obět', 'mrtvý', 'mrtvých', 'zraněn', 'přepad', 'napadl', 'unesl',
  'kalamit', 'katastro', 'tragéd', 'tragick',
  // EN
  'killed', 'murder', 'kidnap', 'stabbed', 'shooting', 'shot dead',
  'arrested', 'convicted', 'crash', 'explosion', 'suicide', 'victim',
  'wounded', 'dead body', 'death toll', 'fatally', 'fatal',
  'disaster', 'catastroph', 'devastat', 'destruction',
  // DE
  'getötet', 'ermordet', 'katastroph', 'unfall', 'angriff',

  // ── War & geopolitics ──
  'invaz', 'inváz', 'sankc', 'sankci', 'embargo', 'konflikt',
  'warfare', 'warzone', 'troops', 'military', 'missile', 'bomb',
  'frontline', 'occupied', 'annex',
  'rop', 'dodávk', // oil/supplies in geopolitical context caught via other stems

  // ── Politics ──
  // CS
  'premiér', 'prezident', 'ministr', 'vlád', 'parlamen', 'senát',
  'poslan', 'kandidát', 'volb', 'voleb', 'rezignov', 'koalic',
  'opozic', 'hlasován', 'schválen', 'projednán',
  'zákon', 'legislativ', 'sněmovn', 'průzkum', 'stran',
  // SK
  'voľb', 'koalíci', 'opozíci', 'legislatív',
  // EN
  'president', 'prime minister', 'senator', 'congress', 'parliament',
  'election', 'candidate', 'resigned', 'legislation', 'bill passed',
  'approval rating', 'democrat', 'republican', 'coalition',
  'government', 'governor', 'political', 'politic',
  // DE
  'bundestag', 'kanzler', 'regierung', 'koalition', 'partei',

  // ── Economics & business ──
  // CS/SK
  'inflac', 'infláci', 'akci', 'burz', 'kryptom', 'bitcoin',
  'rozpočet', 'rozpočt', 'deficit', 'dluh', 'dlh',
  'úrokov', 'čnb', 'tržb', 'recese', 'recesi',
  'daňov', 'daní', 'dane', 'ušetř', 'odpočet', 'poplatn',
  'ekonom', 'finančn',
  // EN
  'inflation', 'stock market', 'cryptocurrency', 'budget',
  'interest rate', 'recession', 'quarterly earning', 'dow jones', 'nasdaq',
  'gdp', 'revenue', 'profit', 'tax ', 'taxes', 'fiscal',
  'surplus', 'deficit', 'treasury', 'federal reserve', 'central bank',
  'investor', 'shareholder', 'ipo', 'merger',
  // DE
  'aktien', 'börse', 'haushalt', 'rezession', 'steuern', 'wirtschaft',

  // ── Controversy / opinion / divisive ──
  'kontroverzn', 'skandál', 'korupc', 'podvod', 'fraud',
  'corruption', 'scandal', 'controversial', 'outrage', 'backlash',
  'protest', 'demonstrac', 'boycott',

  // ── Disasters & weather warnings ──
  'výstrah', 'výstraha', 'varován', 'warning', 'uzavřen', 'uzavrel',
  'evakuac', 'evacuati',
];

/**
 * Wholesome signal stems — if the article contains these AND passes hard-block,
 * it gets a boost in the keyword fallback.
 */
const WHOLESOME_STEMS = [
  // CS/SK
  'zachránil', 'zachránila', 'zachrán', 'hrdina', 'hrdinsk',
  'daroval', 'darovala', 'charit', 'dobrovoln',
  'shledán', 'návrat domů', 'uzdrav', 'vyléčil', 'vyléčila',
  'zázrak', 'dojemn', 'úlev', 'naděj',
  'štěně', 'kotě', 'zvíře', 'mazlíč',
  // EN
  'rescued', 'saved', 'hero', 'heroic', 'reunited', 'reunion',
  'donated', 'charity', 'volunteer', 'miracle', 'heartwarming',
  'breakthrough', 'cured', 'recovered', 'puppy', 'kitten',
  'endangered species', 'good samaritan', 'kindness',
  // DE
  'gerettet', 'held', 'wunder', 'spende', 'ehrenamt',
];

export interface FilterResult {
  pass: boolean;
  positivityScore: number;
  category: string;
  isAdult: boolean;
}

/**
 * Run keyword-based scoring as a fallback (used when AI is unavailable).
 * STRICT MODE: Without AI, only pass articles with strong wholesome signals.
 */
function keywordFallback(
  text: string,
  words: string[],
  totalWords: number,
  isPositiveSource: boolean
): { pass: boolean; positivityScore: number } {
  // Check for any negative keywords at all
  let negativeCount = 0;
  for (const keyword of NEGATIVE_KEYWORDS) {
    if (text.includes(keyword)) {
      negativeCount++;
    }
  }

  if (negativeCount > 0 && !isPositiveSource) {
    return { pass: false, positivityScore: 0 };
  }

  // Check for wholesome signals (stronger than generic positive keywords)
  let wholesomeCount = 0;
  for (const stem of WHOLESOME_STEMS) {
    if (text.includes(stem)) {
      wholesomeCount++;
    }
  }

  // Also count generic positive keywords
  let positiveCount = 0;
  for (const keyword of POSITIVE_KEYWORDS) {
    if (text.includes(keyword)) {
      positiveCount++;
    }
  }

  let positivityScore = positiveCount / totalWords;
  if (isPositiveSource && positivityScore < 0.05) {
    positivityScore = 0.05;
  }
  positivityScore = Math.min(positivityScore, 1.0);

  let pass = false;
  if (isPositiveSource) {
    pass = true;
  } else if (wholesomeCount >= 1 && negativeCount === 0) {
    // Only pass WITHOUT AI if there's at least one wholesome signal and zero negatives
    pass = true;
  }

  return { pass, positivityScore };
}

/**
 * Classify an article using Cloudflare Workers AI.
 * Returns 'POSITIVE', 'NEUTRAL', or 'NEGATIVE'.
 * Returns null on any error so the caller can fall back.
 */
async function classifyWithAI(
  ai: Ai,
  title: string,
  description: string
): Promise<string | null> {
  try {
    const prompt = `You are a strict content filter for a "pure joy" news app. Your goal is NOT to inform — it is to select ONLY stories that warm the heart, bring a smile, or evoke relief.

Apply the Heart Test: "Would this story warm the reader's heart, make them smile, or give them a sense of relief?"

POSITIVE (pass) — ONLY these types:
- Human kindness & heroism: life-saving acts, selfless help, charity, reunions
- Scientific breakthroughs: real cures, planet-saving tech, space discoveries
- Animal stories: rescued pets, endangered species saved, playful interactions
- Stories with a happy ending that bring overwhelming relief

NEGATIVE (reject) — ANY of these, even if framed positively:
- Politics: elections, resignations, legislation, polls, government, candidates
- Economics/Business: stocks, GDP, crypto, corporate earnings, inflation, market data
- Controversy or opinion: anything divisive or debate-provoking
- Dry data: statistics, demographics, analysis without a strong human story
- Violence, crime, disasters, war, tragedy

NEUTRAL (reject) — purely informational, neither heartwarming nor negative

Respond with ONLY one word: POSITIVE, NEUTRAL, or NEGATIVE.

Title: ${title}
Description: ${description}`;

    const response = await (ai as any).run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 10,
    }) as { response?: string };

    const answer = (response.response ?? '').trim().toUpperCase();
    if (['POSITIVE', 'NEUTRAL', 'NEGATIVE'].includes(answer)) {
      return answer;
    }
    // Try to extract from a longer response
    if (answer.includes('POSITIVE')) return 'POSITIVE';
    if (answer.includes('NEGATIVE')) return 'NEGATIVE';
    if (answer.includes('NEUTRAL')) return 'NEUTRAL';

    console.warn(`AI returned unexpected classification: "${answer}"`);
    return null;
  } catch (err) {
    console.error('AI classification failed, using keyword fallback:', err);
    return null;
  }
}

export async function filterArticle(
  article: { title: string; description: string | null; url: string },
  sourceDomain: string,
  sourceLanguage?: string,
  ai?: Ai
): Promise<FilterResult> {
  const result: FilterResult = {
    pass: false,
    positivityScore: 0,
    category: 'other',
    isAdult: false,
  };

  // 1. Check blacklist
  const domainLower = sourceDomain.toLowerCase();
  if (BLACKLIST_DOMAINS.has(domainLower)) {
    return result;
  }

  const text = `${article.title} ${article.description ?? ''}`.toLowerCase();
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const totalWords = words.length || 1;

  // 2. Hard-block: reject immediately if text contains any blocked stem
  for (const stem of HARD_BLOCK_STEMS) {
    if (text.includes(stem)) {
      return result;
    }
  }

  // 3. Trusted positive sources → automatic pass
  const isPositiveSource = POSITIVE_SOURCES.some((s) => domainLower.includes(s));

  // 4. Check adult content
  for (const keyword of ADULT_KEYWORDS) {
    if (text.includes(keyword)) {
      result.isAdult = true;
      break;
    }
  }

  // 5. Classify category
  result.category = classifyCategory(article.title, article.description ?? '');

  // 6. Auto-reject blocked categories (business, etc.)
  if (BLOCKED_CATEGORIES.includes(result.category) && !isPositiveSource) {
    return result;
  }

  // 7. Positive sources always pass
  if (isPositiveSource) {
    result.pass = true;
    result.positivityScore = 0.05;
    return result;
  }

  // 8. AI classification (with keyword fallback)
  if (ai) {
    const classification = await classifyWithAI(
      ai,
      article.title,
      article.description ?? ''
    );

    if (classification !== null) {
      result.pass = classification === 'POSITIVE';
      result.positivityScore = classification === 'POSITIVE' ? 0.1 : 0;
      return result;
    }
    // AI failed — fall through to keyword fallback
  }

  // Keyword fallback — STRICT: without AI, only pass clearly wholesome articles
  const fallback = keywordFallback(text, words, totalWords, isPositiveSource);
  result.pass = fallback.pass;
  result.positivityScore = fallback.positivityScore;

  return result;
}
