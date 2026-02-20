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
    'deforestation', 'clean energy', 'electric vehicle', 'ev', 'nature',
    // Czech
    'klima', 'životní prostředí', 'obnovitelný', 'solární', 'recyklace',
    'biodiverzita', 'ochrana přírody', 'les', 'oceán', 'znečištění', 'uhlík',
    'emise', 'udržitelnost', 'zelená energie', 'příroda', 'ekosystém',
  ],
  health: [
    // English
    'health', 'medical', 'vaccine', 'therapy', 'cancer', 'mental health',
    'wellbeing', 'hospital', 'doctor', 'treatment', 'disease', 'cure',
    'medicine', 'surgery', 'clinical', 'nutrition', 'fitness', 'wellness',
    'pandemic', 'drug', 'pharmaceutical',
    // Czech
    'zdraví', 'lékařský', 'vakcína', 'terapie', 'rakovina', 'duševní zdraví',
    'nemocnice', 'lékař', 'léčba', 'nemoc', 'lék', 'medicína', 'operace',
    'výživa', 'kondice',
  ],
  education: [
    // English
    'education', 'school', 'university', 'student', 'teacher', 'learning',
    'scholarship', 'curriculum', 'literacy', 'graduation', 'college',
    'classroom', 'academic', 'research grant', 'training',
    // Czech
    'vzdělávání', 'škola', 'univerzita', 'student', 'učitel', 'učení',
    'stipendium', 'gramotnost', 'absolvent', 'akademický', 'výuka', 'žák',
  ],
  technology: [
    // English
    'technology', 'software', 'ai', 'artificial intelligence', 'robot',
    'startup', 'app', 'digital', 'innovation', 'blockchain', 'quantum',
    'programming', 'computer', 'internet', 'cyber', 'machine learning',
    'automation', 'gadget', '3d print',
    // Czech
    'technologie', 'umělá inteligence', 'robot', 'digitální', 'inovace',
    'počítač', 'internet', 'automatizace', 'aplikace',
  ],
  community: [
    // English
    'community', 'volunteer', 'charity', 'donation', 'nonprofit',
    'neighbourhood', 'neighborhood', 'local', 'fundraiser', 'homeless',
    'food bank', 'shelter', 'solidarity', 'social work', 'activism',
    // Czech
    'komunita', 'dobrovolník', 'charita', 'dar', 'neziskovka', 'sousedství',
    'místní', 'sbírka', 'bezdomovec', 'solidarita', 'sociální',
  ],
  culture: [
    // English
    'culture', 'art', 'music', 'film', 'movie', 'theater', 'theatre',
    'museum', 'gallery', 'book', 'literature', 'festival', 'dance',
    'photography', 'sculpture', 'concert', 'exhibition', 'heritage',
    // Czech
    'kultura', 'umění', 'hudba', 'film', 'divadlo', 'muzeum', 'galerie',
    'kniha', 'literatura', 'festival', 'tanec', 'fotografie', 'koncert',
    'výstava', 'dědictví',
  ],
  science: [
    // English
    'science', 'research', 'discovery', 'experiment', 'physics', 'chemistry',
    'biology', 'astronomy', 'space', 'nasa', 'esa', 'laboratory', 'genome',
    'dna', 'particle', 'telescope', 'mars', 'satellite', 'fossil',
    // Czech
    'věda', 'výzkum', 'objev', 'experiment', 'fyzika', 'chemie', 'biologie',
    'astronomie', 'vesmír', 'laboratoř', 'genom', 'teleskop', 'fosilie',
  ],
  sport: [
    // English
    'sport', 'football', 'soccer', 'basketball', 'tennis', 'olympic',
    'athlete', 'championship', 'marathon', 'swimming', 'rugby', 'cricket',
    'hockey', 'golf', 'cycling', 'medal', 'tournament', 'league', 'coach',
    'fitness', 'world cup',
    // Czech
    'sport', 'fotbal', 'basketbal', 'tenis', 'olympijský', 'sportovec',
    'mistrovství', 'maraton', 'plavání', 'hokej', 'cyklistika', 'medaile',
    'turnaj', 'liga', 'trenér',
  ],
  business: [
    // English
    'business', 'economy', 'market', 'investment', 'startup', 'entrepreneur',
    'profit', 'revenue', 'trade', 'stock', 'finance', 'banking', 'growth',
    'employment', 'job', 'wage', 'salary', 'company', 'corporation',
    // Czech
    'podnikání', 'ekonomika', 'trh', 'investice', 'podnikatel', 'zisk',
    'obchod', 'finance', 'bankovnictví', 'růst', 'zaměstnanost', 'práce',
    'mzda', 'plat', 'firma', 'společnost',
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
      // Count occurrences of each keyword in the combined text
      let idx = 0;
      while (true) {
        idx = text.indexOf(keyword, idx);
        if (idx === -1) break;
        score++;
        idx += keyword.length;
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
