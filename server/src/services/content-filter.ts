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
  'pozitivni-zpravy.cz',
  'brightside.me',
];

/**
 * Categories that are auto-rejected.
 */
const BLOCKED_CATEGORIES: string[] = ['other', 'business'];

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

  // ── Zdravotní clickbait ──
  'poškodiť vaše', 'poškodit vaše', 'ničí vaše', 'škodí vášmu',
  'môžu poškodiť', 'mohou poškodit',
  'odborníci vymenovali', 'odborníci jmenovali',
  'odborníci varuj', 'odborníky varuj',

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

  // ── Celebrity / drby / bulvár ──
  'celebrity', 'celebrit',
  'influencer', 'influencerka',
  'červený koberec', 'červenom koberci',
  'přiznala', 'přiznal', 'prozradila', 'prozradil',
  'rozchod', 'rozvod', 'po rozchode', 'po rozvode',
  'žije idylu', 'žije dokonalú', 'žije dokonalou',
  'má oči iba pre', 'má oči jen pro',
  'speváčk', 'speváč', 'zpěvačk', 'zpěvák',
  'herečk', 'herec ', 'hercov', 'herečin',
  'hokejist', 'futbalist', 'fotbalist',
  'žiadaný herec', 'žádaný herec',
  'nesprávne otázky', 'nepotrebuje muža', 'nepotřebuje muže',

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

  // ── Kurzovní / burzovní / broker / investice ──
  'kurz koruny', 'kurz eura', 'kurz dolaru',
  'bitcoin', 'kryptomě', 'ethereum',
  'burzovní', 'akciový trh', 'stock market',
  'exchange rate',
  'broker', 'brokeři', 'cfd ', 'forex',
  'obchodování', 'trading', 'investování do',
  'investiční', 'investičn', 'investor',
  'finanční poradce', 'finanční poradenstv',
  'hedge fund', 'portfolio',

  // ── Sponzorovaný / PR obsah ──
  'komerční sdělení', 'sponzorovaný článek', 'sponzorovaný obsah',
  'komerčná správa', 'sponzorovaný príspevok',
  'sponsored content', 'advertorial', 'paid partnership',

  // ── Bare sports scores / league roundups ──
  'chance liga',          // CZ football league score roundups
  'fortuna liga',         // SK football league
  'extraliga',            // CZ/SK hockey league

  // ── Politici (jména) — nulová tolerance ──
  'babiš', 'fiala', 'fico', 'soukup',
  'okamura', 'petr pavel', 'pellegrini', 'čaputová',
  'trump', 'biden', 'putin', 'zelenskyj', 'zelensky',

  // ── Politické strany a instituce ──
  'hnutí ano', 'hnutí spd', 'pirátsk', 'starost', 'spolu ',
  'smer-sd', 'smer ', 'hlas-sd', 'progresívne slovensko',
  'european commission', 'evropská komise', 'european parliament',
  'nato ', 'eu summit', 'summit eu',

  // ── Šokující / drsný / temný obsah ──
  'šokující', 'šokujíc', 'drsná', 'drsný', 'drsné', 'brutální',
  'závislost', 'závislos', 'alkoholi', 'narkomani', 'feťák',
  'bezdomovec', 'bezdomovců', 'bezdomovci',
  'shocking', 'disturbing', 'graphic content',

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

  // ── Cestování / tipy na výlet / lifestyle rady ──
  'dovolená', 'dovolenou', 'dovolenk',
  'co patří do kufru', 'co zabalit', 'co si vzít',
  'jak si užít', 'jak si užiť',
  'na víkend s', 'víkend v ',
  'cestovatelský tip', 'cestovatelské tip',
  'travel tip', 'packing list', 'travel guide',
  'co navštívit', 'co vidět', 'co ochutnat',
  'kam na dovolen', 'kam na výlet',
  'den 1:', 'den 2:', 'den 3:',

  // ── Event listings / programy ──
  'kam o víkendu', 'program kina', 'program divadl',
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

  // ── Akademické papery / korekce ──
  'author correction:', 'publisher correction:', 'corrigendum:',
  'erratum:', 'retraction:',
  'daily briefing:',  'briefing chat:',  // Nature News briefings (not uplifting)
  'mid-cycle update',
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
    const prompt = `You are the CHIEF EDITOR of "Prostě dobré zprávy" — a Czech/Slovak app showing ONLY super-positive news that makes people feel hope, inspiration, and faith in humanity. You are the FINAL GATE. Be EXTREMELY strict: if it's not 9/10 on the "warm heart" scale, REJECT.

An article PASSES only if it clearly fits one of these 5 categories AND describes something that ALREADY HAPPENED (not plans, hopes, or aspirations):

CATEGORY 1 — KINDNESS & COMPASSION
Random acts of kindness, people helping strangers without expecting anything in return, selfless donations, community solidarity with concrete outcomes.
Examples: "Girl donates hair to children with cancer", "Nation raises 150M CZK for gene therapy for baby", "Strangers rebuild home for elderly woman"

CATEGORY 2 — RESCUE & SALVATION
Dramatic or touching rescues of human or animal lives. Firefighters, doctors, volunteers, ordinary people saving lives.
Examples: "Firefighters rescue 160 pigs from burning barn", "Dog found alive after 3 weeks under rubble", "Stranger performs CPR and saves jogger's life"

CATEGORY 3 — SCIENTIFIC BREAKTHROUGH
Major discoveries in medicine (cancer treatment, paralysis cure, rare disease therapy) or planet-protecting technology. Must be concrete and groundbreaking.
Examples: "New drug cures 95% of melanoma patients", "Czech scientists develop nanorings targeting tumors", "Paralyzed man walks again thanks to brain implant"

CATEGORY 4 — PERSONAL TRIUMPH
Stories of people who overcame hardship (disability, illness, poverty, trauma) and now help or inspire others. The human story must be central.
Examples: "Blind climber summits Everest", "Former homeless man opens shelter for others", "Cancer survivor runs marathon to raise funds"

CATEGORY 5 — NATURE & ECOLOGY
Return of extinct species, successful ocean cleanup, forest restoration, concrete biodiversity wins with measurable results.
Examples: "Wolves return to Czech forests after 200 years", "Great Barrier Reef shows high coral recovery", "Country plants 1 billion trees ahead of schedule"

ABSOLUTE REJECTION — NEVER pass these:
- ANY mention of politics, politicians, political parties, government budgets, legislation
- Commercial content: product reviews, shopping tips, PR articles, recipes, sales
- Neutral/informational news: "New school opened", "Nice weather expected"
- Controversial or divisive topics (religion, ideology) even if framed positively
- Celebrity/influencer news, opinion columns, editorials
- Sports scores, league tables, previews
- Plans/aspirations ("hopes to", "wants to", "will compete")
- Historical retrospectives, nostalgia, biographical profiles
- Weather, crime, accidents, disasters, war
- Economic/business/market reports
- Articles that are merely "not negative" — must be ACTIVELY UPLIFTING

THE KEY TEST: Rate the article 1-10 on "warm heart" scale. Would a reader feel genuine emotion — tears of joy, hope for humanity, or deep inspiration? If it's below 9/10, REJECT. Prefer HUMAN STORIES over dry statistics.

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

  // 7. Positive sources pass WITHOUT AI — but only for non-commercial categories
  if (isPositiveSource && result.category !== 'business' && result.category !== 'other') {
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
