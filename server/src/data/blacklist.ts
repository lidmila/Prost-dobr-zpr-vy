/**
 * Known disinformation, propaganda, and unreliable domains.
 * Articles originating from these domains are automatically rejected.
 */
export const BLACKLIST_DOMAINS: Set<string> = new Set([
  // ──────────────────────────────────────────────
  // Czech disinformation / conspiracy sites
  // ──────────────────────────────────────────────
  'aeronet.cz',
  'prvnizpravy.cz',
  'ac24.cz',
  'svetkolemnas.info',
  'ceskobezcenzury.cz',
  'protiproud.cz',
  'nwoo.org',
  'czechfreepress.cz',
  'vlasteneckenoviny.cz',
  'voxpopuliblog.cz',
  'tadesco.cz',
  'lajkit.cz',
  'euportal.cz',
  'cz24.news',
  'pravyprostor.cz',
  'zpravy.dt24.cz',
  'svobodnenoviny.eu',
  'halonoviny.cz',
  'casopisargument.cz',
  'krajskelisty.cz',
  'prozeny.blesk.cz',
  'skrytapravda.cz',
  'nezdravi.cz',
  'alternativnimagazin.cz',
  'pravdive.eu',
  'eportal.cz',
  'infrankreich.com',
  'geopolitika.news',

  // ──────────────────────────────────────────────
  // Slovak disinformation / conspiracy sites
  // ──────────────────────────────────────────────
  'hlavnespravy.sk',
  'zemavek.sk',
  'extraplus.sk',
  'slobodnyvysielac.sk',
  'infovojna.sk',
  'badatel.net',
  'magazin1.sk',
  'narodnesily.sk',
  'topky.sk',
  'armadnymagazin.sk',
  'refresher.sk',
  'slobodnyvyber.sk',
  'verejnadiskusia.sk',

  // ──────────────────────────────────────────────
  // Russian / Kremlin-linked propaganda
  // ──────────────────────────────────────────────
  'rt.com',
  'sputniknews.com',
  'sputnikglobe.com',
  'tass.com',
  'ria.ru',
  'pravda.ru',
  'rusvesna.su',
  'newsfront.info',
  'southfront.org',
  'strategic-culture.org',
  'katehon.com',
  'geopolitica.ru',
  'journal-neo.org',
  'globalresearch.ca',

  // ──────────────────────────────────────────────
  // International disinformation / unreliable
  // ──────────────────────────────────────────────
  'infowars.com',
  'naturalnews.com',
  'breitbart.com',
  'zerohedge.com',
  'thegatewaypundit.com',
  'beforeitsnews.com',
  'worldtruth.tv',
  'yournewswire.com',
  'newspunch.com',
  'davidicke.com',
  'collectiveevolution.com',
  'eutimes.net',
  'presstv.ir',
  'mintpressnews.com',
  'activistpost.com',
  'theepochtimes.com',
  'oann.com',
  'newsmax.com',
  'dailystormer.su',
  'stormfront.org',
]);
