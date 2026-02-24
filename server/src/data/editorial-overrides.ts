/**
 * Editorial overrides — patterns that bypass hard-block and negative-keyword
 * checks for articles matching the developer's editorial stance.
 *
 * Each override = array of "trigger" stems (ALL must be present in text).
 * Matching is case-insensitive substring (text is already lowercased).
 *
 * NOTE: No political overrides allowed. The app has a strict zero-politics policy.
 */

export interface EditorialOverride {
  triggers: string[];
}

export const EDITORIAL_OVERRIDES: EditorialOverride[] = [
  // ── Záchrana zvířat v kontextu nehod/katastrof ──
  { triggers: ['zachránil', 'zvíř'] },
  { triggers: ['zachránila', 'zvíř'] },
  { triggers: ['rescued', 'animal'] },
  { triggers: ['rescued', 'dog'] },
  { triggers: ['rescued', 'cat'] },
  { triggers: ['saved', 'animal'] },

  // ── Překonání nemoci / postižení ──
  { triggers: ['překonal', 'rakovi'] },
  { triggers: ['překonala', 'rakovi'] },
  { triggers: ['beat', 'cancer'] },
  { triggers: ['survived', 'cancer'] },
  { triggers: ['porazil', 'nemoc'] },
  { triggers: ['porazila', 'nemoc'] },

  // ── Sbírky / fundraising (mohou obsahovat slovo "oběť" nebo "nemoc") ──
  { triggers: ['sbírka', 'pomoc'] },
  { triggers: ['sbírku', 'pomoc'] },
  { triggers: ['fundrais', 'help'] },
  { triggers: ['donated', 'help'] },
];
