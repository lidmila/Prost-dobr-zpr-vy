/**
 * Editorial overrides — patterns that bypass hard-block and negative-keyword
 * checks for articles matching the developer's editorial stance.
 *
 * Each override = array of "trigger" stems (ALL must be present in text).
 * Matching is case-insensitive substring (text is already lowercased).
 */

export interface EditorialOverride {
  triggers: string[];
}

export const EDITORIAL_OVERRIDES: EditorialOverride[] = [
  // ── Ukrajina: úspěchy, vítězství, osvobození, pomoc ──
  { triggers: ['ukraj', 'vítěz'] },
  { triggers: ['ukraj', 'vyhrál'] },
  { triggers: ['ukraj', 'osvobod'] },
  { triggers: ['ukraj', 'úspě'] },
  { triggers: ['ukraj', 'postup'] },
  { triggers: ['ukraj', 'pomoc'] },
  { triggers: ['ukraj', 'podpor'] },
  { triggers: ['ukraj', 'obran'] },
  { triggers: ['ukraine', 'victor'] },
  { triggers: ['ukraine', 'liberat'] },
  { triggers: ['ukraine', 'advanc'] },
  { triggers: ['ukraine', 'success'] },
  { triggers: ['ukraine', 'aid'] },
  { triggers: ['ukraine', 'support'] },
  { triggers: ['ukraine', 'defen'] },

  // ── Rusko: porážky, ústup, izolace ──
  { triggers: ['rus', 'porážk'] },
  { triggers: ['rus', 'ústup'] },
  { triggers: ['rus', 'prohrál'] },
  { triggers: ['rus', 'izolac'] },
  { triggers: ['russia', 'defeat'] },
  { triggers: ['russia', 'retreat'] },
  { triggers: ['russia', 'isolat'] },

  // ── Petr Pavel: pozitivní zprávy ──
  { triggers: ['petr pavel'] },
  { triggers: ['pavel', 'prezident'] },

  // ── ANO/Babiš: neúspěchy, odchod = dobrá zpráva ──
  { triggers: ['babiš', 'prohrál'] },
  { triggers: ['babiš', 'odchod'] },
  { triggers: ['babiš', 'rezign'] },
  { triggers: ['babiš', 'odsouzen'] },
  { triggers: ['babiš', 'konec'] },
  { triggers: ['hnutí ano', 'prohra'] },
  { triggers: ['hnutí ano', 'ztráta'] },
  { triggers: ['hnutí ano', 'pokles'] },

  // ── SPD/Okamura: neúspěchy, odchod ──
  { triggers: ['okamura', 'odchod'] },
  { triggers: ['okamura', 'rezign'] },
  { triggers: ['okamura', 'prohrál'] },
  { triggers: ['okamura', 'konec'] },
  { triggers: ['spd', 'konec'] },
  { triggers: ['spd', 'prohra'] },

  // ── Fico & spol.: pád, odsouzení ──
  { triggers: ['fico', 'odsouzen'] },
  { triggers: ['fico', 'rezign'] },
  { triggers: ['fico', 'pád'] },
  { triggers: ['fico', 'prohrál'] },
];
