/**
 * Shared map of named HTML entities → Unicode characters.
 * Covers core entities, Czech/Slovak/German/Polish diacritics,
 * typographic symbols, and common punctuation.
 *
 * Keys are lowercase (e.g. '&scaron;').
 * For case-sensitive lookup, callers should try exact match first,
 * then fall back to lowercase.
 */
export const NAMED_ENTITIES: Record<string, string> = {
  // Core
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&nbsp;': ' ',

  // Typographic dashes & dots
  '&ndash;': '\u2013',
  '&mdash;': '\u2014',
  '&hellip;': '\u2026',

  // Quotes
  '&lsquo;': '\u2018',
  '&rsquo;': '\u2019',
  '&ldquo;': '\u201C',
  '&rdquo;': '\u201D',
  '&sbquo;': '\u201A',
  '&bdquo;': '\u201E',
  '&laquo;': '\u00AB',
  '&raquo;': '\u00BB',

  // Symbols
  '&copy;': '\u00A9',
  '&reg;': '\u00AE',
  '&trade;': '\u2122',
  '&euro;': '\u20AC',
  '&pound;': '\u00A3',
  '&yen;': '\u00A5',
  '&cent;': '\u00A2',
  '&sect;': '\u00A7',
  '&deg;': '\u00B0',
  '&micro;': '\u00B5',
  '&para;': '\u00B6',
  '&middot;': '\u00B7',
  '&bull;': '\u2022',
  '&minus;': '\u2212',
  '&times;': '\u00D7',
  '&divide;': '\u00F7',
  '&plusmn;': '\u00B1',
  '&frac12;': '\u00BD',
  '&frac14;': '\u00BC',
  '&frac34;': '\u00BE',
  '&iquest;': '\u00BF',
  '&iexcl;': '\u00A1',
  '&ordf;': '\u00AA',
  '&ordm;': '\u00BA',
  '&not;': '\u00AC',
  '&shy;': '\u00AD',
  '&macr;': '\u00AF',
  '&sup1;': '\u00B9',
  '&sup2;': '\u00B2',
  '&sup3;': '\u00B3',

  // Arrows & misc
  '&larr;': '\u2190',
  '&rarr;': '\u2192',
  '&uarr;': '\u2191',
  '&darr;': '\u2193',

  // Czech / Slovak lowercase diacritics
  '&aacute;': '\u00E1',   // á
  '&eacute;': '\u00E9',   // é
  '&iacute;': '\u00ED',   // í
  '&oacute;': '\u00F3',   // ó
  '&uacute;': '\u00FA',   // ú
  '&yacute;': '\u00FD',   // ý
  '&scaron;': '\u0161',   // š
  '&ccaron;': '\u010D',   // č
  '&zcaron;': '\u017E',   // ž
  '&rcaron;': '\u0159',   // ř
  '&ecaron;': '\u011B',   // ě
  '&dcaron;': '\u010F',   // ď
  '&tcaron;': '\u0165',   // ť
  '&ncaron;': '\u0148',   // ň
  '&uring;': '\u016F',    // ů
  '&lcaron;': '\u013E',   // ľ
  '&lacute;': '\u013A',   // ĺ
  '&racute;': '\u0155',   // ŕ

  // Czech / Slovak uppercase diacritics
  '&Aacute;': '\u00C1',   // Á
  '&Eacute;': '\u00C9',   // É
  '&Iacute;': '\u00CD',   // Í
  '&Oacute;': '\u00D3',   // Ó
  '&Uacute;': '\u00DA',   // Ú
  '&Yacute;': '\u00DD',   // Ý
  '&Scaron;': '\u0160',   // Š
  '&Ccaron;': '\u010C',   // Č
  '&Zcaron;': '\u017D',   // Ž
  '&Rcaron;': '\u0158',   // Ř
  '&Ecaron;': '\u011A',   // Ě
  '&Dcaron;': '\u010E',   // Ď
  '&Tcaron;': '\u0164',   // Ť
  '&Ncaron;': '\u0147',   // Ň
  '&Uring;': '\u016E',    // Ů
  '&Lcaron;': '\u013D',   // Ľ
  '&Lacute;': '\u0139',   // Ĺ
  '&Racute;': '\u0154',   // Ŕ

  // German
  '&auml;': '\u00E4',     // ä
  '&ouml;': '\u00F6',     // ö
  '&uuml;': '\u00FC',     // ü
  '&szlig;': '\u00DF',    // ß
  '&Auml;': '\u00C4',     // Ä
  '&Ouml;': '\u00D6',     // Ö
  '&Uuml;': '\u00DC',     // Ü

  // French / other accented
  '&agrave;': '\u00E0',   // à
  '&egrave;': '\u00E8',   // è
  '&igrave;': '\u00EC',   // ì
  '&ograve;': '\u00F2',   // ò
  '&ugrave;': '\u00F9',   // ù
  '&Agrave;': '\u00C0',   // À
  '&Egrave;': '\u00C8',   // È
  '&acirc;': '\u00E2',    // â
  '&ecirc;': '\u00EA',    // ê
  '&icirc;': '\u00EE',    // î
  '&ocirc;': '\u00F4',    // ô
  '&ucirc;': '\u00FB',    // û
  '&Acirc;': '\u00C2',    // Â
  '&Ecirc;': '\u00CA',    // Ê
  '&atilde;': '\u00E3',   // ã
  '&otilde;': '\u00F5',   // õ
  '&ntilde;': '\u00F1',   // ñ
  '&Ntilde;': '\u00D1',   // Ñ
  '&cedil;': '\u00B8',    // ¸
  '&ccedil;': '\u00E7',   // ç
  '&Ccedil;': '\u00C7',   // Ç

  // Polish
  '&lstrok;': '\u0142',   // ł
  '&Lstrok;': '\u0141',   // Ł
  '&sacute;': '\u015B',   // ś
  '&Sacute;': '\u015A',   // Ś
  '&zacute;': '\u017A',   // ź
  '&Zacute;': '\u0179',   // Ź
  '&zdot;': '\u017C',     // ż
  '&Zdot;': '\u017B',     // Ż
  '&cacute;': '\u0107',   // ć
  '&Cacute;': '\u0106',   // Ć
  '&nacute;': '\u0144',   // ń
  '&Nacute;': '\u0143',   // Ń
  '&eogonek;': '\u0119',  // ę
  '&Eogonek;': '\u0118',  // Ę
  '&aogonek;': '\u0105',  // ą
  '&Aogonek;': '\u0104',  // Ą

  // Additional commonly seen
  '&eth;': '\u00F0',      // ð
  '&thorn;': '\u00FE',    // þ
  '&oslash;': '\u00F8',   // ø
  '&Oslash;': '\u00D8',   // Ø
  '&aring;': '\u00E5',    // å
  '&Aring;': '\u00C5',    // Å
  '&aelig;': '\u00E6',    // æ
  '&AElig;': '\u00C6',    // Æ
};
