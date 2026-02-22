/**
 * Simple keyword-based article category classifier.
 * Supports both Czech and English keywords.
 */

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  environment: [
    // English
    'climate', 'environment', 'renewable', 'solar', 'wind energy', 'recycling',
    'biodiversity', 'conservation', 'forest', 'ocean', 'pollution', 'carbon',
    'emissions', 'sustainability', 'green energy', 'wildlife', 'ecosystem',
    'deforestation', 'clean energy', 'electric vehicle', 'nature reserve',
    // Czech
    'klima', 'životní prostředí', 'obnovitelný', 'solární', 'recyklace',
    'biodiverzita', 'ochrana přírody', 'oceán', 'znečištění', 'uhlík',
    'emise', 'udržitelnost', 'zelená energie', 'ekosystém', 'ekolog',
  ],
  health: [
    // English
    'health', 'medical', 'vaccine', 'therapy', 'cancer', 'mental health',
    'wellbeing', 'hospital', 'doctor', 'treatment', 'disease', 'cure',
    'medicine', 'surgery', 'clinical', 'nutrition', 'wellness',
    'pandemic', 'pharmaceutical',
    // Czech
    'zdraví', 'lékařský', 'vakcína', 'terapie', 'rakovina', 'duševní zdraví',
    'nemocnice', 'lékař', 'léčba', 'nemoc', 'medicína', 'operace',
    'výživa', 'zdravotnictví',
  ],
  education: [
    // English
    'education', 'school', 'university', 'student', 'teacher', 'learning',
    'scholarship', 'curriculum', 'literacy', 'graduation', 'college',
    'classroom', 'academic', 'research grant', 'training',
    // Czech
    'vzdělávání', 'škola', 'univerzita', 'student', 'učitel', 'učení',
    'stipendium', 'gramotnost', 'absolvent', 'akademický', 'výuka', 'žák',
    'maturit', 'přijímačk', 'prvňáč', 'deváťák', 'gymnázi',
  ],
  technology: [
    // English
    'technology', 'software', 'artificial intelligence', 'robot',
    'startup', 'digital', 'innovation', 'blockchain', 'quantum',
    'programming', 'computer', 'internet', 'cyber', 'machine learning',
    'automation', 'gadget', '3d print',
    // Czech
    'technologie', 'umělá inteligence', 'robot', 'digitální', 'inovace',
    'počítač', 'internet', 'automatizace', 'aplikace', 'smartphone',
  ],
  community: [
    // English
    'community', 'volunteer', 'charity', 'donation', 'nonprofit',
    'neighbourhood', 'neighborhood', 'fundraiser', 'homeless',
    'food bank', 'shelter', 'solidarity', 'social work',
    // Czech
    'komunita', 'dobrovolník', 'charita', 'neziskovka', 'sousedství',
    'sbírka', 'bezdomovec', 'solidarita', 'sociální práce',
  ],
  culture: [
    // English
    'culture', 'art', 'music', 'film', 'movie', 'theater', 'theatre',
    'museum', 'gallery', 'literature', 'festival', 'dance',
    'photography', 'sculpture', 'concert', 'exhibition', 'heritage',
    'oscar', 'emmy', 'grammy',
    // Czech
    'kultura', 'umění', 'hudba', 'film', 'divadlo', 'muzeum', 'galerie',
    'kniha', 'literatura', 'festival', 'tanec', 'fotografie', 'koncert',
    'výstava', 'dědictví', 'herec', 'herecký', 'režisér', 'představení',
    'premiéra', 'seriál', 'pořad', 'zpěvák', 'zpěvačka', 'inscenace',
    'pouť', 'kino', 'berlinale', 'filmový',
    // SK
    'kultúra', 'divadlo', 'herec', 'režisér', 'koncert',
  ],
  science: [
    // English
    'science', 'research', 'discovery', 'experiment', 'physics', 'chemistry',
    'biology', 'astronomy', 'space', 'nasa', 'laboratory', 'genome',
    'particle', 'telescope', 'mars', 'satellite', 'fossil',
    // Czech
    'věda', 'výzkum', 'objev', 'experiment', 'fyzika', 'chemie', 'biologie',
    'astronomie', 'vesmír', 'laboratoř', 'genom', 'teleskop', 'fosilie',
    'vědec', 'vědci', 'vědecký', 'bakterie', 'jeskyně',
  ],
  sport: [
    // English
    'sport', 'football', 'soccer', 'basketball', 'tennis', 'olympic',
    'athlete', 'championship', 'marathon', 'swimming', 'rugby', 'cricket',
    'hockey', 'golf', 'cycling', 'medal', 'tournament', 'league', 'coach',
    'world cup', 'nba', 'nhl', 'nfl', 'uefa', 'fifa',
    // Czech
    'sport', 'fotbal', 'basketbal', 'tenis', 'olympijský', 'sportovec',
    'mistrovství', 'maraton', 'plavání', 'hokej', 'cyklistika', 'medaile',
    'turnaj', 'liga', 'trenér', 'závod', 'závodník', 'branka', 'gól',
    'hráč', 'zápas', 'výhra', 'vítěz', 'soutěž', 'bruslení', 'bruslar',
    'lyžař', 'lyžován', 'snowboard', 'slalom', 'biatlon', 'skikros',
    'běžec', 'plavec', 'atletik', 'florbal', 'volejbal', 'pohár',
    'slavia', 'sparta', 'baník', 'plzeň', 'skiareál', 'extralig',
    'kvalifikac', 'semifinál', 'finále', 'medailové',
    // SK
    'futbal', 'hokej', 'športov', 'majstrovstv', 'zápas',
  ],
  business: [
    // English
    'business', 'economy', 'market', 'investment', 'entrepreneur',
    'profit', 'revenue', 'trade', 'finance', 'banking',
    'employment', 'company', 'corporation',
    // Czech
    'podnikání', 'ekonomika', 'investice', 'podnikatel', 'zisk',
    'obchod', 'bankovnictví', 'firma', 'společnost',
  ],
};

export function classifyCategory(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();

  const scores: Record<string, number> = {};
  let maxScore = 0;
  let bestCategory = 'other';

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (keyword.length <= 4) {
        // Short keywords: match whole words only to avoid false positives
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) score += matches.length;
      } else {
        // Longer keywords: substring match
        let idx = 0;
        while (true) {
          idx = text.indexOf(keyword, idx);
          if (idx === -1) break;
          score++;
          idx += keyword.length;
        }
      }
    }
    scores[category] = score;
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }

  return maxScore > 0 ? bestCategory : 'other';
}
