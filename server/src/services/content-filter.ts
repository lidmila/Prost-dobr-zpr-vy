import { classifyCategory } from './category-classifier';
import { callClaude } from './claude';
import { BLACKLIST_DOMAINS } from '../data/blacklist';
import { NEGATIVE_KEYWORDS_CS, NEGATIVE_KEYWORDS_EN } from '../data/negative-keywords';
import { ADULT_KEYWORDS } from '../data/adult-keywords';
import { EDITORIAL_OVERRIDES } from '../data/editorial-overrides';

const NEGATIVE_KEYWORDS = [...NEGATIVE_KEYWORDS_CS, ...NEGATIVE_KEYWORDS_EN];

const POSITIVE_SOURCES = [
  'goodnewsnetwork.org',
  'positive.news',
  'reasonstobecheerful.world',
  'dobrenoviny.sk',
  'pozitivni-zpravy.cz',
  'brightside.me',
];

/**
 * Categories that are auto-rejected.
 */
const BLOCKED_CATEGORIES: string[] = [];

/**
 * URL path segments that indicate irrelevant content sections.
 * If the article URL contains any of these, it is rejected.
 */
export const BLOCKED_URL_SEGMENTS = [
  '/koktejl',       // novinky.cz tabloid/curiosity section
  '/recept/',       // recipe pages
  '/recepty/',      // recipe sections
  '/vareni/',       // cooking sections
  '/celebrity',     // celebrity sections
  '/horoskop',      // horoscope sections
  '/krimi/',        // crime sections
  '/auto/',         // car review sections
  '/hry/',          // gaming sections
  '/nazory-komentare', // SeznamZprávy opinions
  '/nazory/',       // obecné názorové sekce
  '/komentare/',    // komentáře
  '/blog/',         // blogy
  '/komentar/',     // SK komentáře
  '/glosa/',        // glosy
  '/pocasi/',       // počasí
  '/weather/',      // weather
  '/finance/',      // finance
  '/ekonomika/',    // ekonomika
  '/byznys/',       // byznys
  '/reality/',      // reality
  '/magazin/',      // magazín
  '/styl/',         // styl
  '/zdravi/',       // zdraví
  '/tipy/',         // tipy
  '/nakupovani/',   // nakupování
  '/quiz/',         // kvízy
  '/anketa/',       // ankety
  '/soutez/',       // soutěže
];

/**
 * Hard-block stems — matched against full text (title + description) using
 * substring matching so that inflected forms are caught.
 * If ANY stem is found, the article is immediately rejected.
 */
export const HARD_BLOCK_STEMS = [
  // ── Violence & death ──
  // CS/SK
  'zemřel', 'umřel', 'zahynul', 'zavražd', 'zabil', 'zastřel',
  'pobodal', 'znásiln', 'odsouzen', 'odsúden', 'zatčen', 'zatknut', 'obviněn',
  'nehoda', 'nehodě', 'nehodou', 'nehody', 'havári', 'výbuch', 'požár',
  'povodn', 'válka', 'válce', 'válku', 'válečn',
  'útok', 'teror', 'sebevražd', 'hrozba', 'hrozbě', 'hrozby',
  'obětí', 'obětmi', 'mrtvý', 'mrtvých', 'zraněn', 'přepad', 'napadl', 'unesl',
  'kalamit', 'katastro', 'tragéd', 'tragick',
  // EN
  'killed', 'murder', 'kidnap', 'stabbed', 'shooting', 'shot dead',
  'arrested', 'convicted', 'crash', 'explosion', 'suicide', 'victim',
  'wounded', 'dead body', 'death toll', 'fatally', 'fatal',
  'disaster', 'catastroph', 'devastat', 'destruction',

  // ── War & geopolitics ──
  'invaze', 'invazi', 'invázi', 'sankce', 'sankcí', 'embargo', 'konflikt',
  'warfare', 'warzone', 'troops', 'missile', 'bombing',
  'frontline', 'occupied', 'annex',

  // ── Controversy / opinion / divisive ──
  'kontroverzn', 'skandál', 'korupce', 'korupcí', 'podvod', 'fraud',
  'corruption', 'scandal', 'controversial', 'outrage', 'backlash',
  'rozhorčil', 'rozhorčen', 'pobúril', 'pobúren',  // outrage/angered
  'klamani', 'klamání', 'klamanie',                  // deception/lying
  'ponižoval', 'ponižova', 'ponížen',                // humiliation

  // ── Disasters & weather warnings ──
  'evakuac', 'evacuati',

  // ── Recipes / cooking ──
  'recept na', 'recept pro', 'recept od',
  'ingredienc', 'přísad',
  'upečte', 'uvařte', 'upeč', 'uvař',
  'těsto na', 'koření',
  'recipe', 'recipes',

  // ── Product reviews / buying guides ──
  'recenz', 'review:',
  'pro koho je', 'pro koho jsou',
  'vyplatí se koupit', 'stojí za koupi',
  'which should you buy', 'worth buying',
  'best deals', 'buying guide',

  // ── Clickbait / lifehack / household tips / nostalgia bait ──
  'nevyhazujte', 'nevyhadzujte',
  'překvapí vás', 'prekvapí vás',
  'neuvěříte', 'neuveríte',
  'trik, který', 'trik, ktorý',
  'triky, které', 'triky, ktoré',
  'life hack', 'lifehack',
  'you won\'t believe',
  'nikdy nevide', 'nikdy nevidě',   // "dnešná generácia ho možno nikdy nevidela"
  'možno nikdy',                      // SK nostalgia clickbait
  'asi nikdy',                        // CZ variant

  // ── Celebrity / drby ──
  'celebrity', 'celebrit',
  'influencer', 'influencerka',
  'červený koberec', 'červenom koberci',
  'přiznala', 'přiznal', 'prozradila', 'prozradil',

  // ── Horoskopy / ezoterika ──
  'horoskop', 'znamení zvěrokruh', 'tarot',
  'horoscope', 'zodiac',

  // ── Vztahové rady ──
  'jak poznat nevěr', 'znamení, že vás partner',
  'vztahov', 'randění', 'rande',
  'dating tips', 'relationship advice',

  // ── Módní / beauty ──
  'trendy jaro', 'trendy léto', 'trendy podzim', 'trendy zima',
  'jak se líčit', 'make-up trik', 'beauty tip',
  'fashion trend',

  // ── Kurzovní / burzovní zprávy ──
  'kurz koruny', 'kurz eura', 'kurz dolaru',
  'bitcoin', 'kryptomě', 'ethereum',
  'burzovní', 'akciový trh', 'stock market',
  'exchange rate',

  // ── Sponzorovaný / PR obsah ──
  'komerční sdělení', 'sponzorovaný článek', 'sponzorovaný obsah',
  'komerčná správa', 'sponzorovaný príspevok',
  'sponsored content', 'advertorial', 'paid partnership',

  // ── Bare sports scores / league roundups ──
  'chance liga',          // CZ football league score roundups
  'fortuna liga',         // SK football league
  'extraliga',            // CZ/SK hockey league

  // ── Názorové/komentářové sloupky ──
  'pod čarou', 'pod čiarou', 'komentář:', 'komentár:', 'glosa:', 'editorial:', 'názor:',

  // ── Výpisy akcí (ne zprávy) ──
  'to-do list', 'to do list', 'víkendový přehled', 'víkendový program', 'víkendové tipy', 'víkendový to-do',

  // ── Válečný kontext v kulturním obsahu ──
  'ruská vojska', 'bojovat tady',

  // ── Počasí / výstrahy ──
  'výstraha', 'výstrahy', 'varování meteorolog',
  'weather warning', 'weather alert',
  'silný vítr', 'silný mráz', 'náledí',

  // ── Nekrology / výročí ──
  'výročí úmrtí', 'výročí smrti', 'vzpomínka na', 'vzpomínky na',
  'in memoriam', 'nekrolog', 'odešel', 'odešla',

  // ── Event listings / programy ──
  'kam o víkendu', 'kam na výlet', 'program kina', 'program divadl',
  'vstupné:', 'vstupné od',

  // ── Shopping / deals ──
  'výprodej', 'black friday', 'slevový kód', 'kupón',

  // ── Listicles / tipy ──
  'tipů na', 'tipů, jak', 'způsobů, jak', 'důvodů, proč',
  'top 10', 'top 5',

  // ── Počasí ──
  'předpověď počasí', 'počasí na',

  // ── Sport bez narativu ──
  'výsledky kola', 'tabulka', 'přestup', 'přestupové',
];

/**
 * Check if an article matches any editorial override pattern.
 * All triggers in a pattern must be present in the text for a match.
 */
function matchesEditorialOverride(text: string): boolean {
  return EDITORIAL_OVERRIDES.some(override =>
    override.triggers.every(trigger => text.includes(trigger))
  );
}

export interface FilterResult {
  pass: boolean;
  positivityScore: number;
  category: string;
  isAdult: boolean;
  reason?: string;
  aiUnavailable?: boolean;
}

/**
 * Classify an article using Cloudflare Workers AI.
 * Returns 'POSITIVE', 'NEUTRAL', or 'NEGATIVE'.
 * Returns null on any error so the caller can fall back.
 */
async function classifyWithAI(
  apiKey: string,
  title: string,
  description: string
): Promise<string | null> {
  try {
    const prompt = `You are the FINAL GATE for "Prostě dobré zprávy" (Simply Good News), a Czech/Slovak positive news app. You must be VERY STRICT. When in doubt, REJECT.

An article PASSES only if it fits one of these 7 categories AND has a CONCRETE POSITIVE OUTCOME (something already happened, not aspirational):

CATEGORY 1 — WILDLIFE / NATURE CONSERVATION SUCCESS
Species recovering, population growing, animal saved from extinction, reintroduction succeeding.
Examples: "Giant panda no longer endangered", "Wolves return to Czech forests", "Sea turtle population rebounds 30%"

CATEGORY 2 — MEDICAL / SCIENCE BREAKTHROUGH
Concrete discovery, cure, treatment, or scientific achievement with measurable results.
Examples: "Czech scientists develop nanorings targeting cancer", "HIV prevention drug 99.9% effective", "New type of magnetism discovered"

CATEGORY 3 — ACTS OF KINDNESS / HUMAN SOLIDARITY
Real people helping others: donations, rescues, volunteer efforts, community fundraising with concrete outcomes.
Examples: "Girl donates hair to cancer children", "Nation raises 150M CZK for gene therapy for baby", "Strangers help family rebuild"

CATEGORY 4 — ANIMAL HEARTWARMING STORIES
Rescued animals, unlikely animal friendships, zoo births, firefighter animal rescues.
Examples: "Lonely sheep gets lambs after rescue", "Baby monkey bonds with stuffed toy", "Firefighters rescue 160 pigs"

CATEGORY 5 — CZECH/SLOVAK SPORTS VICTORIES
ONLY actual achievements: medals, world records, championship wins, Olympic victories BY Czech or Slovak athletes. Must have narrative/story beyond bare scores.
REJECT: non-CZ/SK sports, previews, aspirations, league tables, bare one-line results, 4th place+.
PASS: "Czech curlers win Olympic match", "Slovak athlete wins European championship"
FAIL: "Slavia beats Plzeň 2-1", "Czech team hopes for medal", "Premier League results"

CATEGORY 6 — ENVIRONMENT / BIODIVERSITY PROGRESS
Concrete milestones with data: renewables surpassing fossil fuels, ozone healing, gene banks, pollution decreasing.
Examples: "Renewables outperform coal globally", "Prague gene bank preserves 43,000 plant samples"

CATEGORY 7 — COMMUNITY / CULTURAL ACHIEVEMENT
UNESCO recognition, heritage restoration completed, new museums, community milestones.
Examples: "Czech amateur theater gets UNESCO recognition", "Historic castle restored after 10 years"

HARD REJECT — NEVER pass:
- Neutral/informational articles (just facts, no uplift)
- Plans, aspirations, previews ("hopes to", "wants to", "will compete")
- Historical retrospectives, biographical profiles, nostalgia
- Opinion columns, commentaries, editorials
- Event listings, weekend programs, recipes, product reviews
- Celebrity/influencer news
- Political news of ANY kind
- Economic/business/market reports
- Weather, crime, accidents, disasters
- Non-CZ/SK sports results
- Articles merely "not negative" — must be ACTIVELY UPLIFTING

THE KEY TEST: Would a reader feel a warm smile, a surge of hope, or a swell of pride? If not, REJECT.

Respond with ONLY one word: POSITIVE or NEGATIVE.

Title: ${title}
Description: ${description}`;

    const raw = await callClaude(apiKey, prompt, 10);
    if (!raw) return null;

    const answer = raw.trim().toUpperCase();
    if (answer === 'POSITIVE' || answer === 'NEGATIVE') {
      return answer;
    }
    if (answer.includes('POSITIVE')) return 'POSITIVE';
    if (answer.includes('NEGATIVE') || answer.includes('NEUTRAL')) return 'NEGATIVE';

    console.warn(`AI returned unexpected classification: "${answer}"`);
    return null;
  } catch (err) {
    console.error('AI classification failed:', err);
    return null;
  }
}

export async function filterArticle(
  article: { title: string; description: string | null; url: string },
  sourceDomain: string,
  sourceLanguage?: string,
  anthropicApiKey?: string
): Promise<FilterResult> {
  const result: FilterResult = {
    pass: false,
    positivityScore: 0,
    category: 'other',
    isAdult: false,
  };

  // 1. Check blacklist (including subdomains)
  const domainLower = sourceDomain.toLowerCase();
  const isBlacklisted = Array.from(BLACKLIST_DOMAINS).some(
    blocked => domainLower === blocked || domainLower.endsWith('.' + blocked)
  );
  if (isBlacklisted) {
    result.reason = 'blacklisted domain';
    return result;
  }

  // 1b. Check blocked URL segments (tabloid sections, recipe pages, etc.)
  const urlLower = article.url.toLowerCase();
  for (const segment of BLOCKED_URL_SEGMENTS) {
    if (urlLower.includes(segment)) {
      result.reason = `blocked URL segment: ${segment}`;
      return result;
    }
  }

  const text = `${article.title} ${article.description ?? ''}`.toLowerCase();

  // Editorial override: if matched, skip hard-block and negative keyword rejection
  const isEditorialOverride = matchesEditorialOverride(text);

  // 2. Hard-block: reject immediately if text contains any blocked stem (UNLESS editorial override)
  if (!isEditorialOverride) {
    for (const stem of HARD_BLOCK_STEMS) {
      if (text.includes(stem)) {
        result.reason = `hard-block: ${stem}`;
        return result;
      }
    }
  }

  // 3. Negative keywords pre-filter (UNLESS editorial override)
  if (!isEditorialOverride) {
    for (const keyword of NEGATIVE_KEYWORDS) {
      if (text.includes(keyword)) {
        result.reason = `negative keyword: ${keyword}`;
        return result;
      }
    }
  }

  // 4. Check adult content
  for (const keyword of ADULT_KEYWORDS) {
    if (text.includes(keyword)) {
      result.isAdult = true;
      break;
    }
  }

  // 5. Classify category
  result.category = classifyCategory(article.title, article.description ?? '');

  // 6. Auto-reject blocked categories
  const isPositiveSource = POSITIVE_SOURCES.some((s) => domainLower.includes(s));
  if (BLOCKED_CATEGORIES.includes(result.category) && !isPositiveSource) {
    result.reason = `blocked category: ${result.category}`;
    return result;
  }

  // 7. Positive sources always pass (no AI needed)
  if (isPositiveSource) {
    result.pass = true;
    result.positivityScore = 0.05;
    result.reason = 'positive source';
    return result;
  }

  // 8. AI classification (MANDATORY gate)
  if (!anthropicApiKey) {
    result.aiUnavailable = true;
    result.reason = 'no API key';
    return result;
  }

  const classification = await classifyWithAI(
    anthropicApiKey,
    article.title,
    article.description ?? ''
  );

  if (classification === null) {
    result.aiUnavailable = true;
    result.reason = 'AI call failed';
    return result;
  }

  result.pass = classification === 'POSITIVE';
  result.positivityScore = classification === 'POSITIVE' ? 0.1 : 0;
  result.reason = `AI: ${classification}`;
  return result;
}
