/**
 * Known disinformation, propaganda, and unreliable domains.
 * Articles originating from these domains are automatically rejected.
 */
export const BLACKLIST_DOMAINS: Set<string> = new Set([
  // ──────────────────────────────────────────────
  // MAFRA / Agrofert (Babiš) media — nelez.cz
  // ──────────────────────────────────────────────
  'idnes.cz',
  'lidovky.cz',
  'metro.cz',
  'expres.cz',
  'zeny.cz',
  'hnonline.sk', // MAFRA Slovakia

  // ──────────────────────────────────────────────
  // Empresa Media / Jaromír Soukup (Babišův propagandista)
  // ──────────────────────────────────────────────
  'tyden.cz',
  'barrandov.tv',

  // ──────────────────────────────────────────────
  // Ivo Valenta / SYNOT (vlastník Parlamentních listů)
  // ──────────────────────────────────────────────
  'pravda.sk',

  // ──────────────────────────────────────────────
  // Penta Investments (oligarchický fond)
  // ──────────────────────────────────────────────
  'denik.cz',
  'trend.sk',

  // ──────────────────────────────────────────────
  // Czech Media Invest / Daniel Kretínský
  // ──────────────────────────────────────────────
  'e15.cz',

  // ──────────────────────────────────────────────
  // Czech disinformation / conspiracy sites
  // ──────────────────────────────────────────────
  'aeronet.cz',
  'aeronet.news',
  'prvnizpravy.cz',
  'ac24.cz',
  'svetkolemnas.info',
  'ceskobezcenzury.cz',
  'protiproud.cz',
  'protiproud.info',
  'nwoo.org',
  'czechfreepress.cz',
  'vlasteneckenoviny.cz',
  'voxpopuliblog.cz',
  'tadesco.cz',
  'lajkit.cz',
  'euportal.cz',
  'cz24.news',
  'pravyprostor.cz',
  'pravyprostor.net',
  'zpravy.dt24.cz',
  'dt24.cz',
  'svobodnenoviny.eu',
  'halonoviny.cz',
  'casopisargument.cz',
  'krajskelisty.cz',
  'skrytapravda.cz',
  'nezdravi.cz',
  'alternativnimagazin.cz',
  'pravdive.eu',
  'eportal.cz',
  'infrankreich.com',
  'geopolitika.news',
  'novarepublika.cz',
  'cz.sputniknews.com',
  'ceskoaktualne.cz',
  'zvedavec.org',
  'zvedavec.news',
  'bezpolitickekorektnosti.cz',
  'parlamentnilisty.cz',
  'tydenikobcanskepravo.cz',
  'outsidermedia.cz',
  'ceskezpravy.eu',
  'regionalninovinky.cz',
  'ceskavec.com',
  'e-republika.cz',
  'eurabia.cz',
  'narodninoviny.cz',
  'nejvic-info.cz',
  'otevrisvoumysl.cz',
  'pokec24.cz',
  'raptor-tv.cz',
  'vipnoviny.cz',
  'veksvetla.cz',
  'necenzurovanapravda.cz',
  'necenzurujeme.cz',
  'jihoceskenovinky.cz',
  'jihomoravskenovinky.cz',
  'karlovarskenovinky.cz',
  'kralovehradeckenovinky.cz',
  'moravskoslezskenovinky.cz',
  'olomouckenovinky.cz',
  'novinkyvysocina.cz',
  'pardubickenovinky.cz',
  'plzenskenovinky.cz',
  'prazskenovinky.cz',
  'stredoceskenovinky.cz',
  'usteckenovinky.cz',
  'zlinskenovinky.cz',

  // ──────────────────────────────────────────────
  // Slovak government-controlled / Fico-aligned media
  // ──────────────────────────────────────────────
  'teraz.sk',        // TASR — státní agentura pod kontrolou Ficovy vlády
  'tasr.sk',         // TASR — alternativní doména
  'rtvs.sk',         // STVR (ex-RTVS) — slovenská veřejnoprávní, politicky zachycená
  'stvr.sk',         // STVR — nový název po přejmenování
  'ta3.com',         // TA3 — zpravodajská TV, Ivan Kmotrík (blízko Smer)
  'pluska.sk',       // Plus 1 deň / Plus 7 dní — tabloid, pro-Smer tendence
  'cas.sk',          // Nový Čas — bulvár, Ringier SK, nekritický k Ficovi

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
